import { Posts } from '/imports/collections/posts.js';

import sanitizeHtml from 'sanitize-html';

export const addPost = new ValidatedMethod({
  name: 'Posts.methods.add',
  validate: new SimpleSchema({
    photo: {
      type: String
    },
    fingerprint: {
      type: String,
    },
    caption: {
      type: String,
      optional: true,
    },
  }).validator(),

  run({photo, fingerprint, caption}) {

    let captionSantized = sanitizeHtml(caption);
    let votes = 0;

    Posts.insert({
      photo,
      fingerprint,
      caption: captionSantized,
      votes: votes,
    });
  }
});
