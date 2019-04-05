angular.module("revealApp.service.serverInfo", [])
  .factory('serverInfo', ['$http', function ($http) {
    // var server = 'http://192.168.2.2:3000/';
    var server = 'http://54.225.119.84/'; // IP
    var serverTest = function(cb){
      $http.post(server+'api/serverTest').success(function(){
        server = server;
        cb();
      }).error(function(){
        server = serveraws;
        cb();
      });
    };
    return {
      setServer: function(arg){
        server = arg;
      },
      getServer: function(){
        return server;
      }
    };
  }]);