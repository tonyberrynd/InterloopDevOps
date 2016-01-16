angular.module('interloop.layout.controllers', [])


//Layout Controller
//------------------------------------------------------------------
.controller('LayoutCtrl', function(
    $scope,
    $rootScope, 
    $state, 
    $uibModal, 
    $log,
    $location,
    $http,
    $history,
    $splashTeam,
    $splashViews,
    $localStorage,
    $window,
    hotkeys, 
    panels, 
    Notification,
    LoopBackAuth,
    PubSub, 
    Appuser, 
    Org, 
    interloop, 
    interloopConfig) 
{

//Initialize
//--------------------

$scope.scroll = 0;
$scope.data = {};
$scope.data.searchQuery = '';
$scope.currentState = interloop.currentState;  
$scope.data.viewLength = interloopConfig.viewLength; 

$rootScope.searchFocused = false;

//Get Account Managers - Socket IO
Appuser.find({ 
  filter: { where: { id: { neq:  $rootScope.activeUser.id } } }
}, function(appuserList,  httpHeader){
  //Success callback
  //Subscribe to Notifications methods here..
  //Suscribe Post
   PubSub.subscribe({
      collectionName: 'Appuser',
      method : 'POST'
     }, onAppuserCreate);
   
             
  for(var i=0; i<appuserList.length; i++){
    // Subscribe Update 
    PubSub.subscribe({
          collectionName: 'Appuser',
          method : 'PUT',
          modelId : appuserList[i].id,
      }, onAppuserUpdate); 

    //subscribe delete
    PubSub.subscribe({
          collectionName: 'Appuser',
          method : 'DELETE',
          modelId : appuserList[i].id,
      }, onAppuserDelete);    
    } 
  }, 
  //Error
  function(httpResp){
  console.log(httpResp);
})
//then
.$promise.then(function(results) {
    $scope.data.accountManagers = results;            
});  

//Create Callback
var onAppuserCreate = function(){
    //Logic for callback function on new Notifications
}

//Update Callback
var onAppuserUpdate = function(){
console.log('update');
//TODO - PUSH VIA SOCKET NOT ANOTHER HTTP CALL
  Appuser.find() 
  .$promise.then(function(results) {
    $scope.data.accountManagers = results;          
  }); 
}

//Delete Callback
var onAppuserDelete = function(){
    //Logic for callback function on delete Notifications
}


//Sidebar
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//Views
//-----------------
  // Select View
   $scope.selectView = function(entityType, view) {
    interloop.viewAction('Select', view, interloop.entities[entityType]); 
   }; 

   // Hide View
   $scope.hideView = function(view) {
      //change view setting to hide and save.  
      view.hidden = true; 
      interloop.updateView(view); 
   }; 

  // Refresh Views
   $scope.$on('refreshViews', function(event) {
      interloop.getAllViews();
  });

  //Show Active View
  $scope.isItemActive = function(item) {
    return $location.path().indexOf(item.url) > -1;
  };

  //Navigate to View
   $scope.goToView = function(view) {
      $window.location.href = '#'+ view;  
    }

//Team
//-----------------

  $scope.getInitials = function(name){
      if(name != null){
        name =  name.replace(/[^A-Z]/g, '').substring(0,2);
      }
      return name != null ? name : "@";  
  }

//Intercom
//----------------
$scope.showIntercom = function() {
  console.log('Open intercome');
  Intercom('showNewMessage')
}

//Application Settings
//---------------------

  // $scope.showCheatSheat = function() {
  //   hotkeys.toggleCheatSheet()
  // }


//Navbar
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


//toggle shrink

$scope.shrinkToggle = function() {

  //toggle shrink
  $rootScope.shrink = !$rootScope.shrink

  $localStorage.shrinkSidebar = $rootScope.shrink;

}

//Search
//---------------------------------

  $scope.viewSearchResults = function() {
    var queryParam = $scope.data.searchQuery;
    // $scope.data.searchQuery = '';
    $state.go('base.search', {'searchQuery': queryParam});
  }

  $scope.clearSearch = function() {
     $scope.data.searchQuery = '';
     document.getElementById("globalSearch").focus();
  }

//Notifications
//---------------------------------

  $scope.notifyBroadcast = function() {
    $rootScope.$broadcast('Notification:newNotification')
  }

   $scope.viewNotifications = function() {
      //open testmenu panel
        $rootScope.$broadcast('openNotifications')
        console.log('trying to open ontification');
   }

//User Preferences
//---------------------------------

  //logout
  $scope.logout = function() {

    //set active user to Away - TODO - TURN THIS INTO CONNECTION ARRAY NOT STRING
    $rootScope.activeUser.presence = 'away';

     Appuser.prototype$updateAttributes({ id: $rootScope.activeUser.id }, $rootScope.activeUser)
        .$promise.then(function() {
            console.log('Presence:Away');

              // clear loopback token
              LoopBackAuth.clearUser();
              LoopBackAuth.clearStorage();
              $rootScope.loggedIn = false;
              $rootScope.activeUser = null;

              delete $localStorage.counter;

              //make shure and log user out of interom
              Intercom('shutdown');

              $state.go('login');
     });
  }


//Interloop History
//---------------------------------


$scope.goBackHistory = function() {

  $rootScope.viewCounter = $rootScope.viewCounter - 1;
  $window.history.go(-1);
  // --$rootScope.myNav

}

$scope.goForwardHistory = function() {

  $window.history.go(1);

}


///Account Settings Modal

//New Opportunity
//---------------------------------

  $scope.showCheatSheat = function() {
    hotkeys.toggleCheatSheet()
  }

 $scope.accountSettings = function (openThisTab) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'modules/_shared/modals/accountSettings.html',
      controller: 'AccountSettingsCtrl',
      backdropClass: 'loop-backdrop',
      size: 'lg',
      resolve: {
        tabName: function () {
          return openThisTab;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

$scope.userSettings = function () {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'modules/_shared/modals/userSettings.html',
      controller: 'UserSettingsCtrl',
      backdropClass: 'loop-backdrop',
      size: 'lg'
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };



$scope.allViews = function () {
    $splashViews.open();
  };

$scope.allMembers = function () {
  $splashTeam.open();
  };


//NEW ENTITITIES~~~~~~~~~~~~~~~~~~
//---------------------------------

//NEED TO WORK ON ROOTSCOPE BROADCASTS AND PASSING ARGUMENTS 

// _ MAY NEED TO MOVE TO SEPERATE CONTROLLER

$scope.$on('openNewCompany', function(event) {
            $scope.newCompany();
    });

$scope.$on('openNewOpportunity', function(event) {
            $scope.newOpportunity();
    });

$scope.$on('openNewContact', function(event) {
            $scope.newContact();
    });

$scope.$on('openNewTask', function(event) {
            $scope.newTask();
    });



//New Opportunity
//---------------------------------

 $scope.newOpportunity = function () {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'modules/_shared/modals/newOpportunity.html',
      controller: 'newOpportunityCtrl',
      backdropClass: 'loop-backdrop',
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  //New Task
//---------------------------------

 $scope.newTask = function () {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'modules/_shared/modals/newTask.html',
      controller: 'newOpportunityCtrl',
      backdropClass: 'loop-backdrop'
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };


//New Company
//---------------------------------

 $scope.newCompany = function () {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'modules/_shared/modals/newCompany.html',
      controller: 'newCompanyCtrl',
      backdropClass: 'loop-backdrop'
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  //New Contact
//---------------------------------

 $scope.newContact = function () {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'modules/_shared/modals/newContact.html',
      controller: 'newContactCtrl',
      backdropClass: 'loop-backdrop'
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };



  //EASTER EGG//

  $scope.$on('motivateMe', function(event) {
            $scope.motivateMe();
    });

   $scope.motivateMe = function () {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'modules/_shared/modals/motivateMe.html',
      controller: 'motivateCtrl',
      backdropClass: 'loop-backdrop',
      resolve: {
        quote: function () {

        var mot_quotes = [
        "Life is 10% what happens to you and 90% how you react to it.",
        "Failure will never overtake me if my determination to succeed is strong enough.",
        "In order to succeed, we must first believe that we can.",
        "Arriving at one goal is the starting point to another.",
        "It does not matter how slowly you go as long as you do not stop.",
        "If you are not willing to risk the usual you will have to settle for the ordinary.",
        "If you do what you always did, you will get what you always got.",
        "I have not failed. I've just found 10,000 ways that won't work."
       ]

        return mot_quotes[Math.floor(Math.random()*mot_quotes.length)];
        }
      }
    });
  }

  

})





//AccountSettings Ctrl
//------------------------------------------------------------------
.controller('AccountSettingsCtrl', function(tabName, $scope, $uibModalInstance) {

  $scope.view_tab = tabName || 'profile';
  //change tabs
  $scope.changeTab = function(tab) {
    $scope.view_tab = tab;
  }

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
})


//AccountSettings Ctrl
//------------------------------------------------------------------
.controller('UserSettingsCtrl', function($scope, $uibModalInstance) {

  $scope.view_tab = 'profile';
  //change tabs
  $scope.changeTab = function(tab) {
    $scope.view_tab = tab;
  }

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
})



//New Opportunity Controller
//------------------------------------------------------------------
.controller('newOpportunityCtrl', function($scope, $uibModalInstance, $timeout, $http) {



    $scope.companyTags = [];


    $scope.loadCompanies = function($query) {
        return $http.get('http://localhost:3000/api/companies?filter[limit]=100', { cache: true}).then(function(response) {
          var companies = response.data;
          console.log(companies)
          return companies.filter(function(company) {
            company.autoComplete = true;
            console.log(company);
            return company.name.toLowerCase().indexOf($query.toLowerCase()) != -1;
          });
        });
      };


         $scope.contactTags = [];


    $scope.loadContacts = function($query) {
        return $http.get('http://localhost:3000/api/contacts?filter[limit]=100', { cache: true}).then(function(response) {
          var contacts = response.data;
          console.log(contacts)
          return contacts.filter(function(contact) {
            contact.autoComplete = true;
            return contact.fullName.toLowerCase().indexOf($query.toLowerCase()) != -1;
          });
        });
      };

      //placeholders

  $scope.$watch('companyTags.length', function(value) {
    $scope.companyPlaceholder = value > 0 ? '' : 'Add a Company';
  });

  $scope.$watch('contactTags.length', function(value) {
    $scope.contactPlaceholder = value > 0 ? '' : 'Add Stakeholders';
  });

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
})




//New Company Controller
//------------------------------------------------------------------
.controller('newCompanyCtrl', function($scope, $http, $state, $uibModalInstance) {

  $scope.getCompanies = function(val) {
    return $http.get('http://localhost:3000/api/companies', { 
      params: {
            'filter[where][name][regexp]=/': val + '\/i',
            'filter[limit]': 10 //limite to X results
          },
      cache: true}
      ).then(function(response){
          return response.data.map(function(item){
        return item.name;
      });
    });
  };

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
})





//New Contact Controller
//------------------------------------------------------------------
.controller('newContactCtrl', function($scope, $http, $state, $uibModalInstance) {

  $scope.getContacts = function(val) {
    return $http.get('http://localhost:3000/api/contacts', { 
      params: {
            'filter[include]=': 'company',
            'filter[where][fullName][regexp]=/': val + '\/i',
            'filter[limit]': 100 //limite to X results
          },
      cache: true}
      ).then(function(response){
          return response.data.map(function(item){
        return item.fullName + ' - ' + item.company.name;
      });
    });
  };

  $scope.companyTags = [];


  $scope.loadCompanies = function($query) {
        return $http.get('http://localhost:3000/api/companies', { cache: true}).then(function(response) {
          var companies = response.data;
          console.log(companies)
          return companies.filter(function(company) {
            company.autoComplete = true;
            console.log(company);
            return company.name.toLowerCase().indexOf($query.toLowerCase()) != -1;
          });
        });
      };

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
})



//New Opportunity Controller
//------------------------------------------------------------------
.controller('newTaskCtrl', function($scope, $uibModalInstance) {

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
})

//all views controller
.controller('AllViewsCtrl', function($scope, $uibModalInstance) {



})

//all views controller
.controller('AllMembersCtrl', function($scope, $uibModalInstance) {



})

//motivate control
.controller('motivateCtrl', function(quote, $scope, $uibModalInstance) {

  $scope.thisQuote = quote;

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});