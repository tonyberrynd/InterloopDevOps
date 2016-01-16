angular.module('interloop.config.http', [])

// http interceptor
.config(function($httpProvider) {

  $httpProvider.interceptors.push(function($q, $location, $rootScope, $injector, LoopBackAuth) {
  return {
    responseError: function(rejection) {

      if (rejection.status === 401) {

        //Now clearing the loopback values from client browser for safe logout...
        LoopBackAuth.clearUser();
        LoopBackAuth.clearStorage();

        console.log(rejection.config.url);

        if(rejection.config.url !== 'http://localhost:3000/api/Appusers/login' && rejection.config.url !== 'http://localhost:3000/api/Appusers/login?include=user') {
        //redirect state on session logout
        $rootScope.sessionExpired = true;
        var $state = $injector.get('$state');
        $state.go('login', {url: $location.url()});

      }
      else {

        $rootScope.accessDenied = true;
         //stop svg loader
      }
        
      }
      return $q.reject(rejection);
    }
  };
});


})
