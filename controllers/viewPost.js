import express from "express";
const router = express.Router();
import Auth from "./auth.js";

import Account from '../model/account.js';
import Post from '../model/post.js';

//Cloudinary Setup
import cloudinary from 'cloudinary';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

router.get('/remove_comment/:postid/:commentid', Auth, (request,response) => {
  const accountid = request.session.user._id;
  const postid = request.params.postid;
  const commentid = request.params.commentid;
  Post.findOneAndUpdate({_id: postid},
    { $pull: {'comments': {_id: commentid, userId: accountid}} }, function(err,success){
      if(err){
        console.log(err);
        response.redirect(`/view/${postid}`);
      }
      response.redirect(`/view/${postid}`);
    })
})

router.get("/like/:postid", Auth, async (request, response) => {
  const id = request.params.postid;
  const accountId = request.session.user._id;
  const post = await Post.findById(id);

  const isLiked = post.likes.filter((x) => x.userId.equals(accountId));
  const _isUserLiked = isLiked.length > 0 ? true : false;

  if (_isUserLiked) {
    Post.findOneAndUpdate({_id: id},
      { $pull: {'likes': {userId: accountId}} }, function(err,success){
        if(err){
          console.log(err);
          return response.json()
        }   
        // return response.json()
        response.send({'isLiked': false, 'LikesCount': post.likes.length});
      })
  } else {
    let allLikes = post.likes;
    const _newLike = {
      userId: accountId,
    };
    allLikes.push(_newLike);
    post
      .save()
      .then((like_created) => {
        // response.json();
        response.send({'isLiked': true, 'LikesCount': post.likes.length});
        // Now we have to add to the db, the json of the message (to the person who upload the post)
        if(String(post.associateId) != String(request.session.user._id)) {
          console.log()
          Post.findById(id).populate("associateId")
          .then( accountToUpdate => {
            // console.log(accountToUpdate.associateId.notifications);
            Account.findById(accountId)
            .then(accountById => {
              accountToUpdate.associateId.notifications.push({userId: accountId, message: `${accountById.firstName} liked your post!`, referecedPostId: post._id});
              accountToUpdate.associateId.save();
            })
          })
        }
      })
      .catch((err) => {
        console.log(err);
        response.json()
      });
  }
});

router.get("/notificationSeen/:notificationid", Auth, async(request, response) => {
  const notfication_id = request.params.notificationid;
  const accountId = request.session.user._id;

  console.log(accountId);
  const account = await Account.findById(accountId);
  console.log(account);
  for(let notification of account.notifications) {
    if(notification._id == notfication_id)
    {
      notification.seen = true;
    }
  }
  account.save();
  response.redirect('/dashboard');
})

router.get("/:postid", Auth, async (request, response) => {
  const id = request.params.postid;
  const accountId = request.session.user._id;
  const post = await Post.findById(id).populate("associateId");

  const isLiked = post.likes.filter((x) => x.userId.equals(accountId));
  const _isUserLiked = isLiked.length > 0 ? true : false;

  response.render("viewPost", {
    message: "Hello from the back world",
    post: post,
    accountId: accountId,
    isUserLiked: _isUserLiked,
    accountId: request.session.user._id,
    accountContent: await Account.findById(request.session.user._id).populate('notifications.referecedPostId').exec(),
    baseUrl: request.get('host')
  });
});

router.post("/addcomment/:postid", Auth, async (request, response) => {
  const id = request.params.postid;
  const comment = request.body.comment;
  const commenter =
    request.session.user.firstName + " " + request.session.user.lastName;
  const userId = request.session.user._id;
  const post = await Post.findById(id);

  let allComments = post.comments;

  const _newComment = {
    comment: comment,
    user: commenter,
    userId: userId,
  };

  allComments.push(_newComment);
  post
    .save()
    .then((comment_created) => {
      // before we are redirecting, we want to push a notification to the user who got the comment (we have to check if the user who comment is not the one who uploaded the post)
      if(String(post.associateId) != String(request.session.user._id)) {
        Post.findById(id).populate("associateId")
        .then( accountToUpdate => {
          // console.log(accountToUpdate.associateId.notifications);
          Account.findById(userId)
          .then(accountById => {
            accountToUpdate.associateId.notifications.push({userId: userId, message: `${accountById.firstName} has commented on your post: ${comment}`, referecedPostId: post._id});
            accountToUpdate.associateId.save();
          })
        })
      }
      response.redirect(`/view/${id}`);
    })
    .catch((err) => {
      console.log(err);
      response.redirect(`/view/${id}`);
    });
});

router.post("/editImage/:postid", Auth, async (request, response) => {
  const {title, description} = request.body;
  const id = request.params.postid;
  const post = await Post.findById(id).populate("associateId");
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
              image_url = await result.secure_url
          }
      )
  } else {
      image_url = post.imageSource;
  }

  post.title = title;
  post.description = description;
  post.imageSource = image_url;

  post.save()
  .then(post_updated => {
      response.redirect('/dashboard');
  })
  .catch(err => {
      console.log(err);
      response.redirect('/dashboard');
  })
})

function generate(min,max){
  return Math.floor((Math.random() * max) + min);
}

export default router;