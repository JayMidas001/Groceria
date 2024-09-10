const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        // assign a unique name for the uploaded file
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 100);
    
        // create the file name with the original file extension
        const extension = path.extname(file.originalname);
        const fileName = `${uniqueName}${extension}`;
    
        createImageBitmap(null, fileName);
      },
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image/')){
        cb(null, true);
    } else {
        cb(new Error('Image only'));
    }
}

const fileSize = {
    limits: 1024 * 1024 * 10
}

const upload = multer({
    storage,
    fileFilter,
    limits:  fileSize
})

module.exports = upload