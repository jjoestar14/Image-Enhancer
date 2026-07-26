# Enhancia - Low Light Image Enhancer

Enhancia adalah aplikasi web berbasis **React** dan **Vite** yang digunakan untuk meningkatkan kualitas gambar yang diambil pada kondisi pencahayaan rendah (low-light). Aplikasi ini menerapkan metode **Gamma Correction** untuk meningkatkan kecerahan gambar tanpa mengubah detail secara berlebihan.

## Preview

> Upload gambar → Atur nilai Gamma → Bandingkan hasil sebelum & sesudah → Download hasil.

---

## ✨ Fitur

- 📤 Upload gambar (JPG, JPEG, PNG)
- 🌙 Peningkatan pencahayaan menggunakan **Gamma Correction**
- 🎚️ Slider untuk mengatur nilai Gamma
- 🔍 Perbandingan gambar Before & After
- 💾 Download hasil gambar
- ⚡ Proses langsung di browser (Client-side)
- 📱 Responsive Design

---

## 🛠️ Teknologi

- React 19
- Vite
- Tailwind CSS
- HTML5 Canvas API
- Lucide React
- React Compare Image

---

## 📂 Struktur Project

```
image-enhancer/
│
├── public/
│   ├── favicon.png
│   └── icons.svg
│
├── src/
│   ├── components/
│   │   ├── CompareView.jsx
│   │   ├── DownloadButton.jsx
│   │   ├── GammaSlider.jsx
│   │   ├── ImageCanvas.jsx
│   │   └── UploadZone.jsx
│   │
│   ├── utils/
│   │   ├── gammaCorrection.js
│   │   └── histogram.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
└── vite.config.js
```

---

## 🚀 Instalasi

Clone repository

```bash
git clone https://github.com/username/image-enhancer.git
```

Masuk ke folder project

```bash
cd image-enhancer
```

Install dependencies

```bash
npm install
```

Jalankan project

```bash
npm run dev
```

Build production

```bash
npm run build
```

Preview hasil build

```bash
npm run preview
```

---

## 📖 Cara Penggunaan

1. Jalankan aplikasi.
2. Upload gambar dengan kondisi pencahayaan rendah.
3. Atur nilai **Gamma** menggunakan slider.
4. Bandingkan hasil sebelum dan sesudah.
5. Download gambar yang telah ditingkatkan.

---

## 🧠 Metode yang Digunakan

### Gamma Correction

Gamma Correction merupakan teknik pengolahan citra yang digunakan untuk memperbaiki tingkat kecerahan gambar dengan transformasi non-linear.

Persamaan:

```
S = C × R^γ
```

Keterangan:

- **S** = nilai piksel keluaran
- **R** = nilai piksel masukan (0–1)
- **γ (gamma)** = faktor koreksi
- **C** = konstanta (biasanya 1)

Jika:

- γ < 1 → gambar menjadi lebih terang
- γ > 1 → gambar menjadi lebih gelap

---

## 📦 Dependencies

- React
- React DOM
- Tailwind CSS
- React Compare Image
- Lucide React
- Vite

---

## 📄 License

Project ini dibuat untuk keperluan pembelajaran dan penelitian. Bebas digunakan, dimodifikasi, dan dikembangkan lebih lanjut.

---

## 👨‍💻 Developer

Developed by **Muhamad Jakaria**

Program Studi Teknik Informatika