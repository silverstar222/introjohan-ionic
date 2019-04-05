angular.module('revealApp.controller.matchlist', [])
  .controller('MatchlistCtrl', ['$scope', '$http', '$location', '$ionicLoading', 'spinner', 'userData', 'matchData', 'serverInfo', 'services', function ($scope, $http, $location, $ionicLoading,spinner,userData,matchData,serverInfo,services) {
    var server = serverInfo.getServer();
    $scope.user = userData.getUser();
    mixpanel.track('Matchlist');
    $scope.introLogo = "<img src='img/intro3_white_cropped.png' class='title centerItem headerLogo'>";
    services.checkServer(function(){}, function(){
      $scope.user = null;
      $scope.friendData = null;
      $location.path('/login');
    }, $scope.user.fid);
    $scope.allAges = false;
    var serverTest = function(input){
      $http.post(server+'api/serverTest', {input: input}).success(function(){
        spinner.hide();
      });
    };
    $http.post(server+'api/resetBadge', {fid: $scope.user.fid, tagType: 'unseenMatches'}).success(function(){
    });

    var emptyCallback = function(){
    };
    $http.post(server+'api/fetchMutualMatches', {fid: $scope.user.fid}).success(function(data){
      var nameKey = {};
      for (var i = 0; i < data.nameKey.length; i++){
        nameKey[data.nameKey[i].fid] = data.nameKey[i].name;
      }
      for (var i = 0; i < data.matches.length; i++){
        data.matches[i].name = nameKey[data.matches[i].fid];
      }
      $scope.allUsers = data.matches;
      $ionicLoading.hide();
      
      if (data.matches.length<1){
        navigator.notification.alert(
          '',
          emptyCallback,                  // callback to invoke
          'No messages yet, intro some friends or try out more matches!',            // title
          'Ok!'             // buttonLabels
        );
        $location.path('/tab/feed');
        $scope.$apply();
      }
    });
    $scope.selectMatch = function(index){
      $ionicLoading.show({
        templateUrl: "views/loading.html"
      });
    	$scope.match = $scope.allUsers[index];
    	matchData.setUser($scope.match);
    	$location.path('/tab/chat');
    };
    services.checkin('matchlist');
    
}]);

