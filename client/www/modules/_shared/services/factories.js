angular.module('interloop.factories', [])



.factory('NotificationMonitor', function($rootScope, $state, webNotification){

  return {
    startWatching: function(){

          $rootScope.$on('Notification:newNotification', function(event){
  
            if ($rootScope.showNotifications) {
              showWebNotification( 'Opportunity Won!', 'Jordan just won opportunity: Awesom...', 'http://localhost:8100/#/opportunities');
            }
              console.log('newNotification!!');

           })
        }
    }


function showWebNotification(title, body, link) {

  webNotification.showNotification(
                title, {
                body: body,
                icon: 'my-icon.ico',
                onClick: function onNotificationClicked() {
                    console.log('Notification clicked.');
                    $state.go('base.opportunities');
                },
                autoClose: 4000 //auto close the notification after 2 seconds (you can manually close it via hide function)
                }, function onShow(error, hide) {
                if (error) {
                    window.alert('Unable to show notification: ' + error.message);
                } else {
                    console.log('Notification Shown.');

                    setTimeout(function hideNotification() {
                        console.log('Hiding notification....');
                        hide(); //manually close the notification (you can skip this if you use the autoClose option)
                    }, 8000);
                }
            });

    }
  

})

.factory('ConnectivityMonitor', function($rootScope){
 
  return {
    startWatching: function(){
          window.addEventListener("online", function(e) {
            console.log("went online");

          }, false);    
          window.addEventListener("offline", function(e) {
            console.log("went offline");

          }, false);  
        }       
  }
})