import ReactCompareImage from 'react-compare-image';

/**
 * Before/After comparison view using react-compare-image.
 * Left = original image, Right = enhanced image.
 */
export default function CompareView({ originalSrc, enhancedSrc }) {
  if (!originalSrc || !enhancedSrc) return null;

  return (
    <div className="compare-view" id="compare-section">
      <div className="compare-view__header">
        <h2 className="compare-view__title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2" />
            <line x1="12" y1="2" x2="12" y2="22" />
          </svg>
          Perbandingan Sebelum & Sesudah
        </h2>
        <p className="compare-view__hint">Geser slider untuk membandingkan</p>
      </div>

      <div className="compare-view__container">
        <ReactCompareImage
          leftImage={originalSrc}
          rightImage={enhancedSrc}
          leftImageLabel="Sebelum"
          rightImageLabel="Sesudah"
          sliderLineColor="#a855f7"
          sliderLineWidth={3}
          handleSize={40}
          hover={false}
          skeleton={
            <div className="compare-view__skeleton">
              <div className="compare-view__skeleton-pulse" />
            </div>
          }
        />
      </div>
    </div>
  );
}
