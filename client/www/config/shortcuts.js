angular.module('interloop.config.shortcuts', [])


.run(function($rootScope, hotkeys) {
//remove default ? shortcut
hotkeys.del('?');



//Create a new task
hotkeys.add({
    combo: 'mod+shift+g',
    description: 'Create New company',
    callback: function(event) {
     event.preventDefault();
      $rootScope.$broadcast('openNewCompany');
    }
  });
//end hotkeys //

//Create a new task
hotkeys.add({
    combo: 'mod+shift+k',
    description: 'Create New Task',
    callback: function(event) {
      event.preventDefault();
      $rootScope.$broadcast('openNewTask');
    }
  });
//end hotkeys //

//Create a new task
hotkeys.add({
    combo: 'mod+shift+c',
    description: 'Create New Contact',
    callback: function(event) {
      event.preventDefault();
      $rootScope.$broadcast('openNewContact');
    }
  });
//end hotkeys //

//Create a new Lead
hotkeys.add({
    combo: 'mod+shift+o',
    description: 'Create New Opportunity',
    callback: function(event) {
    	event.preventDefault();
      $rootScope.$broadcast('openNewOpportunity');
    }
  });
//end hotkeys //

//Create a new Lead
hotkeys.add({
    combo: 'mod+shift+s',
    description: 'Quick Search',
    callback: function() {
      document.getElementById("globalSearch").focus();
    }
  });

//Create a new Lead
hotkeys.add({
    combo: 'v+v',
    description: 'Search All Views',
    callback: function(event) {
    	event.preventDefault();
      $splashViews.open();
    }
  });

hotkeys.add({
    combo: 'm+m',
    description: 'Search All Team Members',
    callback: function(event) {
    	event.preventDefault();
      $splashTeam.open();
    }
  });

//command + a - Test Command
hotkeys.add({
    combo: 'mod+shift+9',
    description: 'Motivate Me',
    callback: function() {
    $rootScope.$broadcast('motivateMe');
    }
  });
//end hotkeys //


});
//end hotkeys //  
