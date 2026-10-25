# ASRIEATS Perbanas - Campus Food Ordering Platform

**ASRIEATS** adalah platform pemesanan makanan dan minuman (*Campus Food Ordering*) yang dirancang khusus untuk memodernisasi sistem pemesanan di lingkungan kampus **Perbanas Institute**, tepatnya di area Taman Asri (TA). Aplikasi ini mempertemukan mahasiswa, pelanggan umum, dan pengelola warung (kasir) dalam satu ekosistem digital yang terintegrasi secara *real-time*.

Proyek ini dikembangkan untuk memenuhi tugas **Lomba Web Development** dengan tema *Campus Food Ordering*.

## ✨ Fitur Utama

Aplikasi ini memiliki beberapa fitur canggih yang dibagi berdasarkan *role* (peran) pengguna:

### 👨‍🎓 Sisi Pengguna (Mahasiswa, Pelanggan, Guest)
- **Multi-Role Authentication:** Login terintegrasi untuk Mahasiswa (via NIM), Pelanggan umum (via Email), dan fitur *Guest* (pesan cepat tanpa daftar).
- **Verifikasi Email (OTP):** Keamanan ekstra pada pendaftaran pelanggan baru dan fitur lupa password menggunakan One-Time Password (OTP) yang dikirim via email (diintegrasikan dengan Brevo SMTP).
- **Eksplorasi Menu:** Melihat daftar tenant/warung di Taman Asri dan menavigasi menu berdasarkan kategori (Makanan, Minuman, Snack).
- **Kustomisasi Pesanan:** Fitur keranjang belanja cerdas dengan pilihan level pedas (Tidak Pedas, Sedang, Extra Pedas) dan kolom catatan khusus untuk setiap item.
- **Sistem Poin & Voucher:** Pengguna terdaftar (Mahasiswa/Pelanggan) mendapatkan poin dari setiap transaksi yang bisa ditukar dengan voucher diskon.
- **Pilihan Tipe Pesanan:** Mendukung pesanan *Dine In* (dengan validasi nomor meja) dan *Take Away*.
- **Notifikasi Real-time:** Menerima notifikasi suara dan pop-up *custom* saat pesanan *Take Away* sudah selesai disiapkan oleh warung.
- **Manajemen Profil:** Fitur edit profil (ganti nama dan email). Khusus perubahan email, diverifikasi secara ketat menggunakan OTP.

### 🏪 Sisi Kasir (Pengelola Warung)
- **Dashboard Khusus:** Login terpisah untuk setiap warung menggunakan password khusus.
- **Manajemen Pesanan Real-time:** Melihat antrean pesanan aktif dan riwayat pesanan masuk secara langsung tanpa perlu me-refresh halaman.
- **Notifikasi Suara Kasir:** Suara bel otomatis berbunyi di perangkat kasir saat ada pesanan baru masuk dari pelanggan.
- **Filter Laporan:** Menyaring pesanan dan total pendapatan berdasarkan filter Harian, Bulanan, atau Semua Waktu.
- **Cetak Struk:** Fitur cetak struk belanja langsung ke printer thermal (format 80mm).
- **Kelola Ketersediaan Menu:** Saklar (toggle) interaktif untuk menandai menu "Tersedia" atau "Habis". Perubahan ini akan terupdate otomatis di layar pengguna secara *real-time*.

## 🛠️ Teknologi yang Digunakan

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6).
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL & Realtime Subscriptions).
- **Autentikasi:** Supabase Auth (Custom OTP via Email).
- **Layanan Email:** [Brevo](https://www.brevo.com/) (Custom SMTP).
- **Aset & Desain:** FontAwesome, Google Fonts (Playfair Display, DM Sans, Inter).

## 🗄️ Struktur Database (Supabase)

Sistem ini menggunakan beberapa tabel utama untuk menjaga integritas data:
1. `users`: Menyimpan profil pengguna (id/email/NIM, nama, role).
2. `kantins`: Menyimpan data warung beserta password login kasir.
3. `menu`: Menyimpan daftar makanan, harga, deskripsi, dan status ketersediaan (`is_available`).
4. `orders`: Menyimpan data transaksi (nama pemesan, nomor meja, total, detail item pesanan, status, dan tipe user).
5. `user_kantin_points`: Menyimpan saldo poin pengguna yang spesifik untuk setiap warung.

## 🚀 Cara Menjalankan Proyek Secara Lokal

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/valeryrasya16-beep/asrieats.git