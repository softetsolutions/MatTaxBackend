import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    const timestamp = Date.now();
    const finalName = `${timestamp}-${baseName}${ext}`;
    cb(null, finalName);
  }
});

const upload = multer({ storage });

export default upload;
