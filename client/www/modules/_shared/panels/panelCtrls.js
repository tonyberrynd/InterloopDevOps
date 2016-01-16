angular.module('interloop.panel.controllers', [])

// notifications
.controller('NotificationPanelCtrl', function($scope, $state, $rootScope, $timeout, panels, User, Notification) {

    function getNotifications() {
        Notification.find({ filter: { order: "created_date DESC" } })
            .$promise.then(function(notifications) {

                angular.forEach(notifications, function (param) {

                   if(moment(param.created_date).isAfter($rootScope.activeUser.last_read)){
                      param.unread = true;
                       }
                     })

                  $scope.notifications = notifications;
                    
                });  
    }


   $scope.$on('openNotifications', function(event) {
        getNotifications();
        panels.open("notificationsPanel");

      })


   $scope.closeNotifications = function() {

    panels.close();

      $rootScope.activeUser.last_read = moment();

      User.prototype$updateAttributes({ id: $rootScope.activeUser.id }, $rootScope.activeUser)
          .$promise.then(function() {
            console.log('updated last read');

            $rootScope.$broadcast('refreshUnread');
            
      });


   }


})

// metions
.controller('MentionsPanelCtrl', function($scope, $state, panels) {
  
})

// Contact
.controller('ContactPanelCtrl', function($scope, $state, panels) {
  
})



.controller('TaskPanelCtrl', function($scope, $state, $uibModal, $log, $rootScope, $http, $timeout, $filter, interloop, panels, FileUploader) {

  $scope.currentEntity = interloop.entities.Task; 

  $scope.taskGroup = '';
  $scope.todaysDate = moment();
  $scope.taskDescription = '';


  function getTask() {
        $scope.currentEntity.entity.findById({ id: $scope.taskId })
            .$promise.then(function(task) {
              //set thisTask to task
              $scope.thisTask = task;

              $scope.taskDescription = task.description;

            if (task.isComplete) {
              $scope.taskGroup = 'completed';
             }
            else if(moment.utc(task.plannedDate).isBefore(moment().endOf('day'))) {
      
          $scope.taskGroup = 'inbox';
        }
             else if(moment.utc(task.plannedDate).isAfter(moment().endOf('day'))) {
              $scope.taskGroup = 'later';
             }
             else if (!task.plannedDate) {
              $scope.taskGroup = 'someday';
             }

              
 });
}


   $scope.$on('openTaskPanel', function(event, args) {
        $scope.taskId = args.taskId;
        panels.open("taskPanel");

          getTask();




  });


   //top bar actions

   $scope.updatePlanned = function() {

      var plannedDate = null;

        switch (delay) {
            case 'tomorrow':
                plannedDate = moment().add(1, 'days'); 
                break;
            case 'weekend':
                plannedDate = moment().day(7);
                break;
            case 'week':
                plannedDate = moment().add(7, 'days');
                break;
            case 'month':
                plannedDate = moment().add(1, 'months');
                break;
        }

        $scope.thisTask.plannedDate = plannedDate;

        Task.prototype$updateAttributes({ id: $scope.thisTask.id }, $scope.thisTask)
       .$promise.then(function() {
          $rootScope.$broadcast('refreshTasks');
          getTask();
       });
    }

    $scope.setSomeday = function() {

      $scope.thisTask.plannedDate = null;
      $scope.currentEntity.entity.prototype$updateAttributes({ id: $scope.thisTask.id }, $scope.thisTask).$promise
      .then(function() {
          $rootScope.$broadcast('refreshTasks');
          getTask();
       });
  }

    $scope.setNow = function() {

      $scope.thisTask.plannedDate = moment();
      $scope.currentEntity.entity.prototype$updateAttributes({ id: $scope.thisTask.id }, $scope.thisTask).$promise
      .then(function() {
          $rootScope.$broadcast('refreshTasks');
          getTask();
         });
  }

  $scope.saveDescription = function(editor) {

    $scope.thisTask.description = $scope.taskDescription;
    $scope.currentEntity.entity.prototype$updateAttributes({ id: $scope.thisTask.id }, $scope.thisTask).$promise
    .then(function() {
        getTask();
    });
  }

  $scope.completeTask = function() {

      $scope.thisTask.is_complete = true;
      $scope.thisTask.completedDate = moment();
      $scope.thisTask.feed.push({
          "type":"complete",
          "user":$rootScope.activeUser.email,
          "action": "completed task",
          "date": moment()
        });

      $scope.currentEntity.entity.prototype$updateAttributes({ id: $scope.thisTask.id }, $scope.thisTask).$promise
      .then(function() {
        $rootScope.$broadcast('refreshTasks');
      getTask();
     });
    }

 $scope.notComplete = function(index) {
      $scope.updatedTask = $scope.thisTask;
      $scope.updatedTask.is_complete = false;
      $scope.updatedTask.completedDate = null;
      $scope.updatedTask.feed.push({
          "type":"uncomplete",
          "user":$rootScope.activeUser.email,
          "action": "un-completed task",
          "date": moment()
        });

      $scope.currentEntity.entity.prototype$updateAttributes({ id: $scope.thisTask.id }, $scope.updatedTask).$promise
      .then(function() {
        console.log('task not complete');
        getTask();
        $rootScope.$broadcast('refreshTasks');
     });
    }


// panel grid actions



   $scope.updateSubject = function() {

    $scope.currentEntity.entity.prototype$updateAttributes({ id: $scope.thisTask.id }, $scope.thisTask)
       .$promise.then(function() {
        $rootScope.$broadcast('refreshTasks');
       console.log('updated subjected')
       });


   }

   $scope.updateDescription = function() {
    console.log('updated Description')
   }


  $scope.onTimeSet = function(task, dueDate) {

    $scope.updatedTask = task;
    $scope.updatedTask.dueDate = dueDate;
    $scope.thisTask.feed.push({
          "type":"due",
          "user":$rootScope.activeUser.email,
          "action": "set due date: " + $filter('date')(dueDate, 'MMMM d, y'),
          "date": moment()
        });

      $scope.currentEntity.entity.prototype$updateAttributes({ id: $scope.thisTask.id }, $scope.updatedTask)
       .$promise.then(function() {
        console.log('due date set');
        $rootScope.$broadcast('refreshTasks');
       });

       getTask();


  }

   //delete task

   $scope.deleteTask = function() {

   var modalInstance = $uibModal.open({
      templateUrl: 'modules/_shared/modals/deleteTask.html',
      controller: 'DeleteTaskCtrl',
      size: 'md',
      resolve: {
        thisTask: function () {
          return $scope.thisTask;
        }
      }
    });

   //results of modal select
   modalInstance.result.then(function () {

    //if delete is chosen
      $scope.currentEntity.entity.deleteById({ id: $scope.thisTask.id })
        .$promise
        .then(function() { 
          //refresh tasks
          $rootScope.$broadcast('refreshTasks');

          //close panels
          panels.close();
          console.log('deleted'); 
      });

    })

   }



   ///upload attachments

   // create a uploader with options

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
      $http.get('http://localhost:3000/api/containers/container1/files').success(function (data) {
        console.log(data);
        $scope.files = data;
      });
    };

    $scope.delete = function (index, id) {
      $http.delete('http://localhost:3000/api/containers/container1/files/' + encodeURIComponent(id)).success(function (data, status, headers) {
        $scope.files.splice(index, 1);
      });
    };

    $scope.$on('uploadCompleted', function(event) {
      console.log('uploadCompleted event received');
      $scope.load();
    });








})

//delete Task CTRL
.controller('DeleteTaskCtrl', function ($scope, $uibModalInstance, thisTask) {

  $scope.thisTask = thisTask;

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.delete = function () {
    $uibModalInstance.close('delete');
  };
})

// lead - sort panel
.controller('SortPanelCtrl', function($scope, $state, $rootScope, panels) {
  
   $scope.$on('openSortPanel', function(event, args) {
      $scope.gridOptions = args.gridOptions;
        panels.open("sortPanel");
      });

   $scope.sort = {};
   $scope.sort.sortValue = 'DESC__name';

   $scope.descFields = {
    DESC__name: 'Name',
    DESC__score: 'Score',
      DESC__contacts: 'Contacts',
      DESC__status_label: 'Status (A-Z)',
      DESC__status_id: 'Status (Order)',
      DESC__score: 'Score',
      DESC__qualifiers: 'Qualifiers',
      DESC__manager: 'Account Manager',
      DESC__email: "Email",
      DESC__phone: "Phone",
      DESC__website: "Website",
      DESC__created_date: "Created",
      DESC__last_updated: "Last Updated",
      DESC__actions: "actions"
     };

     $scope.ascFields = {
      ASC__name: 'Name',
      ASC__score: 'Score',
      ASC__contacts: 'Contacts',
      ASC__status_label: 'Status (A-Z)',
      ASC__status_id: 'Status (Order)',
      ASC__score: 'Score',
      ASC__qualifiers: 'Qualifiers',
      ASC__manager: 'Account Manager',
      ASC__email: "Email",
      ASC__phone: "Phone",
      ASC__website: "Website",
      ASC__created_date: "Created",
      ASC__last_updated: "Last Updated",
      ASC__actions: "actions"
     };


     $scope.applySort = function() {

      var res = $scope.sort.sortValue.split("__");
      //order
      console.log(res[0]);
      $rootScope.sortOrder = res[0];
      // parameter
      console.log(res[1]);
      $rootScope.sortParam = res[1];

      $scope.gridOptions.api.setDatasource()

      panels.close();
     }

})

// lead - refine panel

.controller('RefinePanelCtrl', function($scope, $rootScope, $state, interloop,  panels) {
  $scope.currentState = interloop.currentState; 
  $scope.data = {}; 
  $scope.data.checked = {};  //Stores current state of the noValue checkboxes 
  $scope.data.anyValue = {"regexp": ".*"}; 
  $scope.data.noValue = {"exists": false}; 

   //get grid reference on open  
  $scope.$on('openRefinePanel', function(event, currentEntity) {
    //Initialize data and then load fields 
    $scope.currentEntity = currentEntity; 
    panels.open("refinePanel");
  });


      //Reset filters to defaults 
      $scope.resetFilters = function(){  //Restore columns to prev state 
        $scope.currentState.view.query = angular.copy($scope.currentState.origView.query); 
        $scope.currentState.entity.refineParams = angular.copy($scope.currentState.origRefineParams); 
        $scope.data.checked = {};  //clear out all the no and anyValue checkboxes 
        $scope.dataChanged(); 
        //interloop.viewAction('Select', $scope.currentState.view, $scope.currentState.entity); 
      }; 

      $scope.dataChanged = function(){
        $scope.applyRefine(); 
      }; 

      //Adds or removes null query based on status of noValue checkbox 
      $scope.setNoValue = function(fieldName, fieldCategory) {
        if($scope.data.checked[fieldName] != null && $scope.data.checked[fieldName].noValue){
          $scope.currentEntity.refineParams[fieldCategory][fieldName].push(null);
        }
        else {
           _.pull($scope.currentEntity.refineParams[fieldCategory][fieldName], null);   
        }
        $scope.dataChanged(); 
      }; 


      $scope.applyRefine = function() {

        //handle Custom  fields 
        var whereClause = {and: []}; 

        //iterate through each refineParam type 
        angular.forEach($scope.currentEntity.refineParams, function(refineFields, fieldName){
          angular.forEach(refineFields, function(values, field){
            //Check for no entry or undefined. Happens because of ng-model in ng-repeat 
            if(values != null && values.length > 0 ){
              whereOr = {or: []};   
            }
            else {
              delete $scope.currentEntity.refineParams[fieldName][field];  //delete key
              whereOr = {}; //no or condition so cleare out 
            }
            
            angular.forEach(values, function(value){
              var orObj = {};
              if(fieldName === 'standardFields') {  
                 orObj[field + '.value'] = value; //Standard fields are at top level so no top level object ref needed 
              } 
              else {
                 orObj[fieldName + '.' + field + '.value'] = value;  //Need to add top level object for rest 
              }
             
              whereOr['or'].push(orObj); 
            });
            whereClause.and.push(whereOr); 
          }); 
        }); 

       
        whereClause = whereClause.and.length > 0 ? whereClause : {} ; 
        $scope.currentState.view.query.filter.where = whereClause; 

        interloop.updateFilterTotals($scope.currentEntity); 
        
        //ask grid to refresh 
        $rootScope.$broadcast($scope.currentEntity.refreshBroadcast);
      }; 


      //used as filter to only show fields with showInRefine = true
      $scope.showInRefine = function(fields){
        var result = {};
        angular.forEach(fields, function(fieldValue, field) {
          if (fieldValue.showInRefine) {
            result[field] = fieldValue;
          }
        });
        return result;
      }; 
})

.controller('ColumnsPanelCtrl', function($scope, panels, interloop) {

  $scope.currentEntity = {}; 
  $scope.currentState = interloop.currentState; 

  $scope.$on('openColumnsPanel', function(event, currentEntity) {
     $scope.currentEntity = currentEntity; 
     panels.open("columnsPanel");
  });

  $scope.applyFilters = function() {
    panels.close("columnsPanel")
  };  

  $scope.resetColumns = function(){  //Restore columns to prev state 
    $scope.currentEntity.columnsChanged = false; 
    $scope.currentState.view.columnDefs = angular.copy($scope.currentState.prevView.columnDefs);  
    $scope.currentState.entity.gridOptions.api.setColumnDefs($scope.currentState.view.columnDefs); 
    
  }; 

  $scope.toggleColumn = function(columnItem){
    columnItem.hide = !columnItem.hide; 
    $scope.currentEntity.gridOptions.columnApi.hideColumn(columnItem.field, columnItem.hide); 
    $scope.currentEntity.columnsChanged = true; 
  }; 

})

