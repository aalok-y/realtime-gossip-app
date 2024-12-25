import { Root } from "@radix-ui/react-slot";
import { WebSocket, WebSocketServer } from "ws";

interface Socket {
  name: string;
  socket: WebSocket;
}

type visibility = "private" | "public";

interface Room {
  id: string;
  name: string;
  people: Socket[];
  visibility: visibility;
  pass?: string;
}

interface joinMsg {
  type: "join";
  payload: {
    name: string;
    roomId: string;
    pass: string;
  };
}

interface leaveMsg {
  type: "leave";
  payload: {
    roomId: string;
  };
}

interface chatMsg {
  type: "chat";
  payload: {
    roomId: string;
    msg: string;
  };
}

interface createMsg {
  type: "create";
  payload: {
    name: string;
    visibility: string;
    pass: string;
  };
}

interface queryRoom {
  type: "query";
  payload: {
    query: "rooms";
  };
}

interface queryUserInRoom {
  type: "query";
  payload: {
    query: "userInRoom";
    roomId: string;
  };
}

function generateRandomString(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

const rooms: Room[] = [];

const allSockets: Socket[] = [];

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket) => {
  console.log("user connected");
  // socket.send("message: Welcome! You are connected to server");
  socket.on("message", (data) => {
    const messageString = data.toString();
    console.log("message: ");
    console.log(messageString);

    const successCodeMsg = {
      code: 0
    }

    const failureCodeMsg = {
      code: 1
    }

    let parsedMessage;
    try {
      parsedMessage = JSON.parse(messageString.toString());
      console.log("parsed JSON: ", parsedMessage);
    } catch (error) {
      console.log(`Unable to parse JSON: ${error}`);
    }

    if (parsedMessage.type === "join") {
      const name = parsedMessage.payload.name;
      const roomId = parsedMessage.payload.roomId;
      const pass = parsedMessage.payload.pass;
      const room = rooms.find((room) => room.id == roomId);
      const user = room?.people.find((u) => u.socket == socket);
      console.log("roomid: ", roomId);
      if (user) {
        const res = {...failureCodeMsg,message: `You are already in the Room: ${roomId}`}
        socket.send(JSON.stringify(res));
        return;
      }
      if (room) {
        if (room.pass == pass) {
          const newSocket: Socket = {
            name: name,
            socket: socket,
          };
          room.people.push(newSocket);
          allSockets.push(newSocket);
          const res = {...successCodeMsg, message: `Successfully joined the Room: ${roomId}`};
          socket.send(JSON.stringify(res));
        } else {
          const res = {...failureCodeMsg,message: `Invalid Pass Key!`}
          socket.send(JSON.stringify(res));
        }
      } else {
        const res = {...failureCodeMsg,message: `Room does not exist`}
        socket.send(JSON.stringify(res));
      }
    }

    if (parsedMessage.type === "create") {
      const roomName = parsedMessage.payload.name;
      const roomVisibility = parsedMessage.payload.visibility;
      const roomPass = parsedMessage.payload.pass;
      const roomId: string = generateRandomString(5);
      const newRoom: Room = {
        id: roomId,
        name: roomName,
        people: [],
        visibility: roomVisibility,
        pass: roomPass,
      };

      rooms.push(newRoom);
      const res = {...successCodeMsg, message: `Room created successfully, Room id: ${roomId}`};
      socket.send(JSON.stringify(res));
    }

    if (parsedMessage.type === "chat") {
      const roomId = parsedMessage.payload.roomId;
      const msg = parsedMessage.payload.msg;

      const room = rooms.find((room) => room.id == roomId);
      if (room) {
        const currentUser = room.people.find((user) => user.socket == socket);
        if (currentUser) {
          for (const user of room.people) {
            if(user.socket==socket){
              continue;
            }
            const namedMsg = {
              msg,
              user: currentUser.name,
            };
            user.socket.send(`message: ${JSON.stringify(namedMsg)}`);
          }
        } else {
          const res = {...failureCodeMsg, message: `You are not in the Room`};
          socket.send(JSON.stringify(res));
        }
      } else {
        const res = {...failureCodeMsg, message: `Room does not exist`};
        socket.send(JSON.stringify(res));
      }
    }

    if (parsedMessage.type === "query") {
      const queryType = parsedMessage.payload.query;
      if (queryType === "rooms") {
        const allRooms = rooms.map(({ pass, ...roomDetails }) => roomDetails);
        console.log("all rooms: ", allRooms);
        socket.send(JSON.stringify(allRooms));
      }
      if (queryType === "userInRoom") {
        const userRoomId = parsedMessage.payload.roomId;
        const room = rooms.find((r) => r.id == userRoomId);
        if (room) {
          const currentUser = room.people.find((u) => u.socket == socket);
          if (currentUser) {
            const res = {...successCodeMsg, message: `User exists in the room`}
            socket.send(JSON.stringify(res));
          } else {
            const res = {...failureCodeMsg, message: `User does not exist in the room`};
            socket.send(JSON.stringify(res));
          }
        } else {
          const res = {...failureCodeMsg, message: `Room does not exist`};
          socket.send(JSON.stringify(res));
        }
      }
    }

    if (parsedMessage.type === "leave") {
      const roomId = parsedMessage.payload.roomId;
      const room = rooms.find((x) => x.id == roomId);
      if (room) {
        const currentUser = room.people.find((x) => x.socket == socket);
        if (currentUser) {
          room.people = room.people.filter((user) => user.socket != socket);
          const res = {...successCodeMsg,message: `User '${currentUser.name}' left the Room '${room.id}`}
          socket.send(JSON.stringify(res));
        } else {
          const res = {...failureCodeMsg, message: `You are not in the Room: ${room.id}`};
          socket.send(JSON.stringify(res));
        }
      } else {
        const res = {...failureCodeMsg, message: `Room does not exist`};
        socket.send(JSON.stringify(res));
      }
    }
  });

  socket.on("close", (code, reason) => {
    socket.send("GoodBye!");
    console.log(`Connection closed. Code: ${code}, Reason: ${reason}`);
    for (const room of rooms) {
      const user = room.people.find((u) => u.socket == socket);
      if (user) {
        room.people = room.people.filter((u) => u.socket !== socket);
      }
    }
  });
});
