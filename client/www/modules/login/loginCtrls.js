angular.module('interloop.login.controllers', [])


//Login Controller
//-----------------------------------------------------------------------
.controller('LoginCtrl', function(
	$scope, 
	$state, 
	$stateParams, 
	$rootScope, 
	$location, 
	Appuser, 
	Org, 
	interloop, 
	amMoment) {

//Initialize
//------------------

  //focus on email input
  document.getElementsByClassName("userEmail")[0].focus();

  $scope.user = {
	  email: '',
	  password: '',
	  remember: true
	 };

  $rootScope.loginLoader = false;

//Submit Login Form
//------------------------------------
$scope.loginUser = function(isValid) {
    // check to make sure the form is completely valid
    if (isValid) {
      $scope.loginLoader = true;
      $rootScope.sessionExpired = false;
      $rootScope.accessDenied = false;

      // strongloop login
        Appuser.login({
            email: $scope.user.email,
            password: $scope.user.password,
            rememberMe: $scope.user.remember
        }).$promise
        .then(function() {
          //stop login loader  
        $rootScope.loginLoader = false;

          //get user info
          Appuser.getCurrent().$promise
          .then(function(user){
            // console.log(user);
            $rootScope.activeUser = user;

            $rootScope.activeUser.presence = 'active';
            Appuser.prototype$updateAttributes({ id: $rootScope.activeUser.id }, $rootScope.activeUser)
            .$promise.then(function() {
              console.log('Presence:Active');
            });

             //let intercom KNnow a user is logged in
             window.Intercom('boot', {
              app_id: "vp6k9wou",
              name: $rootScope.activeUser.fullName,
              email: $rootScope.activeUser.email,
              created_at: $rootScope.activeUser.createdOn
            });

              //set user time zone
              if($rootScope.activeUser.timeZone) {
                amMoment.changeTimezone($rootScope.activeUser.timeZone);
              }
          })

          //go to correct state
          if ($stateParams.url) {
              $location.url($stateParams.url);
            } else {
              $state.go('base.opportunities');
            }

      })
    }
  };

})


//Register Controller
//-----------------------------------------------------------------------

.controller('RegisterCtrl', function($scope, $state, Appuser) {

//Initialize
//------------------

//Register User
//------------------
$scope.registerUser = function(isValid) {
      if(isValid) {
            Appuser.create({
              email: $scope.newUser.email,
              password: $scope.newUser.password,
              fullName: $scope.newUser.fullName,
            }, function() {
              alert('registered!')
              $state.go('login');
            });
        alert('Request Sent! - Check your email for further instructions :)')
        $state.go('login');
      }
    }
})


//Reset Password Controller
//-----------------------------------------------------------------------
.controller('ResetCtrl', function($scope, $state, $http){

//Initialize
//------------------
  $scope.user = {};

//Reset Password
//------------------  
$scope.resetPassword = function(isValid) {
    // check to make sure the form is completely valid
    if (isValid) {
      $http({
          method: 'POST',
          url: '/api/Appusers/reset',
          data: { email: $scope.user.email }
        }).then(function successCallback(response) {
              alert('Nice!, The password reset email is on its way ');
              $state.go('login');
          }, function errorCallback(response) {
              alert('Woops!, There was a problem resetting your email, please try again later' );
          });
     }

  };
})


//New Password Controller
//-----------------------------------------------------------------------
.controller('NewPasswordCtrl', function($scope, $state, $stateParams, $location, $http, Appuser){

//Initialize
//------------------
$scope.accessToken = $location.search().access_token;
$scope.newPassword = {};


//Change Password
//------------------
$scope.changePassword = function(isValid) {
    // check to make sure the form is completely valid
    if (isValid) {
      //post to remote method reset-password to update user password serverside
      $http({
          method: 'POST',
          url: '/new-password?access_token=' + encodeURIComponent($scope.accessToken),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          transformRequest: function(obj) {
              var str = [];
              for(var p in obj)
              str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
              return str.join("&");
          },
          data: {
                password: $scope.newPassword.password1,
                 confirmation: $scope.newPassword.password2
                },
         }).then(function successCallback(response) {
              alert('request successful');
              $state.go('login');
          }, function errorCallback(response) {
              alert('Woops!, There was a problem updated your email, please try again' );
          });
   	 }
  };
})


//Succesfully Registering For Interloop - TODO
//-----------------------------------------------------------------------
.controller('SuccessCtrl', function($scope, $location) {
  $scope.inviteEmail = $location.search().inviteEmail;
})