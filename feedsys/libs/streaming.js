var stream = require('getstream');
var client = stream.connect('vdswwsgtq2w2', 'rft86tyftf7u6d7jebfxvejxv6yq2tnsxcm7nwdpf37xbmktg6fqax5k9buhjb58', '29880');
var uniqid = require('uniqid');

module.exports = {
  addPostToTimeline: function (userId, userName, postContent) {
    return new Promise(function(resolve, reject) {
      // objectId and foregin_id should be unique based on the post
      var user = client.feed('user', userId);
      var activity = {
        actor: userId,
        verb: 'add',
        object: userId,
        foregin_id: uniqid(),
        message: postContent
      };
      var now = new Date();
      activity.time = now.toISOString();
      user.addActivity(activity)
            .then(function(data) {
            resolve(data);
           })
            .catch(function(reason) {
            reject(reason);
          });
    });
  },

  viewTimeLineContents: function (userId) {
    return new Promise(function(resolve, reject) {
      var user = client.feed('user', userId);
      user.get({ limit: 10 })
          .then(function (results) {
            resolve(results);
          })
          .catch(function (errorReadingPost) {
            reject(errorReadingPost);
          })
    });
  },

  followFeed: function (followerUserId, followingUserId) {
    return new Promise(function(resolve, reject) {
      var follower = client.feed('timeline', followerUserId);
      follower.follow('user', followingUserId);
      follower.get({ limit: 10 })
              .then(function (timelineData) {
                resolve(timelineData);
              })
              .catch(function (followingError) {
                console.log(followingError);
                reject(followingError);
              })
    });
  },

  fetchActivityById: function (activityId, userId) {
    return new Promise(function(resolve, reject) {
      var user = client.feed('user', userId);
      user.get({ id: activityId })
          .then(function (activity) {
            // console.log(activity);
            var requiredActivity = activity.results.filter(function (content) {
              // console.log(content.foregin_id);
              if ( content.foregin_id == activityId) {
                return true;
              } else {
                return false;
              }
            });
            console.log(requiredActivity);
            resolve(requiredActivity);
          })
          .catch(function (activityError) {
            reject(activityError);
          })
    });
  },

  addLikeToAPostFeed: function (userId, postId) {
    return new Promise(function(resolve, reject) {
      var user = client.feed('user', userId)
      var now = new Date();
      var activity = {
        actor: userId,
        verb: "like",
        object: uniqid(),
        time: now.toISOString(),
        foreign_id: postId,
      };
      user.addActivity(activity)
          .then(function (data) {
            resolve(data);
          })
          .catch(function (error) {
            reject(error);
          })
    });
  },

  countLikesOfAPost: function (userId, activityId) {
    return new Promise(function(resolve, reject) {
      var user = client.feed('user', userId);
      let count  = 0;
      user.get({ })
          .then(function (userActivities) {
            var activityLikesForThisPost = userActivities.results.filter(function (activity) {
              if (activity.foregin_id  == activityId && activity.verb == "like") {
                count ++;
                return true;
              } else {
                return false;
              }
            });
            resolve(count);
          })
          .catch(function (errorActivities) {
            reject(errorActivities);
          })
    });
  },

  addCommentToAPost: function (userId, postId) {

  }
};
