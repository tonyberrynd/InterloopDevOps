//Interloop Desktop

angular.module('interloop', [

	  //Lib Files
  	//---------------//
	   'ui.router',                       //UI Router
     'ngAnimate',                       //angular animate 
     'ui.bootstrap',                    //ui-boostrap - https://angular-ui.github.io/bootstrap/
     'ui.bootstrap.datetimepicker',     //ui bootstrap date picker - https://github.com/dalelotts/angular-bootstrap-datetimepicker
     'popoverToggle',                   //popover toggle - https://github.com/Elijen/angular-popover-toggle
     'ngStorage',                       //ngStorage - https://github.com/gsklee/ngStorage
     'agGrid',                          //angular grid - http://www.ag-grid.com/
     'angular.panels',                  //Angular Panels - http://eu81273.github.io/angular.panels/
     'angularMoment',                   //Angular moment directive - https://github.com/urish/angular-moment
     'cfp.hotkeys',                     //quick actions - https://github.com/chieffancypants/angular-hotkeys/
     'angular.filter',                  //useful angular filters - https://github.com/a8m/angular-filter
     // 'ngQuill',                      //ngQuill Text Editor - https://github.com/KillerCodeMonkey/ngQuill
     'ngTagsInput',                     //ng-tags - http://mbenford.github.io/ngTagsInput/gettingstarted
     'checklist-model',                 //checklist model - https://github.com/vitalets/checklist-model
     'angularFileUpload',               //angular file upload - https://github.com/nervgh/angular-file-upload
     'vAccordion',                      //v accordion for filter panel - https://github.com/LukaszWatroba/v-accordion
     'ksSwiper',                        //https://github.com/ksachdeva/angular-swiper
     'ui.gravatar',                     //gravatar
     'ui.splash',                       //sexy splash modal - https://github.com/popdevelop/angular-splash-demo
     'angular-web-notification',        //Web Notifictions
     'zingchart-angularjs',             //Zingcharts - angular module - https://github.com/zingchart/ZingChart-AngularJS
     'ui.select',

    


      //Strongloop api Services
      //---------------//
     'lbServices',
     'LoopbackSocketIntegration',
    
    	//Interloop Core
    	//---------------//
      'interloop.services',

      //Interloop App SetUp
    	'interloop.config',
      'interloop.config.panels', 
    	'interloop.routes',
      'interloop.factories',
      'interloop.directives',
      'interloop.filters',
      'interloop.history',

      //Interloop App Modules
      //---------------//
      'interloop.layout.controllers',
      'interloop.panel.controllers',
      'interloop.login.controllers',
      'interloop.opportunities.controllers',
      'interloop.contacts.controllers',
      'interloop.companies.controllers',
      'interloop.tasks.controllers',
      'interloop.analytics.controllers',
      'interloop.profile.controllers',
      'interloop.search.controllers',
      'interloop.splash.controllers'

    ]);



