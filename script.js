const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);
const multer = require("multer");
const path = require("path");
const fs = require("fs");

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.get('/public/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });


app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded");
    res.json({ url: `/uploads/${req.file.filename}`, type: req.file.mimetype });
});

const storageAudio = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + ".webm");
    }
});
const uploadAudio = multer({ storage: storageAudio });

app.post("/upload-audio", uploadAudio.single("audio"), (req, res) => {
    if (!req.file) return res.status(400).send("No audio uploaded");
    res.json({ url: `/uploads/${req.file.filename}`, type: "audio/webm" });
});

io.on("connection", socket => {
    socket.on("chat", data => {
        io.emit("chat", data);
    });
});


http.listen(3000, () => console.log("Server running on http://localhost:3000"));
