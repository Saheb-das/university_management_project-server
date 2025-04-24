// internal import
import messageRepository from "../repository/message";
import userRepository from "../repository/user";
import conversationRepository from "../repository/conversation";

// types import
import { Message } from "@prisma/client";
import { IMessage } from "../repository/message";
import { CustomError } from "../lib/error";

async function createMessage(msg: IMessage): Promise<Message | null> {
  try {
    const user = await userRepository.findById(msg.userId);
    if (!user) {
      throw new CustomError("user not found", 404);
    }

    const conversation = await conversationRepository.findById(msg.conId);
    if (!conversation) {
      throw new CustomError("conversation not found", 404);
    }

    const msgPayload: IMessage = {
      content: msg.content,
      userId: user.id,
      conId: conversation.id,
    };

    const newMessage = await messageRepository.create(msgPayload);
    if (!newMessage) {
      throw new CustomError("message not created", 500);
    }

    return newMessage;
  } catch (error) {
    console.log("Error create message", error);
    return null;
  }
}

// export
export default {
  createMessage,
};
