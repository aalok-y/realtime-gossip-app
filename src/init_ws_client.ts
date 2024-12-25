import { WebSocket } from "ws";

const ws = new WebSocket("ws://localhost:8080");

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
    visibility: visibility;
    pass: string;
  };
}

interface queryMsg {
  type: "query";
  payload: {
    query: "rooms";
  };
}

const roomNames = ["moon", "star", "galaxy", "andromeda", "plasmoid", "centauri"];

// Function to create rooms
function createRooms(arr: string[]): createMsg[] {
  const rooms: createMsg[] = [];
  
  const halfLength = Math.floor(arr.length / 2);
  
  // Create public rooms
  for (let i = 0; i < halfLength; i++) {
    const room: createMsg = {
      type: "create",
      payload: {
        name: arr[i],
        visibility: "public",
        pass: "",
      },
    };
    rooms.push(room);
  }

  // Create private rooms
  for (let i = halfLength; i < arr.length; i++) {
    const room: createMsg = {
      type: "create",
      payload: {
        name: arr[i],
        visibility: "private",
        pass: "123", // Password for private rooms
      },
    };
    rooms.push(room);
  }

  return rooms;
}

// Event listener when the WebSocket opens
ws.on("open", () => {
  const roomQuery = createRooms(roomNames);
  
  // Send each room creation message after stringifying it
  roomQuery.forEach((room) => {
    // Ensure that the message is stringified before sending
    ws.send(JSON.stringify(room));
  });
});
