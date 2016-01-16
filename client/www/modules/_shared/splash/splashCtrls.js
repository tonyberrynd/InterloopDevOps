angular.module('interloop.splash.controllers', [])

.controller('SplashViewCtrl', function($scope, $state, $uibModal, $timeout, interloop, interloopConfig, View) {

	$scope.data = {};
  $scope.currentState = interloop.currentState;  
	$scope.searchViews = '';
	$scope.selectedView = null;

  $scope.selectView = function(view) {
  	$scope.updateHidden(view, false); 

    //check if outside display area 
    var visibleViews = _.filter(_.reject($scope.currentState.views, {id: view.id}), {hidden: false, default: false});

    //if Over limit hide last view
    var viewLen = interloopConfig.viewLength - 1;  
    if(visibleViews.length > viewLen ) {
      $scope.updateHidden(visibleViews[viewLen], true); 
    }; 
    interloop.viewAction('Select', view, interloop.entities[view.entityType]); 
    $scope.$close(); 
  } 

  //TODO - Move to interloop service 
  $scope.updateHidden = function(view, hidden){
    view.hidden = hidden; 
    View.prototype$updateAttributes(  
      {id: view.id}, 
      {hidden : hidden}
    ); 
  }; 

  $scope.deleteView = function($event, view){
  $event.stopPropagation();
   interloop.viewAction('Delete', view); 
  }; 

  //on keydown event - select first
  $scope.arrowDown = function($event) {
   
    if ($event.keyCode == 40) {
    	console.log('arrow down');
    	//set active value to first value of list
      $scope.active = {
			 select: $scope.currentState.views[0],
		  } 
	   }
  };
})


.controller('SplashTeamCtrl', function($scope, $state, $modalInstance, Appuser) {

	$scope.data = {};

	Appuser.find().$promise
    .then(function(results){
        $scope.data.members = results;
     });

    //get initials
    $scope.getInitials = function(name){
    if(name != null){
      name =  name.replace(/[^A-Z]/g, ''); 
    }
    return name; 
  }

  $scope.goToProfile = function(id) {

  	$state.go('base.profile', {userId: id});
  	$modalInstance.dismiss();

  }


})

