import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import Auth from './auth.js';

import Account from '../model/account.js';
import Post from '../model/post.js';

//Cloudinary Setup
import cloudinary from 'cloudinary';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

router.get('/remove_post/:postid', Auth, async(request,response) => {
    const accountId = request.session.user._id;
    const postid = request.params.postid;

    Post.findOneAndDelete({ associateId:accountId, _id: postid })
    .then(success => {
        response.redirect('/profile');
    })
    .catch(err => {
        console.log(err);
        response.redirect('/profile');
    })
})

router.post('/update_mydata', Auth, async(request,response) => {
    const accountId = request.session.user._id;
    const {firstName,lastName} = request.body;
    const image = request.files;
    let image_url = '';

    const account = await Account.findById(accountId);


    if(image[0]){
        const image_name = generate(1000000,999000000);
        const image_type = image[0].mimetype.split('/')[0];
        const body = {
            resource_type: image_type,
            public_id: 'usersposts/' + image_name
        }
        await cloudinary.v2.uploader.upload(
            image[0].path, body,
            async function(error, result){
                image_url = await result.secure_url
            }
        )
    } else {
        image_url = account.avatar;
    }

    account.firstName = firstName;
    account.lastName = lastName;
    account.avatar = image_url.split('upload/')[0] + '/upload/c_fill,h_400,w_400/' + image_url.split('upload/')[1];
    // console.log(account);

    account.save()
    .then(account_updated => {
        response.redirect('/profile');
    })
    .catch(err => {
        console.log(err);
        response.redirect('/profile');
    })
})


router.get('/', Auth, async(request,response) => {

    const accountId = request.session.user._id;
    const myData = await Account.findById(accountId);
    const myPosts = await Post.find({ associateId: accountId }).sort({createdAt: 'desc'});

    response.render('profile', {
        myData: myData,
        myPosts: myPosts,
        accountId: request.session.user._id,
        accountContent: await Account.findById(request.session.user._id).populate('notifications.referecedPostId').exec(),
        baseUrl: request.get('host')
    })
})

function generate(min,max){
    return Math.floor((Math.random() * max) + min);
}

router.get('/editpost/:postid', Auth, async(request,response) => { 
    const id = request.params.postid;
    const post = await Post.findById(id).populate("associateId");
    // console.log(post);
    response.render('editPost', {
        post: post,
        accountId: request.session.user._id,
        accountContent: await Account.findById(request.session.user._id).populate('notifications.referecedPostId').exec(),
        baseUrl: request.get('host')
    })
})

export default router;