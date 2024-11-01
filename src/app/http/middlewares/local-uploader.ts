import multer from "multer";
import envVars from "@shared/env-vars";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //Directory of files to upload
    const dir = path.join(__dirname, '../', envVars.folder);
    //Check if directory exist, if not then create
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  }, filename: function (req, file, cb) {
    const date = new Date();
    const random = Math.floor((Math.random() * 10000) + 1);

    const ext = file.originalname
      .split('.')
      .filter(Boolean)
      .slice(1)
      .join('.');

    const uniqueSuffix = `PO${date.getDay()}${date.getMonth()}${date.getFullYear()}${random}-`
      + Date.now().toString()
      + Math.round(Math.random() * 1E9).toString()
      + '.' + ext;
    cb(null, uniqueSuffix);
  }
});
// const storage = multer.memoryStorage();
const upload = multer({storage});

export default upload;