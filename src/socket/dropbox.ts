// internal import
import { authenticateSocket } from "../middleware/authenticate";

// types import
import { Namespace } from "socket.io";
import { authorizeSocket } from "../middleware/permission";

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

    // Step 3: Join collegeId room
    const collegeRoom = `college_${user.collageId}`;
    socket.join(collegeRoom);
    console.log(`${user.email} joined college room: ${collegeRoom}`);

    // Step 4: Listen for announcements
    socket.on("send_dropbox", (message) => {
      // Step 5: Emit only to same-college users
      dropboxChat.to(collegeRoom).emit("new_dropbox", {
        user,
        message,
      });
    });
  });
}
