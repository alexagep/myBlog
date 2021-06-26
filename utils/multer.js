const multer = require('multer');
const uuid = require('uuid').v4
const path = require('path');

exports.storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/upload'))
    },
    filename: function(req, file, cb) {
        cb(null, `${uuid}-${file.originalname}`)
    }
})


exports.fileFilter = function(req, file, cb){
    if(file.mimeType === 'image/png' || 
       file.mimeType === 'image/jpg' ||
       file.mimeType === 'image/jpeg'){
           cb(null, true)
       } else {
        cb(new Error('invalid type!'), false);
       }
}