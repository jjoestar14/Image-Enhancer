import { useState, useCallback, useRef, useEffect } from 'react';
import UploadZone from './components/UploadZone';
import ImageCanvas from './components/ImageCanvas';
import GammaSlider from './components/GammaSlider';
import CompareView from './components/CompareView';
import DownloadButton from './components/DownloadButton';
import { calculateAverageBrightness, calculateOptimalGamma } from './utils/histogram';



export default function App() {
  // Image state
  const [originalImage, setOriginalImage] = useState(null);
  const [originalSrc, setOriginalSrc] = useState('');
  const [fileName, setFileName] = useState('');

  // Processing state
  const [gamma, setGamma] = useState(1.0);
  const [autoGamma, setAutoGamma] = useState(1.0);
  const [processedUrl, setProcessedUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Stats for display
  const [originalBrightness, setOriginalBrightness] = useState(0);

  const originalSrcRef = useRef('');

  // Clean up original src on new upload
  useEffect(() => {
    return () => {
      if (originalSrcRef.current) {
        URL.revokeObjectURL(originalSrcRef.current);
      }
    };
  }, []);

  const handleImageLoad = useCallback((img, name) => {
    // Revoke previous original src
    if (originalSrcRef.current) {
      URL.revokeObjectURL(originalSrcRef.current);
    }

    // Create a blob URL from the image for the comparison view
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      originalSrcRef.current = url;
      setOriginalSrc(url);
    });

    setOriginalImage(img);
    setFileName(name);
    setHasAnalyzed(false);
    setProcessedUrl('');
    // Set temporary gamma = 1 until analysis completes
    setGamma(1.0);
    setAutoGamma(1.0);
  }, []);

  const handleOriginalData = useCallback((imageData) => {
    if (hasAnalyzed) return;

    const avgBrightness = calculateAverageBrightness(imageData);
    setOriginalBrightness(Math.round(avgBrightness));

    const optimalGamma = calculateOptimalGamma(avgBrightness);
    setAutoGamma(optimalGamma);
    setGamma(optimalGamma);
    setHasAnalyzed(true);
  }, [hasAnalyzed]);

  const handleProcessed = useCallback((url) => {
    setProcessedUrl(url);
  }, []);

  const handleProcessingChange = useCallback((processing) => {
    setIsProcessing(processing);
  }, []);

  const handleGammaChange = useCallback((value) => {
    setGamma(value);
  }, []);

  const handleReset = useCallback(() => {
    setGamma(autoGamma);
  }, [autoGamma]);

  const handleNewImage = useCallback(() => {
    setOriginalImage(null);
    setOriginalSrc('');
    setProcessedUrl('');
    setFileName('');
    setHasAnalyzed(false);
    setGamma(1.0);
    setAutoGamma(1.0);
    setOriginalBrightness(0);
    if (originalSrcRef.current) {
      URL.revokeObjectURL(originalSrcRef.current);
      originalSrcRef.current = '';
    }
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="app__header">
        <div className="app__header-inner">
          <div className="app__logo">
            <div className="app__logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
            </div>
            <div>
              <h1 className="app__title">Enhancia</h1>
              <p className="app__tagline">Low-Light Image Enhancer</p>
            </div>
          </div>

          {originalImage && (
            <button
              className="app__new-btn"
              onClick={handleNewImage}
              id="new-image-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Foto Baru
            </button>
          )}
        </div>
      </header>

      <main className="app__main">
        {!originalImage ? (
          /* ── Upload State ──────────────────────────── */
          <div className="app__upload-section">
            <div className="app__hero">
              <h2 className="app__hero-title">
                Cerahkan Foto Gelap <br />
                <span className="app__hero-gradient">Dalam Sekejap</span>
              </h2>
              <p className="app__hero-desc">
                Upload foto yang diambil di tempat minim cahaya. Sistem akan otomatis
                memperbaiki kecerahan sambil menjaga warna tetap alami.
              </p>
            </div>

            <UploadZone onImageLoad={handleImageLoad} />

            <div className="app__features">
              <div className="app__feature-card">
                <div className="app__feature-icon app__feature-icon--auto">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                </div>
                <h3>Auto Enhance</h3>
                <p>Tingkatkan kecerahan otomatis tanpa perlu edit manual</p>
              </div>
              <div className="app__feature-card">
                <div className="app__feature-icon app__feature-icon--color">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="13.5" cy="6.5" r="2.5"/>
                    <circle cx="17.5" cy="10.5" r="2.5"/>
                    <circle cx="8.5" cy="7.5" r="2.5"/>
                    <circle cx="6.5" cy="12.5" r="2.5"/>
                    <path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z"/>
                  </svg>
                </div>
                <h3>Warna Natural</h3>
                <p>Menaikan kecerahan tanpa merusak warna asli</p>
              </div>
              <div className="app__feature-card">
                <div className="app__feature-icon app__feature-icon--privacy">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h3>100% Privat</h3>
                <p>Semua proses di browser, foto tidak dikirim ke server</p>
              </div>
            </div>
          </div>
        ) : (
          /* ── Editor State ──────────────────────────── */
          <div className="app__editor">
            {/* Hidden canvas for processing */}
            <ImageCanvas
              image={originalImage}
              gamma={gamma}
              onProcessed={handleProcessed}
              onOriginalData={handleOriginalData}
              onProcessingChange={handleProcessingChange}
            />

            {/* Processing overlay */}
            {isProcessing && (
              <div className="app__processing">
                <div className="app__processing-spinner" />
                <span>Memproses gambar…</span>
              </div>
            )}

            {/* Auto-enhance info banner */}
            {hasAnalyzed && (
              <div className="app__auto-info" id="auto-enhance-info">
                <div className="app__auto-info-icon">✨</div>
                <div className="app__auto-info-text">
                  <strong>Auto Enhance diterapkan</strong>
                  <span>
                    Kecerahan asli: {originalBrightness}/255 → Gamma optimal: {autoGamma.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Enhanced preview */}
            {processedUrl && (
              <div className="app__preview" id="enhanced-preview">
                <div className="app__preview-label">Hasil Enhanced</div>
                <img
                  src={processedUrl}
                  alt="Enhanced preview"
                  className="app__preview-img"
                />
              </div>
            )}

            {/* Gamma slider */}
            <GammaSlider
              gamma={gamma}
              autoGamma={autoGamma}
              onChange={handleGammaChange}
              onReset={handleReset}
              disabled={isProcessing}
            />

            {/* Before/After comparison */}
            {originalSrc && processedUrl && (
              <CompareView
                originalSrc={originalSrc}
                enhancedSrc={processedUrl}
              />
            )}

            {/* Download */}
            <div className="app__actions">
              <DownloadButton
                image={originalImage}
                gamma={gamma}
                fileName={fileName}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app__footer">
        <p>
          © 2026 Enhancia. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
