// internal import
import { authenticateSocket } from "../middleware/authenticate";

// types import
import { Namespace } from "socket.io";
import { authorizeSocket } from "../middleware/permission";

export function announcementNamespace(announcementChat: Namespace) {
  announcementChat.use(authenticateSocket);

  announcementChat.on("connection", (socket) => {
    const user = socket.data.authUser;

    // ✅ Authorization logic
    if (!authorizeSocket(["admin", "superadmin"])(socket)) {
      socket.disconnect(true);
      return;
    }

    // Step 3: Join collegeId room
    const collegeRoom = `college_${user.collageId}`;
    socket.join(collegeRoom);
    console.log(`${user.email} joined college room: ${collegeRoom}`);

    // Step 4: Listen for announcements
    socket.on("send_announcement", (message) => {
      // Step 5: Emit only to same-college users
      announcementChat.to(collegeRoom).emit("new_announcement", {
        user,
        message,
      });
    });
  });
}
