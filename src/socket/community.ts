// internal import
import { authenticateSocket } from "../middleware/authenticate";

// types import
import { Namespace } from "socket.io";
import { authorizeSocket } from "../middleware/permission";

export function communityNamespace(communityChat: Namespace) {
  communityChat.use(authenticateSocket);

  communityChat.on("connection", (socket) => {
    const user = socket.data.authUser;

    // ✅ Authorization logic
    if (
      !authorizeSocket([
        "admin",
        "superadmin",
        "accountant",
        "counsellor",
        "examceller",
        "teacher",
      ])(socket)
    ) {
      socket.disconnect(true);
      return;
    }

    // Step 3: Join collegeId room
    const roleBasedRoom = `college_${user.collageId}_${user.role}`;
    socket.join(roleBasedRoom);
    console.log(`${user.email} joined college room: ${roleBasedRoom}`);

    // Step 4: Listen for announcements
    socket.on("send_community", (message) => {
      // Step 5: Emit only to same-college users
      communityChat.to(roleBasedRoom).emit("new_community", {
        user,
        message,
      });
    });
  });
}
