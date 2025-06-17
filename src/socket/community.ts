// internal import
import { authenticateSocket } from "../middleware/authenticate";
import conversationService from "../service/conversation";
import { CustomError, handleSocketError } from "../lib/error";
import messageService from "../service/message";

// types import
import { Namespace } from "socket.io";
import { authorizeSocket } from "../middleware/permission";
import { IMsg } from "../types/conversation";
import { IMessage } from "../repository/message";

export function communityNamespace(communityChat: Namespace) {
  communityChat.use(authenticateSocket);

  communityChat.on("connection", (socket) => {
    const user = socket.data.authUser;

    // ✅ Authorization logic
    if (
      !authorizeSocket(["accountant", "counsellor", "examceller", "teacher"])(
        socket
      )
    ) {
      socket.disconnect(true);
      return;
    }

    // Join collegeId room
    const roleBasedRoom = `college_${user.collageId}_${user.role}`;
    socket.join(roleBasedRoom);
    console.log(`${user.email} joined college room: ${roleBasedRoom}`);

    // Listen for announcements
    socket.on("send_community", async (data: IMsg) => {
      try {
        const conversation = await conversationService.getConByNameAndCollageId(
          {
            collageId: user.collageId,
            conName: `community ${user.role}`,
          }
        );
        if (!conversation) {
          throw new CustomError("conversation not found", 404);
        }

        if (conversation.id !== data.conId) {
          throw new CustomError("invalid conversation id", 400);
        }

        const msgPayload: IMessage = {
          content: data.content,
          userId: user.id,
          conId: conversation.id,
        };

        // create new message
        const updateMsg = await messageService.createMessage(msgPayload);

        // Emit only to same-college users
        communityChat.to(roleBasedRoom).emit("new_community", updateMsg);
      } catch (error: unknown) {
        handleSocketError(socket, error, "community_error");
      }
    });
  });
}
