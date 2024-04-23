const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');

const Connection = require("./db/db.js");
const Message = require("./models/message.js");

const {getRoomId,sendRoomId} = require("./controllers/roomController.js");
const  {getChats,chatsUploader} = require("./controllers/chatsController.js");
const {uploadImage,upload,getImage} = require("./controllers/imageController.js")
const {saveTime,getTime} = require("./controllers/timerController.js")

const app = express();
const server = require("http").Server(app);

app.use(cors({
  origin:"*",
}));
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json({extended:true}))

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const { ExpressPeerServer } = require("peer");
const e = require("express");

const opinions = {
  debug: true,
};

app.use("/peerjs", ExpressPeerServer(server, opinions));

// app.get("/", getRoomId);
// app.get("/:mock_id",sendRoomId);

app.get("/chats/:mock_id",getChats);

app.post("/:mock_id/timer",saveTime)
app.get("/timer/:mock_id",getTime)

app.post("/file/upload",upload.single("file"),uploadImage);
app.get("/file/:filename",getImage)

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    console.log(roomId);
    socket.join(roomId);
    setTimeout(() => {
      socket.to(roomId).emit("user-connected", userId);
      socket.to(roomId).emit("screen-connected",userId);
    }, 1000);

    socket.on("message", (message) => {
      
      chatsUploader(roomId,userName,message)

      io.to(roomId).emit("createMessage", message, userName);
    });

    socket.on("disconnected", (name="") => {
      if(name=="screen-share"){
        io.to(roomId).emit("disconnected",userId,"screen-share")
      }
      else{
        io.to(roomId).emit("disconnected",userId);
      }
    })

    socket.on("end-call",()=>{
      io.to(roomId).emit("end-call");
    })

  });
});

server.listen(process.env.PORT || 8000, (err) => {
  if (err) {
    console.log(err);
  }

  console.log("Server running");
});

Connection();
