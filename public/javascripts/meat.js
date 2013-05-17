define(['jquery'],
  function($) {
  'use strict';

  var body = $('body');

  var self = {
    getAll: function () {
      $.get('/all', function (data) {
        if (data.posts) {
          for (var i = 0; i < data.posts.length; i ++) {
            var isPrivate = '';

            if (data.posts[i].meta.isPrivate) {
              isPrivate = 'private';
            }
            var post = $('<article class="' + isPrivate + '">' +
              data.posts[i].content.message + '</article>');
            body.find('.messages').append(post);
          }
        }
      });
    }
  };

  return self;
});
