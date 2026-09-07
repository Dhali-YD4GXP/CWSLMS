#!/bin/bash
# Script untuk backup otomatis Database PostgreSQL dan file PDF (uploads) CWSLMS
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "🔄 Memulai proses backup LMS ($DATE)..."

# Backup Database PostgreSQL dari Container Docker
docker exec cwslms_db pg_dump -U cws_user cwslms > $BACKUP_DIR/db_backup_$DATE.sql
echo "✅ Database berhasil di-backup."

# Backup Folder Uploads (Materi & Tugas PDF)
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz ./uploads
echo "✅ Folder Uploads berhasil di-compress."

echo "🎉 Backup selesai! File tersimpan di direktori: $BACKUP_DIR"

# TIPS UNTUK ADMIN:
# Jalankan perintah `crontab -e` di server Ubuntu Anda dan tambahkan baris berikut
# untuk melakukan backup otomatis setiap jam 2 pagi:
# 0 2 * * * /path/to/CWSLMS/backup.sh >> /path/to/CWSLMS/backup.log 2>&1
