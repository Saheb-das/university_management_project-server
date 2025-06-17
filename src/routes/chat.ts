// external import
import express from "express";

// internal import
import chatController from "../controller/chat";
import { checkPermission } from "../middleware/permission";

// create router
const router = express.Router();

// routes
router.get("/announcement", chatController.getChatsByConvName);

router.get("/dropbox", chatController.getChatsByConvName);

router.get("/community", chatController.getChatsByConvName);

router.get("/classroom", chatController.getChatsByConvName);

router.get("/con", chatController.getConversationByConName);

// export
export default router;
