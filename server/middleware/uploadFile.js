const path = require('path');
const fs = require('fs');
const multer = require('multer')

const limits = { fileSize: 2 * 1024 * 1024 };
exports.upload = imageUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const path = `public/uploads/${req.folderName}/`;
      fs.mkdirSync(path, { recursive: true })
      cb(null, path);
    },

    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
  }),
  limits,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|JPG|webp|jpeg|JPEG|png|PNG|PDF|pdf|doc|docx)$/)) {
      req.fileValidationError = 'Only image and pdf files are allowed!';
      return cb(null, false);
    }
    cb(null, true);
  }
}).single('file')