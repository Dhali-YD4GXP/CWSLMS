# Project Name: Collaborative Class LMS (cws.dhali.my.id)
# Description: Lightweight, collaborative Learning Management System for a peer group.
# Infrastructure: Cloudflare -> Ubuntu Server.
# Architecture Model: Multi-Agent Collaboration (Design, Frontend, Backend, QA).

## 1. Misi Utama & Panduan Desain (System Directive)
Tugas kalian adalah membangun aplikasi web LMS kolaboratif yang *robust*, sangat estetik (modern, clean, dark/light mode), dan responsif sempurna (Mobile-first). 
Karena sistem ini bersifat kolaboratif penuh tanpa hierarki admin (egaliter), sistem harus memiliki mekanisme pengamanan data internal (*soft delete* & *audit trail*) untuk mencegah kehilangan data akibat ketidaksengajaan pengguna.

Kalian beroperasi sebagai tim *multi-agent*. Setiap output harus melewati agent QA/Reviewer untuk koreksi bug dan validasi desain sebelum difinalisasi. Fitur AI asisten akan ditambahkan di masa depan; siapkan arsitektur kode modular, namun abaikan implementasi AI-nya saat ini.

## 2. Peran Agent (Agent Roles & Workflow)

*   **Agent 1: Lead Architect / PM**
    *   Tugas: Merancang skema database (termasuk relasi log aktivitas dan komentar), struktur proyek, dan alur kerja.
*   **Agent 2: UI/UX Designer**
    *   Tugas: Menghasilkan UI yang estetik, modern, dan intuitif. Memastikan fitur seperti *recycle bin* dan kolom komentar menyatu dengan mulus dalam desain.
*   **Agent 3: Frontend Engineer**
    *   Tugas: Menerjemahkan desain menjadi kode (Next.js/React, Tailwind, Shadcn/Framer Motion).
*   **Agent 4: Backend Engineer**
    *   Tugas: Membangun API, autentikasi, manajemen file, *webhook* notifikasi, dan skrip *backup* otomatis. (Node.js/Go/Python dengan PostgreSQL).
*   **Agent 5: QA & Code Reviewer**
    *   Tugas: Menguji integrasi, performa *upload*, mencegah *layout break* di mobile, dan memastikan *soft delete* berjalan tanpa menghapus data permanen.

## 3. Spesifikasi Fitur Utama

### A. Autentikasi & Akun Pengguna (Egalitarian Access)
*   Setiap anggota memiliki akun (Login/Register).
*   Semua pengguna memiliki hak akses penuh dan setara untuk membaca, menambahkan, mengedit, dan menghapus (via *soft delete*) data di semua modul.

### B. Modul Tugas, Jadwal & Notifikasi Eksternal
*   **List Tugas:** Kanban/List view dengan *deadline*, deskripsi, dan status.
*   **Reminder UI:** Hitung mundur (*countdown*) untuk *deadline* tugas, UTS, UAS, dan kelas rutin.
*   **Push Notification:** Integrasi *webhook* otomatis untuk mengirim *reminder* (H-3, H-1) langsung ke bot grup Telegram atau Discord kelas.

### C. Kolaborasi, Repositori & Perpustakaan (Materials & Books)
*   **Materi & Soal:** Link URL untuk materi, *slide*, dan bank soal tahun lalu.
*   **Library:** Fitur *upload* PDF (buku referensi) ke server dengan tombol *preview/download*.
*   **Filter & Tagging Lanjutan:** Pencarian/filter berdasarkan Mata Kuliah dan sistem *Tag* kustom (misal: "Tugas Kelompok", "Urgensi Tinggi").
*   **Kolom Komentar:** Setiap item (Tugas, Link Materi, atau Buku) memiliki *thread* komentar mini agar pengguna dapat berdiskusi (misal: pembagian kelompok, klarifikasi jawaban soal).

### D. Keamanan Data Interaksi (Collaboration Safety)
*   **Audit Trail:** Sistem log internal yang mencatat aktivitas pengguna ("User X mengedit Tugas Y pada pukul Z"). Ditampilkan secara ringkas di UI.
*   **Soft Delete & Recycle Bin:** Fungsi "Hapus" tidak membuang data dari *database*, melainkan mengubah statusnya (*hidden*). Buat UI "Recycle Bin" agar data yang terhapus tak sengaja dapat dipulihkan oleh siapa saja.

## 4. Persyaratan Infrastruktur & Deployment

*   **Domain:** `cws.dhali.my.id`
*   **CDN/DNS:** Cloudflare (Backend wajib membaca *real IP* dari *proxied traffic* Cloudflare).
*   **Server:** Self-hosted Ubuntu Server menggunakan Docker (`docker-compose.yml`).
*   **File Handling & Pembatasan:** Setel *limit upload* maksimal 20MB per file PDF di level Nginx dan API untuk mencegah *overload* kapasitas penyimpanan Ubuntu.
*   **Automated Backup:** Sertakan *script cronjob* atau *Docker service* terpisah yang otomatis melakukan *dump database* PostgreSQL dan mem-backup direktori PDF secara berkala.

## 5. Instruksi Eksekusi untuk AI (Phased Execution)
1.  **Fase 1 (Arsitektur):** Hasilkan ERD lengkap (tabel *users*, *tasks*, *materials*, *books*, *comments*, *activity_logs*) dengan dukungan kolom `deleted_at` untuk *soft delete*. Review oleh QA.
2.  **Fase 2 (Backend Core):** Bangun REST/GraphQL API. Implementasikan *limit upload*, *webhook* Telegram/Discord, logika *soft delete*, dan sistem *logging*.
3.  **Fase 3 (Frontend):** Bangun UI estetik. Buat komponen interaktif untuk kanban tugas, *upload* PDF, *recycle bin*, dan *chat/comment box*.
4.  **Fase 4 (Deployment):** Sediakan `docker-compose.yml`, konfigurasi Nginx/Tunnels, dan skrip *backup* *database* yang siap dijalankan di server.