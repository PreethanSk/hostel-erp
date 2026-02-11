const util = require('util')
const path = require('path');
const fs = require('fs');
const multer = require('multer')

// const maxSize = 5 * 1024 * 1024

// let storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const path = `/opt/shreeladies/uploads/`;
//     fs.mkdirSync(path, { recursive: true });
//     cb(null, path);
//   },

//   filename: (req, file, cb) => {
//     console.log(file.originalname)
//     cb(null, `${Date.now()}${path.extname(file.originalname)}`)
//   },
// })

// let uploadFile = multer({
//   storage: storage,
//   limits: { fileSize: maxSize },
// }).single('file')

// const uploadDir = '/opt/shreeladies/uploads';
const uploadPath = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`📁 Created upload directory: ${uploadPath}`);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const maxSize = 5 * 1024 * 1024;

const uploadFile = multer({ storage, limits: { fileSize: maxSize } }).single('file');

let uploadFileMiddleware = util.promisify(uploadFile)

module.exports = uploadFileMiddleware
