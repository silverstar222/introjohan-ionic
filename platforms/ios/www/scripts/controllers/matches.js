angular.module('revealApp.controller.matches', ['angular-carousel'])
  .controller('MatchesCtrl', ['$scope', '$http', '$document','$location', '$ionicLoading', 'userData', 'matchData', 'spinner', 'serverInfo', '$ionicModal', '$timeout', '$ionicPopup', '$ionicScrollDelegate', 'services', function ($scope, $http, $document, $location,$ionicLoading, userData, matchData,spinner, serverInfo, $ionicModal, $timeout,$ionicPopup,$ionicScrollDelegate,services) {
    $ionicLoading.show({
      templateUrl: "views/loading.html"
    });      
    // services.checkKill();    On tabs
    mixpanel.track('Matches');
    $scope.currentSlide = 0;
    var server = serverInfo.getServer();
    var serverTest = function(input){
      $http.post(server+'api/serverTest', {input: input}).success(function(){
        spinner.hide();
      });
    };
    $scope.user = userData.getUser();
    services.checkServer(function(){}, function(){
      $scope.user = null;
      $scope.friendData = null;
      $location.path('/login');
    }, $scope.user.fid);

    var matchListLength;
    var currentMatch;
    var intros = 0;
    var likes = 0;

    $scope.matchTags = [];
    $scope.match = {profilePhotos: []};
    $scope.slideStartIndex=0;                    //The index of the first slide
    $scope.postsArray=[];
    $scope.animationFinished=true;              // Describe whether scroll animation is finisehd or not
    //$scope.isDataLoaded=true;                      // Describe whether the data is loaded or not
    $scope.yesOrNo="";                          // Used by plugin to specify which function needs to be executed Yes/No

    for (var i = 0; i < 20; i++){
      $scope.match.profilePhotos.push('img/blackpixel.jpg');
    }

    $ionicModal.fromTemplateUrl('views/friendIntroModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.friendIntroModal = modal;
    });
    $scope.closeModal = function(){
      $scope.friendIntroModal.hide();
      $scope.next();
    };    

    var alertCallback = function(){};
    $scope.popup = {stopShowing: false};
    $scope.hideFirstTime = function(){
      $http.post(server+'api/changeFirst', {fid: $scope.user.fid, page: 'MatchesFlash'}).success(function(){
      });
      $scope.firstTime=false;
    };
    var checkFirst = function(){
      $http.post(server+'api/checkFirst', {fid: $scope.user.fid, page: 'MatchesFlash'}).success(function(data){
        $scope.firstTime = data['firstMatches'];
        // if ($scope.firstTime){
        //   var alertPopup = $ionicPopup.alert({
        //     title: 'Meet people',
        //     scope: $scope,
        //     template: "View people and see what they've been up to. If you'd like to meet someone, tap 'Yes'! If you both say 'Yes', you'll be connected<br><br><input type='checkbox' ng-model='popup.stopShowing'> <span ng-click='popup.stopShowing = !popup.stopShowing'>Got it, don't show this again!</span>"
        //   });
        //   alertPopup.then(function(res) {
        //     if ($scope.popup.stopShowing){
        //       $http.post(server+'api/changeFirst', {fid: $scope.user.fid, page: 'Matches'}).success(function(){
        //       });
        //     }
        //   });
        // }
      }).error(function(err){console.log(err);});
    };
  
    var matchAdjustments = function(){
      $scope.match.firstname = $scope.match.name.split(' ')[0];
      services.createTagArray($scope.match.tags);
      $scope.matchTags = services.getTagArray();
      $ionicLoading.hide();
    }
    if ($location.path() === '/tab/chatMatches'){
      $http.post(server+'api/fetchSingleMatch', {fid: matchData.getUser().fid}).success(function(data){
        $scope.match = data.user;
        if (data.user.latlon){
          $scope.match.distance = Math.ceil(services.getDistance(data.user.latlon[1], data.user.latlon[0], $scope.user.latlon[1], $scope.user.latlon[0]));
        }
        fetchPosts();
        matchAdjustments();
      });
    } else {
      checkFirst();

      $http.post(server+'api/fetchMatches', {fid: $scope.user.fid}).success(function(data){
      //$http.post(server+'api/fetchMatches', {fid: "673720172"}).success(function(data){
        if (!data[0]){
          $ionicLoading.hide();
          navigator.notification.alert(
            "You'll get more daily matches if more of your friends join. Check again tomorrow at noon ET for new matches",  // message
            alertCallback,                  // callback to invoke
            'No more matches today, sorry!',            // title
            'Ok'             // buttonLabels
          );
          $location.path('/tab/feed');
          $scope.$apply();
        } else {
          $scope.matches = data;
          for (var i = 0; i < data.length; i++){
            //Get first name from full name
            $scope.matches[i].firstname = $scope.matches[i].name.split(' ')[0];
            if (data[i].intro){
              intros++;
            }
            if (data[i].liked){
              likes++;
            }
          }
          if (intros>0){
            introAlert();
          }
          if (likes>0){
            likesAlert();
          }
          matchListLength = data.length;
          // $scope.matches[0].firstname = $scope.matches[0].name.split(' ')[0];
          // $scope.matches[0].age = $scope.matches[]
          $scope.match = $scope.matches[0];
          for (var i = 0; i < $scope.matches.length; i++){
            for (var j = 0; j < $scope.matches[i].profilePhotos.length;j++){
              preloadImages([$scope.matches[i].profilePhotos[j]]);
              console.log('preloading '+$scope.matches[i].profilePhotos[j]);
            }
          }
          if ($scope.match.latlon){
            $scope.match.distance = Math.ceil(services.getDistance($scope.match.latlon[1], $scope.match.latlon[0], $scope.user.latlon[1], $scope.user.latlon[0]));
          }
          fetchPosts();
          
          currentMatch = 0;
          matchAdjustments();
          
        }
      }).error(function(err){alert('Error in fetchMatches');$ionicLoading.hide();});

    }
        
    var introAlert = function(){
      navigator.notification.alert(
        "Someone thought you should meet "+intros+" of the people in today's set!",  // message
        alertCallback,                  // callback to invoke
        'Woohoo!',            // title
        'Ok!'             // buttonLabels
      );
    };
    var likesAlert = function(){
      navigator.notification.alert(
        likes+" of the people in today's matches already said they want to meet you!",  // message
        alertCallback,                  // callback to invoke
        'Woohoo!',            // title
        'Ok!'             // buttonLabels
      );
    };

    $scope.yes = function(){
      $ionicLoading.show({
        templateUrl: "views/loading.html"
      });
      viewedUser();      

      $http.post(server+'api/postLike', {liker: $scope.user.fid, likee: $scope.match.fid}).success(function(data){
        $ionicLoading.hide();
        if (data === 'match'){
          match();
        } else {
          $scope.showPopup();
          $http.post(server+'api/emailer', {type: 'informLike', userFid: $scope.user.fid, friendFid: '', matchFid: $scope.match.fid}).success(function(data){
          });
          // $scope.openModal();
          // options: 1) nothing, 2) ping the person, 3) ask friend for intro
          //$scope.next();
        }
      }).error(function(err){alert('Error in postLike');});

      mixpanel.track('Match.yes');
      mixpanel.track('Match.swipe');
    };

    var match = function(){
      $http.post(server+'api/addMatch', {userFid: $scope.user.fid, matchFid: $scope.match.fid}).success(function(data){
        $http.post(server+'api/pushNotification', {fid: $scope.match.fid, tagType: 'unseenMatches', message: 'You have a match!'}).success(function(data){
        }).error(function(data){console.log(err);});
        if(navigator.notification!=null){
          navigator.notification.alert(
            "Start chatting!",  // message
            toChat,                  // callback to invoke
            'It\'s a match! Congratulations!',            // title
            'Ok!'             // buttonLabels
          );
        }
        mixpanel.track('Match.addMatch');
        DataLoadFinished();
      }).error(function(err){alert('Error in matching');DataLoadFinished();});
    };
    $scope.no = function(){
      $ionicLoading.show({
        templateUrl: "views/loading.html"
      });
      viewedUser();                       // save reject to viewedUsers
      $scope.next();

      $ionicScrollDelegate.scrollTop();
      mixpanel.track('Match.no');
      mixpanel.track('Match.swipe');
    };

    var viewedUser = function(){
      $http.post(server+'api/viewedUser', {fid: $scope.user.fid, matchFid: $scope.match.fid}).success(function(data){
      }).error(function(err){alert('Error in viewedUser');});
    };

    var toMain = function(){
      $location.path('/tab/feed');
      $scope.$apply();
    };
    var toChat = function(){
      matchData.setUser($scope.match);
      $location.path('/tab/chat');
      $scope.$apply();
    };

    $scope.next = function(){
      $ionicLoading.show({
        templateUrl: "views/loading.html"
      });
      if (currentMatch < matchListLength - 1){
        $scope.slideStartIndex++;
        currentMatch++;
      } else {
        $ionicLoading.hide();
        if(navigator.notification!=null){
          navigator.notification.alert(
            "You'll get more matches if more of your friends join. Check again tomorrow at noon ET for new matches",  // message
            toMain,                  // callback to invoke
            'No more matches today, sorry!',            // title
            'Ok'             // buttonLabels
          );
        }
      }

      $scope.matches[currentMatch].firstname = $scope.matches[currentMatch].name.split(' ')[0];
      $scope.match = $scope.matches[currentMatch];
      if ($scope.match.latlon){
        $scope.match.distance = Math.ceil(services.getDistance($scope.match.latlon[1], $scope.match.latlon[0], $scope.user.latlon[1], $scope.user.latlon[0]));
      }
      fetchPosts();

      $scope.currentSlide = 0;
      services.createTagArray($scope.match.tags);
      $scope.matchTags = services.getTagArray();
    };
    var promptOptions = function(option){
      if (option === 2){
        createMutualFriendArray();
        $scope.friendIntroModal.show();
      } else {
        $scope.next();
      }
    }
    $scope.messageFriend = function(index){
      $http.post(server+'api/emailer', {type: 'askForIntro', userFid: $scope.user.fid, friendFid: $scope.mutualFriendList[index].fid, matchFid: $scope.match.fid}).success(function(data){
      // $http.post(server+'api/emailer', {type: 'askForIntro',userFid: $scope.mutualFriendList[index].fid, friendFid: $scope.user.fid, matchFid: $scope.match.fid}).success(function(data){
        $scope.next();
      }).error(function(err){alert('Err in prompt');});
      $scope.friendIntroModal.hide();
      navigator.notification.alert(
        'Message sent',  // message
        alertDismissed,         // callback
        'Sent!',            // title
        'Ok'                  // buttonName
      );
      mixpanel.track('Match.askedForIntro');
    };

    $scope.showPopup = function() {
      if(navigator.notification!=null){
        navigator.notification.confirm(
          "You're not a match yet, but you can still get an intro! Message a mutual friend asking for an intro",  // message
          promptOptions,                  // callback to invoke
          'Get connected!',               // title
          ['Next match','Ask for intro']             // buttonLabels
        );
      }
    };
    var alertDismissed = function(){};

    $scope.viewMutualFriends = function(){
      $http.post(server+'api/fetchMutualFriends', {userFriends: $scope.user.friends, matchFriends: $scope.match.friends}).success(function(data){
        var friendNameList = [];
        for (var i = 0; i < data.length; i++){
          friendNameList.push(data[i].name);
        };
        navigator.notification.alert(
          friendNameList.join(', '),  // message
          alertDismissed,         // callback
          'Mutual Friends',            // title
          'Got it!'                  // buttonName
        );

      });
    };

    var createMutualFriendArray = function(){
      $http.post(server+'api/fetchMutualFriends', {userFriends: $scope.user.friends, matchFriends: $scope.match.friends}).success(function(data){
        $scope.mutualFriendList = [];
        for (var i = 0; i < data.length; i++){
          $scope.mutualFriendList.push({name: data[i].name, fid: data[i].id});
        }
        DataLoadFinished();
      });
    };
  

  $scope.report=function(){
    var msg = 'See something inappropriate or offensive? We take these incidents seriously. Please click "Report" below to report inappropriate activity and so we can take the appropriate actions. Thank you!';
    services.report(msg, $scope.user.fid, $scope.match.fid);
  };
  $scope.onMatchesPage = $location.path() === '/tab/matches';

  var fetchPosts = function(){
    $http.post(server+'api/fetchUserPosts',{fid: $scope.match.fid}).success(function(data){
      $scope.match.isFriend = false;
      data = services.checkPostsVisible(data, $scope.match);
      $scope.matches[currentMatch].posts=services.preparePosts(data,$scope.user.fid);
      $scope.posts = services.preparePosts(data, $scope.user.fid);
      $scope.matches[currentMatch].posts=$scope.posts;
      $ionicLoading.hide();
      DataLoadFinished();
      console.log("Loaded:"+$scope.$$childHead.$$childHead.$$childHead.isDataLoaded);
    }).error(function(err){alert('Err in prompt');$ionicLoading.hide(); DataLoadFinished();});
  };

  function preloadImages(array) {
    if (!preloadImages.list) {
      preloadImages.list = [];
    }
    for (var i = 0; i < array.length; i++) {
      var img = new Image();
      img.onload = function() {
        var index = preloadImages.list.indexOf(this);
        if (index !== -1) {
          // remove this one from the array once it's loaded
          // for memory consumption reasons
          //preloadImages.splice(index, 1);
        }
      }
      preloadImages.list.push(img);
      img.src = array[i];
    }
  }

  function DataLoadFinished(){
    if($scope.$$childHead.$$childHead.$$childHead.isDataLoaded!=null){
      console.log("Loaded");
      $scope.$$childHead.$$childHead.$$childHead.isDataLoaded=true;
    }
  }

  services.checkin('matches');
}]);


