define(['jquery'],
  function($) {
  'use strict';

  var body = $('body');

  var generatePost = function (post, admin, isSubscription) {
    var isPrivate = '';
    var shared = '';
    var permalink = '';
    var isAdmin = '';
    var urls = [];

    if (post.meta.isPrivate) {
      isPrivate = 'private';
    }

    if (post.content.urls) {
      for (var i = 0; i < post.content.urls.length; i ++) {
        var url = post.content.urls[i];
        var result = '';

        if (url.url.match(/\.[jpg|jpeg|gif|png]\??/)) {
          result = '<a href="' + url.url + '" title="' +
            url.title + '"><img src="' + url.url + '"></a>';
        } else {
          result = '<a href="' + url.url + '" title="' +
            url.title + '">' + url.title + '</a>';
        }

        urls.push('<li>' + result + '</li>');
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

    if (isSubscription) {
      if (body.data('authenticated')) {
        permalink = '<a href="javascript:;" data-action="share" data-url="' +
          post.meta.originUrl + '">share</a>';
      }
    } else {
      permalink = '<a href="javascript:;" ' +
        'data-action="get-post" data-url="/post/' + post.id + '" ' +
        'class="permalink">permalink</a>';
    }

    if (post.meta.isShared || isSubscription) {
      shared = '<a href="' + post.meta.originUrl + '">origin</a>';
    }

    return $('<article id="post_' + post.id + '" class="article ' +
      isPrivate + '"><p>' + post.content.message + '</p>' + urls +
      '<div class="actions">' + isAdmin + permalink + shared + '</div></article>');
  };

  var self = {
    getAll: function () {
      $.getJSON('/all', function (data) {
        if (data.posts) {
          history.pushState(data.posts, 'posts', '/');
          body.find('.messages').empty();

          for (var i = 0; i < data.posts.length; i ++) {
            body.find('.messages').append(generatePost(data.posts[i], data.isAdmin, false));
          }
        }
      });

      $.getJSON('/subscription/all', function (data) {
        if (data.posts) {
          body.find('.container.right').removeClass('hidden');
          body.find('.subscriptions').empty();

          for (var i = 0; i < data.posts.length; i ++) {
            body.find('.subscriptions').append(generatePost(data.posts[i], false, true));
          }
        }
      });
    },

    getOne: function (self) {
      $.getJSON(self.data('url'), function (data) {
        if (data.post) {
          body.find('.container.right').addClass('hidden');
          history.pushState(data.post, 'post ' + data.post.id, '/post/' + data.post.id);
          body.find('.messages').html(generatePost(data.post, data.isAdmin, false));
        }
      });
    },

    deleteOne: function (self) {
      $.post(self.data('url'), function (data) {
        self.closest('article').addClass('hidden');
      });
    },

    share: function (self) {
      $.post('/share', { url: self.data('url') }, function (data) {
        body.find('.messages').prepend(generatePost(data.post, true, false));
      });
    },

    deleteSubscription: function (self) {
      $.post('/subscription/unsubscribe', { url: self.data('url') }, function (data) {
        self.closest('li').addClass('hidden');
      });
    }
  };

  return self;
});
