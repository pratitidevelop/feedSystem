var express = require('express');
var router = express.Router();
var User = require('../models/User');
var streaming = require('../libs/streaming');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/createUser', function (req, res) {
  // adds a user to the FeedSystem
  var userInfo = req.body;
  var newUser = new User(userInfo);
  newUser.save(function (err, savedUser) {
    if (err) {
      res.json({ msg: 'Error!!. User cannot be saved' });
    } else {
      res.json({ msg: 'Success!!. User added' });
    }
  });
});

router.post('/addFriend', function (req, res) {
  // adds a friend refernce to a requested user by another user
  // First finds that whether two users exsists or not if yes then person asking for add friend will be addFriend
  // payload: {
  //  requestedBy: mongooseId of user,
  //  requestedFor: mongooseId of user
  // }
  let requestedBy = req.body.requestedBy;
  let requestedFor = req.body.requestedFor;
  let userRequestedBy;
  User.findOne({'_id': requestedBy })
  .then(function (requestedByUser) {
    userRequestedBy = requestedByUser;
    return User.findOne({ '_id': requestedFor })
  })
  .then(function (requestedForUser) {
    requestedForUser.friends.push(requestedBy);
    return requestedForUser.save()
  })
  .then(function (savedFriendRequestUserFor) {
     userRequestedBy.friends.push(requestedFor);
     return userRequestedBy.save()
  })
  .then(function (savedFriendRequest) {
    res.json({ msg: 'Success!!. Added friends request' });
  })
  .catch(function (errFriendRequest) {
    res.json({ msg: 'Error!!. Cannot save friend request requested for' });
  })
});


router.post('/addFollower', function (req, res) {
  // add followers
  // payload: {
  // follower: user id
  // following: user id
  // }
  // add user id of follower to following user in followers array
  let followingUser = req.body.following;
  let followerUser = req.body.follower;
  User.findOne({ '_id': followingUser })
  .then(function (userFollowing) {
    userFollowing.followers.push(followerUser);
    return userFollowing.save()
  })
  .then(function (savedFollower) {
    res.json({ msg: 'Success!!. Follower saved' });
  })
  .catch(function (errFollower) {
    res.json({ msg: 'Error!!. Follower cannot be saved' });
  })
});


router.post('/addPostToTimeline', function (req, res) {
  let userId = req.body.userId;
  let postContent = req.body.postContent;
  User.findOne({'_id': userId })
  .then(function (userInfo) {
    let userName = userInfo.name;
    return streaming.addPostToTimeline(userId, userName, postContent);
  })
  .then(function (savedPost) {
    res.json({ msg: "Success!!. Post saved for timeline" });
  })
  .catch(function (postError) {
    console.log(postError);
    res.json({ msg: "Error!!. Post cannot be saved", reason: postError.message });
  })
});

router.post('/viewTimeLineFeeds', function (req, res) {
  let userId = req.body.userId;
  streaming.viewTimeLineContents(userId)
            .then(function (timelineFeeds) {
                res.json({ msg: "Success!!. Timeline feeds fetched", results: timelineFeeds });
            })
            .catch(function (errorReadingTimeline) {
              res.json({ msg: "Error!!. Timeline feeds cannot be fetched", reason: errorReadingTimeline.message });
            })
});


router.post("/followUserFeed", function (req, res) {
  let followerUserId = req.body.follower;
  let followingUserId = req.body.following;
  streaming.followFeed(followerUserId, followingUserId)
            .then(function (timelineData) {
              res.json({ msg: "Success!!. followed", resultTimeline: timelineData });
            })
            .catch(function (errorFollowing) {
              console.log(errorFollowing);
              res.json({ msg: "Error!!. Follwoing cannot be done", reason: errorFollowing.message });
            })
});

router.post('/addLikeToAPostFeed', function (req, res) {
  // from payload take postId of the post that is being liked, and the userId of the person liking it
  // first fetch the userId of the post from the post foregin_id taken as input, and check if that parituclar
  // user is elligible to like the feed, i.e: whether the person liking the post is in friends list or in follower list
  // and then acll the stream api to add the acivity like to that parituclar post
  // k84m7pnj918midj foregin_id of post
  let activityId = req.body.activityId;
  let userId = req.body.userId;
  streaming.fetchActivityById(activityId, userId)
           .then(function (activity) {
            //  console.log(activity);
             let foreginIdOfActivity = activity[0].foregin_id;
             return streaming.addLikeToAPostFeed(userId, foreginIdOfActivity)
           })
           .then(function (likeAdded) {
             res.json({ msg: "Success!!. Like added to the post feed" });
           })
           .catch(function (activityError) {
              console.log(activityError);
             res.json({ msg: "Error!!. Like acnnot be added to post feed" });
           });
});

router.get('/countLikesForAPost', function (req, res) {
  // payload consist of postId and userId as to whose post likes will be counted
  let activityId = req.query.activityId;
  let userId = req.query.userId;
  streaming.countLikesOfAPost(userId, activityId)
      .then(function (countLikes) {
        res.json({ msg: "Success!!. Counted likes for the particular post", likeCounts: countLikes });
      })
      .catch(function (errorCountLikes) {
        res.json({ msg: "Error!!. Cannot count like for the particlar post", reason: errorCountLikes.message });
      })
});

module.exports = router;
