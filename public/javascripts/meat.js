define(['jquery'],
  function($) {
  'use strict';

  var body = $('body');

  var generatePost = function (post, admin) {
    var isPrivate = '';
    var isAdmin = '';
    var urls = [];

    if (post.meta.isPrivate) {
      isPrivate = 'private';
    }

    if (post.content.urls) {
      for (var i = 0; i < post.content.urls.length; i ++) {
        var url = post.content.urls[i];

        urls.push('<li><a href="' + url.url + '" title="' +
          url.title + '">' + url.title + '</a></li>');
      }
    }

    if (urls) {
      urls = '<ul class="links">' + urls.join('') + '</ul>';
    }

    if (admin) {
      isAdmin = '<a href="/edit/' + post.id + '">Edit</a>' +
        '<a href="javascript:;" data-url="/delete/' + post.id +
        '" data-action="delete-post">Delete</a>';
    }

    return $('<article id="post_' + post.id + '" class="article ' +
      isPrivate + '"><p>' + post.content.message + '</p>' + urls +
      '<div class="actions">' + isAdmin + '<a href="javascript:;" ' +
      'data-action="get-post" data-url="/post/' + post.id + '" ' +
      'class="permalink">permalink</a></div></article>');
  };

  var self = {
    getAll: function () {
      $.getJSON('/all', function (data) {
        if (data.posts) {
          history.pushState(data.posts, 'posts', '/');
          body.find('.messages').empty();

          for (var i = 0; i < data.posts.length; i ++) {
            body.find('.messages').append(generatePost(data.posts[i], data.isAdmin));
          }
        }
      });
    },

    getOne: function (self) {
      $.getJSON(self.data('url'), function (data) {
        if (data.post) {
          history.pushState(data.post, 'post ' + data.post.id, '/post/' + data.post.id);
          body.find('.messages').html(generatePost(data.post, data.isAdmin));
        }
      });
    },

    deleteOne: function (self) {
      $.post(self.data('url'), function (data) {
        document.location.href = '/';
      });
    }
  };

  return self;
});
