const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');

const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: 'recordings',
      filename: `${Date.now()}-${file.originalname}`
    };
  }
});

let gfs;

mongoose.connection.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'recordings'
    });
  });
  
  const deleteFile = (filename) => {
    return new Promise((resolve, reject) => {
      gfs.find({ filename: filename }).toArray((err, files) => {
        if (err) {
          reject(err);
        }
        if (!files || files.length === 0) {
          reject(new Error('File not found'));
        }
        gfs.delete(files[0]._id, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  };
  
  module.exports = { storage, deleteFile };