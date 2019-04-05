angular.module("revealApp.service.friendData", [])
  .factory('friendData', [ function () {
    var user;
    return {
      setFriend: function(arg){
        user = arg;
      },
      getFriend: function(){
        return user;
      }
    };
  }]);