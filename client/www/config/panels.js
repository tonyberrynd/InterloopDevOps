angular.module('interloop.config.panels', [])

//side panels
.config(['panelsProvider', function (panelsProvider) {

    panelsProvider
        .add({
            id: 'notificationsPanel',
            position: 'right',
            size: '300px',
            templateUrl: 'modules/_shared/panels/notificationsPanel.html',
            controller: 'NotificationPanelCtrl'
        })
        .add({
            id: 'mentionsPanel',
            position: 'right',
            size: '300px',
            templateUrl: 'modules/_shared/panels/mentionsPanel.html',
            controller: 'MentionsPanelCtrl'
        })

         .add({
            id: 'companyGlimpse',
            position: 'right',
            size: '368px',
            templateUrl: 'modules/companies/company-glimpse.html',
            controller: 'CompanyGlimpseCtrl'
        })

          .add({
            id: 'contactGlimpse',
            position: 'right',
            size: '368px',
            templateUrl: 'modules/contacts/contact-glimpse.html',
            controller: 'ContactGlimpseCtrl'
        })

        .add({
            id: 'opportunityGlimpse',
            position: 'right',
            size: '368px',
            templateUrl: 'modules/opportunities/opportunity-glimpse.html',
            controller: 'OpportunityGlimpseCtrl'
        })

          .add({
            id: 'taskPanel',
            position: 'right',
            size: '368px',
            templateUrl: 'modules/_shared/panels/taskPanel.html',
            controller: 'TaskPanelCtrl'
        })

         .add({
            id: 'refinePanel',
            position: 'right',
            size: '300px',
            templateUrl: 'modules/_shared/panels/refinePanel.html',
            controller: 'RefinePanelCtrl', 
            params:  { 
              currentEntity: null
            }
        })

        .add({
            id: 'columnsPanel',
            position: 'right',
            size: '300px',
            templateUrl: 'modules/_shared/panels/columnsPanel.html',
            controller: 'ColumnsPanelCtrl'
        })
}]);