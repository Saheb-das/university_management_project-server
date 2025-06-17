// internal import
import chatService from "../service/chat";
import { CustomError } from "../lib/error";

// types import
import { NextFunction, Response } from "express";
import { AuthRequest } from "../types";

async function getConversationByConName(
  req: AuthRequest<{}, {}, { conName: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { conName } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthenticate user", 401);
    }

    const collageId = req.authUser.collageId;

    if (!conName) {
      throw new CustomError("conversation name required", 400);
    }

    const con = await chatService.getConversationByConNameAndCollage(
      collageId,
      conName
    );
    if (!con) {
      throw new CustomError("conversation not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "conversation fetched successfully",
      conversation: con,
    });
  } catch (error) {
    next(error);
  }
}

async function getChatsByConvName(
  req: AuthRequest<
    {},
    {},
    { conName: string; lastMsgId?: string; limit?: string }
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { conName, lastMsgId, limit } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthenticate user", 401);
    }

    const collageId = req.authUser.collageId;

    if (!conName) {
      throw new CustomError("conversation name required", 400);
    }

    const chats = await chatService.getAllChatsByConvName({
      collageId,
      conName,
      lastMsgId,
      limit: limit ? Number(limit) : undefined,
    });
    if (!chats) {
      throw new CustomError("announcements are not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "announcements fetched successfully",
      chats: chats,
    });
  } catch (error) {
    next(error);
  }
}

async function getCommunityChatsByRole(
  req: AuthRequest<
    {},
    {},
    { conName: string; lastMsgId?: string; limit?: string }
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { conName, lastMsgId, limit } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthenticate user", 401);
    }

    const collageId = req.authUser.collageId;

    if (!conName) {
      throw new CustomError("conversation name required", 400);
    }

    const chats = await chatService.getAllChatsByConvName({
      collageId,
      conName,
      lastMsgId,
      limit: limit ? Number(limit) : undefined,
    });
    if (!chats) {
      throw new CustomError("chats are not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "chats fetched successfully",
      chats: chats,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  getChatsByConvName,
  getCommunityChatsByRole,
  getConversationByConName,
};
