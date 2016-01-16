module.exports = function(Company) {

  var _=require('lodash');

  Company.search = function(searchTxt, cb) {
   
    var mongodb   = Company.getDataSource().connector.collection('Company');

  mongodb.find({ $text: {$search: searchTxt}})
    .toArray(function(err,results){
      cb(null, {companies: results}); 
    }) 
  }; 

  Company.remoteMethod (
    'search',
    {
      http: {path: '/search', verb: 'get'}, 
      accepts: {arg: 'txt', type: 'string'}, 
      returns: { arg: 'response', type: 'object' }
    }
  ); 

};
