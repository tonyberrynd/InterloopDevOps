module.exports = function(Analytics) {

  //Mongo Aggregate Query that provides a summary of Opps by each Account Manager 
  Analytics.accountMgr = function(cb) {

    var mongodb   = Analytics.getDataSource().connector.collection('Opportunity');

    mongodb.aggregate([
      { $match: { }},  //Stage 1 
      { $group: { _id: "$accountManager.value", 
        oppTotal: {$sum: "$value"}, 
        mobileTotal : {$sum : "$customFields.EstMobile"}, 
        mediaTotal : {$sum :  "$customFields.EstMedia"}, 
        mailTotal : {$sum :  "$customFields.EstMail"}, 
        otherTotal : {$sum :  "$customFields.EstOther"},
        oppCount: {$sum: 1}, 
        mobileCount: {$sum: {$cond: [{$gt: ["$customFields.EstMobile", 0]}, 1, 0]}},
        mediaCount: {$sum: {$cond: [{$gt: ["$customFields.EstMedia", 0]}, 1, 0]}},
        mailCount: {$sum: {$cond: [{$gt: ["$customFields.EstMail", 0]}, 1, 0]}},
        otherCount: {$sum: {$cond: [{$gt: ["$customFields.EstOther", 0]}, 1, 0]}}
      }}, // Stage 2
      { $sort: { "oppTotal": 1, "_id": 1}},// Stage 3
      { $project: { "doc": {"_id": {"$ifNull": ["$_id", "No Acct Mgr"]}, 
        "oppTotal" : "$oppTotal" , 
        "mobileTotal" : "$mobileTotal",
        "mediaTotal" : "$mediaTotal",
        "mailTotal" : "$mailTotal",
        "otherTotal" : "$otherTotal", 
        "oppCount" : "$oppCount" , 
        "mobileCount" : "$mobileCount",
        "mediaCount" : "$mediaCount",
        "mailCount" : "$mailCount",
        "otherCount" : "$otherCount"
      }}}, // Stage 4
      { $group: { "_id": null, 
        "maxTotal": {$max: "$doc.oppTotal"}, 
        "maxCount": {$max: "$doc.oppCount"}, 
        "oppTotal" : {$sum: "$doc.oppTotal"} , 
        "mobileTotal" : {$sum: "$doc.mobileTotal"},
        "mediaTotal" : {$sum: "$doc.mediaTotal"},
        "mailTotal" : {$sum: "$doc.mailTotal"},
        "otherTotal" : {$sum: "$doc.otherTotal"}, 
        "oppCount" : {$sum: "$doc.oppCount"} , 
        "mobileCount" : {$sum: "doc.$mobileCount"},
        "mediaCount" : {$sum: "$doc.mediaCount"},
        "mailCount" : {$sum: "$doc.mailCount"},
        "otherCount" : {$sum: "$doc.otherCount"},   
        "results" : {$push: "$doc"}}}, // Stage 
      { $project: {
        "results": 1, "_id": 0, 
        "maxTotal" : 1,
        "maxCount": 1, 
        "oppTotal" : 1, 
        "mobileTotal" : 1,
        "mediaTotal" : 1,
        "mailTotal" : 1,
        "otherTotal" : 1, 
        "oppCount" : 1 , 
        "mobileCount" : 1,
        "mediaCount" : 1,
        "mailCount" : 1,
        "otherCount" : 1   
        }} // Stage 6  
    ], 
    function(err,results){
      cb(null, results[0]);
    })
  }; 

  Analytics.remoteMethod (
    'accountMgr',
    {
      http: {path: '/accountMgr', verb: 'get'}, 
      //accepts: {arg: 'txt', type: 'string'}, 
      returns: { root: true, type: 'object'}
    }
  ); 

  Analytics.monthly = function(filter, cb) {
    var mongodb   = Analytics.getDataSource().connector.collection('Opportunity');

    filter = filter || '{}'; 
    filter = filter.replace(RegExp('("and":)','g'), '"$and":'); 
    filter = filter.replace(RegExp('("or":)','g'), '"$or":'); 
    filter = filter.replace(RegExp('(\\[\\])', 'g'), '[{}]');  //handle issue of Mongo not liking empty arrays needs [{}] not []
    filter = JSON.parse(filter); 
    
    filter.value = {"$gt": 0 }; 
   
    mongodb.aggregate([
      { $match: filter},
      { $group: { 
          "_id" : {"$month" : "$estimatedClose"}, 
          "oppTotal" : {"$sum" :  {$divide : ["$value",1000]} }, 
          "mobileTotal" : {"$sum" : {$divide : ["$customFields.EstMobile", 1000]}}, 
          "mediaTotal" : { "$sum" : {$divide : ["$customFields.EstMedia", 1000]} }, 
          "mailTotal" : { "$sum" : {$divide : ["$customFields.EstMail", 1000]} }, 
          "otherTotal" : { "$sum" : {$divide : ["$customFields.EstOther", 1000]}}
      }},
      { $sort: { "_id" : 1 }} , 
      { $project: { "doc": {"_id": {"$ifNull": ["$_id", 0]}, 
        "oppTotal" : "$oppTotal" , 
        "mobileTotal" : "$mobileTotal",
        "mediaTotal" : "$mediaTotal",
        "mailTotal" : "$mailTotal",
        "otherTotal" : "$otherTotal"
      }}}, // Stage 4
      { $group: { "_id": null, "max": {$max: "$doc.oppTotal"}, "results" : {$push: "$doc"}}}, // Stage 
      { $project: { "results": 1, "_id": 0, "max" : 1}} // Stage 6  
      ], 
      function(err,results){
        cb(null, results[0]);
      })
    }; 

    Analytics.remoteMethod (
      'monthly',
      {
        http: {path: '/monthly', verb: 'get'}, 
        accepts: {arg: 'where', type: 'string'}, 
        returns: { root: true,  type: 'object'}
      }
    ); 

    Analytics.oppStats = function(filter, cb) {
      var mongodb   = Analytics.getDataSource().connector.collection('Opportunity');
      
      filter = filter || '{}'; 
      filter = filter.replace(RegExp('("and":)','g'), '"$and":'); 
      filter = filter.replace(RegExp('("or":)','g'), '"$or":'); 
      filter = filter.replace(RegExp('(\\[\\])', 'g'), '[{}]'); 

      filter = JSON.parse(filter); 

      
      mongodb.aggregate([
        { $match: filter},
        { $group: { "_id" : "$stage.value", "order": {"$max" : "$stage.order"}, "total" : {"$sum" : "$value"}, "count" : {"$sum" : 1}}},
        { $sort: {"order" : 1}}, 
        { $project: {"doc" : {"stage" : "$_id" , "order" : "$order", "total": "$total", "count": "$count"}}},
        { $group: {"_id": "All","total": {"$sum": "$doc.total"},"count": {"$sum": "$doc.count"},"results": {"$push" : "$doc"}}},
        { $project: {"_id": 0, "results": 1, "total": 1, "count": 1}} // Stage 6  
        ], 
        function(err,results){
          cb(null, results[0]);
        })
    }; 

    Analytics.remoteMethod (
      'oppStats',
      {
        http: {path: '/oppStats', verb: 'get'}, 
        accepts: {arg: 'where', type: 'string'}, 
        returns: { root: true,  type: 'object'}
      }
    ); 

    Analytics.query = function(collection, query, cb) {
      var mongodb   = Analytics.getDataSource().connector.collection(collection);
      
      //query = JSON.parse(query); 

      mongodb.aggregate(query, 
        function(err,results){
          cb(null, results);
        })
      }; 

    Analytics.remoteMethod (
      'query',
      {
        http: {path: '/query', verb: 'get'}, 
        accepts: [
          {arg: 'collection',  type: 'string', http: { source: 'query' }},
          {arg: 'query',  type: 'object', http: { source: 'body' }} 
        ], 
        returns: { arg: 'results',  type: 'object'},
        http: {verb: 'post'}
      }
    ); 
};
