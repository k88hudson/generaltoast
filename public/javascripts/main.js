define(['jquery', 'meat'],
  function($, meat) {
  'use strict';

  var body = $('body');
  var currentLocation;

  meat.getAll();

  navigator.geolocation.getCurrentPosition(function (loc) {
    body.find('form input[name="geolocation"]').val(loc.coords.latitude +
      ', ' + loc.coords.longitude);
  });

  body.on('click', '#login', function(ev) {
    ev.preventDefault();

    navigator.id.get(function(assertion) {
      if (!assertion) {
        return;
      }

      $.ajax({
        url: '/persona/verify',
        type: 'POST',
        data: { assertion: assertion },
        dataType: 'json',
        cache: false
      }).done(function(data) {
        if (data.status === 'okay') {
          document.location.href = '/';
        } else {
          console.log('Login failed because ' + data.reason);
        }
      });
    });
  });

  body.on('click', '#logout', function(ev) {
    ev.preventDefault();

    $.ajax({
      url: '/persona/logout',
      type: 'POST',
      dataType: 'json',
      cache: false
    }).done(function(data) {
      if (data.status === 'okay') {
        document.location.href = '/';
      } else {
        console.log('Logout failed because ' + data.reason);
      }
    });
  });
});
