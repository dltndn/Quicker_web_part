import express, { Request } from "express";
import multer from "multer";

import { orderController } from "../Controllers";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// GET /order/image/complete
router.get("/", orderController.getImage);

// POST /order/image/complete
router.post("/", upload.single("uploadImage"), orderController.postImage);

export interface MulterRequest extends Request {
  file: any;
}

export default router;