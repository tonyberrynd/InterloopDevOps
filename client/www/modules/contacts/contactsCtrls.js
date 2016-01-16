angular.module('interloop.contacts.controllers', [])

.controller('ContactsCtrl', function($scope, $stateParams, interloop, panels) {
  $scope.currentEntity = {}; 
  $scope.data = {}; 
  $scope.data.viewType = 'list'; 

  //get reference to Contact shared service 
  $scope.currentEntity = interloop.entities.Contact; 
  $scope.currentView = $stateParams.view != null ? $stateParams.view : interloop.defaultView($scope.currentEntity.entityType); 
  interloop.setCurrentState($scope.currentEntity, $scope.currentView); 
  
  //bind resize event 
  //TB - disabled for testing 
  //resize.bind();

  //Panel actions - Open 
  $scope.panelAction = function(action, panelName) {
    interloop.panelAction(action, panelName, $scope.currentEntity)
  }; 

  //Handles views actions such as Select, Update, Save, Delete
  $scope.viewAction = function(action, view){
    interloop.viewAction(action, view, $scope.currentEntity)
  }; 
  
  ///export Contacts
  $scope.exportContacts = function() {
    // $scope.gridOptions.api.exportDataAsCsv();
  };

  $scope.resized = function() {
    console.log('resized');
    $scope.data.gridOptions.api.sizeColumnsToFit();
  };

  //switch view type 
  $scope.switchView = function(view) {
    switch(view){
      case 'cards' : 
        $scope.data.viewType = 'cards'; 
        $scope.sortOpps('stage'); //TODO make this generic field 
        break;
      case 'list': 
        $scope.data.viewType = 'list'; 
        break;  
      case 'timeline': 
        $scope.data.viewType = 'timeline'; 
        break;  
    } 
  }; 

  $scope.clearAllFilters = function(){
    interloop.clearAllFilters(); 
  }; 

  //wire up grid to this data source and columndefs
  $scope.currentEntity.gridOptions.onReady = function(api){
    $scope.currentEntity.gridOptions.api.setColumnDefs($scope.currentView.columnDefs); 
    $scope.currentEntity.gridOptions.api.setDatasource($scope.currentEntity.datasource); 
  }; 

  $scope.doRefresh = function(){
    //set Data Source 
    $scope.currentEntity.gridOptions.api.setDatasource(); 
  }; 

  //refresh Grid when broadcast is recevied    
  $scope.$on($scope.currentEntity.refreshBroadcast, function(event, view) {
    $scope.doRefresh(); 
  }); 

})

//quick Contact view
.controller('ContactGlimpseCtrl', function($scope, $state, panels, interloop) {
  $scope.currentEntity = interloop.entities.Contact; 
  $scope.currentState = interloop.currentState; 
  $scope.data = {}; 
  $scope.data.selected = {}; 
 
  //display current contact in side panel when broadcast message is recevied 
  $scope.$on('openContactGlimpse', function(event, currentEntity) {         
     $scope.currentEntity = currentEntity; 
     panels.open("contactGlimpse");  
  });

  //Close panel action  
  $scope.closePanel = function(action){
    if(action == 'Save'){
      $scope.currentEntity.entityModel.upsert($scope.currentEntity.currentItem).$promise
      .then(function(results){
        $scope.currentEntity.gridOptions.api.refreshView(); 
        interloop.viewAction('Select', $scope.currentState.view,  $scope.currentEntity);  //reload view 
      }) 
    }; 

    //TODO - Need to add dialog to confirm 
    if(action == 'Delete'){
      $scope.currentEntity.entityModel.deleteById({id: $scope.currentEntity.currentItem.id}).$promise
      .then(function(results){
        $scope.currentEntity.gridOptions.api.refreshView(); 
        interloop.viewAction('Select', $scope.currentState.view, $scope.currentEntity);  //reload view 
      })
    }
    panels.close();  
  }; 

  //Update scores for any changes made to panel 
  $scope.$watchCollection('currentEntity.currentItem.qualifiers', function() {
    //Calculate new score 
    var arr = $scope.currentEntity.currentItem.qualifiers; 
    $scope.currentEntity.currentItem.score = 
        _.sum(arr, 'value')/_.size(arr); 
    });
})


.controller('ContactDetailsCtrl', function($scope, $state, $stateParams, $sce, interloop) {
  $scope.data = {} ;  //data that is not saved with Opportunity records 
  $scope.currentEntity = interloop.entities.Contact; 
  $scope.currentEntity.currentItem = {};  //clear out old data to avoid flash 

  //get select Contact 
  $scope.currentEntity.entityModel.findById($scope.currentEntity.queries.detail, {id: $state.params.contactId}, function(item){
    $scope.currentEntity.currentItem = item; 

     //load generated data - not stored in currentEntity - Initials, Qualifiers display  
    $scope.data.acctMgrInitials = interloop.getInitials($scope.currentEntity.currentItem.accountManager.value); 
    $scope.data.htmlQualifiers = $sce.trustAsHtml(interloop.htmlQualifiers($scope.currentEntity.currentItem.qualifiers));  
  }); 

  $scope.getInitials = function(name){
    return interloop.getInitials(name); 
  }; 
})
