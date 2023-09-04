import express from "express";

import OrderController from "../Controllers/OrderController";
import OrderFailImage from "./OrderFailImage";
import OrderCompleteImage from "./OrderCompleteImage";

require("dotenv").config();

const router = express.Router();


router.use("/image/fail", OrderFailImage);

// 테스트 완료
// GET /order
router.get("/", OrderController.order)
// POST /order
router.post("/", OrderController.request);
// PATCH /order
router.patch("/", OrderController.updateOrder);

router.use("/image/complete", OrderCompleteImage);
export default router;