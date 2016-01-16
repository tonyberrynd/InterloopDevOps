// Re-usable $splash module
angular.module('ui.splash', ['ui.bootstrap', 'ngAnimate'])

//view Splash

.service('$splashViews', [
  '$uibModal',
  '$rootScope',
  function($uibModal, $rootScope) {
    return {
      open: function (attrs, opts) {
        var scope = $rootScope.$new();
        angular.extend(scope, attrs);
        opts = angular.extend(opts || {}, {
          backdrop: false,
          scope: scope,
          controller: 'SplashViewCtrl',
          templateUrl: '/modules/_shared/splash/viewSplash.html',
          windowTemplateUrl: '/modules/_shared/splash/splashBase.html'
        });
        return $uibModal.open(opts);
      }
    };
  }
])


// Team Splash
.service('$splashTeam', [
  '$uibModal',
  '$rootScope',
  function($uibModal, $rootScope) {
    return {
      open: function (attrs, opts) {
        var scope = $rootScope.$new();
        angular.extend(scope, attrs);
        opts = angular.extend(opts || {}, {
          backdrop: false,
          scope: scope,
          controller: 'SplashTeamCtrl',
          templateUrl: '/modules/_shared/splash/teamSplash.html',
          windowTemplateUrl: '/modules/_shared/splash/splashBase.html'
        });
        return $uibModal.open(opts);
      }
    };
  }
])
