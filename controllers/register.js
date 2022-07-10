import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import Auth from './auth.js';

import Account from '../model/account.js';
import Post from '../model/post.js';

router.post('/register', async(request, response) => {
    const {firstName,lastName, username, email, password} = request.body;
    //console.log(request.body);
    const id = mongoose.Types.ObjectId();

    const account_email = await Account.findOne({ email: email });
    const account_username = await Account.findOne({ username: username });

    if(account_email || account_username){
        var signup_error = '';
        if(account_email != null)
        {
            console.log('There is a user with that email');
            signup_error = 'There is a user with that email';
        }
        else { 
            console.log('There is an account with that username, please choose another');
            signup_error = 'There is an account with that username';
        }
        return response.redirect('/signup/?error=' + Buffer.from(signup_error).toString('base64'));
    } else {
        const hash = await bcryptjs.hash(password, 10);
        const account = new Account({
            _id: id,
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            password: hash,
            avatar: 'https://media.istockphoto.com/vectors/default-profile-picture-avatar-photo-placeholder-vector-illustration-vector-id1223671392?k=20&m=1223671392&s=612x612&w=0&h=lGpj2vWAI3WUT1JeJWm1PRoHT3V15_1pdcTn2szdwQ0='
        });
    
        account.save()
        .then(account_created => {
            // console.log(account_created);
            response.redirect('/');
        })
        .catch(error => {
            console.log(error);
        })
    }
})

router.get('/signup', async(request,response) => {
    var signup_error = request.query.error;
    if(signup_error != null) {
        response.render('signup', {error: signup_error});
    }
    else 
    {
        response.render('signup', {error: 'none'});
    }
})

export default router;