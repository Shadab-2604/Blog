import { io, Socket } from "socket.io-client"

function getSocketUrl(): string {
  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("192.168.")
    if (isLocalhost) {
      return "http://localhost:5000"
    }
  }
  return (
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    (process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
      : "http://localhost:5000")
  )
}

let socketInstance: Socket | null = null

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(getSocketUrl(), {
      withCredentials: true,
      autoConnect: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 8000,
    })

    // Gracefully handle connection errors without throwing uncaught exceptions to the console
    socketInstance.on("connect_error", () => {
      // Degrades gracefully to HTTP REST polling if WebSockets are unavailable
    })
  }
  return socketInstance
}

export const socket = typeof window !== "undefined" ? getSocket() : ({} as Socket)
