/**
 * Gamma Correction via HSL Lightness Channel
 *
 * Converts each pixel RGB → HSL, applies power-law transform
 * only to the Lightness channel, then converts back to RGB.
 * This preserves Hue and Saturation so colors stay natural.
 *
 * Formula: L_out = c * L_in^gamma  (c = 1 by default)
 */

// ── RGB ↔ HSL conversion helpers ─────────────────────────────

/**
 * Convert RGB (0–255) to HSL (H: 0–360, S: 0–1, L: 0–1)
 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return [0, 0, l]; // achromatic
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return [h * 360, s, l];
}

/**
 * Convert HSL (H: 0–360, S: 0–1, L: 0–1) back to RGB (0–255)
 */
function hslToRgb(h, s, l) {
  h /= 360;

  if (s === 0) {
    const val = Math.round(l * 255);
    return [val, val, val];
  }

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// ── Lookup Table builder ──────────────────────────────────────

/**
 * Build a 256-entry lookup table mapping input lightness (0–255 quantized)
 * to output lightness (0–1) after gamma correction.
 *
 * LUT[i] = (i / 255) ^ gamma   clamped to [0, 1]
 */
function buildGammaLUT(gamma) {
  const lut = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = Math.pow(i / 255, gamma);
  }
  return lut;
}

// ── Main export ───────────────────────────────────────────────

/**
 * Apply gamma correction to ImageData using HSL lightness channel.
 *
 * @param {ImageData} imageData - Source pixel data (will NOT be mutated)
 * @param {number}    gamma     - Gamma exponent (< 1 brightens, > 1 darkens)
 * @returns {ImageData}          New ImageData with corrected pixels
 */
export function applyGammaCorrection(imageData, gamma) {
  const { width, height, data } = imageData;
  const output = new Uint8ClampedArray(data.length);

  // Fast path: gamma ≈ 1 means no change
  if (Math.abs(gamma - 1.0) < 0.001) {
    output.set(data);
    return new ImageData(output, width, height);
  }

  // Pre-compute LUT for lightness mapping
  const lut = buildGammaLUT(gamma);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Convert to HSL
    const [h, s, l] = rgbToHsl(r, g, b);

    // Apply gamma via LUT — quantize lightness to 0–255 index
    const lIndex = Math.round(l * 255);
    const newL = lut[lIndex];

    // Convert back to RGB with corrected lightness
    const [nr, ng, nb] = hslToRgb(h, s, newL);

    output[i] = nr;
    output[i + 1] = ng;
    output[i + 2] = nb;
    output[i + 3] = a; // preserve alpha
  }

  return new ImageData(output, width, height);
}
