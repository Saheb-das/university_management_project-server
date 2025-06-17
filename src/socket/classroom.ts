// internal import
import studentService from "../service/student";
import asignTeacherService from "../service/asign-teacher";
import messageService from "../service/message";
import conversationService from "../service/conversation";
import { authenticateSocket } from "../middleware/authenticate";
import { authorizeSocket } from "../middleware/permission";
import { CustomError, handleSocketError } from "../lib/error";

// types import
import { Namespace } from "socket.io";
import { IMsg } from "../types/conversation";
import { IMessage } from "../repository/message";

export function classroomNamespace(classroomChat: Namespace) {
  classroomChat.use(authenticateSocket);

  classroomChat.on("connection", async (socket) => {
    const user = socket.data.authUser;

    try {
      // ✅ Authorization logic
      if (!authorizeSocket(["student", "teacher"])(socket)) {
        socket.disconnect(true);
        return;
      }

      if (user.role === "student") {
        const student = await studentService.getStudentByUserId(user.id);
        if (!student) {
          throw new CustomError("student not found", 404);
        }

        // ✅ Join batch rooms for student
        const batchRoom = `collage_${user.collageId}_${student.batch.name}`;
        socket.join(batchRoom);
        console.log(`${user.email} joined college room: ${batchRoom}`);

        // Listen for message
        socket.on("send_classroom", async (data: IMsg) => {
          try {
            // get conversation
            const conversation =
              await conversationService.getConByNameAndCollageId({
                collageId: user.collageId,
                conName: `classroom ${student.batch.name}`,
              });

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
            classroomChat.to(batchRoom).emit("new_classroom", updateMsg);
          } catch (error: unknown) {
            handleSocketError(socket, error, "classroom_error");
          }
        });
      } else if (user.role === "teacher") {
        const teacherBatches =
          await asignTeacherService.getAllBatchesByTeacherUserId(user.id);
        if (!teacherBatches) {
          throw new CustomError("teacher batches not found", 404);
        }

        if (teacherBatches.length <= 0) {
          throw new CustomError("teacher not asign any batches");
        }

        // ✅ Join all batch rooms for teacher
        teacherBatches.forEach((item) => {
          const batchRoom = `college_${user.collageId}_${item.batch.name}`;
          socket.join(batchRoom);
          console.log(`${user.email} joined room: ${batchRoom}`);
        });

        // ✅ Listen for messages and broadcast to all joined rooms
        socket.on("send_classroom", async (data: IMsg) => {
          try {
            const conversation = await conversationService.getConById(
              data.conId
            );
            if (!conversation) {
              throw new CustomError("conversation not found", 404);
            }

            // Extract batch name from conversation name
            const batchName = conversation.name
              .replace("classroom ", "")
              .trim();

            // Ensure teacher is assigned to that batch
            const isAssigned = teacherBatches.some(
              (item) => item.batch.name === batchName
            );
            if (!isAssigned) {
              throw new CustomError("You are not assigned to this batch", 403);
            }

            // Create the message
            const msgPayload: IMessage = {
              content: data.content,
              userId: user.id,
              conId: conversation.id,
            };

            const updateMsg = await messageService.createMessage(msgPayload);

            // Emit message to the specific batch room
            const batchRoom = `college_${user.collageId}_${batchName}`;

            classroomChat.to(batchRoom).emit("new_classroom", updateMsg);
          } catch (error: unknown) {
            handleSocketError(socket, error, "classroom_error");
          }
        });
      }
    } catch (error: unknown) {
      handleSocketError(socket, error, "classroom_error");
    }
  });
}
