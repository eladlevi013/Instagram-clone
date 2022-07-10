// Imports
import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import Auth from './auth.js';
import Account from '../model/account.js';
import Post from '../model/post.js';

//Cloudinary Setup
import cloudinary from 'cloudinary';
cloudinary.config({
    cloud_name: 'dtf5khfk8',
    api_key: '544844654167324',
    api_secret: 'vxXiH51dh_GCwpJfI0budnr5y4U'
})

// Render function(ejs) for newPost page
router.get('/', Auth, async(request,response) => {
    response.render('addNewPost', { // the parameters for the ejs page
        accountId: request.session.user._id,
        accountContent: await Account.findById(request.session.user._id).populate('notifications.referecedPostId').exec(),
        baseUrl: request.get('host')
    })
})

// Function that is being called from the ejs page, that creates a post
router.post('/create', Auth, async(request,response) => {
    // for the redirect to dashboard
    const posts = await Post.find().populate('associateId').sort({createdAt: 'desc'});
    const content_account = await Account.findById(request.session.user._id).populate('notifications.referecedPostId').exec();

    try {
        const id = mongoose.Types.ObjectId();
        const {title,description} = request.body;
        const image = request.files;
        let image_url = '';
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
                    // if we could upload the image, upload the post
                    if(!error) {
                        image_url = await result.secure_url
                        const _post = new Post({
                            _id: id,
                            title: title,
                            description: description,
                            imageSource: image_url,
                            associateId: request.session.user._id,
                            comments: [],
                            likes: []
                        })
                
                        _post.save()
                        .then(post_created => {
                            // before we are redirecting the page, we will update the user who uploaded the post
                            Account.findOne({ _id:request.session.user._id })
                            .then(async(account_data) => {
                                account_data.posts.push(id);     
                                account_data.save();
                            })
                            .catch(err => {
                                console.log(err);
                            })
                        })
                        .catch(error => {
                            console.log(error);
                        })
                    }
                }
            )
        }
        // If we could upload the file, render the dashboard page
        response.render('dashboard', {
            allposts: posts,
            accountId: request.session.user._id,
            accountContent: content_account,
            baseUrl: request.get('host')
        })
    } catch(error) {
        // if we couldn't upload the file, render the dashboard page
        response.render('dashboard', {
            allposts: posts,
            accountId: request.session.user._id,
            accountContent: content_account,
            baseUrl: request.get('host')
        })
    }
})

// generate function for the image_name
function generate(min,max){
    return Math.floor((Math.random() * max) + min);
}

export default router;