// external import
import express from "express";

// internal import
import transactionController from "../controller/transaction";
import { checkPermission } from "../middleware/permission";

// create router
const router = express.Router();

// routes
router.post("/", transactionController.createTransaction);

router.get(
  "/",
  checkPermission("read_transaction"),
  transactionController.getTransactions
);

router.get("/me", transactionController.getMyTransactions);

router.get(
  "/:id",
  // checkPermission("read_transaction"),
  transactionController.getTransaction
);

router.post("/create-order", transactionController.createPaymentOrder);

router.post("/verify-payment", transactionController.verifyPaymentOrder);

// export
export default router;
