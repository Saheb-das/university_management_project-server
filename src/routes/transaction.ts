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
  // checkPermission("read_transaction"),
  transactionController.getTransactions
);

router.get("/me", transactionController.getMyTransactions);

router.get(
  "/students/:studentId",
  transactionController.getFeeTransactionByStudentId
);

router.get(
  "/stuff/:userId",
  transactionController.getLastMonthTransactionByStuffUserId
);

router.get(
  "/:id",
  // checkPermission("read_transaction"),
  transactionController.getTransaction
);

router.patch(
  "/fees/:feeId/verify-fee",
  transactionController.verifyTutionFeeById
);

// export
export default router;
