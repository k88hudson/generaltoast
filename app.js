var express = require('express');
var configurations = module.exports;
var app = express();
var server = require('http').createServer(app);
var nconf = require('nconf');
var settings = require('./settings')(app, configurations, express);
var whitelist = require('./whitelist');

nconf.argv().env().file({ file: 'local.json' });

/* Filters for routes */

var isAdmin = function (req, res, next) {
  if (req.session.email && whitelist.indexOf(req.session.email) > -1) {
    next();
  } else {
    res.redirect('/logout');
  }
};

var notLoggedIn = function (req, res, next) {
  if (req.session.email) {
    res.redirect('/');
  } else {
    next();
  }
}

require('express-persona')(app, {
  audience: nconf.get('domain') + ':' + nconf.get('authPort')
});

// routes
require("./routes")(app, nconf, notLoggedIn, isAdmin);

app.listen(process.env.PORT || nconf.get('port'));
