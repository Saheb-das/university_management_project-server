// internal import
import { authenticateSocket } from "../middleware/authenticate";
import studentService from "../service/student";
import asignTeacherService from "../service/asign-teacher";
import { authorizeSocket } from "../middleware/permission";
import { CustomError } from "../lib/error";

// types import
import { Namespace } from "socket.io";

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
        const batchRoom = `collage_${user.collageId}_${user.role}_${student.batch.name}`;
        socket.join(batchRoom);
        console.log(`${user.email} joined college room: ${batchRoom}`);

        // Listen for message
        socket.on("send_classroom", (message) => {
          // Emit only to same-college users
          classroomChat.to(batchRoom).emit("new_classroom", {
            user,
            message,
          });
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
        teacherBatches.forEach((batch) => {
          const batchRoom = `college_${user.collageId}_${user.role}_${batch}`;
          socket.join(batchRoom);
          console.log(`${user.email} joined room: ${batchRoom}`);
        });

        // ✅ Listen for messages and broadcast to all joined rooms
        socket.on("send_classroom", (message) => {
          teacherBatches.forEach((batch) => {
            const batchRoom = `college_${user.collageId}_${user.role}_${batch}`;
            classroomChat.to(batchRoom).emit("new_classroom", {
              user,
              message,
            });
          });
        });
      }
    } catch (error: any) {
      socket.emit("error", {
        status: error.statusCode || 500,
        message: error.message || "Unexpected error",
      });
    }
  });
}
