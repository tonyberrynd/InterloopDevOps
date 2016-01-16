module.exports = function(Opportunity) {
  var _=require('lodash');


  Opportunity.on('dataSourceAttached', function(obj){
    var count = Opportunity.stats;
    Opportunity.count = function(filter, cb) {
      filter = filter!= null ? JSON.stringify(filter) : '{}'; 
      filter = filter.replace(RegExp('("and":)','g'), '"$and":'); 
      filter = filter.replace(RegExp('("or":)','g'), '"$or":'); 
     
      filter = JSON.parse(filter); 

      var mongodb   = Opportunity.getDataSource().connector.collection('Opportunity');
    
      mongodb.aggregate([
        { $match: filter},
        { $group: { 
          "_id" : "thisGroup", 
          "total" : {"$sum" : "$value"},
          "count" : {"$sum" : 1}
        }},
        {$project: {"_id": 0, "total": 1, "totalWgt":1, "count": 1}}
        ])
        .toArray(function(err, results){
          cb (null, results[0]); 
      }); 
    };
  });

  //{ $ifNull: [ <expression>, <replacement-expression-if-null> ] }


  Opportunity.search = function(searchTxt, cb) {
   
    var mongodb   = Opportunity.getDataSource().connector.collection('Opportunity');

    mongodb.find({ $text: {$search: searchTxt}})
    .toArray(function(err,results){
      cb(null, {opportunities: results}); 
    }) 
  }; 

  Opportunity.remoteMethod (
    'search',
    {
      http: {path: '/search', verb: 'get'}, 
      accepts: {arg: 'txt', type: 'string'}, 
      returns: { arg: 'response', type: 'object' }
    }
  ); 
};
