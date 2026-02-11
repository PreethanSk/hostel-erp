const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const path = `../public/upload/${folderName}`;
    fs.mkdirSync(path, { recursive: true });
    callback(null, '');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  },
});
const uploadSupport = multer({ storage: storage }).single('userPhoto');

module.exports.upload = async (req, res) => {
  uploadSupport(req, res, function (err) {
    if (err) {
      return res.end('Error uploading file.');
    }
    res.end('File is uploaded');
  });
};
