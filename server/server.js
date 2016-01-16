var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var bodyParser = require('body-parser');

var app = module.exports = loopback();

// configure view handler
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// configure body parser
app.use(bodyParser.urlencoded({extended: true}));

app.use(loopback.token());

// boot scripts mount components like REST API
boot(app, __dirname);

  //show password reset form
  app.get('/new-password', function(req, res, next) {
    if (!req.accessToken) return res.sendStatus(401);
  	// res.render('password-reset', {
   //    accessToken: req.accessToken.id
   //  });
  next();
  });


  // app.get('/success', function(req, res, next) {
  //       if (!req.inviteEmail) return res.sendStatus(401);
  //   // res.render('password-reset', {
  //  //    accessToken: req.accessToken.id
  //  //  });
  //   next();
  // })

  //reset the user's pasword
  app.post('/new-password', function(req, res, next) {
    if (!req.accessToken) return res.sendStatus(401);

    //verify passwords match
    if (!req.body.password ||
        !req.body.confirmation ||
        req.body.password !== req.body.confirmation) {
      return res.sendStatus(400, new Error('Passwords do not match'));
    }

    app.models.Appuser.findById(req.accessToken.userId, function(err, user) {
      console.log('finding by id');
      if (err) return res.sendStatus(404);
      
      user.updateAttribute('password', req.body.password, function(err, user) {
          console.log('updating password');
      if (err) return res.sendStatus(404);
        console.log('> password reset processed successfully');
        res.render('response', {
          title: 'Password reset success',
          content: 'Your password has been reset successfully',
          redirectTo: '/',
          redirectToLinkText: 'Log in'
        });
      });
      });
     });

app.use(loopback.static(path.join(__dirname, '..', 'client', 'www')));

// https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-configure-your-server-to-work-with-html5mode
app.use(function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'client', 'www', 'index.html'));
});


app.start = function() {
  'use strict';
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}
