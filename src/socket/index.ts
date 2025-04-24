// external import
import socketIO from "socket.io";

// internal import
import { announcementNamespace } from "./announcement";
import { dropboxNamespace } from "./dropbox";
import { communityNamespace } from "./community";
import { classroomNamespace } from "./classroom";

// types import
import { Server } from "http";

function socketHandler(server: Server) {
  const io = new socketIO.Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  // create different namespace
  const announcementChat = io.of("/announcement");
  const dropboxChat = io.of("/dropbox");
  const communityChat = io.of("/community");
  const classroomChat = io.of("/classroom");

  announcementNamespace(announcementChat);
  dropboxNamespace(dropboxChat);
  communityNamespace(communityChat);
  classroomNamespace(classroomChat);
}

export { socketHandler };
