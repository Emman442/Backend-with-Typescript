import multer, { FileFilterCallback } from "multer";
import { Request, Express } from "express";
import AppError from "./appError";

// Define the storage strategy for multer
const multerStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let folder = "public/files";
    if (file.mimetype.startsWith("image")) {
      folder = "public/photos";
    }
    cb(null, folder);
  },

  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `admin-${file.fieldname}-${Date.now()}.${ext}`);
  },
});

// Define the file filter for multer
const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: any
) => {
  const allowedImageTypes = ["image/jpeg", "image/png"];
  const allowedFileTypes = ["application/pdf"];

  const isValidImage = allowedImageTypes.includes(file.mimetype);
  const isValidPDF = allowedFileTypes.includes(file.mimetype);

  if (isValidImage || isValidPDF) {
    cb(null, true);
  } else {
    cb(
      new AppError("Image uploaded is not of type jpg/jpeg or png", "400"),
      false
    );
  }
};

// Configure and create the multer upload instance
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
    files: 5, // Maximum number of files
  },
});

export default upload;
