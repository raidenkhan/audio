const mongoose = require('mongoose');

// Remove GridFsStorage import as we won't be using it anymore

// ... existing code ...

const encodeFile = (buffer) => {
  return buffer.toString('base64');
};

function decodeFile(data) {
  // if (!data) {
  //   throw new Error('Invalid input: data is undefined or null');
  // }
  return Buffer.from(data, 'base64');
}

// ... existing code ...

module.exports = { encodeFile, decodeFile };