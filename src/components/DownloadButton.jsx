import { useState, useCallback, useRef, useEffect } from 'react';
import { applyGammaCorrection } from '../utils/gammaCorrection';

/**
 * Download button that exports the enhanced image at full resolution.
 * Uses File System Access API when available, falls back to <a download>.
 */
export default function DownloadButton({ image, gamma, fileName }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const blobUrlRef = useRef(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const processFullRes = useCallback(() => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const fullWidth = image.naturalWidth || image.width;
      const fullHeight = image.naturalHeight || image.height;
      canvas.width = fullWidth;
      canvas.height = fullHeight;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(image, 0, 0, fullWidth, fullHeight);

      const originalData = ctx.getImageData(0, 0, fullWidth, fullHeight);
      const corrected = applyGammaCorrection(originalData, gamma);
      ctx.putImageData(corrected, 0, 0);

      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }, [image, gamma]);

  const handleDownload = useCallback(async () => {
    if (!image || isProcessing) return;

    setIsProcessing(true);

    try {
      const blob = await processFullRes();
      if (!blob) throw new Error('Gagal membuat blob.');

      // Generate output filename
      const baseName = fileName?.replace(/\.[^.]+$/, '') || 'enhanced';
      const outputName = `${baseName}_enhanced.png`;

      // Try File System Access API first (modern browsers)
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: outputName,
            types: [
              {
                description: 'PNG Image',
                accept: { 'image/png': ['.png'] },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          setIsProcessing(false);
          return;
        } catch (err) {
          // User cancelled or API not fully supported — fall through to <a>
          if (err.name === 'AbortError') {
            setIsProcessing(false);
            return;
          }
        }
      }

      // Fallback: create <a download> element
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }

      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const a = document.createElement('a');
      a.href = url;
      a.download = outputName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Revoke after a short delay to allow download to start
      setTimeout(() => {
        if (blobUrlRef.current === url) {
          URL.revokeObjectURL(url);
          blobUrlRef.current = null;
        }
      }, 5000);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [image, gamma, fileName, isProcessing, processFullRes]);

  return (
    <button
      className="download-btn"
      onClick={handleDownload}
      disabled={!image || isProcessing}
      id="download-btn"
    >
      {isProcessing ? (
        <>
          <div className="download-btn__spinner" />
          <span>Memproses resolusi penuh…</span>
        </>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Simpan Hasil</span>
        </>
      )}
    </button>
  );
}
