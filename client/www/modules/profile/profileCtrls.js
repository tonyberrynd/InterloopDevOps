angular.module('interloop.profile.controllers', [])

.controller('ProfileCtrl', function($scope, $state, $stateParams, Appuser) {
    $scope.userId = $stateParams.userId;

    Appuser.findById(
      { id: $stateParams.userId}
    )
    .$promise.then(function(user) {
        $scope.thisUser = user;
     })


    $scope.getInitials = function(name){
    if(name != null){
      name =  name.replace(/[^A-Z]/g, ''); 
    }
    return name; 
  }
     
})