// internal import
import { Conversation } from "@prisma/client";
import { CustomError } from "../lib/error";
import collageRepository from "../repository/collage";
import conversationRepository from "../repository/conversation";
import messageRepository, { TMsgWithSender } from "../repository/message";

interface IAnnouncProps {
  collageId: string;
  conName: string;
  lastMsgId?: string;
  limit?: number;
}
async function getAllChatsByConvName({
  collageId,
  conName,
  lastMsgId,
  limit,
}: IAnnouncProps): Promise<TMsgWithSender[] | []> {
  try {
    if (!collageId) {
      throw new CustomError("collage id required", 400);
    }

    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    const conv = await conversationRepository.findByNameAndCollageId({
      collageId,
      conName,
    });
    if (!conv) {
      throw new CustomError("conversation not found", 404);
    }

    const chats = await messageRepository.getMessagesPaginated({
      conversationId: conv.id,
      cursor: lastMsgId,
      limit,
    });
    if (!chats) {
      throw new CustomError("chats not found", 404);
    }

    return chats;
  } catch (error) {
    console.log("Error fetching chats", error);
    throw error;
  }
}

async function getConversationByConNameAndCollage(
  collageId: string,
  conName: string
): Promise<Conversation> {
  try {
    if (!collageId) {
      throw new CustomError("collage id required", 400);
    }

    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    const con = await conversationRepository.findByNameAndCollageId({
      collageId,
      conName,
    });
    if (!con) {
      throw new CustomError("conversation not found", 404);
    }

    return con;
  } catch (error) {
    console.log("Error fetching conversation", error);
    throw error;
  }
}

// export
export default {
  getAllChatsByConvName,
  getConversationByConNameAndCollage,
};
