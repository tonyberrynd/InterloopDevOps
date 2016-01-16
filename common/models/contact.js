module.exports = function(Contact) {

  var _=require('lodash');

  Contact.search = function(searchTxt, cb) {
   
  var mongodb   = Contact.getDataSource().connector.collection('Contact');

  mongodb.find({ $text: {$search: searchTxt}})
    .toArray(function(err,results){
      cb(null, {contacts: results}); 
    }) 
  }; 

  Contact.remoteMethod (
    'search',
    {
      http: {path: '/search', verb: 'get'}, 
      accepts: {arg: 'txt', type: 'string'}, 
      returns: { arg: 'response', type: 'object' }
    }
  ); 

};
