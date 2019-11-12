const multer = require('multer');
const path = require('path');

const MIME_TYPE = {
  'image/gif': 'gif',
};
const storage = multer.diskStorage({
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPE[file.mimetype];
    callback(null, `${name + Date.now()}.${extension}`);
  },
});
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 30,
  },
  fileFilter: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.gif') {
      return callback('Only gif images allowed');
    }
    return callback(null, true);
  },
});
module.exports = upload;
