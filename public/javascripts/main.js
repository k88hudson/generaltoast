define(['jquery', 'meat'],
  function($, meat) {
  'use strict';

  var body = $('body');
  var currentLocation;
  var currentUser = localStorage.getItem('personaEmail');

  var checkUrl = function () {
    if (body.data('url')) {
      meat.getOne(body);
    } else {
      meat.getAll();
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
          document.location.href = '/';
        },
        error: function(res, status, xhr) {
          self.status
            .addClass('error')
            .text('There was an error logging in')
            .addClass('on');

          settings.statusTimer(self.status);
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
    }
  });
});
