angular.module('interloop.opportunities.controllers', [])

//Opportunities Controller
//------------------------------------------------------------------
.controller('OpportunitiesCtrl', function(
    $scope, 
    $stateParams, 
    interloop, 
    panels, 
    Org
  ) {

//Initialize
//--------------------

  $scope.currentEntity = {}; 
  $scope.data = {}; 
  $scope.data.viewType = 'list'; 

  //get reference to Opportunity shared service 
  $scope.currentEntity = interloop.entities.Opportunity; 
  $scope.currentView = $stateParams.view != null ? $stateParams.view : interloop.defaultView($scope.currentEntity.entityType); 
  interloop.setCurrentState($scope.currentEntity, $scope.currentView);

    //wire up grid to this data source and columndefs
  $scope.currentEntity.gridOptions.onReady = function(api){
    $scope.currentEntity.gridOptions.api.setColumnDefs($scope.currentView.columnDefs); 
    $scope.currentEntity.gridOptions.api.setDatasource($scope.currentEntity.datasource); 
  };  

  // console.log($scope.currentEntity.gridOptions.api.selectedNodesById);
  

  $scope.clearSelected  = function() {
    $scope.currentEntity.gridOptions.api.deselectAll();
  }


  $scope.resetAll = function() {

        //rest Filters
        $scope.currentState.view.query = angular.copy($scope.currentState.origView.query); 
        $scope.currentState.entity.refineParams = angular.copy($scope.currentState.origRefineParams); 
        $scope.data.checked = {};  //clear out all the no and anyValue checkboxes 
        $scope.currentEntity.gridOptions.api.setDatasource($scope.currentEntity.datasource);  
        //interloop.viewAction('Select', $scope.currentState.view, $scope.currentState.entity); 

        //reset columns
        $scope.currentEntity.columnsChanged = false; 
        // $scope.currentState.view.columnDefs = angular.copy($scope.currentState.prevView.columnDefs);  
        $scope.currentState.entity.gridOptions.api.setColumnDefs($scope.currentState.view.columnDefs); 
  }

//List View
//-------------------

  //Panel actions - Open 
  $scope.panelAction = function(action, panelName) {
    interloop.panelAction(action, panelName, $scope.currentEntity)
  }; 

  //Handles views actions such as Select, Update, Save, Delete
  $scope.viewAction = function(action, view){
    interloop.viewAction(action, view, $scope.currentEntity.type)
  }; 
  
  ///export Opportunities
  $scope.exportOpportunities = function() {
    
  };

  $scope.refreshView = function() {
    console.log('refresh');
    $scope.currentEntity.gridOptions.api.setDatasource($scope.currentEntity.datasource); 
  }

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
        $scope.sortOppsByMonth();
        break;  
    } 
  }; 




//Card View
//-------------------

  $scope.sortOpps = function(){
    $scope.data.sortedOpps = {}; 
    //create Stage Buckets 
    angular.forEach($scope.currentEntity.pickLists.stage.items,function(stage){
      var oppStage = stage.value; 
      $scope.data.sortedOpps[oppStage] = []; 
    }); 
    //Add NoStage section to array 
    $scope.data.sortedOpps['NoStage'] = [];  

    angular.forEach($scope.currentEntity.data, function (opp) { 
      var oppStage = _.get(opp, 'stage.value', 'NoStage');
      if (oppStage in $scope.data.sortedOpps){
         $scope.data.sortedOpps[oppStage].push(opp);   
      }
      else {
        $scope.data.sortedOpps['NoStage'].push(opp);  
      };          
     
    });    
  }; 


  $scope.sortOppsByMonth = function() {

    $scope.data.sortedOppsByMonth = {};

    //create Month buckets based on today
    $scope.upcomingMonths = [];
    for(var i=0;i<12;i++) {
    $scope.upcomingMonths.push(moment().add(i, 'months').get('month'));
    }

     angular.forEach($scope.upcomingMonths,function(month){
      $scope.data.sortedOppsByMonth[month] = []; 
    }); 

    console.log($scope.upcomingMonths);

    angular.forEach($scope.currentEntity.data, function (opp) {           
      $scope.data.sortedOppsByMonth[moment(opp.estimatedClose).get('month')].push(opp);
    });    

  }


  $scope.updateCard = function(opp, newStage) {
    var newStageValue = _.find($scope.currentEntity.pickLists.stage.items, {value: newStage}); 
    opp.stage = newStageValue; 

   $scope.currentEntity.entityModel.prototype$updateAttributes({ id: opp.id }, opp)
   .$promise.then(function() {
      //find this record in grid data and update 
      var oppToChange = _.find($scope.currentEntity.data, {id: opp.id}); 
      oppToChange.stage = newStageValue;  //update change in grid 
      $scope.currentEntity.gridOptions.api.refreshView();  
   });
  }; 



//Timeline View
//-------------------

$scope.getTotal = function(opps) {
    var total = 0;
    for(var i = 0; i < opps.length; i++){
        var opportunity = opps[i];
        total += opportunity.value;
    }
    return total;
  }

 $scope.getWonTotal = function(opps) {

    var total = 0;
    for(var i = 0; i < opps.length; i++){
        var opportunity = opps[i];
        if(opportunity.status == 'won') {
         total += opportunity.value;
        }
    }
    return total;
  }

 $scope.getOpenTotal = function(opps) {

    var total = 0;
    for(var i = 0; i < opps.length; i++){
        var opportunity = opps[i];
        if(opportunity.status !== 'won' || opportunity.status !== 'lost') {
         total += opportunity.value;
        }
    }
    return total;
  }

 $scope.getMonthTotal = function(opps) {

    var total = 0;
    for(var i = 0; i < opps.length; i++){
        var opportunity = opps[i];
        if(opportunity.status !== 'lost') {
         total += opportunity.value;
        }
    }
    return total;
  }



//Global Opportunities Actions
//-----------------------------

 //Clear Filters
 $scope.clearAllFilters = function(){
    interloop.clearAllFilters(); 
  }; 

  //refresh
  $scope.doRefresh = function(){
    //set Data Source 
    $scope.currentEntity.gridOptions.api.setDatasource(); 
  }; 

  //refresh Grid when broadcast is recevied    
  $scope.$on($scope.currentEntity.refreshBroadcast, function(event, view) {
    $scope.doRefresh(); 
  });

})



//Opportunities Glimpse View
//------------------------------------------------------------------
.controller('OpportunityGlimpseCtrl', function($scope, $state, panels, interloop) {
  $scope.currentEntity = interloop.entities.Opportunity; 
  $scope.currentState = interloop.currentState; 
  $scope.data = {}; 
  $scope.data.selected = {}; 

  //Wire up  watches for rules 
  angular.forEach($scope.currentEntity.rules, function(rule){
    //Wire up each trigger field 
    angular.forEach(rule.ruleTrigger.fields, function(field){
      var watchItem = 'currentEntity.currentItem.' + rule.ruleTrigger.obj + '.' + field; 

      $scope.$watch(watchItem, function(newVal, oldVal){
        if(newVal != null){
          //TODO - Move into Interloop 
          var startObj = $scope.currentEntity.currentItem;  
          var fieldParts = rule.updateField.split(/\.(?=[^.]+$)/);  //break reference into 2 parts
          if(fieldParts.length > 1){  //Need drill into obj and get new reference from string in fieldParts[1]
            function index(startObj, i) {return startObj[i]}; 
            updateObj = fieldParts[0].split('.').reduce(index,startObj);  //Get reference one level up from assignemnt 
            updateField = fieldParts[1];  
          } else {  //drill into object not needed 
            updateObj = startObj; 
            updateField = rule.updateField;  
          }; 
          
          updateObj[updateField] = interloop.applyRule(rule, $scope.currentEntity.currentItem); //assign value 
          //$scope.currentEntity.currentItem[rule.updateField] = interloop.applyRule(rule, $scope.currentEntity.currentItem);     
        };
      }); 
    })
  });

  //display current Opportunity in side panel when broadcast message is recevied 
  $scope.$on('openOpportunityGlimpse', function(event, currentEntity) {         
     //TODO - Remove after testing since entity is already bound during initialize 
     //$scope.currentEntity = currentEntity; 
     //console.log($scope.currentEntity);
     panels.open("opportunityGlimpse");  
  });

  //Close panel action  
  $scope.closePanel = function(action){
    if(action == 'Save'){
      delete $scope.currentEntity.currentItem.company; //remove nested item to avoid issue with Strongloop modifying id to string 
      $scope.currentEntity.entityModel.upsert($scope.currentEntity.currentItem).$promise
      .then(function(results){
        $scope.currentEntity.gridOptions.api.refreshView(); 
        interloop.viewAction('Select', $scope.currentState.view,  $scope.currentState.entity);  //reload view 
      }) 
    }; 

    //TODO - Need to add dialog to confirm 
    if(action == 'Delete'){
      $scope.currentEntity.entityModel.deleteById({id: $scope.currentEntity.currentItem.id}).$promise
      .then(function(results){
        $scope.currentEntity.gridOptions.api.refreshView(); 
        interloop.viewAction('Select', $scope.currentState.view, $scope.currentState.entity);  //reload view 
      })
    }
    panels.close();  
  }; 

  //Wire up  watches for rules 
  angular.forEach($scope.currentEntity.rules, function(rule){
    //Wire up each trigger field 
    angular.forEach(rule.ruleTrigger.fields, function(field){
      var watchItem = 'currentEntity.currentItem.' + rule.ruleTrigger.obj + '.' + field; 

      $scope.$watch(watchItem, function(newVal, oldVal){
        if(newVal != null){
          //TODO - Move into Interloop 
          var startObj = $scope.currentEntity.currentItem;  
          var fieldParts = rule.updateField.split(/\.(?=[^.]+$)/);  //break reference into 2 parts
          if(fieldParts.length > 1){  //Need drill into obj and get new reference from string in fieldParts[1]
            function index(startObj, i) {return startObj[i]}; 
            updateObj = fieldParts[0].split('.').reduce(index,startObj);  //Get reference one level up from assignemnt 
            updateField = fieldParts[1];  
          } else {  //drill into object not needed 
            updateObj = startObj; 
            updateField = rule.updateField;  
          }; 
          
          updateObj[updateField] = interloop.applyRule(rule, $scope.currentEntity.currentItem); //assign value 
          //$scope.currentEntity.currentItem[rule.updateField] = interloop.applyRule(rule, $scope.currentEntity.currentItem);     
        };
      }); 
    })
  });

  /* TODO - Remove after testing new watches
  //Update scores for any changes made to panel 
  $scope.$watchCollection('currentEntity.currentItem.qualifiers', function() {
    //Calculate new score 
    var arr = $scope.currentEntity.currentItem.qualifiers; 
    $scope.currentEntity.currentItem.score = 
        _.sum(arr, 'value')/_.size(arr); 
    });
  */
})




//Detail Controller
//------------------------------------------------------------------
.controller('OpportunityDetailsCtrl', function($scope, $log, $state, $stateParams, $sce, $uibModal, interloop, FileUploader) {

//Initalize
//--------------------
  $scope.data = {} ;  //data that is not saved with Opportunity records 
  $scope.currentEntity = interloop.entities.Opportunity; 
  $scope.currentEntity.currentItem = {};  //clear out old data to avoid flash 

  $scope.container = interloop.entities.Container; 

  var oppContact = interloop.entities.OppContact; 

    //get select opportunity 
  $scope.currentEntity.entityModel.findById($scope.currentEntity.queries.detail, {id: $state.params.opportunityId}, function(item){
    $scope.currentEntity.currentItem = item; 
    /* 
    oppContact.entityModel.find(oppContact.queries.detail, {opportunityId: $state.params.opportunityId}, function(results){
      $scope.currentEntity.currentItem.contacts = results;   
    })
  */ 
  $scope.container.entityModel.getFiles({container: $scope.currentEntity.currentItem.company}, function(results){
      $scope.container.files = results; 
    })

     //load generated data - not stored in currentEntity - Initials, Qualifiers display  
    $scope.data.acctMgrInitials = interloop.getInitials($scope.currentEntity.currentItem.accountManager.value); 
    $scope.data.htmlQualifiers = $sce.trustAsHtml(interloop.htmlQualifiers($scope.currentEntity.currentItem.qualifiers));  
  });
  //$scope.currentEntity.currentItem = interloop.entities.Opportunity.gridOptions.api.getSelectedRows()[0]; 
  
  $scope.swiper = {};




//define dropdown toggles

$scope.popover = {
  editName: false,
  editValue: false
};


$scope.isOpen = false;

$scope.openCalendar = function(e) {
      e.preventDefault();
      e.stopPropagation();

      $scope.isOpen = true;
  };



  //date time picker stuff - need to remove unnecessary code 

   $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function() {
    $scope.dt = null;
  };

  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };

  $scope.toggleMin();
  $scope.maxDate = new Date(2020, 5, 22);

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.open2 = function() {
    $scope.popup2.opened = true;
  };

  $scope.setDate = function(year, month, day) {
    $scope.dt = new Date(year, month, day);
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];
  $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.popup1 = {
    opened: false
  };

  $scope.popup2 = {
    opened: false
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events =
    [
      {
        date: tomorrow,
        status: 'full'
      },
      {
        date: afterTomorrow,
        status: 'partially'
      }
    ];

  $scope.getDayClass = function(date, mode) {
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  };



  //tabs

    $scope.view_tab = 'details';
  //change tabs
  $scope.changeTab = function(tab) {
    $scope.view_tab = tab;
  }



//file uploads
  var uploader = $scope.uploader = new FileUploader({
      scope: $scope,                          // to automatically update the html. Default: $rootScope
      url: 'http://localhost:3000/api/containers/container1/upload',
      formData: [
        { key: 'value' }
      ],
      autoUpload: true
    });

    // ADDING FILTERS
    uploader.filters.push({
        name: 'filterName',
        fn: function (item, options) { // second user filter
            console.info('filter2');
            return true;
        }
    });

    // REGISTER HANDLERS
    // --------------------
    uploader.onAfterAddingFile = function(item, index) {
      console.info('After adding a file', item);

      if(!$scope.thisTask.attachments) {
        $scope.thisTask.attachments = [];
      }

      $scope.thisTask.attachments.push( {
        "name": item.file.name,
        "size": item.file.size,
        "url":  item.file.name,
      })

      var index = $scope.thisTask.attachments.length - 1;
      $scope.thisTask.attachments[index].showLoader = true;

      $scope.disableUpload = true;
      
    };
    // --------------------
    uploader.onAfterAddingAll = function(items) {
      console.info('After adding all files', items);
    };
    // --------------------
    uploader.onWhenAddingFileFailed = function(item, filter, options) {
      console.info('When adding a file failed', item);
    };
    // --------------------
    uploader.onBeforeUploadItem = function(item) {
      console.info('Before upload', item);
      
    };
    // --------------------
    uploader.onProgressItem = function(item, progress) {
      console.info('Progress: ' + progress, item);
    };
    // --------------------
    uploader.onProgressAll = function(progress) {
      console.info('Total progress: ' + progress);
    };
    // --------------------
    uploader.onSuccessItem = function(item, response, status, headers) {
      console.info('Success', response, status, headers);
    $scope.$broadcast('uploadCompleted', item)
    };
    // --------------------
    uploader.onErrorItem = function(item, response, status, headers) {
      console.info('Error', response, status, headers);
    };
    // --------------------
    uploader.onCancelItem = function(item, response, status, headers) {
      console.info('Cancel', response, status);
    };
    // --------------------
    uploader.onCompleteItem = function(item, response, status, headers, progress) {
      console.info('Complete', response, status, headers, progress);

      $scope.thisTask.feed.push({
          "type":"file",
          "user":$rootScope.activeUser.email,
          "action": "uploaded file: " + item.file.name,
          "date": moment()
        });
     
       Task.prototype$updateAttributes({ id: $scope.thisTask.id }, $scope.thisTask)
       .$promise.then(function() {
        getTask();
       });



    };
    // --------------------
    uploader.onCompleteAll = function() {
      console.info('Complete all');
    };
    // --------------------


 $scope.$on('uploadCompleted', function(event) {
    
    var index = $scope.thisTask.attachments.length - 1;

      $timeout($scope.thisTask.attachments[index].showLoader = false, 300000)

});


$scope.load = function () {
      $http.get('/api/containers/container1/files').success(function (data) {
        console.log(data);
        $scope.files = data;
      });
    };

    $scope.delete = function (index, id) {
      $http.delete('/api/containers/container1/files/' + encodeURIComponent(id)).success(function (data, status, headers) {
        $scope.files.splice(index, 1);
      });
    };

    $scope.$on('uploadCompleted', function(event) {
      console.log('uploadCompleted event received');
      $scope.load();
    });





//Stage & Steps Swiper
//----------------------

  $scope.nextSlide = function(){
      $scope.swiper.slideNext();
    };

  $scope.prevSlide = function() {
      $scope.swiper.slidePrev();
    }

  $scope.stepChecked = function(step){
  
    $scope.currentEntity.entityModel.prototype$updateAttributes(
      {id: $scope.currentEntity.currentItem.id}, 
      {process : {stages: $scope.currentEntity.currentItem.process.stages}}).$promise
    .then(function(results){
      $scope.currentEntity.currentItem = results; 
    })
  }; 
  

//Contacts
//------------------------
  $scope.getInitials = function(name){
    return interloop.getInitials(name); 
  }; 



//win a deal modal
 $scope.wonDeal = function () {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'modules/_shared/modals/wonDeal.html',
      controller: 'wonDealCtrl',
      backdropClass: 'loop-backdrop',
      openedClass: 'confetti'
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

})

//New Opportunity Controller
//------------------------------------------------------------------
.controller('wonDealCtrl', function($scope, $uibModalInstance) {

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
})



