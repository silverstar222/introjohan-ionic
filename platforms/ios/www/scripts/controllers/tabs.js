angular.module('revealApp.controller.menu', [])
  .controller('TabsCtrl', ['$scope', '$window', '$http', '$location', 'userData', 'services', 'serverInfo', '$ionicSideMenuDelegate', '$ionicLoading', 'State', 'matchData', function ($scope, $window, $http, $location, userData, services,serverInfo,$ionicSideMenuDelegate,$ionicLoading,State,matchData) {
    var server = serverInfo.getServer();
    $scope.user = userData.getUser();

    var resetBadge = function(tagType){
      $http.post(server+'api/resetBadge', {fid: $scope.user.fid, tagType: tagType}).success(function(){
      });
    };
    $scope.feed = function(){
      $location.path('/tab/feed');
    }
    
    var onResume = function() {
      console.log('RESUMED');
      $http.post(server+'api/fetchUser', {fid: $scope.user.fid}).success(function(data){
        if (data === 'err'){
          $location.path('/login');
        } else {
          $scope.user = data;
          setInAppBadges();
          if ($location.path() === '/tab/editProfile'){
            console.log('resumed edit profile');
            resetBadge('unreadTags');
          }
          if ($location.path() === '/tab/matchlist'){
            console.log('resumed matchlist');
            resetBadge('unseenMatches');
          }
          if ($location.path() === '/tab/chat'){
            var match = matchData.getUser();
            console.log('resumed chat');
            $http.post(server+'api/resetChatBadge', {userFid: $scope.user.fid, matchFid: match.fid}).success(function(data){
            });
          }
          // var callbackToLogin = function(){
          //   $location.path('/login');
          //   $scope.$apply();
          // };
          // var geoLocationError = function(){
          //   navigator.notification.alert(
          //   'Your location is needed to help find matches for you. Please change this under Settings-> Privacy-> Location Services, and then log in again. We will never reveal your exact location to any party. You will now be logged out.',
          //   callbackToLogin,
          //   'Sorry!',
          //   'Ok!');
          // };
          var cb = function(){
            // if ($scope.user.latlon !== [position.coords.longitude, position.coords.latitude]){
              // $scope.user.latlon = [position.coords.longitude, position.coords.latitude];
              // $http.post(server+'api/updateProfile', {property: 'latlon', value: $scope.user.latlon}).success;
              // window.localStorage.setItem('user', JSON.stringify($scope.user));
              // userData.setUser($scope.user);
              console.log('userData set');
              services.checkKill(function(){});
              mixpanel.track('Resumed');
            // }
          };
          services.deviceGeoService($scope.user, cb);
          // navigator.geolocation.getCurrentPosition(geoSuccess, geoLocationError);
          
        }
      });
    };

    document.addEventListener("resume", onResume, false);

    var setInAppBadges = function(){
      $scope.badges = userData.data;
      userData.data.unreadMessages = $scope.user.unreadMessages || 0;
      userData.data.unreadTags = $scope.user.unreadTags || 0;
      userData.data.unseenMatches = $scope.user.unseenMatches || 0;
      userData.data.matches = $scope.user.matches || {}; 
    };
    setInAppBadges();
    var pushNotification = window.plugins.pushNotification;
    if (!$scope.user.testState){
      registerDevice();
    }

    function registerDevice(){
      var alertCallback = function(){};
      // navigator.notification.alert(
      //   'To get notifications when someone messages you or wants to meet, make sure you allow push notifications',
      //   alertCallback,
      //   'Find out if someone wants to meet',
      //   'Ok!'
      // );
    
          pushNotification.register(
          tokenHandler,
          errorHandler,
          {
              "badge":"true",
              "sound":"true",
              "alert":"true",
              "ecb":"onNotificationAPN"
          });

      function errorHandler (error) {
          alert('error = ' + error);
      }

      function successHandler (result) {
          alert('successhandler');
      }

      function tokenHandler (result) {
        $http.post(server+'api/postToken', {token: result, fid: $scope.user.fid}, function(){
        });
          // Your iOS push server needs to know the token before it can push to this device
          // here is where you might want to send it the token for later use.
        console.log('device token = ' + result);
      }
      // pushNotification.setApplicationIconBadgeNumber(successCallback, errorCallback, badgeCount);

      onNotificationAPN = function(e){
        $scope.match = matchData.getUser();
        if (e.foreground) {
          console.log('notification received');  
          if (e.type === 'unreadTags'){
            userData.data.unreadTags+=1;
            console.log('in unreadtags');
            // If user is currently viewing this page, no change to inAppBadges and decrement the db
            if ($location.path()==='/tab/editProfile'){
            // Trying incrementing regardless
              console.log('in editprofile');
              $http.post(server+'api/badgeIncrement', {fid: $scope.user.fid, tagType: 'unreadTags', increment: -1}).success(function(data){
              });
            // Otherwise, increment inAppBadge
            } 
          }
          if (e.type === 'unseenMatches'){
            console.log('in unseenMatches');
            $http.post(server+'api/fetchMatchUpdate', {fid: $scope.user.fid}).success(function(data){
              // console.log(data);
              userData.data.unseenMatches = data.unseenMatches;
              userData.data.matches = data.matches;
              userData.data.unreadMessages+=1;
            });
          }
          if (e.type === 'unreadMessages'){
            console.log('in unreadMessages');
            // If user is currently viewing this chat page, no change to inAppBadges and decrement the db msgs
            if ($location.path()==='/tab/chat' && $scope.match.fid===e.senderFid){
              console.log('on chat page, no adding to in-app, posting decrement');
              $http.post(server+'api/badgeIncrement', {fid: $scope.user.fid, tagType: 'unreadMessages', increment: -1, matchFid: $scope.match.fid}).success(function(data){
              });
            } else {
            // Otherwise, add one to in-app badge count
              console.log('adding in-app');
              for (var i = 0; i < userData.data.matches.length; i++){
                if (userData.data.matches[i].fid === e.senderFid){
                  userData.data.matches[i].unseenChat +=1;
                  userData.data.unreadMessages+=1;
                  $scope.$apply();
                }
              }
            }
          }
          $scope.$apply();
        }
        if (e.alert) {
          alert('here');
          navigator.notification.alert(e.alert);
        }
            
        if (e.sound) {
            // playing a sound also requires the org.apache.cordova.media plugin
            var snd = new Media(e.sound);
            snd.play({ playAudioWhenScreenIsLocked : false });

        }
        
        if (e.badge) {
          pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
        }
      }
      var badgeSuccess = function(){
        console.log('ok');
      };
      var badgeError = function(){
        console.log('err');
      };
    };
    

    var decrementBadge = function(tagType){
      $http.post(server+'api/decrementBadge', {fid: $scope.user.fid, tagType: tagType}).success(function(){
      });
    };
    $scope.spinner = function(path){
      $ionicLoading.show({
        templateUrl: "views/loading.html"
      });      
      $location.path('/menu/'+path);
    };

}]);

