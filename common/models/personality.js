module.exports = function(Personality) {

  var watson = require('watson-developer-cloud'); 
  var cfenv = require("cfenv");

  var vcapLocal = {
     "services": {
        "personality_insights": [
           {
              "name": "personality-insights-box",
              "label": "personality_insights",
              "plan": "standard",
              "credentials": {
                 "url": "https://gateway.watsonplatform.net/personality-insights/api",
                 "username": "18cbba33-49f4-492f-9420-bd5cf3babc9c",
                 "password": "H5pujyPJZ9jb"
              }
           }
        ]
     }
  }; 

  var appEnvOpts = vcapLocal ? {vcap:vcapLocal} : {}
  var appEnv = cfenv.getAppEnv(appEnvOpts);
 

  //---Set up Watson Personality Insights-----------------------------------------
  var personalityInsightsCreds = getServiceCreds(appEnv, "personality-insights-box");
  personalityInsightsCreds.version = "v2";
  var personality_insights = watson.personality_insights(personalityInsightsCreds);

  Personality.getProfile = function(containerName, fileName, cb){
    var app = Personality.app; 
    var container = app.models.Container;
    var txtFile = ""; 
    var inStream = container.downloadStream(containerName, fileName,null, function(){}); 

    //container.download(containerName, fileName, txtFile, function(){}); 
  var res = {}; 
   
   
// this is the classic api
  inStream
  .on('error',
    function (err)  { 
      console.error('Error', err); 
      cb(err,null); 
  })
  .on('data',
    function (data)  { 
      console.log("data recevied"); 
      txtFile += data;
  })
  .on('end',
    function (){ 
      console.log('All done!'); 
      personality_insights.profile(
        {text: txtFile},
        function (err, result) {
          if (err) {
            cb(err, null); 
          }
          else {
            cb(null,result);
          }; 
      });    
  }); 
}; 

  Personality.remoteMethod (
    'getProfile', 
    {
      http: {path: '/getprofile', verb: 'get'}, 
      accepts: [{arg: 'container', type: 'string'}, {arg: 'fileName', type: 'string'}],
      returns: {arg: 'profile', type: 'object'}
    }
  ); 
};

// Retrieves service credentials for the input service
function getServiceCreds(appEnv, serviceName) {
  var serviceCreds = appEnv.getServiceCreds(serviceName)
  if (!serviceCreds) {
    console.log("service " + serviceName + " not bound to this application");
    return null;
  }
  return serviceCreds;
}
