'use strict';
angular.module('LoopbackSocketIntegration', [])
 
//Here LoopBackAuth service must be provided as argument for authenticating the user
.factory('socket', function(LoopBackAuth){
    //Creating connection with server
    var socket = io.connect('http://localhost:3000');
 
    // This part is only for login users for authenticated socket connection between client and server.
    // If you are not using login page in you website then you should remove rest piece of code..
    // var id = LoopBackAuth.accessTokenId;
    // console.log(id);
    // var userId = LoopBackAuth.currentUserId;
    // console.log(userId);
    // socket.on('connect', function(){
    //     socket.emit('authentication', {id: id, userId: userId });
    //     socket.on('authenticated', function() {
    //         // use the socket as usual
    //         console.log('User is authenticated');
    //     });
    // });
  return socket;

})


  .factory('PubSub', function (socket) {
    var container =  [];
    return {
        subscribe: function(options, callback){
            if(options){
                var collectionName = options.collectionName;
                var modelId = options.modelId;
                var method = options.method;
                if(method === 'POST'){
                    var name = '/' + collectionName + '/' + method;
                    socket.on(name, callback);
                }
                else{
                    var name = '/' + collectionName + '/' + modelId + '/' + method;
                    socket.on(name, callback);
                }
                //Push the container..
                this.pushContainer(name);
            }else{
                throw 'Error: Option must be an object';
            }
        }, //end subscribe
 
        pushContainer : function(subscriptionName){
            container.push(subscriptionName);
        },
 
        //Unsubscribe all containers..
        unSubscribeAll: function(){
            for(var i=0; i<container.length; i++){
                socket.removeAllListeners(container[i]);   
            }
            //Now reset the container..
            container = [];
        }
 
    };
     
});