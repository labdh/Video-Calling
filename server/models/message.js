const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  mock_id: {
    type: String,
    required: true,
  },
  text: [{
    name: {
        type:String,
        required:true
    },
    text: {
        type: String,
        required:true
    }
  }]
});


module.exports = mongoose.model('message',messageSchema)