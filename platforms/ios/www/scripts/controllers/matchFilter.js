angular.module('revealApp.controller.matchFilter', [])
  .controller('MatchFilterCtrl', ['$scope', '$http', '$location', '$ionicLoading', 'userData', 'serverInfo', '$timeout', 'services', function ($scope, $http, $location, $ionicLoading,userData,serverInfo,$timeout,services) {
    $scope.user = userData.getUser();
    mixpanel.track('MatchFilter');
    $scope.newFriend = {email: '', fid: ''};
    $scope.logoIcon = "<img src='img/intro3_white_cropped.png' class='title centerItem headerLogo'>";
    services.checkServer(function(){}, function(){
      $scope.user = null;
      $scope.friendData = null;
      $location.path('/login');
    }, $scope.user.fid);
    var server = serverInfo.getServer();
    $ionicLoading.hide();
    $scope.save = function(property){
    	$http.post(server+'api/saveFilters', {fid: $scope.user.fid, filters: $scope.user.filters}).success(function(){
    	});
    };
    $scope.back = function(){
      $location.path('/tab/editProfile');
    }
    services.checkin('matchFilter');
    $scope.addFriend = function(type){
      var input;
      var alertCallback = function(){};
      if (type==='email') input = $scope.newFriend.email.toLowerCase();
      if (type==='fid') input = $scope.newFriend.fid;
      $http.post(server+'api/friendRequest', {fid: $scope.user.fid, name: $scope.user.name, type: type, input: input}).success(function(data){
        var targetFid = data;
        $scope.newFriend.email = '';
        $scope.newFriend.fid = '';  
        if (data === 'no user'){
          navigator.notification.alert(
            "No user found with that info, please try again",  // message
            alertCallback,                  // callback to invoke
            'Oops!',            // title
            'Ok'             // buttonLabels
          );
        } else if (data === 'already friends'){
          navigator.notification.alert(
            "",  // message
            alertCallback,                  // callback to invoke
            'You\'re already friends!',            // title
            'Ok'             // buttonLabels
          );
        } else {
          $http.post(server+'api/pushNotification',{fid: targetFid, tagType: 'unreadTags', message: 'You have a new friend request!'}, function(){
          });
          navigator.notification.alert(
            "Friend request sent",  // message
            alertCallback,                  // callback to invoke
            'Success!',            // title
            'Ok'             // buttonLabels
          );
        }
          
      });
    };


  }]);
