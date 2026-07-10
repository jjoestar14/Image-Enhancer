import { useRef, useEffect, useCallback } from 'react';
import { applyGammaCorrection } from '../utils/gammaCorrection';

const PREVIEW_MAX_WIDTH = 1200;

/**
 * Hidden canvas component that handles pixel-level image processing.
 *
 * - Draws the original image onto an offscreen canvas
 * - Applies gamma correction via HSL lightness
 * - Outputs a blob URL for the processed result
 * - Downscales large images for real-time preview; full-res on demand
 */
export default function ImageCanvas({
  image,
  gamma,
  onProcessed,
  onOriginalData,
  onProcessingChange,
  processFullRes = false,
  onFullResBlob,
}) {
  const canvasRef = useRef(null);
  const prevBlobUrl = useRef(null);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrl.current) {
        URL.revokeObjectURL(prevBlobUrl.current);
      }
    };
  }, []);

  // Process image whenever image or gamma changes
  useEffect(() => {
    if (!image || gamma == null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    onProcessingChange?.(true);

    // Determine preview dimensions (downscale large images)
    let drawWidth = image.naturalWidth || image.width;
    let drawHeight = image.naturalHeight || image.height;

    if (drawWidth > PREVIEW_MAX_WIDTH) {
      const scale = PREVIEW_MAX_WIDTH / drawWidth;
      drawWidth = PREVIEW_MAX_WIDTH;
      drawHeight = Math.round(drawHeight * scale);
    }

    canvas.width = drawWidth;
    canvas.height = drawHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0, drawWidth, drawHeight);

    // Get original image data for histogram analysis (only on first load)
    const originalData = ctx.getImageData(0, 0, drawWidth, drawHeight);
    onOriginalData?.(originalData);

    // Apply gamma correction
    const corrected = applyGammaCorrection(originalData, gamma);
    ctx.putImageData(corrected, 0, 0);

    // Convert to blob URL
    canvas.toBlob((blob) => {
      if (!blob) {
        onProcessingChange?.(false);
        return;
      }

      // Revoke previous URL to prevent memory leaks
      if (prevBlobUrl.current) {
        URL.revokeObjectURL(prevBlobUrl.current);
      }

      const url = URL.createObjectURL(blob);
      prevBlobUrl.current = url;
      onProcessed?.(url);
      onProcessingChange?.(false);
    }, 'image/png');
  }, [image, gamma]);

  // Full-resolution processing for download
  const processFullResolution = useCallback(() => {
    if (!image) return;

    const offscreen = document.createElement('canvas');
    const fullWidth = image.naturalWidth || image.width;
    const fullHeight = image.naturalHeight || image.height;
    offscreen.width = fullWidth;
    offscreen.height = fullHeight;

    const ctx = offscreen.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0, fullWidth, fullHeight);

    const originalData = ctx.getImageData(0, 0, fullWidth, fullHeight);
    const corrected = applyGammaCorrection(originalData, gamma);
    ctx.putImageData(corrected, 0, 0);

    return new Promise((resolve) => {
      offscreen.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  }, [image, gamma]);

  // Expose processFullResolution when requested
  useEffect(() => {
    if (processFullRes && onFullResBlob) {
      processFullResolution().then((blob) => {
        onFullResBlob(blob);
      });
    }
  }, [processFullRes]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'none' }}
      id="processing-canvas"
    />
  );
}

export { ImageCanvas };
