# 🤖 Finite Automata Simulator & Visualizer

Aplikasi web interaktif satu halaman (Single Page Application) berbasis **Vite + React 18 + Tailwind CSS v4** untuk melakukan simulasi, konstruksi, minimalisasi, dan pembuktian ekuivalensi mesin-mesin otomata bahasa formal (Theory of Computation). Aplikasi ini sepenuhnya berjalan di sisi klien (browser) dengan performa sangat cepat, visual graf yang modern, dan responsif.

---

## 🚀 Fitur Utama & Modul Otomata

Aplikasi ini mencakup **5 Modul Akademik** utama dalam Teori Bahasa & Automata:

### 1. ⚙️ DFA Simulator
*   **Editor Otomata Dinamis**: Konfigurasi State ($Q$), Alfabet ($\Sigma$), Start State ($q_0$), dan Accept States ($F$) secara instan menggunakan form interaktif.
*   **Fungsi Transisi δ Matriks**: Sel transisi divalidasi secara otomatis demi mencegah kesalahan format.
*   **Simulasi Interaktif & Penjelasan Bahasa Indonesia**: Uji string input Anda dengan mode **Langkah-demi-Langkah (Step-by-Step)** dengan kontrol Play/Pause/Skip otomatis.
*   **Animasi Aliran Graf**: Lintasan transisi yang aktif akan **menyala berwarna kuning** dan berdenyut secara visual di atas graf.

### 2. ⚙️ NFA Simulator
*   **Editor NFA Dinamis**: Konfigurasi State, Alfabet, Start State, Accept States, dan Transisi NFA.
*   **Dukungan Transisi Cabang & Epsilon ($\epsilon$)**: Input transisi bercabang (koma terpisah, misal `q0, q1`) dan transisi epsilon ($\epsilon$) langsung di tabel transisi.
*   **Simulasi Subset Terintegrasi**: Simulasi interaktif menggunakan algoritma Epsilon-Closure & Subset Construction dengan visualisasi lintasan aktif (berwarna kuning).

### 3. 🔀 Regex to NFA (Thompson's Construction)
*   **Standard Regex AST Parser**: Mendukung parse ekspresi reguler dengan operator literal `a`, gabungan `a|b`, sekuensial `ab`, Kleene star `a*`, pengulangan positif `a+`, opsional `a?`, dan pengelompokan `(a|b)*`.
*   **Thompson Construction Compiler**: Mengompilasi Regex menjadi graf NFA dengan transisi $\epsilon$ (epsilon) otomatis secara langsung.
*   **NFA Subset Simulator**: Mensimulasikan string input pada NFA menggunakan metode **Epsilon-Closure & Subset Construction** di latar belakang.
*   **Pembanding Mesin**: Menyediakan pembanding otomatis hasil pengujian menggunakan JavaScript Native RegExp.

### 4. 🔍 DFA Minimizer (Hopcroft's Algorithm)
*   **Myhill-Nerode & Hopcroft Partitioning**: Menghilangkan state yang tidak dapat dijangkau (*unreachable states*) dari Start State, kemudian membagi himpunan state ke dalam kelas ekuivalen (*partition refinement*).
*   **Visualisasi Komparatif Side-by-Side**: Menampilkan graf DFA asal dan graf DFA hasil minimalisasi secara bersandingan untuk memudahkan perbandingan.
*   **Equivalence Classes & Round Logs**: Menampilkan tabel penggabungan kelas ekuivalensi (misal: $\{q_1, q_3\} \to Q_1$) serta rincian log pembagian partisi di setiap ronde iterasi.

### 5. 🔏 DFA Equivalence Checker (Table-Filling Algorithm)
*   **Konstruksi Automaton Produk ($Q_1 \times Q_2$)**: Menggabungkan dua DFA berbeda (bisa dengan nama state berbeda) untuk mencari perbedaan bahasa.
*   **Deteksi String Pembeda (Witness String)**: Jika kedua DFA tidak ekuivalen, algoritma BFS akan menemukan **string terpendek** yang diterima oleh salah satu DFA tetapi ditolak oleh DFA lainnya.
*   **Visualisasi Graf Produk**: Menampilkan graf automaton produk beserta tanda double-circle hijau pada state yang membedakan (Symmetric Difference).

---

## 🛠️ Tech Stack & Library Utama

Aplikasi dibangun menggunakan kombinasi pustaka front-end modern:
*   **Runtime & Bundler**: [Node.js](https://nodejs.org/) & [Vite](https://vitejs.dev/) (Kompilasi super cepat).
*   **Framework**: [React 18](https://react.dev/) (Functional components & hooks).
*   **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/) & `@tailwindcss/vite` (Utilitas visual premium dan bersih, mendukung **Light/Dark Mode** secara dinamis).
*   **Visualizer Graf**: [@xyflow/react](https://reactflow.dev/) (React Flow versi 12 untuk rendering graf interaktif yang halus).
*   **Icons**: [Lucide React](https://lucide.dev/).

---

## 🖥️ Panduan Cara Menjalankan Project

### Prerequisites
Pastikan Anda sudah menginstal **Node.js** (versi 16 atau lebih tinggi) di sistem Anda.

### 1. Clone & Masuk ke Folder Project
```bash
git clone https://github.com/<username>/<repo-name>.git
cd <repo-name>
```

### 2. Instalasi Dependensi
Jalankan perintah berikut untuk mengunduh semua pustaka yang dibutuhkan:
```bash
npm install
```

### 3. Jalankan Server Development
```bash
npm run dev
```

> [!IMPORTANT]
> **Penting untuk Pengguna Windows (Bypass Error Ampersand `&`)**:
> Jika folder tempat Anda menyimpan project ini mengandung karakter ampersand (`&`) (seperti folder bawaan Anda `TeoriBahasa&Automata`), menjalankan perintah bawaan `npm run dev` dapat memicu error shell Windows CMD.
>
> Anda dapat melewatinya dengan **menjalankan server Vite secara langsung menggunakan Node**:
> ```powershell
> node node_modules/vite/bin/vite.js
> ```

Setelah berjalan, buka alamat lokal yang muncul di browser Anda (biasanya `http://localhost:5173`).

### 4. Build untuk Produksi
Untuk mengompilasi aplikasi ke dalam bundel web yang sangat teroptimasi (HTML, CSS, JS statis):
```bash
node node_modules/vite/bin/vite.js build
```
Hasil kompilasi akan diletakkan di dalam folder `dist/` dan siap dideploy ke layanan hosting statis (GitHub Pages, Vercel, Netlify).

---

## 📁 Struktur Kode

```
src/
├── main.jsx                 ← Entry point aplikasi React
├── App.jsx                  ← Main layout & pengaturan tab navigasi
├── index.css                ← Konfigurasi Tailwind v4 & style kustom (Light/Dark Mode)
├── components/
│   ├── AutomataGraph.jsx    ← Komponen React Flow untuk visualisasi graf (Custom Node & Loops)
│   ├── DFAInputForm.jsx     ← Form input matriks transisi δ DFA yang reusable
│   ├── NFAInputForm.jsx     ← Form input matriks transisi δ NFA (mendukung koma-terpisah & epsilon)
│   ├── TransitionTable.jsx  ← Render tabel δ dinamis untuk DFA dan NFA
│   ├── SimulationLog.jsx    ← Tabel log penelusuran langkah-demi-langkah
│   └── Navbar.jsx           ← Header logo & tombol toggle Light/Dark Mode
├── tabs/
│   ├── DFASimulator.jsx     ← Modul Feature 1: DFA simulator & pemutar langkah
│   ├── NFASimulator.jsx     ← Modul Feature 2: NFA simulator & pemutar langkah (Subset & Epsilon)
│   ├── RegexToNFA.jsx       ← Modul Feature 3: Thompson Construction & NFA simulator
│   ├── DFAMinimizer.jsx     ← Modul Feature 4: Side-by-side graph DFA minimizer
│   └── DFAEquivalence.jsx   ← Modul Feature 5: Equivalence checker & product graph
└── lib/
    ├── dfaEngine.js         ← Logika eksekusi DFA & Bahasa Indonesia reason generator
    ├── nfaEngine.js         ← Logika NFA epsilon closure & subset simulation
    ├── regexToNFA.js        ← Regex AST recursive descent parser & Thompson compiler
    ├── dfaMinimizer.js      ← BFS unreachable remover & Hopcroft partitioning
    ├── dfaEquivalence.js    ← Product states BFS & witness generator
    └── graphLayout.js       ← Algoritma tata letak melingkar otomatis untuk graf
```

---

## 💡 Konsep Matematika & Teori Otomata yang Diimplementasikan

1.  **Thompson's Construction**: Mengubah regex menjadi NFA dengan menambahkan transisi kosong ($\epsilon$) sekuensial dan paralel berdasarkan operator AST.
2.  **Epsilon-Closure ($\epsilon\text{-closure}$)**: Menghitung himpunan semua state yang dapat dijangkau dari suatu state $s$ hanya dengan melintasi transisi $\epsilon$.
3.  **Subset Construction**: Metode untuk mensimulasikan NFA secara paralel pada memori dengan memperlakukan status NFA sebagai pergerakan sekelompok state (*state sets*).
4.  **Hopcroft's Partition Refinement**: Meminimalkan DFA dengan membagi himpunan $Q$ menjadi partisi-partisi terkecil yang saling terbedakan (*distinguishable*) menggunakan uji kecocokan perilaku transisi input.
5.  **Product Automaton $A \times B$**: Otomaton gabungan yang menyinkronkan langkah dari dua otomata berbeda, digunakan untuk membuktikan kesamaan bahasa formal $L(A) = L(B)$ (Ekuivalensi).
