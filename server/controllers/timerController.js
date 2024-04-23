const Timer = require("../models/timer.js");

const saveTime = (req, res) => {
  const mock_id = req.params.mock_id;
  // console.log(req.body);
  Timer.findOne({ mock_id: mock_id }, (err, data) => {
    if (err) {
      res.status(500).json({ msg: err });
    } else {
      if (data) {
        if (data.seconds < req.body.seconds) {
          Timer.findOneAndUpdate(
            { mock_id: mock_id },
            { seconds: req.body.seconds },
            (err, data) => {
              if (err) {
                res.status(200).json({ msg: err });
              } else {
                res.status(200).json({ data });
              }
            }
          );
        } 
      } else {
        const newTimer = Timer({
          mock_id: mock_id,
          seconds: req.body.seconds,
        });
        newTimer.save();
      }
    }
  });
};

const getTime = (req, res) => {
  const mock_id = req.params.mock_id;

  Timer.findOne({ mock_id: mock_id }, (err, data) => {
    if (err) {
      res.status(500).json({ msg: err });
    } else {
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(200).json({});
      }
    }
  });
};

module.exports = { saveTime, getTime };
