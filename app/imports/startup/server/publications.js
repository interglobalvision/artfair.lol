import { Meteor } from 'meteor/meteor';

import { Posts } from '/imports/collections/posts.js';

Meteor.publish('feed.posts', function(subscriptionParams) {

  check(subscriptionParams, Object);
  check(subscriptionParams.sort, String);

  return Posts.find({
    createdAt: {
      $lte: subscriptionParams.timestamp,
    },
  }, {
    sort: {
      createdAt: -1,
    },
    limit: 10,
  });

});

Meteor.publish('feed.newPosts', function(subscriptionParams) {

  check(subscriptionParams, Object);

  return Posts.find({
    createdAt: {
      $gt: subscriptionParams.timestamp,
    },
  });

});

Meteor.publish('post.single', function(postId) {

  check(postId, String);

  return Posts.find(postId);

});
