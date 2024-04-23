const Message = require("../models/message.js")

const getChats = (req,res) => {
    const mock_id = req.params.mock_id;
  // console.log("hekkemac");
 Message.find({mock_id:mock_id},(err,data)=>{
    if(err){
      res.status(500).json({msg:err})
    }
    else{
      res.status(200).json(data)
    }
  })
}

const chatsUploader = (roomId,userName,message) =>{
    Message.find({ mock_id: roomId }, (err, data) => {
        if (err) {
          res.status(500).json({ msg: err });
        } else if (data.length === 0) {
          const messageData = new Message({
            mock_id: roomId,
            text: [
              {
                name: userName,
                text: message,
              },
            ],
          });
          messageData.save();
        } else {
                Message.update(
                    { mock_id: roomId },
                    { $push: { text: { name: userName, text: message } } }
                  ,(err,data)=>{
                    if(err){
                      console.log(err);
                    }
                    else{
                      console.log(data);
                    }
                  });
        }
      });
}



module.exports={getChats,chatsUploader}