import { io } from "socket.io-client"

const socket = io("http://localhost:5000", {

  transports: ["websocket"],

  autoConnect: true,

  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,

  timeout: 20000

})

export default socket