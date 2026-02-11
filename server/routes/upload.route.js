const express = require("express");
const path = require('path');
const constants = require("../config/constants");
const uploadFileMiddleware = require("../middleware/uploadFileMiddleware");

const router = express.Router();
router.post(constants.path.uploadFile, async (req, res) => {
  try {
    await uploadFileMiddleware(req, res);
    if (!req.file) {
      return res.status(400).send({ message: "Please upload a file!" });
    }
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).send({ message: "Uploaded file size must be below 5MB" });
    }

    // let filePath = req.file.path.replaceAll('\\', '/').replace('/opt/shreeladies/', '');
    // res.status(200).send({ file: filePath });
    const relativePath = path.join('uploads', req.file.filename).replace(/\\/g, '/');
    res.json({ file: relativePath });
  } catch (error) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).send({ message: "File size should not exceed 5MB." });
    }
    return res.status(500).send({ message: `Could not upload the file: ${error.message || error}`, });
  }
}
);

module.exports = router;
