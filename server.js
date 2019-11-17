const path = require('path');
const fs = require('fs');
const express = require('express');
const mammoth = require('mammoth');
const app = express();
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');

const port = process.env.PORT || 5000;


app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'files')));


const fileStorage = multer.diskStorage({
    destination: (res, file, cb) => {
        cb(null, 'files')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    }
})

// const filter = (req, file, cb) => {
//     if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
//         cb(null, true);
//     }
//     else {
//         cb(null, false);
//     }
// }

app.use(multer({ storage: fileStorage }).single('mydocument'))


app.get('/', (req, res, next) => {
    res.render('index',{
        readData:null
    });
})

app.post('/readdoc', (req, res, next) => {
    const docFile = req.file;
    mammoth.extractRawText({ path: docFile.path })
        .then(result => {
            let data = parseFormat(result.value);
            let stringData = JSON.stringify(data);
            res.render('index', {
                readData: data
            })
        })
        .catch(err => {
            console.log(err);
        })
})

app.post('/postdata',(req,res,next)=>{
    const data=req.body.jobdata;
    console.log(data);
})

mongoose.connect("mongodb+srv://prakhar:admin@cluster0-qejpw.mongodb.net/docextractor", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(res => {
        console.log('Mongodb connected');
        app.listen(port, () => {
            console.log(`server listening on port ${port}`)
        });
    })
    .catch(err => {
        console.log(err);
    })



function parseFormat(data) {
    let category,
        obj = {},
        output=[];

    data.trim().split('\n').forEach(line => {
        if (line.includes(':')) {
            let str = line.split(':');
            category = str[0];
            obj[category] = str[1] || ' ';
        }
        else {
            obj[category] = obj[category] +  line;
        }
    });
    return obj;
}
