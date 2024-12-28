# Real-time Chat Application Backend (WebSocket)

This backend provides a real-time chat application using WebSocket with support for chat rooms. Users can connect to the WebSocket server, query available rooms, join specific rooms, send messages, and leave rooms. The backend is designed to handle commands from users in **JSON** format, making it easy to integrate with different frontend clients.

This backend supports both **public** and **private chat rooms**:
- **Public rooms** allow anyone to join without a password.
- **Private rooms** require a password to join.

## Features
- **Real-time Communication**: Powered by WebSocket for instant messaging.
- **Room Management**: Users can create multiple rooms, join multiple rooms, send messages, and leave.
- **Public and Private Rooms**: 
  - **Public rooms**: Anyone can join.
  - **Private rooms**: Password required to join.
- **Multiple Commands**: Includes support for querying available rooms, joining a room, chatting, and leaving a room.

## Available Commands

Below are the commands users can send to interact with the WebSocket server. Each command must be sent in JSON format.

### 1. **Create Room**
To create new Room (A user can create multple Rooms)

```json
{
  type: "create",
  payload: {
    name: "galaxy",                     // Name of the Room
    visibility: "public" or "private",  // Whether room is public or private
    pass: "anyPassword",                // Set password if room is private else "" empty string
  };
}
```

### 2. **Query Available Rooms**
To get a list of all available rooms:

**Request**:
```json
{
    "type": "query",
    "payload": {
        "query": "rooms"
    }
}
```

### 3. **Join**
To join in specific room

```json
{
    "type": "join",
    "payload": {
        "name": "alok",       // User's name
        "roomId": "EOF29",    // Room ID to join
        "pass": ""            // Leave empty if the Room is public
    }
}
```
### 4. **Chat**
To chat in a Specific Room

```json
{
    "type": "chat",
    "payload": {
        "roomId": "EOF29",  // Room ID where the message will be sent
        "msg": "Hello"      // Message content
    }
}
```

### 5. **Leave**
To leave the Room

```json
{
    "type": "leave",
    "payload": {
        "roomId": "ABC23"    // Room ID to leave
    }
}
```



