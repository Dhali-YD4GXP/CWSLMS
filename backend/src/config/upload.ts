import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Pastikan folder uploads tersedia
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'book-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Konfigurasi Multer
// Limit file size maksimal 20MB
export const uploadMiddleware = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
  fileFilter: (req, file, cb) => {
    // Hanya menerima file PDF sesuai instruksi
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Hanya file PDF yang diizinkan untuk di-upload.'));
    }
  },
});
