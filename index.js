const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://p2pmeet.vercel.app"],
  },
});

const rooms = {};
const users = {};

io.on("connection", (socket) => {
  console.log("a user connected " + socket.id);

  socket.on("disconnect", (params) => {
    Object.keys(rooms).map((roomId) => {
      rooms[roomId].users = rooms[roomId].users.filter((x) => x !== socket.id);
    });
    console.log("user deleted", users[socket.id]);
    delete users[socket.id];
  });

  socket.on("join", (params) => {
    const roomId = params.roomId;
    // socket.join(roomId.toString());
    console.log("🎉🎉", roomId.toString());
    users[socket.id] = {
      roomId: roomId,
    };
    if (!rooms[roomId]) {
      rooms[roomId] = {
        roomId,
        users: [],
      };
    }
    rooms[roomId].users.push(socket.id);
    console.log("🔉", rooms[roomId].users);
    console.log("user added to room " + roomId);
  });
  socket.on("message", (data) => {
    let roomId = users[socket.id].roomId;
    let otherUsers = rooms[roomId].users;
    console.log("😒😒", users[socket.id].roomId);
    console.log("😒", data);

    otherUsers.forEach((otherUser) => {
      console.log(otherUser);
      io.to(otherUser).emit("message", { data });
    });
  });

  socket.on("localDescription", (params) => {
    let roomId = users[socket.id].roomId;

    let otherUsers = rooms[roomId].users;
    otherUsers.forEach((otherUser) => {
      if (otherUser !== socket.id) {
        io.to(otherUser).emit("localDescription", {
          description: params.description,
        });
      }
    });
  });

  socket.on("remoteDescription", (params) => {
    let roomId = users[socket.id].roomId;
    let otherUsers = rooms[roomId].users;

    otherUsers.forEach((otherUser) => {
      if (otherUser !== socket.id) {
        io.to(otherUser).emit("remoteDescription", {
          description: params.description,
        });
      }
    });
  });

  socket.on("iceCandidate", (params) => {
    let roomId = users[socket.id].roomId;
    let otherUsers = rooms[roomId].users;

    otherUsers.forEach((otherUser) => {
      if (otherUser !== socket.id) {
        io.to(otherUser).emit("iceCandidate", {
          candidate: params.candidate,
        });
      }
    });
  });

  socket.on("iceCandidateReply", (params) => {
    let roomId = users[socket.id].roomId;
    let otherUsers = rooms[roomId].users;

    otherUsers.forEach((otherUser) => {
      if (otherUser !== socket.id) {
        io.to(otherUser).emit("iceCandidateReply", {
          candidate: params.candidate,
        });
      }
    });
  });
});

server.listen(8080, () => {
  console.log("listening on *:8080");
});
