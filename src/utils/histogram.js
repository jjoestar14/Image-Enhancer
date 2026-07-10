/**
 * Histogram / Brightness analysis utilities for Auto-Enhance.
 *
 * Calculates the average perceived brightness of an image and
 * determines the optimal gamma value to reach a target brightness.
 */

/**
 * Calculate the average brightness (lightness) of an image.
 * Uses the HSL lightness formula: L = (max(R,G,B) + min(R,G,B)) / 2
 * Returns a value in the range 0–255.
 *
 * @param {ImageData} imageData
 * @returns {number} Average brightness 0–255
 */
export function calculateAverageBrightness(imageData) {
  const { data } = imageData;
  const pixelCount = data.length / 4;
  let totalBrightness = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // HSL lightness (0–255 scale)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;

    totalBrightness += lightness;
  }

  return totalBrightness / pixelCount;
}

/**
 * Calculate the optimal gamma value to transform the current
 * average brightness to a target brightness.
 *
 * Derivation:
 *   target/255 = (avg/255)^gamma
 *   gamma = log(target/255) / log(avg/255)
 *
 * @param {number} averageBrightness  Current average brightness (0–255)
 * @param {number} targetBrightness   Desired average brightness (default 125)
 * @returns {number} Optimal gamma, clamped to [0.1, 3.0]
 */
export function calculateOptimalGamma(averageBrightness, targetBrightness = 125) {
  // Guard against edge cases
  if (averageBrightness <= 1) return 0.1;  // extremely dark image
  if (averageBrightness >= 254) return 1.0; // already bright enough

  // If already near target, no correction needed
  if (Math.abs(averageBrightness - targetBrightness) < 5) return 1.0;

  const gamma = Math.log(targetBrightness / 255) / Math.log(averageBrightness / 255);

  // Clamp to reasonable range
  return Math.max(0.1, Math.min(3.0, gamma));
}
