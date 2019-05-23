const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, 'uploads');
    },
    filename(req, file, callback) {
        let array = file.originalname.split('.');
        array[0] = array[0] + '_';
        array[1] = '.' + array[1];
        array.splice(1, 0, Date.now().toString());
        const result = array.join('');
        console.log(result);
        callback(null, result);
    }
});

const upload = multer({
    storage,
    limits: {
        files: 10,
        fileSize: 1024 * 1024 * 1024,
    }
});

router.post('/upload', upload.array('photo', 1), function (req, res, next) {
    try {
        const files = req.files;
        let originalName = '';
        let fileName = '';
        let mimeType = '';
        let size = 0;

        if (Array.isArray(files)) {
            console.log(`files is array~`);

            originalName = files[0].originalname;
            fileName = files[0].filename;
            mimeType = files[0].mimetype;
            size = files[0].size;
            
        } else {
            console.log(`files is not array~`);
            originalName = files[0].originalname;
            fileName = files[0].filename;
            mimeType = files[0].mimetype;
            size = files[0].size;
        }

        console.log(`file inform : ${originalName}, ${fileName}, ${mimeType}, ${size}`);

        res.writeHead('200', {
            'Content-type': 'text/html;charset=utf8'
        });
        res.write('<h3>upload success</h3>');
        res.write(`<p>original name = ${originalName}, saved name = ${fileName}<p>`);
        res.write(`<p>mime type : ${mimeType}<p>`);
        res.write(`<p>file size : ${size}<p>`);
        res.end();
    } catch (err) {
        console.dir(err.stack);
    }
});

module.exports = router;