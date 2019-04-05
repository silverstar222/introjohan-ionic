// 'use strict';

angular.module('revealApp.controller.main', [])
  .controller('MainCtrl', ['$scope', '$http', '$location', '$timeout', 'userData', 'spinner', 'friendData', 'serverInfo', '$ionicSideMenuDelegate', '$ionicPopup', '$ionicLoading', 'services', '$ionicScrollDelegate', function ($scope, $http, $location, $timeout, userData, spinner, friendData,serverInfo,$ionicSideMenuDelegate,$ionicPopup,$ionicLoading,services,$ionicScrollDelegate) {
    // Can delete this file
    $scope.introLogo = "<img src='img/intro3_white_cropped.png' class='title centerItem headerLogo'>";
    $ionicLoading.show({
      templateUrl: "views/loading.html",
      // template: 'Loading...'
    });


    // NEED TO ADD SCROLLING TO TOP

    var server = serverInfo.getServer();
    $scope.user = userData.getUser();
    // $scope.user = {fid: '1601373'};
    // var thing = services.tester;
    $scope.test=function(){
      // thing='bye';
      // console.log('here');
      services.tester.testData = 'bye';
    };
    
    services.checkServer(function(){}, function(){
      $scope.user = null;
      $scope.friendData = null;
      $location.path('/login');
    }, $scope.user.fid);
    $scope.filtered = {friends: []};
    $scope.limit = 20;
    // $scope.friendData2 = [{name: ''}];
    // var user = userData.getUser();
    $scope.featuredFriends = [];
    var randomIndex = [];
    // SHOULD COMBINE THIS WITH SELECTFRIEND FUNCTION
    $scope.pickFeature = function(index){
      // $scope.selectFriend(randomIndex+index)
      var friend = $scope.friendData[randomIndex[index]];
      console.log(friend);
      // serverTest(friend);
      friendData.setFriend(friend);
      services.setPassedData(true);
      // spinner.show();
      $ionicLoading.show({
        templateUrl: "views/loading.html",
        });
      $location.path('/tab/friendCards');
      // // spinner.show();
      // $ionicLoading.show({
      //   templateUrl: "views/loading.html",
      //     // template: 'Loading...'
      //   });
      // $location.path('/tab/editFriend/default');
    };
    // var alertCallback = function(){};
    // $http.post(server+'api/checkFirst', {fid: $scope.user.fid, page: 'FriendList'}).success(function(data){
    //   $scope.firstTime = data['firstFriendList'];
    //   if ($scope.firstTime){
    //     navigator.notification.alert(
    //       "Click to intro them to others",
    //       alertCallback,
    //       'See a friend?',
    //       'Ok!'
    //     );
    //     $http.post(server+'api/changeFirst', {fid: $scope.user.fid, page: 'FriendList'}).success(function(){
    //     });
    //   }
    // }).error(function(err){console.log(err);});
    // $http.post(server+'api/checkin', {fid: $scope.user.fid}).success(function(){
    // });
    

    mixpanel.track('Main');
    $scope.friendData = services.getFriendData();
    var friendIdsOnly=[];
    var setFriendIdsArray = function(){
      for (var i = 0; i < $scope.friendData.length; i++){
        friendIdsOnly.push($scope.friendData[i].fid);
      }
    }
    $scope.toggleLeft = function() {
      $ionicSideMenuDelegate.toggleLeft();
    };

    /*
    var ul = document.getElementById('friendList');
    ul.addEventListener('slip:beforereorder', function(e){
        if (/demo-no-reorder/.test(e.target.className)) {
            e.preventDefault();
        }
    }, false);

    ul.addEventListener('slip:swipe', function(e) {
      var onConfirm = function(index){
        if (index===1){
          e.preventDefault();
        } else {
          var index = parseInt(e.target.childNodes[3].id); // careful, this '3' index might change and f things up
          var deletedFriend = $scope.friendData[index];
          $http.post(server+'api/notAvailable',{fid: deletedFriend.fid}).success(function(){
          }).error(function(err){alert('Error in posting NA'+err);});
          e.target.parentNode.removeChild(e.target);
        }
      };
      navigator.notification.confirm(
        'Are you sure this friend is unavailable?',  // message
        onConfirm,              // callback to invoke with index of button pressed
        'Sure?',            // title
        ['No','Yes']          // buttonLabels
      );
    });
    ul.addEventListener('slip:tap', function(e) {
      // var index = e.target.id;
      // $timeout(function(){
      //   $scope.selectFriend(index);
      // }, 0);
      // e.preventDefault(); // will animate back to original position
      
    });

    

    ul.addEventListener('slip:reorder', function(e){
        e.target.parentNode.insertBefore(e.target, e.detail.insertBefore);
        return false;
    }, false);

    new Slip(ul);
    */
  
  var serverTest = function(input){
    $http.post(server+'api/serverTest', {input: input}).success(function(){
    });
  };
  // console.log('here');

  // $http.get('https://graph.facebook.com/704345/picture?redirect=1&height=50&width=50').success(function(data){
  //   // var arrayBufferView = new Uint8Array(data); // can choose 8, 16 or 32 depending on how you save your images
  //   // blob = new Blob([arrayBufferView], {'type': 'image\/jpeg'});
  //   // $scope.testImage = window.URL.createObjectURL(blob);
  //   data = escape(data);
  //   $scope.testImage = 'data:image/jpeg;base64,' + btoa(data);
  //   // console.log(data);
  // //   localStorage.setItem('image', data);
  //   // $scope.testImage = localStorage.getItem('image');
  //   console.log($scope.testImage);
  //   // $scope.testImage = 'http://i.stack.imgur.com/GnU2W.jpg?s=32&g=1';

  // }).error(function(err){console.log(err); console.log('error!')});
    
  var fetchFriends = function(){
    console.log('fetching friends');
    $http.post(server+'api/fetchFriends', {fid: $scope.user.fid}).success(function(data){
      $scope.user.friends = {data: data};
      userData.setUser($scope.user);
      // console.log(data[0]);
      // console.log(data[1]);
      $scope.friendData = data;
      // THIS SCREWS UP THE ID/FID OF FRIENDS, SHOULD JUST LEAVE AS ID
      for (var i = 0; i < data.length; i++){
        $scope.friendData[i].fid = data[i].id;
        delete $scope.friendData[i].id;
      }
      // THIS SHOULD PROLLY BE CLEANED UP, JUST PUT IN USER
      // services.setFriendList($scope.friendData);
      setFriendIdsArray();
      selectFeatures();
      services.setFriendData(data);
      $ionicLoading.hide();
    });
  };
  $scope.clearSearch=function(){
    $scope.search.name = '';
  };

    // SHOULD PUT THIS IN SERVICE?
    // $scope.logout = function(){
    //   FB.logout(function(data){
    //     //NOTE: Catch errors??
    //     $scope.user = null;
    //     $scope.friendData = null;
    //     $location.path('/tab/login');
    //     // $scope.$apply();
    //   });
    // };
    
    $scope.selectFriend = function(index){
      // serverTest('5 selectFriend');
      // alert(JSON.stringify($scope.friendData[index]));
      // serverTest(index);
      var friend = $scope.filtered.friends[index];
      console.log(friend);
      
      // serverTest(friend);
      friendData.setFriend(friend);
      services.setPassedData(true);
      // spinner.show();
      $ionicLoading.show({
        templateUrl: "views/loading.html",
          // template: 'Loading...'
        });
      $location.path('/tab/friendCards');
      // $location.path('/tab/editFriend/default');
      // serverTest('here!=========');
      // $navigate.go('/editFriend');
      // serverTest('6 selectFriend end');
    };
    
    $scope.doRefresh = function() {
      // console.log(friendIdsOnly);
      var newFriends=[];
      // $scope.friendData.push(person);
      // FB.api('/me', {fields: 'friends,education'}, function(resp){
      FB.api('/me/friends', { fields: 'id,name,picture.width(640).height(640),location,gender,relationship_status,birthday' },  function(resp) {
        if (resp.error){ alert('Error in refreshing, please contact us at "tech@makeanintro.com" to let us know');}
        // console.log('Fb friends fetched');
        var newList = resp.data;
        for (var i = 0; i < newList.length; i++){
          if (_.indexOf(friendIdsOnly, newList[i].id)===-1){
            newFriends.push(newList[i]);
          }
        }
        // console.log(newFriends);
        var newFriendsSimple=[];
        for (var i = 0; i < newFriends.length; i++){
          // console.log(newFriends.name);
          // console.log(newFriends.id);
          newFriends[i].fid = newFriends[i].id;
          delete newFriends[i].id;
          newFriendsSimple.push({name: newFriends[i].name, fid: newFriends[i].fid});
        }
        // console.log(newFriendsSimple);
        // console.log(newFriends);
        if (newFriends.length>0){
          $http.post(server+'api/postFriendData', {user: $scope.user, friendData: newFriends, token: $scope.user.token}).success(function(data){
            $http.post(server+'api/postFriendToUser', {userFid: $scope.user.fid, friends: newFriendsSimple}).success(function(data){
              // console.log('postedfriendtouser');
              for (var i = 0; i < newFriendsSimple.length;i++){
                $scope.friendData.push(newFriendsSimple[i]);
              }
              setFriendIdsArray();
              $scope.$broadcast('scroll.refreshComplete');
            });
          });
        } else {
          // console.log('No new friends');
          $scope.$broadcast('scroll.refreshComplete');
        }
      });
      
      // $timeout(function(){
        // alert('blah');
      // },500);
      // $http.get('/new-items').success(function(newItems) {
        // $scope.items = newItems;
        //Stop the ion-refresher from spinning
        // $scope.$broadcast('scroll.refreshComplete');
      // });
    };
    var selectFeatures = function(){
      for (var i = 0; i < 3; i++){
        randomIndex.push(Math.floor(Math.random()*$scope.friendData.length));
        $scope.featuredFriends.push($scope.friendData[randomIndex[i]]);
      }
    };

    if ($scope.friendData.length<1){
      fetchFriends();
    } else {
      selectFeatures();
      setFriendIdsArray();
      $ionicLoading.hide();
    }
    $scope.loadMore = function(){
      // alert($scope.limit);
      $scope.limit = $scope.limit+80;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    };
    $scope.keyPress = function(){
      console.log('here');
      $ionicScrollDelegate.scrollTop();
    };
    // $scope.$on('stateChangeSuccess', function() {
    //   $scope.loadMore();
    // });
      services.checkin('main');


  }]);

