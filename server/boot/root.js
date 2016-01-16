// module.exports = function(server) {
//   // Install a `/` route that returns server status
//   var router = server.loopback.Router();
//   router.get('/', server.loopback.status());
//   server.use(router);
// };

exports.clearBaseACLs = function (ModelType, ModelConfig) {
  ModelType.settings.acls.length = 0;
  ModelConfig.acls.forEach(function (r) {
    ModelType.settings.acls.push(r);
  });
};
