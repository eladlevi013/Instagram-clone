// Import npm packages
import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import Auth from './auth.js';

// Import mongodb schemas
import Account from '../model/account.js';
import Post from '../model/post.js';

// function that renders the otherProfile page
router.get('/:username', Auth, async(request,response) => {
    const username_parameter = request.params.username;
    Account.findOne({ username:username_parameter })
    .then(async(account_data) => {
        account_data.populate("posts")
        .then(async(posts_array) => {
            response.render('otherProfile', {
                OtherAccountContent: account_data,
                posts: posts_array.posts,
                accountId: request.session.user._id,
                accountContent: await Account.findById(request.session.user._id).populate('notifications.referecedPostId').exec(),
                baseUrl: request.get('host')
            })
        })
    })
    .catch(err => {
        console.log(err);
        response.redirect('/profile');
    })
})

export default router;