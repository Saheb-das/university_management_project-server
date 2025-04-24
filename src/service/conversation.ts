// internal import
import conversationRepository from "../repository/conversation";
import { CustomError } from "../lib/error";

// types import
import { Conversation } from "@prisma/client";
import { IConversation } from "../repository/conversation";

async function getConByNameAndCollageId(
  conInfo: IConversation
): Promise<Conversation | null> {
  try {
    const conPayload: IConversation = {
      collageId: conInfo.collageId,
      conName: conInfo.conName,
    };
    const con = await conversationRepository.findByNameAndCollageId(conPayload);
    if (!con) {
      throw new CustomError("conversation not found", 404);
    }

    return con;
  } catch (error) {
    console.log("Error fetching conversation", error);
    return null;
  }
}

async function getConById(conId: string): Promise<Conversation | null> {
  try {
    if (!conId) {
      throw new CustomError("conversation id required", 400);
    }

    const conversation = await conversationRepository.findById(conId);
    if (!conversation) {
      throw new CustomError("conversation not found", 404);
    }

    return conversation;
  } catch (error) {
    console.log("Error fetching conversation", error);
    return null;
  }
}

// export
export default {
  getConByNameAndCollageId,
  getConById,
};
