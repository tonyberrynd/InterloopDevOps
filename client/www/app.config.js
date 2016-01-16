// Interloop Config

angular.module('interloop.config', [

     'interloop.config.http',
     'interloop.config.bootstrap',
     'interloop.config.panels', 
     'interloop.config.shortcuts'
     
])

// Run Block
// --------------------------------------------------------------
.run(function($rootScope, $state, $location, $localStorage, NotificationMonitor, Appuser, Org) { 

    //Initialize
    //---------------------
    $rootScope.activeUser = null;
    $rootScope.accessDenied = false;
    $rootScope.sessionExpired = false;
    $rootScope.showViewNavigator = false;
    $rootScope.$state = $state;

    //Notifications
    //---------------------
    $rootScope.showNotifications = true; //remove 
    NotificationMonitor.startWatching();

    //Active User
    //---------------------
    if (Appuser.isAuthenticated()) {

      //set user information early
      //ToDo - Turn into Resolve
      Appuser.getCurrent().$promise
      .then(function(user){

          //Set Active User to RootScope!!
          $rootScope.activeUser = user;

          //set presence on current user
         $rootScope.activeUser.presence = 'active';
            Appuser.prototype$updateAttributes({ id: $rootScope.activeUser.id }, $rootScope.activeUser)
            .$promise.then(function() {
              console.log('Presence:Active');
      

          if($rootScope.activeUser.timeZone) {
              amMoment.changeTimezone($rootScope.activeUser.timeZone);
          }

          //let intercom KNnow a user is logged in
           window.Intercom('boot', {
            app_id: "vp6k9wou",
            name: $rootScope.activeUser.fullName,
            email: $rootScope.activeUser.email,
            created_at: $rootScope.activeUser.createdOn
          });

           // console.log(interloop.currentState.org);
          //go to base state
          //$state.go('base.opportunities')

        })
      })      
    }


    //check is sidebar should shrink
    if ($localStorage.shrinkSidebar) {
      $rootScope.shrink = $localStorage.shrinkSidebar;
    }
    else {
      $rootScope.shrink = false;
    }
    

    //State Change
    //---------------------
    //check on stage change start
    $rootScope.$on('$stateChangeStart', function(evt, to, params) {
      $rootScope.isOnSearch = false;
      //authenticate
      if (to.authenticate && !Appuser.isAuthenticated()) {
        evt.preventDefault();
        $state.go('login');
      }
      //redirect
      if (to.redirectTo) {
        evt.preventDefault();
        $state.go(to.redirectTo, params)
      }
    })


    //Intercom
    //---------------------
   

    //let intercom know user has changed page
    $rootScope.$on('$stateChangeSuccess',function(){
     window.Intercom('update');

    });

    $rootScope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
      //hide loading screen on successfully entering first state
      loading_screen.finish();
    });


    // //Loading Screen
    // //---------------------
    // loading_screen.finish()

})


// Basic Config
// --------------------------------------------------------------


    //HTML5 Mode
    //---------------------
    .config(function($locationProvider) {
    $locationProvider.html5Mode(true);
    })

    //LoopBack
    //---------------------
    .config(function(LoopBackResourceProvider) {
    // Use a custom auth header instead of the default 'Authorization'
    LoopBackResourceProvider.setAuthHeader('X-Access-Token');

    // Change the URL where to access the LoopBack REST API server
    LoopBackResourceProvider.setUrlBase('http://169.44.5.117:3001/api'); 
    })


  .config(function(gravatarServiceProvider) {
    gravatarServiceProvider.defaults = {
      "default": 'mm'  // Mystery man as default for missing avatars
     };
    // Use https endpoint
    gravatarServiceProvider.secure = true;

    })

    // NG Tags Config
    // ---------------------
    .config(function(tagsInputConfigProvider) {
      tagsInputConfigProvider
        .setActiveInterpolation('tagsInput', { 
          placeholder: true
        })
    .setDefaults('tagsInput', { placeholder: '' })
    })