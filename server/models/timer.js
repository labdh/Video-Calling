const mongoose = require("mongoose");

const timerSchema = new mongoose.Schema({
  mock_id: {
    type: String,
    required: true,
  },
  seconds: {
    type: Number,
    required: true
  },
});

module.exports = mongoose.model("timer", timerSchema);
