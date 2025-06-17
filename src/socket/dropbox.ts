// internal import
import { authenticateSocket } from "../middleware/authenticate";
import { authorizeSocket } from "../middleware/permission";
import messageService from "../service/message";
import conversationService from "../service/conversation";
import { CustomError, handleSocketError } from "../lib/error";

// types import
import { Namespace } from "socket.io";
import { IMsg } from "../types/conversation";
import { IMessage } from "../repository/message";

export function dropboxNamespace(dropboxChat: Namespace) {
  dropboxChat.use(authenticateSocket);

  dropboxChat.on("connection", (socket) => {
    const user = socket.data.authUser;

    // ✅ Authorization logic
    if (
      !authorizeSocket([
        "admin",
        "superadmin",
        "accountant",
        "counsellor",
        "examceller",
        "student",
        "teacher",
      ])(socket)
    ) {
      socket.disconnect(true);
      return;
    }

    // Join collegeId room
    const collegeRoom = `college_${user.collageId}`;
    socket.join(collegeRoom);
    console.log(`${user.email} joined college room: ${collegeRoom}`);

    // Listen for announcements
    socket.on("send_dropbox", async (data: IMsg) => {
      try {
        // get conversation
        const conversation = await conversationService.getConByNameAndCollageId(
          {
            collageId: user.collageId,
            conName: "dropbox",
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
          conId: data.conId,
        };

        // create new message
        const updateMsg = await messageService.createMessage(msgPayload);
        // Emit only to same-college users
        dropboxChat.to(collegeRoom).emit("new_dropbox", updateMsg);
      } catch (error: unknown) {
        handleSocketError(socket, error, "dropbox_error");
      }
    });
  });
}
