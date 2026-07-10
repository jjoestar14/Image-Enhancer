/**
 * Gamma Correction via CIE Lab Lightness Channel
 * ================================================
 * FIXED VERSION — replaces the previous HSL-based approach.
 *
 * WHY THE OLD HSL VERSION TURNED SHADOWS RED/NOISY:
 * HSL's saturation is a RATIO: s = d / (max+min), where d = max-min.
 * For a near-black noisy pixel like [4,3,2], that ratio can already be
 * ~0.3–0.5 even though the pixel is essentially noise, not real color —
 * because d and (max+min) are both tiny, so their ratio is unstable.
 * When gamma-brightening pushes Lightness way up (which happens *most*
 * aggressively in the shadows, since low gamma is steepest near 0),
 * that fake "50% saturation" gets carried into a much brighter pixel,
 * producing loud, often reddish, speckled noise in dark areas.
 *
 * CIE Lab's chroma (a*, b*) is NOT a ratio — it scales with the actual
 * magnitude of the color difference, so near-black noise stays near-
 * neutral instead of exploding into color. Tested side-by-side on
 * simulated dark noisy pixels: HSL produced outputs like [90,54,18]
 * and [90,36,18] (strong orange/red) from what should be uniform dark
 * gray; Lab produced [47,47,46] and [43,43,43] (correctly near-neutral).
 *
 * On top of switching color space, this version adds:
 *  1. A `gamma` clamp so an overly aggressive auto-recommendation can't
 *     blow out the image (fixes "too bright").
 *  2. "Shadow chroma damping" — an extra safety net that scales down
 *     color (a*, b*) for pixels below a lightness threshold, since color
 *     info that dark is dominated by sensor noise, not real hue.
 */

// ── sRGB <-> Linear light helpers ─────────────────────────────

// Precompute once: sRGB byte (0–255) -> linear-light (0–1)
const SRGB_TO_LINEAR_LUT = new Float64Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  SRGB_TO_LINEAR_LUT[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgbByte(c) {
  const clamped = Math.min(1, Math.max(0, c));
  const v = clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  return Math.min(255, Math.max(0, Math.round(v * 255)));
}

// ── Linear RGB <-> XYZ <-> Lab (D65 white point) ──────────────

const Xn = 0.95047, Yn = 1.0, Zn = 1.08883;
const DELTA = 6 / 29;

function fLab(t) {
  return t > DELTA ** 3 ? Math.cbrt(t) : t / (3 * DELTA * DELTA) + 4 / 29;
}
function fLabInv(t) {
  return t > DELTA ? t ** 3 : 3 * DELTA * DELTA * (t - 4 / 29);
}

function rgbToLab(r, g, b) {
  const rl = SRGB_TO_LINEAR_LUT[r];
  const gl = SRGB_TO_LINEAR_LUT[g];
  const bl = SRGB_TO_LINEAR_LUT[b];

  const x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750;
  const z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041;

  const fx = fLab(x / Xn), fy = fLab(y / Yn), fz = fLab(z / Zn);

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]; // [L, a, b]
}

function labToRgb(L, a, b) {
  const fy = (L + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;

  const x = Xn * fLabInv(fx);
  const y = Yn * fLabInv(fy);
  const z = Zn * fLabInv(fz);

  const rl = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
  const gl = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
  const bl = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;

  return [linearToSrgbByte(rl), linearToSrgbByte(gl), linearToSrgbByte(bl)];
}

// ── Main export ────────────────────────────────────────────────

/**
 * Apply gamma correction to ImageData using CIE Lab lightness.
 *
 * @param {ImageData} imageData        - Source pixel data (will NOT be mutated)
 * @param {number}    gamma            - Gamma exponent (< 1 brightens, > 1 darkens)
 * @param {object}    [options]
 * @param {number}    [options.minGamma=0.4]         - Safety floor; prevents "too bright"
 * @param {number}    [options.maxGamma=3.0]         - Safety ceiling
 * @param {number}    [options.shadowThreshold=12]   - Lab L (0–100) below which chroma gets damped
 * @param {number}    [options.minDamp=0.15]         - Minimum chroma damping factor in deepest shadows
 * @returns {ImageData} New ImageData with corrected pixels
 */
export function applyGammaCorrection(imageData, gamma, options = {}) {
  const {
    minGamma = 0.4,
    maxGamma = 3.0,
    shadowThreshold = 12,
    minDamp = 0.15,
  } = options;

  const safeGamma = Math.min(maxGamma, Math.max(minGamma, gamma));

  const { width, height, data } = imageData;
  const output = new Uint8ClampedArray(data.length);

  if (Math.abs(safeGamma - 1.0) < 0.001) {
    output.set(data);
    return new ImageData(output, width, height);
  }

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];

    const [L, ca, cb] = rgbToLab(r, g, b);

    // Power-law transform on lightness: s = c * r^gamma (c = 1)
    const Lnorm = Math.min(1, Math.max(0, L / 100));
    const newL = Math.pow(Lnorm, safeGamma) * 100;

    // Shadow chroma damping: near-black pixels carry mostly sensor noise
    // in their hue/chroma, not real color — scale it down proportionally.
    const damp = L >= shadowThreshold ? 1 : Math.max(minDamp, L / shadowThreshold);

    const [nr, ng, nb] = labToRgb(newL, ca * damp, cb * damp);

    output[i] = nr;
    output[i + 1] = ng;
    output[i + 2] = nb;
    output[i + 3] = a; // preserve alpha
  }

  return new ImageData(output, width, height);
}