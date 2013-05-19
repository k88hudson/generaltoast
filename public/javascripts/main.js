define(['jquery', 'meat'],
  function($, meat) {
  'use strict';

  var body = $('body');
  var currentLocation;
  var currentUser = localStorage.getItem('personaEmail');

  var checkUrl = function () {
    var url = body.attr('data-url');

    if (url) {
      if (url.indexOf('/post/') > -1 || url.indexOf('/edit/') > -1) {
        body.find('.container.right').addClass('hidden');
        meat.getOne(body);
      } else if (url.indexOf('/recent') > -1 || url === '/') {
        body.find('.container.right').removeClass('hidden');
        meat.getAll();
      } else {
        return;
      }
    }
  }

  checkUrl();

  navigator.geolocation.getCurrentPosition(function (loc) {
    body.find('form input[name="geolocation"]').val(loc.coords.latitude +
      ', ' + loc.coords.longitude);
  });

  navigator.id.watch({
    loggedInUser: currentUser,
    onlogin: function (assertion) {
      $.ajax({
        type: 'POST',
        url: '/persona/verify',
        data: { assertion: assertion },
        success: function (res, status, xhr) {
          localStorage.setItem('personaEmail', res.email);
          window.location.reload();
        },
        error: function(res, status, xhr) {
          console.log('error logging in');
        }
      });
    },
    onlogout: function() {
      $.ajax({
        url: '/persona/logout',
        type: 'POST',
        success: function(res, status, xhr) {
          $.get('/logout', function () {
            localStorage.removeItem('personaEmail');
            document.location.href = '/';
          });
        },
        error: function(res, status, xhr) {
          console.log('logout failure ', res);
        }
      });
    }
  });

  window.onpopstate = function (ev) {
    body.attr('data-url', document.location.pathname);
    checkUrl();
  }

  window.onpushstate = function (ev) {
    body.attr('data-url', document.location.pathname);
    checkUrl();
  }

  body.on('click', function (ev) {
    var self = $(ev.target);

    switch (self.data('action')) {
      case 'login':
        ev.preventDefault();
        navigator.id.request();
        break;

      case 'logout':
        ev.preventDefault();
        navigator.id.logout();
        break;

      case 'get-post':
        ev.preventDefault();
        meat.getOne(self);
        break;

      case 'delete-post':
        ev.preventDefault();
        meat.deleteOne(self);
        break;

      case 'share':
        ev.preventDefault();
        meat.share(self);
        break;
    }
  });
});
