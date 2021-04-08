const util = require("util");
const multer = require("multer");
const maxSize = 2 * 1024 * 1024;

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
let uploadFile = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
}).single("image");

let uploadDocsFileMiddleware = util.promisify(uploadFile);
module.exports = uploadDocsFileMiddleware;
