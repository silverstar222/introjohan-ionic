angular.module('revealApp.controller.feed', [])
  .controller('FeedCtrl', ['$scope', '$http', '$location', '$window', 'userData', 'spinner', 'friendData', 'serverInfo', '$rootScope', '$ionicPopup', '$ionicLoading', 'services', '$ionicScrollDelegate', '$ionicModal', '$timeout', 'matchData', function ($scope, $http, $location, $window, userData, spinner, friendData,serverInfo,$rootScope,$ionicPopup,$ionicLoading,services,$ionicScrollDelegate,$ionicModal,$timeout,matchData) {
    $scope.introLogo = "<img src='img/intro3_white_cropped.png' class='title centerItem headerLogo'>";
    $scope.morePosts = {posts: true, geoPosts: true, friendPosts: true};
    $scope.posts = services.getPosts();
    var alreadyFetching = false;
    var fetchPostsLimit = 30;
    var initializing = true

    $scope.geoPosts = services.getGeoPosts();
    $scope.friendPosts = services.getFriendPosts();
    $ionicLoading.show({
      templateUrl: "views/loading.html",
    });
    mixpanel.track('Feed');

    var server = serverInfo.getServer();
    $scope.user = userData.getUser();
    $scope.filterChoices = [];
    if ($scope.filterChoices.length===0){
      for (var i = 0; i < $scope.user.education.length; i++){
        $scope.filterChoices.push($scope.user.education[i]);
      }
      $scope.filterChoices.unshift({school: {name: 'Friends of Friends'}});
      $scope.filterChoices.unshift({school: {name: 'Friends'}});
      $scope.filterChoices.default = 'Everyone';
    }
    // $scope.filterChoices.selected = 'Everyone';

    $scope.hideFirstTime = function(){
      $http.post(server+'api/changeFirst', {fid: $scope.user.fid, page: 'FriendList'}).success(function(){
      });
      $scope.firstTime=false;
    };
    
    var alertCallback = function(){};
    $scope.popup = {stopShowing: false};
    $http.post(server+'api/checkFirst', {fid: $scope.user.fid, page: 'FriendList'}).success(function(data){
      $scope.firstTime = data['firstFriendList'];
      // if ($scope.firstTime){
      //   var alertPopup = $ionicPopup.alert({
      //     title: 'See what\'s going on',
      //     scope: $scope,
      //     template: "See recent posts, or tap the wheel icon on the bottom menu to add a post.<br><br><input type='checkbox' ng-model='popup.stopShowing'> <span ng-click='popup.stopShowing = !popup.stopShowing'>Got it, don't show this again!</span>"
      //   });
      //   alertPopup.then(function(res) {
      //     if ($scope.popup.stopShowing){
      //       $http.post(server+'api/changeFirst', {fid: $scope.user.fid, page: 'FriendList'}).success(function(){
      //       });
      //     }
      //   });
      // }
    }).error(function(err){console.log(err);});
    
    var current = new Date();
    var createdAt = services.getTime() || new Date($scope.user.createdAt);
    
    $timeout(function(){
      if (current - createdAt > 5*60*1000&& !$scope.user.state.friendLatLonComplete){ // if account was created more than 5 minutes ago
        $http.post(server+'api/checkFriendsCompleted', {fid: $scope.user.fid}).success(function(data){
          if (data==='false'){
            services.setTime(new Date());  // resets created at so that it doesn't run again soon
            FB.api('/me/friends', { fields: 'id,name,picture.width(640).height(640),location,gender,relationship_status,birthday' },  function(response) {
              if (response.error) {
                console.log(JSON.stringify(response.error));
              } else {
                var friendData = response.data;
                for (var i = 0; i < friendData.length; i++){
                  friendData[i].fid = friendData[i].id;
                  delete friendData[i].id;
                }
                $http.post(server+'api/postFriendData', {user: $scope.user, friendData: friendData}).success(function(data){
                });
              }
            });
          } else {
            $scope.user.state.friendLatLonComplete = true;
            userData.setUser($scope.user);
          }
        });
      }
    },0);

    services.checkServer(function(){}, function(){
      $scope.user = null;
      $scope.friendData = null;
      $location.path('/login');
    }, $scope.user.fid);

    var friendFids = friendFids || [];
    if (friendFids.length<1){
      for (var i = 0; i < $scope.user.friends.data.length; i++){
        // THIS IS A TEMP FIX
        if ($scope.user.friends.data[i].id){
          friendFids.push($scope.user.friends.data[i].id);
        }
        if ($scope.user.friends.data[i].fid){
          friendFids.push($scope.user.friends.data[i].fid);
        } 
      }
    }


    var fetchPosts = function(cb){
      $http.post(server+'api/fetchFriendPosts',{friendFids: friendFids, fid: $scope.user.fid, skip: 0}).success(function(data){
        data = services.preparePosts(data, $scope.user.fid);
        $scope.friendPosts = data;
        services.setFriendPosts(data);
        if (data.length < fetchPostsLimit){ // This must be in sync w/ the limit in the server
          $scope.morePosts.friendPosts = false;
        }
      });
      $http.post(server+'api/fetchPosts',{friendFids: friendFids, fid: $scope.user.fid, skip: 0}).success(function(data){
        data = services.preparePosts(data, $scope.user.fid);
        $scope.posts = data;
        $ionicLoading.hide();
        services.setPosts(data);
        if (data.length < fetchPostsLimit){ // This must be in sync w/ the limit in the server
          $scope.morePosts.posts = false;
        }
      });

      console.log($scope.filterChoices.selected);

      fetchGeoPosts($scope.filterChoices.selected || $scope.filterChoices.default, cb);

      var callbackToLogin = function(){
        $location.path('/login');
        $scope.$apply();
      };
      var geoLocationError = function(){
        navigator.notification.alert(
        'Your location is needed to help find matches for you. Please change this under Settings-> Privacy-> Location Services, and then log in again. We will never reveal your exact location to any party. You will now be logged out.',
        callbackToLogin,
        'Sorry!',
        'Ok!');
      };
      
    };
    var fetchGeoPosts = function(filter, cb){
      $ionicLoading.show({
        templateUrl: "views/loading.html",
      });
      // console.log($scope.user.latlon);
      $http.post(server+'api/fetchGeoPosts',{friendFids: friendFids, fid: $scope.user.fid, lat: $scope.user.latlon[1], lon: $scope.user.latlon[0], skip: 0, filter: filter, education: $scope.user.education}).success(function(data){
        $ionicLoading.hide();
        data = services.preparePosts(data, $scope.user.fid);
        $scope.geoPosts = [];
        $scope.geoPosts = data;
        services.setGeoPosts(data);
        if (data.length < fetchPostsLimit){ // This must be in sync w/ the limit in the server
          $scope.morePosts.geoPosts = false;
        }
        if (cb){
          cb();
        }
      });
    };
    if (!$scope.posts){
      fetchPosts();
    } else {
      $ionicLoading.hide();
    }

    
    $scope.clickFriend = function(type,index){
      var friend;
      if (type==='poster'){
        friend = {fid: $scope.friendPosts[index].posterfid};
      } else {
        friend = {fid: $scope.friendPosts[index].subjectFid};
      }
      if (friend.fid === $scope.user.fid){
      } else {
        friendData.setFriend(friend);
        services.setPassedData(true);
        $ionicLoading.show({
          templateUrl: "views/loading.html",
        });
        $location.path('/tab/friendCards');
      }
    };
    $scope.search = function(){
      $location.path('/tab/main');
    }

    $scope.loadMore = function(postType){
      var url = 'api/fetch'+postType[0].toUpperCase()+postType.slice(1);
      if ($scope[postType]){
        if (!alreadyFetching){
        // if ($scope[postType].length - $scope.visible[postType].length <= 5 && alreadyFetching === false){// set to 20
          alreadyFetching = true;
          $http.post(server+url,{friendFids: friendFids, fid: $scope.user.fid, skip: $scope[postType].length}).success(function(data){
            if (data.length<fetchPostsLimit){
              $scope.morePosts[postType] = false;
            }
            data = services.preparePosts(data, $scope.user.fid);
            $scope[postType].push(data);
            $scope[postType] = _.flatten($scope[postType]);
            $scope[postType] = _.uniq($scope[postType]);
            alreadyFetching = false;
          });
        }
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    $scope.doRefresh = function() {
      fetchPosts(function(){
        $scope.$broadcast('scroll.refreshComplete');
        $ionicScrollDelegate.scrollTop(true);
      });
      
    };
    $scope.viewingFriendTags = 'nearby';
    $scope.viewStranger = function(clickon, type, index, usersIndex){
      $scope.cantLike = false;
      $ionicLoading.show({
        templateUrl: "views/loading.html",
      });
      var fid;
      if (clickon==='poster'){
        if (type==='friends'){
          fid = $scope.friendPosts[index].posterFid;
        } else if (type==='stranger') {
          fid = $scope.strangerPosts[index].posterFid;
        } else if (type==='nearby') {
          fid = $scope.geoPosts[index].posterFid;
        } else {
          fid = $scope.posts[index].posterFid;
        }
      } else {
        // if not the poster but someone mentioned
        if (type==='friends'){
          fid = $scope.friendPosts[index].users[usersIndex].fid;
        } else if (type==='stranger') {
          fid = $scope.strangerPosts[index].users[usersIndex].fid;
        } else if (type==='nearby') {
          fid = $scope.geoPosts[index].users[usersIndex].fid;
        } else {
          fid = $scope.posts[index].users[usersIndex].fid;
        }
      }
      if (fid === $scope.user.fid){
        $ionicLoading.hide();
      } else {
        $http.post(server+'api/fetchSingleMatch', {fid: fid}).success(function(data){
          var nAvailable = ['In a relationship','Engaged','Married','In a civil union','In a domestic partnership'];
          $scope.stranger = data.user;
          $http.post(server+'api/checkLiked', {strangerFid: data.user.fid, userFid: $scope.user.fid }).success(function(data){
            for (var i = 0; i < nAvailable.length; i++){
              if ($scope.stranger.relationship_status === nAvailable[i]){
                $scope.cantLike = true;
              }
            }
          });
          // Check to see if stranger is a friend
          $scope.stranger.isFriend = false;
          for (var i = 0; i < $scope.user.friends.data.length; i++){
            if ($scope.user.friends.data[i].id === $scope.stranger.fid){
              $scope.cantLike = true;
              $scope.stranger.isFriend = true;
            }
          }
          data.posts = services.checkPostsVisible(data.posts, $scope.stranger);
          data.posts = services.preparePosts(data.posts, $scope.user.fid);
          $scope.strangerPosts = data.posts;
          if (data.user.latlon){
            $scope.stranger.distance = Math.ceil(services.getDistance(data.user.latlon[1], data.user.latlon[0], $scope.user.latlon[1], $scope.user.latlon[0]));
          }
          $ionicModal.fromTemplateUrl('views/viewStrangerModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
          $scope.viewStrangerModal = modal;
          $scope.viewStrangerModal.show();
            $ionicLoading.hide();
          });
        });
      }
    };

    $scope.closeStrangerModal = function(){
      fetchPosts();
      $scope.stranger = undefined;
      $scope.viewStrangerModal.hide();
    };

    $scope.viewMutualFriends = function(){
      $http.post(server+'api/fetchMutualFriends', {userFriends: $scope.user.friends, matchFriends: $scope.stranger.friends}).success(function(data){
        var friendNameList = [];
        for (var i = 0; i < data.length; i++){
          friendNameList.push(data[i].name);
        };
        navigator.notification.alert(
          friendNameList.join(', '),  // message
          emptyCallback,         // callback
          'Mutual Friends',            // title
          'Got it!'                  // buttonName
        );
      });
    };

    $scope.carrotClick=function(index, type){
      // Only make changes if user is not original poster and not subject tagged
      if ($scope[type][index].posterFid !== $scope.user.fid && $scope[type][index].subjectFid !== $scope.user.fid){
      // type = posts or friendPosts or strangerPosts
        if (!$scope[type][index].likes){
          $scope[type][index].likes = {};
        }
        if ($scope[type][index].likes[$scope.user.fid]){
          $scope[type][index].likesLength--;
          delete $scope[type][index].likes[$scope.user.fid];
        } else {
          $scope[type][index].likesLength++;
          $scope[type][index].likes[$scope.user.fid] = true;
        }
        $http.post(server+'api/carrotClick', {fid: $scope.user.fid, post: $scope[type][index]._id}).success(function(){
        });
        if ($scope[type][index].subjectFid){ // only when it's a tag
          $http.post(server+'api/findType', {tag: $scope[type][index].content}).success(function(data){
            $http.post(server+'api/postTag', {type: data, tag: $scope[type][index].content, userFid: $scope.user.fid, friendFid: $scope[type][index].subjectFid, second: true}).success(function(data){
              // $http.post(server+'api/pushNotification',{fid: $scope[type][index].subjectFid, tagType: 'unreadTags', message: 'Someone tagged you!'}, function(){
              // });
              // $http.post(server+'api/emailer', {type: 'tagNotification', userFid: $scope.user.fid, friendFid: $scope[type][index].subjectFid, matchFid: ''}).success(function(data){
              // });
            });
            mixpanel.track('EditFriend.AddTag');
          });
        }
      }
    }

    var emptyCallback = function(){};
    services.checkin('feed');

    $scope.postPage = function(){
      $location.path('/tab/post')
    };

    $scope.getCamera = function(){
      var options = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
        encodingType: 0,     // 0=JPG 1=PNG
        allowEdit: 1,
        correctOrientation: 1,
        saveToPhotoAlbum: 1
      };
      navigator.camera.getPicture(onSuccess, onFail, options);
    };


    function onSuccess(imageData) {
      // $scope.testImage = document.getElementById('myImage');
      $scope.tempImage = "data:image/jpeg;base64," + imageData;
    }

    function onFail(message) {
      // alert('Failed because: ' + message);
    };

    $scope.like = function(){
      // This should be in a service
      viewedUser();
      $http.post(server+'api/postLike', {liker: $scope.user.fid, likee: $scope.stranger.fid}).success(function(data){
        if (data === 'match'){
          match();
        } else {
          $scope.showPopup();
          $http.post(server+'api/emailer', {type: 'informLike', userFid: $scope.user.fid, friendFid: '', matchFid: $scope.stranger.fid}).success(function(data){
          });
          // $scope.openModal();
          // options: 1) nothing, 2) ping the person, 3) ask friend for intro
          // next();
        }
      }).error(function(err){alert('Error in postLike');});
      // mixpanel.track('Match.yes');
      // mixpanel.track('Match.swipe');
    };
    var viewedUser = function(){
      $http.post(server+'api/viewedUser', {fid: $scope.user.fid, matchFid: $scope.stranger.fid}).success(function(data){
      }).error(function(err){alert('Error in viewedUser');});
    };
    $scope.showPopup = function() {
      navigator.notification.confirm(
        "You're not a match yet, but you can still get an intro! Message a mutual friend asking for an intro",  // message
        promptOptions,                  // callback to invoke
        'Get connected!',            // title
        ['Nah','Ask for intro']             // buttonLabels
      );
    };
    var promptOptions = function(option){
      if (option === 2){
        createMutualFriendArray();
        $scope.friendIntroModal.show();
      } else {
      }
    };
    var createMutualFriendArray = function(){
      $http.post(server+'api/fetchMutualFriends', {userFriends: $scope.user.friends, matchFriends: $scope.stranger.friends}).success(function(data){
        $scope.mutualFriendList = [];
        for (var i = 0; i < data.length; i++){
          $scope.mutualFriendList.push({name: data[i].name, fid: data[i].id});
        }
      });
    };
    $ionicModal.fromTemplateUrl('views/friendIntroModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.friendIntroModal = modal;
    });
    $scope.closeModal = function(){
      $scope.friendIntroModal.hide();
    };
    var match = function(){
      $http.post(server+'api/addMatch', {userFid: $scope.user.fid, matchFid: $scope.stranger.fid}).success(function(data){
        $http.post(server+'api/pushNotification', {fid: $scope.stranger.fid, tagType: 'unseenMatches', message: 'You have a match!'}).success(function(data){
        }).error(function(data){console.log(err);});
        navigator.notification.alert(
          "Start chatting!",  // message
          toChat,                  // callback to invoke
          'It\'s a match! Congratulations!',            // title
          'Ok!'             // buttonLabels
        );
        mixpanel.track('Match.addMatch');
      }).error(function(err){alert('Error in matching');});
    };
    var toChat = function(){
      matchData.setUser($scope.stranger);
      $location.path('/tab/chat');
      $scope.$apply();
    };

    $scope.selectedEvent = function(index, postType){
      services.viewEvent($scope[postType][index].atEvent._id, function(data){
        data.posts = services.preparePosts(data.posts, $scope.user.fid);
        $scope.selectedEventData = data;
        $ionicModal.fromTemplateUrl('views/viewEventModal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.viewEventModal = modal;
          $scope.viewEventModal.show();
        });
      });
    };
    $scope.closeViewEventModal = function(){
      $scope.viewEventModal.hide();
    };

    $scope.$watch('filterChoices.selected', function(newValue, oldValue) {
      if (initializing) {
        $timeout(function() { initializing = false; });
      } else {
        if (newValue === ''){
          newValue = 'Everyone';
        }
        fetchGeoPosts(newValue);
        // console.log(newValue);
      }
    }, true);

    $scope.postTweet = function(){
      OAuth.popup('twitter')
      .done(function (r) {
          // the access_token is available via r.access_token
          // but the http functions automagically wrap the jquery calls
          r.get('/1.1/account/verify_credentials.json')
              .done(function(data) {
                alert(data);
                alert(data.name);
                  // $('#result').html("twitter: Hello, " + data.name + " !");
              })
              .fail(function( jqXHR, textStatus, errorThrown) {
                alert(textStatus);
                  // $('#result').html("req error: " + textStatus);
              });
      })
      .fail(function (e) {
        alert(e.message);
          // $('#result').html('error: ' + e.message);
      });
    };

    // Caman("#test", "http://farm6.static.flickr.com/5224/5643109041_9cb6bafbdb_b.jpg", function () {
    //   // manipulate image here
    //   // this.brightness(5).render();
    //   this.render();
    // });


  }])

.directive('scrollwatch', function($rootScope) {
  return function(scope, elem, attr) {
    var start = 0, headerTop=0, topLimit=-64;
    var footerBottom=0, bottomLimit=-49; isBottom=1;
    var hPos=0, fPos=0;
    var firstRun=true;

    elem.bind('scroll', function(e) {
      var diff=e.detail.scrollTop-start;
      if(diff==0&&firstRun!=true) {
        start=e.detail.scrollTop;
        firstRun=false;
        return false;
      }
      //Scroll Down
      if(e.detail.scrollTop>start&&e.detail.scrollTop>0&&start!=0){
        if(headerTop==topLimit){
          start=e.detail.scrollTop;
          return false;
        }

        hPos=headerTop-(e.detail.scrollTop-start);
        fPos=footerBottom-(e.detail.scrollTop-start);
        if(hPos>=topLimit){
          headerTop=hPos;
        } else{
          headerTop=topLimit;
        }

        if(fPos>=bottomLimit){
          footerBottom=fPos;
        }
        else{
          footerBottom=bottomLimit;
        }
      }
      //Scroll Up
      else if(e.detail.scrollTop<start){
        if(headerTop==0){
          start=e.detail.scrollTop;
          return false;
        }

        hPos=headerTop+(start-e.detail.scrollTop);
        fPos=footerBottom+(start-e.detail.scrollTop);
        if(hPos<=0){
          headerTop=hPos;
        } else{
          headerTop=0;
        }

        if(fPos<=0){
          footerBottom=fPos;
        } else{
          footerBottom=0;
        }
      }

      start=e.detail.scrollTop;
      document.getElementsByClassName("bar-header")[1].style.top=headerTop+"px";
      document.getElementsByClassName("tabs")[0].style.bottom=footerBottom+"px";
      document.getElementsByClassName("feedWrapper")[0].style.cssText="margin-top:"+(-topLimit+headerTop)+"px;"+"bottom:"+(-bottomLimit+footerBottom)+"px;";
    });
  };
});

