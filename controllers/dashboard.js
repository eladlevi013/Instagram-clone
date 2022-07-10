// Import npm packages
import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import Auth from './auth.js';

// Import mongodb schemas
import Account from '../model/account.js';
import Post from '../model/post.js';

// function that renders the dashboard page
router.get('/', Auth, async(request,response) => {
    const posts = await Post.find().populate('associateId').sort({createdAt: 'desc'});
    response.render('dashboard', {
        allposts: posts,
        accountId: request.session.user._id,
        accountContent: await Account.findById(request.session.user._id).populate('notifications.referecedPostId').exec(),
        baseUrl: request.get('host')
    })
})

// function that checks if the credentials are good
router.post('/login', async(request,response) => {
    const {email,password} = request.body;
    const account = await Account.findOne({email: email});

    if(account){
        bcryptjs.compare(password, account.password)
        .then(async isMatch => {
            if(isMatch && account.isApproved){

                request.session.logged = true;
                request.session.user = account;
                return request.session.save(test => {
                    response.redirect('/dashboard');
                })

            } else {
                console.log('Not Match');
                var signin_error = 'Invalid email or password';
                response.redirect('/?error=' + Buffer.from(signin_error).toString('base64'));
            }
        })
        .catch(err => {
            console.log('ERROR: ' + err);
        })

    } else {
        console.log('Account Not Exist');
        var signin_error = 'Account is not exists';
        response.redirect('/?error=' + Buffer.from(signin_error).toString('base64'));
    }
})

// logout function
router.get('/logout', (request,response) => {
    request.session.destroy();
    response.redirect('/');
})

export default router;