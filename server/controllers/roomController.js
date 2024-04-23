const Message = require("../models/message.js")
const { v4: uuid4 } = require("uuid");


const getRoomId = (req,res) => {
  res.status(200).json({ roomId: uuid4() });
};

const sendRoomId = (req,res) => {
    res.status(200).json({ roomId: req.params.mock_id });
}

exports.sendRoomId = sendRoomId;
exports.getRoomId = getRoomId