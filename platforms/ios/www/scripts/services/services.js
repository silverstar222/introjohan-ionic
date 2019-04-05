angular.module("revealApp.service.services", [])
  .factory('services', ['$http', 'serverInfo', '$ionicLoading', '$rootScope', '$timeout', '$q', '$location', 'userData', function ($http,serverInfo,$ionicLoading,$rootScope,$timeout,$q,$location,userData) {
    var matchTags = [];
    var matchTagsFids = [];
    var friends = [];
    var friendList;
    var socket;
    var posts;
    var geoPosts;
    var friendPosts;
    var lat, lon;
    var cardsFriendList;
    var passedData = false;
    var tempTime = undefined;
    var placeholderTags = undefined;
    var version = '0.1.1';
    var server = serverInfo.getServer();
    var alertCallback = function(){};
    var user = {};
    var match = {};
    var cbfunc;
    var reportCallback = function(results){
      if (results.buttonIndex===2){
        $http.post(server+'api/reportUser',{fid: user.fid, matchFid: match.fid, comment: results.input1}).success(function(data){
          navigator.notification.alert(
          'Report submitted! Thank you for your help in keeping Intro a good environment for our users!', 
          alertCallback, 
          'Thanks!',
          'Ok');  
        });
      }
    };
    var postGeo = function(user, cb){
      var geoSuccess = function(position){
        $http.post(server+'api/postGeo', {fid: user.fid, position: position}).success(function(data){
          if (data!=='true'){
            navigator.notification.alert(
            'Intro may not be available in your area yet, or you may need to turn on location preferences for Intro',
              callbackToLogin,
              'Sorry!',
              'Ok!');
          } else {
            if (user.latlon !== [position.coords.longitude, position.coords.latitude]){
              user.latlon = [position.coords.longitude, position.coords.latitude];
              window.localStorage.setItem('user', JSON.stringify(user));
              userData.setUser(user);
            }
            cb();
          }
        });
      };
      var geoLocationError = function(err){
        var emptyCb = function(){};
        navigator.notification.alert(
          'Your location is needed to help find matches for you. Please change this under Settings-> Privacy-> Location Services, and then log in again. We will never reveal your exact location to any party. You will now be logged out.',
          emptyCb,
          'Sorry!',
          'Ok!');
        $location.path('/login');
        $scope.$apply();
      };
      navigator.geolocation.getCurrentPosition(geoSuccess, geoLocationError);
    };
      var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      var formatDate = function(date){
        var hours = date.getHours();
        var ampm = 'am'
        if (hours>11){
          ampm = 'pm';
        }
        hours = hours % 12;
        if (hours === 0){
          hours = 12;
        }
        var minutes = date.getMinutes();
        if (minutes < 10){
          minutes = '0'+minutes;
        }
        date = months[date.getMonth()] +' '+ date.getDate()+', ' + hours+':' + minutes+ampm;
        return date;
      };
      var localImages = [];
      function preloadImage(url)
      {
        var img = new Image();
        img.src=url;
        localImages.push(img);
      }
    var state = {};
    
    return {
      createTagArray: function(tags){
        matchTags = [];
        matchTagsFids = [];
        for (var cat in tags){
          for (var tag in tags[cat]){
            matchTags.push([tag, Object.keys(tags[cat][tag]).length]);
            matchTagsFids.push([tag, tags[cat][tag]]);
          }
        }
        return matchTags;
      },
      getTagArray: function(){
        return matchTags;
      },
      checkin: function(action){
        var user = userData.getUser();
        $http.post(server+'api/checkin', {'fid': user.fid, 'action': action}).success(function(){
        });
      },
      getTagFidsArray: function(){
        return matchTagsFids;
      },
      setFriendData: function(data){
        friends = data;
      },
      getFriendData: function(){
        return friends;
      },
      setFriendList: function(data){
        friendList = data;
      },
      getFriendList: function(){
        return friendList;
      },
      setSocket: function(data){
        socket = data;
      },
      getSocket: function(){
        return socket;
      },
      setTime: function(data){
        tempTime = data;
      },
      getTime: function(){
        return tempTime;
      },
      setLat: function(data){
        lat = data;
      },
      getLat: function(){
        return lat;
      },
      setLon: function(data){
        lon = data;
      },
      getLon: function(){
        return lon;
      },
      deviceGeoService: function(user, cb){
        postGeo(user, cb);
      },
      setPassedData: function(data){
        passedData = data;
      },
      getPassedData: function(){
        return passedData;
      },
      getVersion: function(){
        return version;
      },
      checkKill: function(cb){
        var killApp = function(){
          $location.path('/login');
          $scope.$apply();
          $ionicLoading.hide();
        };
        $http.post(server+'api/checkKill', {version: version}).success(function(data){
          if (data.opt === 2 || data.opt === 3){
            alert(data.text);
            navigator.notification.alert(
            data.text,
            killApp,
            data.headline,
            'Ok!'
            );
          } else {
            cb();
          }
        });
      },
      setPosts: function(data){
        posts = data;
      },
      getPosts: function(){
        return posts;
      },
      setGeoPosts: function(data){
        geoPosts = data;
      },
      getGeoPosts: function(){
        return geoPosts;
      },
      setFriendPosts: function(data){
        friendPosts = data;
      },
      getFriendPosts: function(){
        return friendPosts;
      },
      setCardsFriendList: function(data){
        cardsFriendList = data;
      },
      getCardsFriendList: function(){
        return cardsFriendList;
      },
      setPlaceholderTags: function(data){
        placeholderTags = data;
      },
      getPlaceholderTags: function(){
        return placeholderTags;
      },

      getStatus: function(){
        $ionicLoading.show({
          template: '<i class="icon ion-loading-c iconLarge"></i><br><div>Fetching posts and people nearby...</div>'
        });
        console.log('in getStatus');
        var deferred = $q.defer();
        if ( window.localStorage.getItem('isLoggedIn') === 'true'){
          console.log('isloggedin is true');
          var user = JSON.parse(window.localStorage.getItem('user'));
          userData.setUser(user);
          // console.log(user);
          postGeo(user, function(){
            $http.post(server+'api/fetchUser', {fid: user.fid}).success(function(data){
              if (data === 'err'){
                $ionicLoading.hide();
                $location.path('/login');
              } else {
                console.log('fetched user');
                userData.setUser(data);
                window.localStorage.setItem('user', JSON.stringify(data));
                $ionicLoading.hide();
                $location.path('/tab/feed');
              }
            });
          });
          
        } else {
          console.log('deferred resolve');
          $ionicLoading.hide();
          deferred.resolve();
        }
        console.log('deferred promise');
        $ionicLoading.hide();
        return deferred.promise;
      },

      preparePosts: function(data, userFid){
        var date;
        for (var i = 0; i < data.length; i++){
          date = new Date(data[i].date);
          data[i].date = formatDate(date);
          if (data[i].subjectFid === userFid || data[i].posterFid === userFid){
            data[i].noVoting = true;
          }
          if (data[i].likes){
            data[i].likesLength = Object.keys(data[i].likes).length;
          } else {data[i].likesLength = 0}
          if (data[i].image){
            preloadImage(data[i].image.url);
          }
        }
        return data;
      },
      checkPostsVisible: function(posts, person){ // check which posts should be visible to this person
        // make new array of just valid ones
        var visiblePosts = [];
        for (var i = 0; i < posts.length; i++){
          // person whose profile is being viewed made the post
          if (posts[i].posterFid === person.fid){
            if (person.isFriend){
              if (posts[i].poster && posts[i].poster.shareFriends){
                visiblePosts.push(posts[i]);
              }
            } else { // non-friend
              if (posts[i].poster && posts[i].poster.shareNonFriends){
                visiblePosts.push(posts[i]);
              }
            }
          } else { // if not poster, need to find which user
            for (var j = 0; j < posts[i].users.length; j++){
              if (posts[i].users[j].fid === person.fid){
                if (person.isFriend){
                  if (posts[i].users[j].shareFriends){
                    visiblePosts.push(posts[i]);
                  }
                } else { // non-friend
                  if (posts[i].users[j].shareNonFriends){
                    visiblePosts.push(posts[i]);
                  }
                }
              }
            }
          }
        }
        return visiblePosts;
      },

      viewEvent: function(postId, cb){
        $http.post(server+'api/fetchSelectedEvent', {_id: postId}).success(function(data){
          cb(data);
        });
      },
      getDistance: function(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var deg2rad = function(deg) {
          return deg * (Math.PI/180);
        };
        var dLat = deg2rad(lat2-lat1); 
        var dLon = deg2rad(lon2-lon1); 
        var a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2)
          ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        d = d * 0.62137 // Convert to miles
        return d;
      },

      checkServer: function(cb, cb2, fid){
        
        $http.post(server+'api/serverTest', {fid: fid, input: 'ServerCheck passed'}).success(function(data){
          if (data === 'suspended'){
            navigator.notification.alert(
            'Your account has been flagged for inappropriate activity. If you think this was an error, please contact us at suspensions@makeanintro.com',
            cb2,                  // callback to invoke
            'Sorry',            // title
            'Ok'             // buttonLabels
            );
            cb2();
          }
          else {
            cb();
          }
        }).error(function(err){
          $ionicLoading.hide();
          navigator.notification.alert(
            'The network seems to be having problems. Please turn on your data or wifi, or try again in a few minutes.',
            cb2,                  // callback to invoke
            'Oh noes!',            // title
            'Ok!'             // buttonLabels
          );
        });
      },
      fetchFriends: function(user){
        // $ionicLoading.hide();
        // $ionicLoading.show({
        //   template: '<i class="icon ion-loading-c iconLarge"></i><br><div>Finding your friends...</div>'
        // });
        FB.api('/me/friends', { fields: 'id,name,picture.width(640).height(640),location,gender,relationship_status,birthday' },  function(response) {
          if (response.error) {
            // alert(JSON.stringify(response.error));
          } else {
            // $ionicLoading.hide();
            // $ionicLoading.show({
            //   template: '<i class="icon ion-loading-c iconLarge"></i><br><div>Finding people nearby...</div>'
            // });
            var friendData = response.data;
            // postFriendData();
            for (var i = 0; i < friendData.length; i++){
              friendData[i].fid = friendData[i].id;
              delete friendData[i].id;
            }
            $http.post(server+'api/postFriendData', {user: user, friendData: friendData, token: user.token}).success(function(data){
              // getLocation();
              }).error(function(err){
                // alert('Error in postFriendData');
                // $ionicLoading.hide();
            });

          }
         })
       },

      report: function(msg, userFid, matchFid){
        console.log('in report');
        user.fid = userFid;
        if (matchFid){
          match.fid = matchFid;
        }
        console.log('in report');
        navigator.notification.prompt(
          msg, 
          reportCallback, 
          'Report user?',
          ['Cancel', 'Report'],
          '(Optional comments)'
        );
      }
    };
  }])
.factory('State', function ($rootScope) {
    // 'use strict';

    var state;
 
    var broadcast = function (state) {
      $rootScope.$broadcast('State.Update', state);
    };
 
    var update = function (newState) {
      state = newState;
      broadcast(state);
    };
    
    var onUpdate = function ($scope, callback) {
      $scope.$on('State.Update', function (newState) {
        callback(newState);
      });
    };
 
    return {
      update: update,
      state: state,
      listen: onUpdate
    };

  });
;