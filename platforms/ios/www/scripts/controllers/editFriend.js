angular.module('revealApp.controller.editFriend', [])
  .controller('EditFriendCtrl', ['$scope', '$http', '$location', 'spinner', 'userData', 'friendData', 'serverInfo', '$ionicLoading', 'services', '$ionicSideMenuDelegate', '$ionicModal', '$parse', '$state', '$timeout', '$ionicScrollDelegate', function ($scope, $http, $location, spinner,userData, friendData,serverInfo,$ionicLoading,services,$ionicSideMenuDelegate,$ionicModal,$parse,$state,$timeout,$ionicScrollDelegate) {
  // .controller('EditFriendCtrl', ['$scope', '$http', '$location', 'spinner', 'userData', 'friendData', 'serverInfo', '$ionicLoading', 'services', '$ionicSideMenuDelegate', '$ionicModal', '$parse', '$ionicSwipeCardDelegate', '$state', '$timeout', '$ionicScrollDelegate', function ($scope, $http, $location, spinner,userData, friendData,serverInfo,$ionicLoading,services,$ionicSideMenuDelegate,$ionicModal,$parse,$ionicSwipeCardDelegate,$state,$timeout,$ionicScrollDelegate) {
    // Not using this file currently


    $scope.user = userData.getUser();
    var server = serverInfo.getServer();
    $scope.userDetails = false;
    // if some value from server is true, fetch the list and save locally
    // if we have the local list, use it and save it locally
    // otherwise, this list is $scope.user...
    var cardsFriendList;
    // This is for introfriends modal
    var setIntroFriendsModalList = function(){
      $scope.friendList = cardsFriendList;
      for (var i = 0; i < $scope.friendList.length; i++){
        if ($scope.friendList[i].fid === $scope.user.fid){
          $scope.friendList.splice(i,1);
        }
        if ($scope.friendList[i].fid){
          $scope.friendList[i].id = $scope.friendList[i].fid;
        }
      }
    }
    if (services.getCardsFriendList()){
      cardsFriendList = services.getCardsFriendList();
      // console.log(cardsFriendList);
      setIntroFriendsModalList();
      console.log('here1');
      continuation();
    } else {
      console.log('here2a');
      $http.post(server+'api/checkCardsFriendList', {fid: $scope.user.fid}).success(function(data){
          console.log('here2');

        if (data.rankedList){
          console.log('here3a');
          // for (var i = 0; i < data.rankedList; i++){
          //   data.rankedList[i].fid = data.rankedList[i].id;
          // }
          cardsFriendList = data.rankedList;
          services.setCardsFriendList(data.rankedList);
          setIntroFriendsModalList();
          continuation();
        } else {
          console.log('here3');
          cardsFriendList = $scope.user.friends.data;
          setIntroFriendsModalList();
          continuation();
        }

      });
    }

    function continuation(){
      
    // services.checkKill();
    // $scope.user = {fid: '1601373', "friends" : {
    //     "data" : [ 
    //         {
    //             "name" : "Dan Kanivas",
    //             "id" : "665"
    //         }, 
    //         {
    //             "name" : "Allison Tanenhaus",
    //             "id" : "3366"
    //         }, 
    //         {
    //             "name" : "Sarah Schacter",
    //             "id" : "6335"
    //         }, 
    //         {
    //             "name" : "Kevin Tung",
    //             "id" : "100524"
    //         }, 
    //         {
    //             "name" : "Edward Kim",
    //             "id" : "104991"
    //         }, 
    //         {
    //             "name" : "Roger Kwan",
    //             "id" : "106863"
    //         }]}};
    // Either take the user clicked on, or pick random friend
    if (services.getPassedData()){
      $scope.friend = friendData.getFriend();  
    } else {
      var randomFriend = cardsFriendList[Math.floor(Math.random()*cardsFriendList.length)];
      $scope.friend = randomFriend;
    }

    $scope.highlight = false;
    var randomIndex = [];
    $scope.featuredFriends = [];
    var selectFeatures = function(){
      for (var i = 0; i < 3; i++){
        randomIndex.push(Math.floor(Math.random()*cardsFriendList.length));
        $scope.featuredFriends.push(cardsFriendList[randomIndex[i]]);
      }
      // DO WE NEED BELOW LINE??????
      // $scope.friend = $scope.featuredFriends[0];
    };
    selectFeatures();
    $scope.pickFeature = function(index){
      // $scope.selectFriend(randomIndex+index)
      var friend = cardsFriendList[randomIndex[index]];
      // console.log(friend);
      // serverTest(friend);
      friendData.setFriend(friend);
      // spinner.show();
      $ionicLoading.show({
        templateUrl: "views/loading.html",
          // template: 'Loading...'
        });
      $location.path('/tab/editFriend/default');
    };
  //     $scope.friend = { name: 'Fred Fakefriend',
  // fid: '704645',
  // profilePhotos: [ 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xfa1/t1.0-1/c34.4.216.216/1000260_10100112981560848_1947986849_n.jpg' ],
  // };
    
    var fetchFriend = function(cb){
      console.log($scope.friend.fid);
      $http.post(server+'api/fetchFriend', {fid: $scope.friend.fid}).success(function(data){
        $scope.friend = data;
        console.log('$scope.friend:');
        console.log($scope.friend);
        services.createTagArray($scope.friend.tags);
        $scope.friendTags = services.getTagArray();
        runTagProcess();
        if (cb){
          cb();
        }
      });
    };
    // If viewing partial profile
    if ($location.path()!=='/tab/friendCards'){
      fetchFriend();
    }
    $scope.filtered = {friends: []};
    $scope.limit = 10;
    var arr = services.getPlaceholderTags();
    var fetchContent = function(cb){
      $http.post(server+'api/fetchContent', {type: 'PlaceholderTags'}).success(function(data){
        arr = data;
        selectRandomPlaceholder();
        services.setPlaceholderTags(data);
        cb();
      });
    }
    var selectRandomPlaceholder = function(){
      var randomIndex=[];
      var resume = function(){
        randomIndex = Math.floor(Math.random()*arr.length);
        if (randomIndex>arr.length-3){
          randomIndex = arr.length-randomIndex;
        }
        $scope.placeholderText = [arr[randomIndex], arr[randomIndex+1], arr[randomIndex+2]];
      };
      if (arr === undefined){
        fetchContent(function(){
          resume();
        });
      } else {
        resume();
      }
    };
    
  
    $ionicLoading.hide();

  
    $scope.comment = {comment: ''};
    $scope.newTag = {tag: ''};
    
    // $scope.toggleLeft = function() {
    //   $ionicSideMenuDelegate.toggleLeft();
    // };

    var alertCallback = function(){};
    $http.post(server+'api/checkFirst', {fid: $scope.user.fid, page: 'EditFriend'}).success(function(data){
      $scope.firstTime = data['firstEditFriend'];
      // if ($scope.firstTime){
      //   navigator.notification.alert(
      //     "Pick tags to tell people about your friend, or intro them to others!",
      //     alertCallback,
      //     'Intro your friend',
      //     'Ok!'
      //   );
      // }
      // $http.post(server+'api/changeFirst', {fid: $scope.user.fid, page: 'EditFriend'}).success(function(){
      // });
    }).error(function(err){console.log(err);});
    services.checkin('editFriend');
    
    services.checkServer(function(){}, function(){
      $scope.user = null;
      $scope.friendData = null;
      $location.path('/login');
    }, $scope.user.fid);
    var userTags;
    var changedTags = {looks: {}, traits: {}, activities: {}};

    var isInArray = function(value, array) {
      return array.indexOf(value) > -1;
    };
    // var server = 'http://192.168.2.11:3000/';
    mixpanel.track('EditFriend');
    
    var serverTest = function(input){
      $http.post(server+'api/serverTest', {input: input}).success(function(){
        // spinner.hide();
      });
    };
    
    $scope.tagClicks = [];
    $scope.randomIndex = {looks: [], traits: [], activities: []};
    var selectTags = function(array,type){
      var tempArr = [];
      var i=0;
      while (i<7){
        $scope.randomIndex[type][i] = Math.floor(Math.random()*array.length);
        tempArr.push(array[$scope.randomIndex[type][i]]);
        tempArr = _.uniq(tempArr);
        i=tempArr.length;
      }
      return _.uniq(tempArr);
    };
 
    var setRandomTags = function(){
      $scope.tagsRandomLooks = selectTags($scope.tagsLooks, 'looks');
      $scope.tagsRandomTraits = selectTags($scope.tagsTraits, 'traits');
      $scope.tagsRandomActivities = selectTags($scope.tagsActivities, 'activities');
    };

    $http.post(server+'api/fetchContent', {type: 'Tags'}).success(function(data){
      $scope.tagsLooks = data.looks;
      $scope.tagsTraits = data.traits;
      $scope.tagsActivities = data.activities;
      setRandomTags();
      if ($location.path()==='/tab/friendCards'){
        console.log('adding card');
        if (!$scope.firstTime){
          $scope.addCard();
        }
      }
    });
    
    var runTagProcess = function(){
      var looksKey  = {};
      var traitsKey = {};
      var activitiesKey = {};
      $scope.selected = {looks: {}, traits: {}, activities: {}, randomLooks: {}, randomTraits: {}, randomActivities: {}};
      
      
      for (var i = 0; i < $scope.tagsLooks.length; i++){
        $scope.selected.looks[i] = false;
        looksKey[$scope.tagsLooks[i]] = i;
      }
      for (var i = 0; i < $scope.tagsTraits.length; i++){
        $scope.selected.traits[i] = false;
        traitsKey[$scope.tagsTraits[i]] = i;
      }
      for (var i = 0; i < $scope.tagsActivities.length; i++){
        $scope.selected.activities[i] = false;
        activitiesKey[$scope.tagsActivities[i]] = i;
      }
      // Highlight appropriate tags
    	// $http.post(server+'api/fetchUserTags', {fid: $scope.friend.fid}).success(function(data){
        // from fetchfriend, tags = user.tags which was data here
   	// }).error(function(err){alert('Error fetching user tags');});
      userTags = $scope.friend.tags || {looks: {}, traits: {}, activities: {}};
      for (var cat in $scope.friend.tags){
        for (var tag in $scope.friend.tags[cat]){
          for (var tagger in $scope.friend.tags[cat][tag]){
            if (tagger === $scope.user.fid){
              var randomCat = 'random'+cat[0].toUpperCase()+cat.slice(1);
              var arrName = 'tagsRandom'+cat[0].toUpperCase()+cat.slice(1);
              highlightTag(cat, eval(cat+'Key')[tag]);
              highlightTag(randomCat, _.indexOf($parse(arrName)($scope), tag));
            }
          }
        }
      }
    };


    var highlightTag = function(type, index){
      $scope.selected[type][index] = !$scope.selected[type][index];
      // if ($scope.selected[type][index]){ // if it's now highlighted
      //   $scope.friendTags.push($scope.selected[type][index]);
      // }
    };
    $scope.selectTag = function(type, index){
      highlightTag(type, index);
      var shortType = type;
      var tagArr = 'tags'+type.split('')[0].toUpperCase()+type.slice(1);
      if (type.split('random')[1]){ // if random
        shortType = type.split('random')[1].toLowerCase();
        var shortArrName = 'tags'+shortType.split('')[0].toUpperCase()+shortType.slice(1);
        var tempShortIndex = _.indexOf($parse(shortArrName)($scope), $scope[tagArr][index]);
        if (tempShortIndex>-1){
          highlightTag(shortType, _.indexOf($parse(shortArrName)($scope), $scope[tagArr][index]));
        }
      } else {
        var longType = 'random'+type.split('')[0].toUpperCase()+type.slice(1);
        var randomArrName = 'tags'+longType.split('')[0].toUpperCase()+longType.slice(1);
        var tempRandomIndex = _.indexOf($parse(randomArrName)($scope), $scope[tagArr][index]);
        if (tempRandomIndex>-1){
          highlightTag(longType, _.indexOf($parse(randomArrName)($scope), $scope[tagArr][index]));
        }
      }
      $http.post(server+'api/postTag', {type: shortType, tag: $scope[tagArr][index], userFid: $scope.user.fid, friendFid: $scope.friend.fid}).success(function(data){
        // Fetch friend here as a lazy way of updating tag state for friend details view
        fetchFriend();
        $http.post(server+'api/pushNotification',{fid: $scope.friend.fid, tagType: 'unreadTags', message: 'Someone tagged you!'}, function(){
        });
        $http.post(server+'api/emailer', {type: 'tagNotification', userFid: $scope.user.fid, friendFid: $scope.friend.fid, matchFid: ''}).success(function(data){
        });
      });
      mixpanel.track('EditFriend.AddTag');
    };

    $scope.friendSelection = false;
    $scope.selectFriend = function(friend){
      console.log(friend);
      $scope.match = friend;
      console.log('=============================');
      console.log($scope.match);
      if ($scope.match.id){
        $scope.match.fid = $scope.match.id;
      }
      $scope.highlight = true;
      $scope.friendSelection = true;
    };
    $scope.cancelSelection = function(){
      $scope.friendSelection = false;
      $scope.match = undefined;
    };

    $scope.loadMore = function(){
      // alert($scope.limit);
      $scope.limit = $scope.limit+80;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    };
    $scope.keyPress = function(){
      console.log('here');
      $ionicScrollDelegate.scrollTop();
    };
    $scope.introFriends = function(){
      $ionicLoading.show({
        templateUrl: "views/loading.html"
      });
      // console.log('$scope.match');
      // console.log($scope.match);
      $http.post(server+'api/introFriends', {friendFid: $scope.friend.fid, matchFid: $scope.match.fid, userFid: $scope.user.fid}).success(function(data){
        $http.post(server+'api/emailer', {type: 'giveAnIntro', userFid: $scope.user.fid, friendFid: $scope.friend.fid, matchFid: $scope.match.fid}).success(function(data){
          $ionicLoading.hide();
          navigator.notification.alert(
            "We've sent each of them a message and added them to the front of each others' Intro lists. Hope it works out!",  // message
            alertCallback,                  // callback to invoke
            'Intro sent!',            // title
            'Ok!'             // buttonLabels
          );
          mixpanel.track('introFriendsSent');
          $scope.friendCardsIntroModal.hide();
        }).error(function(){$ionicLoading.hide();});
      // $location.path('/tab/editFriend/default');
      }).error(function(){$ionicLoading.hide();});
    };
    $scope.back=function(){
      $location.path('/tab/editFriend/default');
    };
    $scope.test = function(thing, thing2){
      console.log('in test');
      $location.path('/tab/editFriend/default');
      console.log(thing+thing2);
      return $scope.tagsLooks;
    };
    $scope.moreTagsArr = function(){
      if ($scope.moreTagsType ==='looks'){
        return $scope.tagsLooks;
      }
      if ($scope.moreTagsType ==='traits'){
        return $scope.tagsTraits;
      }
      if ($scope.moreTagsType ==='activities'){
        return $scope.tagsActivities;
      }
      
    };
    $scope.moreTags = function(type){
      console.log('type is '+type)
      // tagsLooks or tagsRandomLooks
      $scope.moreTagsType = type;
      // $scope.moreTagsArr = window['$scope.tags'+type.split('')[0].toUpperCase()+type.slice(1)];
      $ionicModal.fromTemplateUrl('views/editFriendPartials/moreTagsModal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.moreTagsModal = modal;
          $scope.moreTagsModal.show();
          // $ionicLoading.hide();
        });
    };
    $scope.closeTagsModal = function(){
      $scope.moreTagsModal.hide();
    };
    $scope.allTags = function(){
      $ionicModal.fromTemplateUrl('views/allTags.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.allTagsModal = modal;
        $scope.allTagsModal.show();
        // $ionicLoading.hide();
      });
    };
    $scope.closeAllTagsModal = function(){
      $scope.allTagsModal.hide();
    };

    $scope.saveCustom = function(){
      if ($scope.newTag.tag.length>0){
        $http.post(server+'api/newTag', {tag: $scope.newTag.tag, userFid: $scope.user.fid, userName: $scope.user.name, friendFid: $scope.friend.fid}).success(function(data){
          navigator.notification.alert(
            "Your friend needs to approve the tag before people can see it",
            alertCallback,
            'Tag saved!',
            'Ok'
          );
          $scope.newTag.tag = '';
          // Following is lazy way to update tags for detailed profile 
          fetchFriend();
          $http.post(server+'api/pushNotification',{fid: $scope.friend.fid, tagType: 'unreadTags', message: 'Someone wrote a custom tag about you!'}, function(){
          });
          $http.post(server+'api/emailer', {type: 'tagNotification', userFid: $scope.user.fid, friendFid: $scope.friend.fid, matchFid: ''}).success(function(data){
          });
          // $location.path('/tab/main');

        });
        mixpanel.track('EditFriend.CustomTag');
      }
      
    };
    $scope.location = function(){
      return $location.path();
    };
    // serverTest();

    // var selectType = function(){
    //   var types=['looks', 'activities', 'traits'];
    //   return Math.floor(Math.random*3);
    // }

    // JELLY SWIPE CODE

  console.log('$scope.cards');
  console.log($scope.cards);

    var cardTypes = [
      { title: 'What\'s blah look like?', image: 'https://graph.facebook.com/123/picture?redirect=1&height=9999&width=9999' }
      // ,
      // { title: 'Where is this?', image: 'https://graph.facebook.com/'+$scope.featuredFriends[1].id+'/picture?redirect=1&height=9999&width=9999' }
      
    ];

    $scope.cards = Array.prototype.slice.call(cardTypes, 0, 0);

    var nextFriends = undefined; // fid
    var nextUrls = [];
    var nextImg = [];
    var queue;
    var img;
    function preloadImage(url)
    {
        var img=new Image();
        img.src=url;
        console.log('preloaded'+url);
    }
    // function preloadImages(array) {
    //     if (!preloadImages.list) {
    //         preloadImages.list = [];
    //     }
    //     for (var i = 0; i < array.length; i++) {
    //         img = new Image();
    //         img.onload = function() {
    //             var index = preloadImages.list.indexOf(this);
    //             if (index !== -1) {
    //                 // remove this one from the array once it's loaded
    //                 // for memory consumption reasons
    //                 preloadImages.list.splice(index, 1);
    //             }
    //         }
    //         preloadImages.list.push(img);
    //         img.src = array[i];
    //     }
    // }
    $scope.cardSwiped = function(index) {
      $scope.addCard();
      
    };
    // $scope.cardSwiped();

    $scope.cardDestroyed = function(index) {
      $scope.cards.splice(index, 1);
    };

    // var index = 0;
    var userId;
    var titles = [
      "look like?",
      "like to do?",
      "like?"
      ];
    $scope.addCard = function() {
      if ($scope.firstTime){
        $http.post(server+'api/changeFirst', {fid: $scope.user.fid, page: 'EditFriend'}).success(function(){
        });
      }
      if (services.getPassedData()){
        console.log('getPassedData');
        // $scope.friend = friendData.getFriend();  
        services.setPassedData(false);
      } else {
        // Use queue, or pick random
        if (nextFriends){
          console.log('using nextfriends');
          $scope.friend = nextFriends[0];
          console.log($scope.friend);
          nextFriends.shift();
          nextUrls.shift();
        } else {
          console.log('in this else');
          $scope.friend = cardsFriendList[Math.floor(Math.random()*cardsFriendList.length)];
        }
      }
      selectRandomPlaceholder();
      if ($scope.friend.id){
        $scope.friend.fid = $scope.friend.id;
      }
      friendFid = $scope.friend.fid;
      $scope.randomType = Math.floor(Math.random()*titles.length);
      var title = titles[$scope.randomType];
      var name = undefined;
      console.log('$scope.friend in addcard');
      console.log($scope.friend);

      fetchFriend(function(){
        console.log('$scope.friend.name after fetchfriend:');
        console.log($scope.friend.name);
        if ($scope.friend.name.length>19){
          name = $scope.friend.name.split(' ')[0]+' '+$scope.friend.name.split(' ')[$scope.friend.name.split(' ').length-1][0] +'.';
          if (name.length > 19){
            name = $scope.friend.name.split(' ')[0];
            if (name.length > 19){
              name = name.slice(0,16)+'...';
            }
          }
        }
        var newCard = {
          title: title, 
          name: name || $scope.friend.name,
          // image: img
          image: 'https://graph.facebook.com/'+friendFid+'/picture?redirect=1&height=700&width=700'
        };
        setRandomTags();
        $scope.cards.push(angular.extend({}, newCard));
        // ('https://graph.facebook.com/'+nextFriend.fid+'/picture?redirect=1&height=9999&width=9999');
        mixpanel.track('editFriend.cardAdded');
      });
     

      if (!nextFriends){
        queue = 2;
        nextFriends=[];
      }
      var friend;
      for (var i = 0; i < queue; i++){
        friend = cardsFriendList[Math.floor(Math.random()*cardsFriendList.length)];
        nextFriends.push(friend);
        nextUrls.push('https://graph.facebook.com/'+friend.id+'/picture?redirect=1&height=700&width=700');
      }
      preloadImage(nextUrls[0]);
      preloadImage(nextUrls[1]);
      queue=1;
      // console.log($scope.cards);

    }

    // $scope.goAway = function($scope) {
    //   var card = $ionicSwipeCardDelegate.getSwipebleCard($scope);
    //   card.swipe();
    // };
    $scope.photoClick=function(){
      $state.go('tabs.editFriend.friendDetails');
    };
    $ionicModal.fromTemplateUrl('views/editFriendPartials/friendDetailsModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.friendDetailsModal = modal;
    });
    $ionicModal.fromTemplateUrl('views/editFriendPartials/friendCardsIntroModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.friendCardsIntroModal = modal;
    });
    $scope.viewDetails = function(){
      $scope.friendDetailsModal.show();
        // $ionicLoading.hide();
    };
    $scope.showing = true;
    $scope.showIntroFriend = function(){
      $scope.friendDetailsModal.hide();
      $scope.friendCardsIntroModal.show();
      // $scope.showing = !$scope.showing;
    };
// }); // this is kind of ridiculous
}
  	
}]);
