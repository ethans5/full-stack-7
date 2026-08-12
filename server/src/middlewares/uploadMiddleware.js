// ================================================
// middlewares/uploadMiddleware.js — Multer Configuration
// Handles image uploads (JPEG, PNG) and PDF uploads
// ================================================

const multer = require('multer');
const path = require('path');

// ---- Storage configuration ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    /**
     * Détermine le dossier de destination en fonction du nom du champ (image ou rules_pdf).
     */
    if (file.fieldname === 'image') {
      cb(null, path.join(__dirname, '..', '..', 'uploads', 'images'));
    } else if (file.fieldname === 'rules_pdf') {
      cb(null, path.join(__dirname, '..', '..', 'uploads', 'pdfs'));
    } else {
      cb(new Error('Unexpected field name'), null);
    }
  },
  filename: (req, file, cb) => {
    /**
     * Génère un nom de fichier unique basé sur le timestamp et un nombre aléatoire.
     */
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// ---- File filter ----
/**
 * Filtre les fichiers uploadés pour n'accepter que certains types MIME.
 * @param {Object} req - La requête courante
 * @param {Object} file - Le fichier en cours d'upload
 * @param {Function} cb - Le callback à appeler avec le résultat
 */
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png'];
  const allowedPdfTypes = ['application/pdf'];

  if (file.fieldname === 'image' && allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.fieldname === 'rules_pdf' && allowedPdfTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for field "${file.fieldname}". Allowed: JPEG, PNG (image) or PDF (rules_pdf).`), false);
  }
};

// ---- Multer instance ----
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max per file
  },
});

// Export a middleware that accepts both fields simultaneously
// Usage: uploadMiddleware (handles "image" + "rules_pdf" in a single request)
const uploadMiddleware = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'rules_pdf', maxCount: 1 },
]);

module.exports = uploadMiddleware;
