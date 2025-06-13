// external import
import express from "express";

// internal import
import razorpayController from "../controller/razorpay";

// create router
const router = express.Router();

// routes

router.post("/order", razorpayController.createPaymentOrder);

router.post("/verify", razorpayController.verifyPaymentOrder);

// export
export default router;
