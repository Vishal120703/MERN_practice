const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve a simple HTML page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("message", (msg) => {
        console.log("Client says:", msg);

        // send back to client
        socket.emit("reply", "Message received: " + msg);
        
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});