var loopback = require('loopback');
var config = require('../../server/config.json');
var path = require('path');

module.exports = function(Appuser) {

//after register - send verification email
Appuser.afterRemote('create', function(context, Appuser, next) {
    console.log('> Appuser.afterRemote triggered');

    //generate verification token
    context.req.app.models.Appuser.generateVerificationToken(Appuser, function (err,token) {
    if (err) {
    	// TODO - HANDLE ERROR MORE GRACEFULLY
       console.log(err);
    }
    //set token
    Appuser.verificationToken = token;
    //save Appuser
    Appuser.save(function (err) {
        if (err) {
            next(err);
        }
        //If successful - send verification email via mandrill
        else {

          //get Appuser unique uid
          var uid = Appuser.id
          var userEmail = Appuser.email
          var redirect = '/success?inviteEmail=' + userEmail

          //set up confirmation link with server info, UID, Verification
          //currently redirects to /#/success
          //TODO - FIGURE OUT FOR MOBILE HOW TO HANDLE VARIOUS SERVERS
          var url = 'http://' + config.host + ':' + config.port + '/api/Appusers/confirm?uid=' + uid + '&redirect=' + redirect + '&token=' + token

          //send email via Mandrill
          loopback.Email.send({
            to: Appuser.email,
            from: "noreply@interloop.io",
            subject: "Thanks for registering",
            template : {
            	//Appuser register template
               name :"register",
               //merge tags
               //TODO - Change to handlebars vs Mailchimp Merge Tags
                  content : [{
                    name : "registerButton",
                    content : '<a href="'+ url + '" class="btn-primary" itemprop="url" style="margin: 0;font-family: &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif;box-sizing: border-box;font-size: 14px;color: #FFF;text-decoration: none;background-color: #348eda;border: solid #348eda;border-width: 10px 20px;line-height: 2em;font-weight: bold;text-align: center;cursor: pointer;display: inline-block;border-radius: 5px;text-transform: capitalize;">' +
                            'Confirm Email Address' +
                            '</a>'
                   			}],
                        },
                      },
                        function(err, result) {
                        if(err) {
                            console.log(err);
                            return;
                        }
                        console.log(result);
                      })
            	}
        	})
    	});
  });

 //password reset request

  //send password reset link when requested
  Appuser.on('resetPasswordRequest', function(info) {
    var url = 'http://' + config.host + ':' + config.port + '/new-password';
    var html = 'Click <a href="' + url + '?access_token=' +
        info.accessToken.id + '">here</a> to reset your password';

    loopback.Email.send({
      to: info.email,
      from: "noreply@interloop.io",
      subject: 'Password Reset Request',
      html: html
    },function(err, result) {
        if(err) {
            console.log(err);
            return;
        }
        console.log(result);
    });
  });





};
