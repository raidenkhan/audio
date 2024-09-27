const mongoose = require('mongoose');

// Remove GridFsStorage import as we won't be using it anymore

// ... existing code ...

const encodeFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const decodeFile = (base64String) => {
  const [, data] = base64String.split(',');
  return Buffer.from(data, 'base64');
};

// ... existing code ...

module.exports = { encodeFile, decodeFile };