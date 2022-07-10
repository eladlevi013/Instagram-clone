//IMPORT NPM LIBS
import express from 'express';
import bp from 'body-parser';
import mongoose from 'mongoose';
import path from 'path';
import multer from 'multer';
import csurf from 'csurf';
import session from 'express-session';
import { default as connectMongoDbSession } from 'connect-mongodb-session';
const MongoDbStore = connectMongoDbSession(session);
import { fileURLToPath } from 'url';

// dotenv for hiding the api keys, and cloudinary keys
import dotenv from 'dotenv'
dotenv.config()

//CREATE THE APP
const app = express();

//SETUP VIEW ENGINE
app.set('view engine','ejs');
app.set('views','views');

//SETUP BODY-PARSER
app.use(bp.urlencoded({extended:false}));
app.use(bp.json());

//SETUP PUBLIC DIR
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
app.use(express.static(path.join(_dirname, 'public')));
app.use('/images', express.static('images'));

import moment from 'moment';
app.locals.moment = moment;

const fileStorage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, 'public/images');
    },

    _filename: (request, file, cb) => {
        cb(null, file.originalname )
    }
})

app.use(multer({ storage: fileStorage, limits: {fileSize:5503364} }).array('image'));


const mongo_url = process.env.MONGO_URL;

//CHECK FOR SESSIONS COLLECTION IN MONGO
const store = new MongoDbStore({
    uri: mongo_url,
    collection: 'sessions'
});
//CREATE THE SESSION (MIDDLEWARE)
app.use(session({
    secret: 'mSjI3Cm7Tgu71GANPb3N4IKqINusAaRK',
    resave: false,
    saveUninitialized: false,
    store: store
}))
//READ THE SESSION
app.use((request,response,next) => {
    if(!request.session.account){
        return next();
    }
    account.findById(request.session.account._id)
    .then(account => {
        request.account = account;
        next();
    })
    .catch(error => {
        console.log(error);
    }) 
})

//ROUTES / CONTROLLERS
import loginController from './controllers/index.js';
app.use('/', loginController);

import viewPostController from './controllers/viewPost.js';
app.use('/view', viewPostController);

import dashboardController from './controllers/dashboard.js';
app.use('/dashboard', dashboardController);

import addNewPostController from './controllers/addNewPost.js';
app.use('/addPost', addNewPostController);

import profileController from './controllers/profile.js';
app.use('/profile', profileController);

import otherProfileController from './controllers/otherProfile.js';
app.use('/user', otherProfileController);

import register from './controllers/register.js';
app.use('/', register);

//RUN SERVER
const port = 3088;

mongoose.connect(mongo_url)
.then(results => {
    // app.listen(port, function(){
    //     console.log(`Server is running via port ${port}`);
    // })
    app.listen(process.env.PORT || port, function(){
        console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
      });
})
.catch(error => {
    console.log(error);
})