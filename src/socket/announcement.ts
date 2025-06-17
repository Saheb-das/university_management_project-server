// internal import
import { authenticateSocket } from "../middleware/authenticate";
import messageService from "../service/message";
import conversationService from "../service/conversation";

// types import
import { Namespace } from "socket.io";
import { IMessage } from "../repository/message";
import { IMsg } from "../types/conversation";
import { CustomError, handleSocketError } from "../lib/error";

export function announcementNamespace(announcementChat: Namespace) {
  announcementChat.use(authenticateSocket);

  announcementChat.on("connection", (socket) => {
    const user = socket.data.authUser;

    // ✅ Join their college's announcement room
    const collegeRoom = `college_${user.collageId}`;
    socket.join(collegeRoom);
    console.log(`${user.email} joined college room: ${collegeRoom}`);

    // ✅ Allow only admins/superadmins to send announcements
    socket.on("send_announcement", async (data: IMsg) => {
      try {
        // Only admins/superadmins can send
        if (!["admin", "superadmin"].includes(user.role)) {
          socket.emit("error_occurred", {
            message: "Not authorized to send announcements.",
          });
          return;
        }

        // get conversation
        const conversation = await conversationService.getConByNameAndCollageId(
          {
            collageId: user.collageId,
            conName: "announcement",
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
        announcementChat.to(collegeRoom).emit("new_announcement", updateMsg);
      } catch (error: unknown) {
        handleSocketError(socket, error, "announcement_error");
      }
    });
  });
}
