const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs')
const cors = require('cors')
const corsOptions = require('./config/corsOptions');
//const { logger } = require('./middleware/logEvents');
//const errorHandler = require('./middleware/errorHandler');
const PORT = process.env.PORT || 3500;
const connectDB = require('./db/connectDB')

const multer = require('multer');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdir('./uploads/', (err) => {
            cb(null, './uploads/')
        })

    },

    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    },
})

const fileFilter = (req, file, cb) => {
        if (
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/jpeg'
        ) {
            cb(null, true)
        } else {
            cb(null, false)
        }
    }
    // custom middleware logger
    //app.use(logger);

// Cross Origin Resource Sharing
app.use(cors());

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//serve static files
app.use('/', express.static(path.join(__dirname, '/public')));
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// routes
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use('/feed', require('./routes/feed'));
app.use('/auth', require('./routes/auth'));
app.get('/', (req, res) => { res.status(200).send({ msg: "thanks" }) })

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

//app.use(errorHandler);
app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500
    const message = error.message
    const data = error.data
    res.status(status).json({ message, data })
})





const start = async() => {
    try {
        await connectDB
      const server =   app.listen(
            PORT,
            console.log(`server is running on PORT : ${PORT}`)
        )
        const io = require('./socket').init(server)
        io.on('connection', (socket) => {
          console.log('Client connected')
        })
    } catch (err) {
        console.log(err)
    }
}
start()