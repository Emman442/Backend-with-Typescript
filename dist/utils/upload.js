"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const appError_1 = __importDefault(require("./appError"));
// Define the storage strategy for multer
const multerStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let folder = "public/files";
        if (file.mimetype.startsWith("image")) {
            folder = "public/photos";
        }
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `admin-${file.fieldname}-${Date.now()}.${ext}`);
    },
});
// Define the file filter for multer
const multerFilter = (req, file, cb) => {
    const allowedImageTypes = ["image/jpeg", "image/png"];
    const allowedFileTypes = ["application/pdf"];
    const isValidImage = allowedImageTypes.includes(file.mimetype);
    const isValidPDF = allowedFileTypes.includes(file.mimetype);
    if (isValidImage || isValidPDF) {
        cb(null, true);
    }
    else {
        cb(new appError_1.default("Image uploaded is not of type jpg/jpeg or png", "400"), false);
    }
};
// Configure and create the multer upload instance
const upload = (0, multer_1.default)({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB
        files: 5, // Maximum number of files
    },
});
exports.default = upload;
