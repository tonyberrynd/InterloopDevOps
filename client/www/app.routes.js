// Interloop Routes

angular.module('interloop.routes', [])

//UI Router
.config(function($stateProvider, $urlRouterProvider) {

   $stateProvider

    .state('login', {
      url: "/login",
      templateUrl: "modules/login/login.html",
      controller: 'LoginCtrl',
      authenticate: false
    })

    .state('register', {
      url: "/register",
      templateUrl: "modules/login/register.html",
       controller: 'RegisterCtrl',
       authenticate: false
    })

    .state('register-success', {
      url: "/success",
      templateUrl: "modules/login/success.html",
       controller: 'RegisterCtrl',
       authenticate: false
    })

    .state('reset-password', {
      url: "/reset-password",
      templateUrl: "modules/login/reset-password.html",
       controller: 'ResetCtrl',
       authenticate: false
    })

    .state('new-password', {
      url: "/new-password",
      templateUrl: "modules/login/new-password.html",
       controller: 'NewPasswordCtrl',
       authenticate: false
    })

    .state('base', {
      url: "",
      templateUrl: "modules/_shared/layout/base.html",
      controller: 'LayoutCtrl',
      authenticate: true,
      abstract: true, 
      resolve: {
        OrgLoader: function(Org, interloop) {
          return Org.findOne().$promise  //Get Org info 
            .then(function(org){
              interloop.currentState.org = org;   
              return interloop.getAllViews() //Read all the views 
              .then(function(views){
                return interloop.config(org);  //Config Entities 
              }); 
          }); 
        }
      }    
    })

    .state('base.opportunities', {
      url: "/opportunities",
      templateUrl: "modules/opportunities/opportunities.html",
      controller: 'OpportunitiesCtrl',
      authenticate: true,
      params: {
        view: null
      },
      data: {
          pageTitle: 'Opportunities'
      }
    })

    .state('base.opportunity-details', {
      url: "/opportunities/:opportunityId",
      templateUrl: "modules/opportunities/opportunity-detail.html",
      controller: 'OpportunityDetailsCtrl',
      data: {
          pageTitle: 'Details'
      }
    })

    .state('base.companies', {
      url: "/companies",
      templateUrl: "modules/companies/companies.html",
      controller: 'CompaniesCtrl',
       data: {
          pageTitle: 'Companies'
        }, 
      params: {
        view: null
      }
    })

    .state('base.company-details', {
      url: "/companies/:companyId",
      templateUrl: "modules/companies/company-detail.html",
      controller: 'CompanyDetailsCtrl',
       data: {
          pageTitle: 'Details'
        }
    })

    .state('base.contacts', {
      url: "/contacts",
      templateUrl: "modules/contacts/contacts.html",
      controller: 'ContactsCtrl',
      params: {
        view: null
      },
       data: {
          pageTitle: 'Contacts'
        }
    })

    .state('base.contact-details', {
      url: "/contacts/:contactId",
      templateUrl: "modules/contacts/contact-details.html",
      controller: 'ContactDetailsCtrl',
       data: {
          pageTitle: 'Details'
        }
    })

    .state('base.tasks', {
      url: "/tasks",
      // abstract: true,
      templateUrl: "modules/tasks/tasks.html",
      redirectTo: 'base.tasks.now', //redirects sidebar nav to now tasks
      data: {
          pageTitle: 'Tasks'
        }
    })

    .state('base.tasks.now', {
      url: "/now",
      templateUrl: "modules/tasks/now.html",
      controller: 'NowCtrl',
    })

    .state('base.tasks.later', {
      url: "/later",
      templateUrl: "modules/tasks/later.html",
      controller: 'LaterCtrl',
    })

    .state('base.tasks.someday', {
      url: "/someday",
      templateUrl: "modules/tasks/someday.html",
      controller: 'SomedayCtrl',
    })

    .state('base.tasks.completed', {
      url: "/completed",
      templateUrl: "modules/tasks/completed.html",
      controller: 'CompletedCtrl',
    })

    // ~analytics
    .state('base.analytics', {
      url: "/analytics",

      templateUrl: "modules/analytics/analytics.html",
      redirectTo: 'base.analytics.forecast',
       data: {
          pageTitle: 'Analytics'
        }
    })

        // ~analytics
    .state('base.analytics.forecast', {
      url: "/forecast",
      authenticate: true,
      templateUrl: "modules/analytics/forecast.html",
      controller: 'AnalyticsCtrl',
       data: {
          pageTitle: 'Analytics'
        }
    })

    .state('base.analytics.performance', {
      url: "/performance",
      templateUrl: "modules/analytics/performance.html",
      controller: 'AnalyticsCtrl',
       data: {
          pageTitle: 'Analytics'
        }
    })

    .state('base.analytics.interactions', {
      url: "/interactions",
      templateUrl: "modules/analytics/interactions.html",
      controller: 'AnalyticsCtrl',
       data: {
          pageTitle: 'Analytics'
        }
    })

    .state('base.profile', {
      url: "/profile/:userId",
      templateUrl: "modules/profile/profile.html",
      controller: 'ProfileCtrl',
      data: {
          pageTitle: 'Profile'
      }
    })

    .state('base.search', {
      url: "/search",
      templateUrl: "modules/search/search.html",
      controller: 'SearchCtrl',
      params: { 
          searchQuery: '' 
      },
      data: {
          pageTitle: 'Search'
      }
    })


    //$urlRouterProvider.otherwise("/login");

    //user other state rather than urlRouter to avoide $digest issues
    .state("otherwise", {
      url: "*path",
      template: "",
      controller: [
          '$state',
        function($state) {
          $state.go('base.opportunities')
        }]
    })
    
})