angular.module('revealApp.controller.menu', [])
  .controller('MenuCtrl', ['$scope', '$http', '$location', 'userData', 'spinner', 'serverInfo', '$ionicSideMenuDelegate', '$ionicLoading', function ($scope, $http, $location, userData, spinner,serverInfo,$ionicSideMenuDelegate,$ionicLoading) {
    // Can delete this file
    $scope.toggleLeft = function() {
      $ionicSideMenuDelegate.toggleLeft();
    };
    $scope.clickMenuLink = function(path){
      $ionicSideMenuDelegate.toggleLeft();
      if ($location.path() !== '/menu/'+path){
        $ionicLoading.show({
          templateUrl: "views/loading.html"
        });      
        $location.path('/menu/'+path);
      }
    }
    $scope.logout = function(){
      FB.logout(function(data){
        $scope.user = undefined;
        $scope.frienData = undefined;
        $location.path('/login');
        $ionicSideMenuDelegate.toggleLeft();
      });
    };
}]);

