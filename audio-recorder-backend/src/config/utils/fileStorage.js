const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const saveFile = (file) => {
  const filename = `${Date.now()}-${file.originalname}`;
  const filepath = path.join(uploadDir, filename);
  
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, file.buffer, (err) => {
      if (err) reject(err);
      else resolve(filename);
    });
  });
};

const deleteFile = (filename) => {
  const filepath = path.join(uploadDir, filename);
  return fs.promises.unlink(filepath);
};

module.exports = { saveFile, deleteFile };