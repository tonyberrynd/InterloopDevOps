angular.module('interloop.tasks.controllers', [])


.controller('NowCtrl', function($scope, $rootScope, $http, $q, interloop, panels) {

  $scope.currentEntity = interloop.entities.Activity; 

    $scope.newTaskText = '';
    $scope.status = {
      isopen: false
    }; 
    $scope.selectedRow = null;    // initialize our variable to null
    $scope.datePicker = false;    //hide datepicker in dop-up
    $scope.todaysDate = moment(); //get now

    $scope.taskType = 'task';


    //after deleting - refresh tasks
    $scope.$on('refreshTasks', function(event) {
          $scope.selectedRow = null;  //set selected row to null
          getTasks();
    });

    var query = {
      filter: {
        order: 'plannedDate DESC', 
        where: {
          and: [{plannedDate: { lt : moment().endOf('day')}}, {isComplete: false} ] 
        }
      }
    }; 

    //get Tasks Function
    function getTasks() {
        $scope.currentEntity.entityModel.find(query).$promise
        .then(function(tasks) {
           angular.forEach(tasks, function (task) {
              if(moment.utc(task.plannedDate).isBefore($scope.todaysDate, 'day')) {
                task.beforeToday = true;
              }
          })
          $scope.tasks = tasks;
        });
    }

    //get tasks on first entering controller
    getTasks();


    $scope.createNewTask = function() {
      console.log('new task');
      $scope.currentEntity.entity.create({ 
        subject: $scope.newTaskText,
        type: $scope.taskType, 
        isComplete: false, 
        plannedDate: moment(),
        assignedTo:$rootScope.activeUser.email,
        feed: [{
          "type":"created",
          "user":$rootScope.activeUser.email,
          "action": "created task",
          "date": moment()
        }]
      })
      .$promise.then(function() {
          $scope.newTaskText = '';
          $scope.taskType = 'Task';
          getTasks();

        });
        
      }

    $scope.viewTask = function(index, task) {
      $scope.selectedRow = index;
      $rootScope.$broadcast('openTaskPanel', {taskId : task.id});
    }


    $scope.completeTask = function(task) {
      $scope.updatedTask = task;
      $scope.updatedTask.isComplete = true;
      $scope.updatedTask.completedDate = moment();
       $scope.updatedTask.feed.push({
          "type":"complete",
          "user":$rootScope.activeUser.email,
          "action": "completed task",
          "date": moment()
        });

      $scope.currentEntity.entityModel.prototype$updateAttributes({ id: task.id }, $scope.updatedTask).$promise
      .then(function() {
        console.log('task completed');
        panels.close();
      });
    }

    $scope.updatePlanned = function(index, task, delay) {
      $scope.updatedTask = task;

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

        $scope.updatedTask.plannedDate = plannedDate;

        $scope.currentEntity.entityModel.prototype$updateAttributes({ id: task.id }, $scope.updatedTask).$promise
        .then(function() {
        console.log('task updated');
         $scope.tasks.splice(index,1)
       });
    }

  $scope.setSomeday = function(index, task) {
    $scope.updatedTask = task;
    $scope.updatedTask.plannedDate = null;
    $scope.currentEntity.entityModel.prototype$updateAttributes({ id: task.id }, $scope.updatedTask).$promise
    .then(function() {
        console.log('task updated');
         $scope.tasks.splice(index,1);
    });
  }

  $scope.setNow = function(task) {
   $scope.updatedTask = task;
    $scope.updatedTask.plannedDate = moment();
    $scope.currentEntity.entityModel.prototype$updateAttributes({ id: task.id }, $scope.updatedTask).$promise
    .then(function() {
        console.log('task updated');
         getTasks();
    });
}


$scope.pickDate = function(task, $event) {
    // $event.preventDefault();
    // $event.stopPropagation();

    $scope.datePicker = !$scope.datePicker;
    // $scope.tasks[index].datePicker = true;
    // $scope.datePicker = true;
    // $scope.status.isopen = !$scope.status.isopen;
}

$scope.onTimeSet = function() {
  
  $scope.status.isopen = !$scope.status.isopen;
  $scope.datePicker = false;
}


// //mentions and links to leads, teammates, etc
// //leads
//         $scope.searchCompanies = function(term) {

//             var leadList = [];

//              return $http.get('http://localhost:3000/api/leads?filter=%7B%22order%22:%22name+ASC%22,%22limit%22:null,%22skip%22:0,%22where%22:%7B%22and%22:%5B%7B%22name%22:%7B%22regexp%22:%22.*%22%7D%7D%5D,%22or%22:%5B%7B%22name%22:%7B%22regexp%22:%22.*%22%7D%7D%5D%7D%7D').then(function (response) {
//                 angular.forEach(response.data, function(item) {
//                     if (item.name.toUpperCase().indexOf(term.toUpperCase()) >= 0) {
//                         leadList.push(item);
//                     }
//                 });

//                 $scope.lookupCompaniess = leadList;
//                 return $q.when(leadList);
//             });
//         };

//         $scope.getCompanyText = function(item) {
//             //remove spaces
//              item.name = item.name.replace(/\s+/g, '_');
//              // remove apostrophes
//              item.name = item.name.replace("'","");
//              return '@' + (item.name);
//         };

// //contacts
//        $scope.searchContacts = function(term) {

//             var contactList = [];

//              return $http.get('http://localhost:3000/api/contacts').then(function (response) {
//                 angular.forEach(response.data, function(item) {
//                     if (item.first_name.toUpperCase().indexOf(term.toUpperCase()) >= 0) {
//                         contactList.push(item);
//                     }
//                 });

//                 $scope.lookupContacts = contactList;
//                 return $q.when(contactList);
//             });
//         };

//         $scope.getContactText = function(item) {
//             //remove spaces
//              item.name = item.first_name.replace(/\s+/g, '<span style="color:transparent">_</span>');
//              // remove apostrophes
//              item.name = item.first_name.replace("'","");
//              return "&" + (item.name)
//         };

})

.controller('LaterCtrl', function($scope, $rootScope, interloop, panels) {

  $scope.currentEntity = interloop.entities.Task; 
    $scope.todaysDate = moment();

        //after deleting - refresh tasks
    $scope.$on('refreshTasks', function(event) {
      $scope.selectedRow = null;  //set selected row to null
          getTasks();
    });

    var query = {
      filter: {
        order: 'plannedDate DESC', 
        where: {
          and: [{plannedDate: { gt : moment().endOf('day')}}, {isComplete: false} ] 
        }
      }
    }; 

    function getTasks() {
        $scope.currentEntity.entity.find(query).$promise
        .then(function(tasks) {

          angular.forEach(tasks, function (param) {
            if (param.plannedDate){
              param.plannedGroup = moment.utc(param.plannedDate).format('dddd') + ' - ' + moment.utc(param.plannedDate).format('LL');
            }
            else {
              param.plannedGroup = 'No Planned Date';
            }
          })

          $scope.laterTasks = tasks;
        });
    }

    getTasks();


    $scope.viewTask = function(task) {
      $rootScope.$broadcast('openTaskPanel', {taskId : task.id});
    }

    $scope.completeTask = function(task) {
      $scope.updatedTask = task;
      $scope.updatedTask.isDomplete = true;
      $scope.updatedTask.completedDate = moment();
         $scope.updatedTask.feed.push({
          "type":"complete",
          "user":$rootScope.activeUser.email,
          "action": "completed task",
          "date": moment()
        });

      $scope.currentEntity.entity.prototype$updateAttributes({ id: task.id }, $scope.updatedTask)
     .$promise.then(function() {
      console.log('task completed');
      panels.close();
     });
    }



    //actions

       $scope.updatePlanned = function(index, task, delay) {
      $scope.updatedTask = task;

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

        $scope.updatedTask.plannedDate = plannedDate;

        $scope.currentEntity.entity.prototype$updateAttributes({ id: task.id }, $scope.updatedTask)
       .$promise.then(function() {
        console.log('task updated');
         $scope.laterTasks.splice(index,1)
       });
    }

  $scope.setSomeday = function(task) {
    $scope.updatedTask = task;
    $scope.updatedTask.plannedDate = null;
    $scope.currentEntity.entity.prototype$updateAttributes({ id: task.id }, $scope.updatedTask)
       .$promise.then(function() {
        console.log('task updated');
         getTasks();
       });
  }

$scope.setNow = function(task) {
   $scope.updatedTask = task;
    $scope.updatedTask.plannedDate = moment();
    $scope.currentEntity.entity.prototype$updateAttributes({ id: task.id }, $scope.updatedTask)
       .$promise.then(function() {
        console.log('task updated');
         getTasks();
       });
}




})

.controller('SomedayCtrl', function($scope, $rootScope, interloop, panels) {

  $scope.currentEntity = interloop.entities.Task; 

      //after deleting - refresh tasks
    $scope.$on('refreshTasks', function(event) {
      $scope.selectedRow = null;  //set selected row to null
          getTasks();
    });


  $scope.todaysDate = moment();

   var query = {
      filter: {
        order: 'plannedDate DESC', 
        where: {
          and: [{plannedDate: null}, {isComplete: false} ] 
        }
      }
    }; 

    function getTasks() {
        $scope.currentEntity.entity.find(query).$promise
        .then(function(tasks) {
          $scope.somedayTasks = tasks;
        });
    }

    getTasks();


  $scope.createNewTask = function() {
    console.log('new task');
    $scope.currentEntity.entity.create({ subject: $scope.newTaskText, isComplete: false })
    .$promise.then(function() {
        $scope.newTaskText = '';
        getTasks();
      });
      
    }

     $scope.viewTask = function(task) {
      $rootScope.$broadcast('openTaskPanel', {taskId : task.id});
    }

    $scope.completeTask = function(task) {
      $scope.updatedTask = task;
      $scope.updatedTask.is_complete = true;
      $scope.updatedTask.completedDate = moment();
         $scope.updatedTask.feed.push({
          "type":"complete",
          "user":$rootScope.activeUser.email,
          "action": "completed task",
          "date": moment()
        });

      $scope.currentEntity.entity.prototype$updateAttributes({ id: task.id }, $scope.updatedTask)
     .$promise.then(function() {
      console.log('task completed');
      panels.close();
     });
    }


     $scope.updatePlanned = function(index, task, delay) {
      $scope.updatedTask = task;

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

        $scope.updatedTask.plannedDate = plannedDate;

        $scope.currentEntity.entity.prototype$updateAttributes({ id: task.id }, $scope.updatedTask)
       .$promise.then(function() {
        console.log('task updated');
         $scope.somedayTasks.splice(index,1)
       });
    }

  $scope.setSomeday = function(task) {
    $scope.updatedTask = task;
    $scope.updatedTask.plannedDate = null;
    Task.prototype$updateAttributes({ id: task.id }, $scope.updatedTask)
       .$promise.then(function() {
        console.log('task updated');
         getTasks();
       });
  }

$scope.setNow = function(task) {
   $scope.updatedTask = task;
    $scope.updatedTask.plannedDate = moment();
    $scope.currentEntity.entity.prototype$updateAttributes({ id: task.id }, $scope.updatedTask)
       .$promise.then(function() {
        console.log('task updated');
         getTasks();
       });
}


})

.controller('CompletedCtrl', function($scope, $rootScope,  interloop, panels) {

  $scope.currentEntity = interloop.entities.Task; 

  $scope.isComplete = true;
  $scope.canLoad = true;
  $scope.page = 0;

      //after deleting - refresh tasks
    $scope.$on('refreshTasks', function(event) {
      $scope.selectedRow = null;  //set selected row to null
          getTasks();
    });

    var query = {
      filter: {
        order: 'plannedDate DESC', 
        where: {isComplete: true}, 
        limit: 20  
      }
    }; 


    $scope.currentEntity.entity.count({where: { is_complete: true }}).$promise
    .then(function(value) {
      $scope.maxItems = value.count;
    });

    function getTasks() {
        $scope.currentEntity.entity.find(query).$promise
        .then(function(tasks) {
           angular.forEach(tasks, function (param) {
            if (param.completedDate){
              param.completedGroup = moment.utc(param.completedDate).format('LL')
            }
            else {
              param.completedGroup = 'No Completed Date';
            }
            
          });
          $scope.tasks = tasks;
        });
    }

    getTasks();


$scope.loadMore = function() {

  $scope.canLoad = false;
    $scope.page++;
    

    $scope.currentEntity.entity.find({ filter: 
              { order: 'completedDate DESC',
                where: { is_complete: true },
                limit: 20,
                skip: 20*$scope.page
            } 
            })
    .$promise
    .then(function(results) {

      //give them completed groups
       angular.forEach(results, function (param) {
            if (param.completedDate){
              param.completedGroup = moment.utc(param.completedDate).format('LL')
            }
            else {
              param.completedGroup = 'No Completed Date';
            }

           });

        //concat results
          $scope.tasks = $scope.tasks.concat(results);

          if($scope.tasks.length < $scope.maxItems) {
            $scope.canLoad = true; // Disable further calls if there are no more items
          }
          else {
            $scope.canLoad = false;
          }        
    });

  }



     $scope.notComplete = function(index, task) {
      $scope.updatedTask = task;
      $scope.updatedTask.isComplete = false;
      $scope.updatedTask.completedDate = null;

      $scope.currentEntity.entity.prototype$updateAttributes({ id: task.id }, $scope.updatedTask)
     .$promise.then(function() {
      // remove task from scope
      $scope.tasks.splice(index, 1);
      console.log('task not complete');
     });
    }

    $scope.viewTask = function(task) {
      $rootScope.$broadcast('openTaskPanel', {taskId : task.id});
    }



})