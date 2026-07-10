import { useState, useRef, useCallback } from 'react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export default function UploadZone({ onImageLoad }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Format tidak didukung. Gunakan JPG, PNG, atau WEBP.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Ukuran file terlalu besar (${(file.size / 1024 / 1024).toFixed(1)}MB). Maksimal 20MB.`;
    }
    return null;
  };

  const handleFile = useCallback((file) => {
    setError('');
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => onImageLoad(img, file.name);
      img.onerror = () => setError('Gagal memuat gambar. File mungkin rusak.');
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, [onImageLoad]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files?.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="upload-zone-wrapper">
      <div
        className={`upload-zone ${isDragging ? 'upload-zone--dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        id="upload-dropzone"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleInputChange}
          className="upload-zone__input"
          id="file-input"
        />

        <div className="upload-zone__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <div className="upload-zone__text">
          <p className="upload-zone__title">
            Seret & lepas foto di sini
          </p>
          <p className="upload-zone__subtitle">
            atau <span className="upload-zone__link">pilih foto</span> dari perangkat
          </p>
          <p className="upload-zone__formats">
            JPG, PNG, WEBP • Maks 20MB
          </p>
        </div>

        <div className="upload-zone__privacy">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
          <span>Semua proses dilakukan di browser — foto tidak dikirim ke server</span>
        </div>
      </div>

      {error && (
        <div className="upload-zone__error" role="alert" id="upload-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
