angular.module("revealApp.service.matchData", [])
  .factory('matchData', [ function () {
    var user;
    return {
      setUser: function(arg){
        user = arg;
      },
      getUser: function(){
        return user;
      }
    };
  }]);