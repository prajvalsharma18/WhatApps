const multer = require('multer');
const {CloudinaryStorage} = require('multer-storage-cloudinary');
const cloudinary  = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary : cloudinary,
    params : {              
        folder : 'whatapps_chat_images',
        allowed_formats : ['jpg' , 'jpeg' , 'png' , 'gif' , 'webp'],
        transformation : [
            {width : 800 , height : 600 , crop : 'limit'},
            {quality : 'auto'}
        ]
    }
});

const upload = multer({
    storage : storage,
    limits : {
        fileSize : 20 * 1024 * 1024,
    },
    fileFilter : (req , file , cb) =>{
        if(file.mimetype.startsWith('image/')){
            cb(null , true);
        }
        else{
            cb(new Error('Only image files are allowed!') , false);
        }
    }
});

module.exports = {
    upload
};