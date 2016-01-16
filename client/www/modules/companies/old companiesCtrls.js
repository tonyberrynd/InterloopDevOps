angular.module('interloop.companies.controllers', [])


.controller('CompaniesCtrl', function($scope, resize, interloop, panels) {
  $scope.currentEntity = {}; 
  
  //get reference to Company shared service 
  $scope.currentEntity = interloop.entities.Company; 
  
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

  
  //Event for Row click in grid 
  //TODO - move function into Interloop service 
  $scope.rowClicked = function (event) {
    //If column has an href don't open side panel let href control navigation
    if(event.event.srcElement.attributes.length == 0 || event.event.srcElement.attributes[0].name !== "href"){
      $scope.currentEntity.currentItem = event.data; 
      $scope.panelAction('Open', 'CompanyGlimpse', $scope.currentEntity);
    }; 
  };
  
  ///export companies
  $scope.exportCompanies = function() {
    // $scope.gridOptions.api.exportDataAsCsv();
  };

  $scope.resized = function() {
    console.log('resized');
    $scope.data.gridOptions.api.sizeColumnsToFit();
  };

  $scope.getCount = function() {
    return $scope.currentEntity.entity.count($scope.currentEntity.currentQuery.filter).$promise 
  }; 

  //TODO - setup for infinite scroll 
  $scope.getEntities = function(params){
    
    if(params != null && params.sortModel.length > 0 ){  //Call came from grid so get Sort Order  
      var order = []; 
      angular.forEach(params.sortModel, function(sortItem){
        order.push(sortItem.colId + " " + sortItem.sort.toUpperCase());  
      }); 
      $scope.currentEntity.currentQuery.filter.order = order;  
    }; 

    //Setup page to load 
    $scope.currentEntity.currentQuery.filter.skip = params.startRow; 
    $scope.currentEntity.currentQuery.filter.limit = $scope.currentEntity.gridOptions.datasource.pageSize; 
    
    return $scope.currentEntity.entity.find($scope.currentEntity.currentQuery).$promise 
  }; 

  $scope.doRefresh = function(){
    //Update Total Counts
    $scope.getCount()
    .then(function(data) {
      $scope.currentEntity.totalCount = data.count; 
      $scope.currentEntity.gridOptions.datasource = $scope.currentEntity.datasource;
      $scope.currentEntity.gridOptions.datasource.totalCount = data.count
      $scope.currentEntity.gridOptions.api.setDatasource(); 
    });  
  }; 
  
  //Update options and load grid if not already loaded 
  if(!$scope.currentEntity.loaded){ 
    $scope.currentEntity.gridOptions = new interloop.gridOptions();  //create new grid option for this entity 
    $scope.currentEntity.gridOptions.columnDefs = $scope.currentEntity.defaultColumnDefs; 
    
    $scope.currentEntity.gridOptions.onRowClicked = $scope.rowClicked;  //wire up open Panel 
    //Load Picklists
    interloop.getPickLists($scope.currentEntity)
    .then(function(results){
      $scope.currentEntity.pickLists = results; 
    });

    interloop.getQualifiers($scope.currentEntity)
    .then(function(results){
      $scope.currentEntity.qualifiers = results; 
    });  

    //load views for this entity 
    interloop.getViews($scope.currentEntity)
    .then(function(results){
      $scope.currentEntity.views = results; 
     
      //TODO - change with logic to select default view 
      $scope.viewAction('Select', results[0])
      //load data
      $scope.currentEntity.loaded = true;  
    }); 

    //Setup datasource since this is first time thru
    $scope.currentEntity.datasource = new interloop.datasource(); //create new data source for this entity 
    $scope.currentEntity.datasource.getRowData = function(params){
      return $scope.getEntities(params); 
    }; 
  }; 

  //refresh Grid when broadcast is recevied    
  $scope.$on('refreshCompanies', function(event, args) {
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
      $scope.currentEntity.entity.upsert($scope.currentEntity.currentItem).$promise
      .then(function(results){
        $scope.currentEntity.gridOptions.api.refreshView(); 
        interloop.viewAction('Select', $scope.currentEntity.currentView,  $scope.currentEntity);  //reload view 
      }) 
    }; 

    //TODO - Need to add dialog to confirm 
    if(action == 'Delete'){
      $scope.currentEntity.entity.deleteById({id: $scope.currentEntity.currentItem.id}).$promise
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


.controller('CompanyDetailsCtrl', function($scope, $state, $stateParams, $sce, interloop) {
  $scope.data = {} ;  //data that is not saved with company records 
  $scope.currentEntity = interloop.entities.Company; 
  $scope.currentEntity.currentItem = interloop.entities.Company.gridOptions.api.getSelectedRows()[0]; 
  
  //load generated data - not stored in currentEntity - Initials, Qualifiers display  
  $scope.data.acctMgrInitials = interloop.getInitials($scope.currentEntity.currentItem.accountManager.value); 
  $scope.data.htmlQualifiers = $sce.trustAsHtml(interloop.htmlQualifiers($scope.currentEntity.currentItem.qualifiers));  

  $scope.getInitials = function(name){
    return interloop.getInitials(name); 
  }; 
})
