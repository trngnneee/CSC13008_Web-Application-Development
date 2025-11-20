import { io } from "socket.io-client";

let socket;

export function getSocket() {
    if (!socket) {
        socket = io("http://localhost:10000");
    }
    return socket;
}
