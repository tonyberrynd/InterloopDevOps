angular.module('interloop.companies.controllers', [])


.controller('CompaniesCtrl', function($scope, $stateParams, interloop, panels) {
  $scope.currentEntity = {}; 
  $scope.data = {}; 
  $scope.data.viewType = 'list'; 

  //get reference to Company shared service 
  $scope.currentEntity = interloop.entities.Company; 
  $scope.currentView = $stateParams.view != null ? $stateParams.view : interloop.defaultView($scope.currentEntity.entityType); 
  interloop.setCurrentState($scope.currentEntity, $scope.currentView); 
  

  //Panel actions - Open 
  $scope.panelAction = function(action, panelName) {
    interloop.panelAction(action, panelName, $scope.currentEntity)
  }; 

  //Handles views actions such as Select, Update, Save, Delete
  $scope.viewAction = function(action, view){
    interloop.viewAction(action, view, $scope.currentEntity)
  }; 
  
  ///export Companies
  $scope.exportCompanies = function() {
    // $scope.gridOptions.api.exportDataAsCsv();
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

//quick company view
.controller('CompanyGlimpseCtrl', function($scope, $state, panels, interloop) {
  $scope.currentEntity = interloop.entities.Company; 
  $scope.data = {}; 
  $scope.data.selected = {}; 
 
  //display current company in side panel when broadcast message is recevied 
  $scope.$on('openCompanyGlimpse', function(event, currentEntity) {         
     $scope.currentEntity = currentEntity; 
     panels.open("companyGlimpse");  
  });

  //Close panel action  
  $scope.closePanel = function(action){
    if(action == 'Save'){
      $scope.currentEntity.entityModel.upsert($scope.currentEntity.currentItem).$promise
      .then(function(results){
        $scope.currentEntity.gridOptions.api.refreshView(); 
        interloop.viewAction('Select', $scope.currentEntity.currentView,  $scope.currentEntity);  //reload view 
      }) 
    }; 

    //TODO - Need to add dialog to confirm 
    if(action == 'Delete'){
      $scope.currentEntity.entityModel.deleteById({id: $scope.currentEntity.currentItem.id}).$promise
      .then(function(results){
        $scope.currentEntity.gridOptions.api.refreshView(); 
        interloop.viewAction('Select', $scope.currentEntity.currentView, $scope.currentEntity);  //reload view 
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


.controller('CompanyDetailsCtrl', function($scope, $state, $stateParams, $sce, $filter, interloop) {
  $scope.data = {} ;  //data that is not saved with Company records 
  $scope.currentEntity = interloop.entities.Company; 
  $scope.currentEntity.currentItem = {};  //clear out old data to avoid flash 

  //get select opportunity 
  $scope.currentEntity.entityModel.findById($scope.currentEntity.queries.detail, {id: $state.params.companyId}, function(item){
    $scope.currentEntity.currentItem = item; 

     //load generated data - not stored in currentEntity - Initials, Qualifiers display  
    $scope.data.acctMgrInitials = interloop.getInitials($scope.currentEntity.currentItem.accountManager.value); 
    $scope.data.htmlQualifiers = $sce.trustAsHtml(interloop.htmlQualifiers($scope.currentEntity.currentItem.qualifiers));  
  }); 

  //$scope.currentEntity.currentItem = interloop.entities.Opportunity.gridOptions.api.getSelectedRows()[0]; 
  
  $scope.getInitials = function(name){
    return interloop.getInitials(name); 
  }; 

  //swiper controls

  $scope.swiper = {};

    $scope.nextSlide = function(){
      $scope.swiper.slideNext();
    };

    $scope.prevSlide = function() {
      $scope.swiper.slidePrev();
    }

})
