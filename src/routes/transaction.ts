// external import
import express from "express";

// internal import
import transactionController from "../controller/transaction";

// create router
const router = express.Router();

// routes
router.post("/", transactionController.createTransaction);

router.get("/", transactionController.getTransactions);

router.get("/:id", transactionController.getTransaction);

router.patch("/:id", transactionController.updateTransaction);

router.delete("/:id", transactionController.deleteTransaction);

// export
export default router;
