const { GridFsStorage } = require("multer-gridfs-storage");
const multer = require("multer");
const grid = require("gridfs-stream");
const mongoose = require("mongoose");

const url = "http://localhost:8000";

let gfs, gridfsBucket;
const conn = mongoose.connection;
conn.once("open", () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: "files"
    });
    gfs = grid(conn.db, mongoose.mongo);
    gfs.collection("files");
})

const storage = new GridFsStorage({
  url: "mongodb+srv://123:123@cluster0.ameamlb.mongodb.net/?retryWrites=true&w=majority",
  options: { useNewUrlParser: true },
  file: (request, file) => {
    return {
      bucketName: "files",
      filename: file.originalname,
    };
  },
});

exports.upload = multer({ storage });

const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(500).json({ msg: "no file sent" });
  }
  const imageUrl = `${url}/file/${req.file.filename}`;

  return res.status(200).json(imageUrl);
};

exports.uploadImage = uploadImage;

const getImage = async (req, res) => {
    try {

        const file = await gfs.files.findOne({filename:req.params.filename});
        const readStream = gridfsBucket.openDownloadStream(file._id);
        readStream.pipe(res);

    } catch (error) {
        res.status(500).json({msg:error})
    }
};

exports.getImage = getImage;
