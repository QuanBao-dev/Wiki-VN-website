import io from "socket.io-client";
export default (io as any).connect(
  process.env.NODE_ENV === "development" ? "localhost:5000" : "/",
  {
    upgrade: true,
    transports: ["websocket", "polling"],
  }
);
