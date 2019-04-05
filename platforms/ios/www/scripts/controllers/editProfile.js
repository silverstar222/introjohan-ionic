angular.module('revealApp.controller.editProfile', [])
  .controller('EditProfileCtrl', ['$scope', '$window', '$http', '$location', '$ionicLoading', 'userData', 'spinner', 'serverInfo', 'albumData', '$timeout', '$ionicModal', 'services', '$ionicPopup', function ($scope, $window, $http, $location, $ionicLoading,userData, spinner,serverInfo,albumData,$timeout,$ionicModal,services,$ionicPopup) {
  	$scope.userIcon = "<img src='img/intro3_white_cropped.png' class='title centerItem headerLogo'>";
    mixpanel.track('EditProfile');
    var tempIndex;
    var tempType;
    $scope.viewingPage = 'posts';
    // $scope.imageStatus = {loaded: false};
    $ionicLoading.show({
      templateUrl: "views/loading.html"
    });
    console.log('image loading');
    $scope.loadedImage = function(){
      $scope.photoLoaded = true;
      $ionicLoading.hide();
      console.log('image loaded');
    };
    var initializing = true;
    $scope.popup = {stopShowing: false};
    $scope.user = userData.getUser();
    $scope.vars = {available: undefined};
    $scope.posts = []; // so length = 0 initially
    $scope.morePosts = true;
    fetchPostsLimit = 30; // sync w/ server
    var server = serverInfo.getServer();

    services.checkServer(function(){}, function(){
      $scope.user = null;
      $scope.friendData = null;
      $location.path('/login');
    }, $scope.user.fid);
    $scope.checkStatus = [];
    
    userData.data.unreadTags = 0;
    $http.post(server+'api/resetBadge', {fid: $scope.user.fid, tagType: 'unreadTags'}).success(function(){
    });
    $http.post(server+'api/fetchFlags', {fid: $scope.user.fid}).success(function(data){
      $scope.user.flags = data.length;
    });
    // should put this in a service
    $scope.hideFirstTime = function(){
      $http.post(server+'api/changeFirst', {fid: $scope.user.fid, page: 'Login'}).success(function(){
      });
      $scope.firstTime=false;
    };
    var alertCallback = function(){};
    $http.post(server+'api/checkFirst', {fid: $scope.user.fid, page: 'Login'}).success(function(data){
      $scope.firstTime = data['firstLogin'];
      // if ($scope.firstTime){
        // var alertPopup = $ionicPopup.alert({
        //   title: 'Welcome!',
        //   scope: $scope,
        //   template: "Add photos and describe yourself. The 'About me' will only be shown to matches, not your friends. Control who sees posts you're in from this page in the 'My Posts' section. An example has been created below<br><br><input type='checkbox' ng-model='popup.stopShowing'> <span ng-click='popup.stopShowing = !popup.stopShowing'>Got it, don't show this again!</span>"
        // });
        // alertPopup.then(function(res) {
        //   if ($scope.popup.stopShowing){
        //     $http.post(server+'api/changeFirst', {fid: $scope.user.fid, page: 'Login'}).success(function(){
        //     });
        //   }
        // });
      // }
    }).error(function(err){console.log(err);});
    $scope.fullImageSource = albumData.getImage();
    $scope.user.about = $scope.user.about || '';
    $scope.user.feet = $scope.user.feet || '';
    $scope.user.referral = $scope.user.referral || '';
    $scope.user.occupation = $scope.user.occupation || '';
    $scope.user.religion = $scope.user.religion || '';
    if ($scope.user.relationship_status === 'Available' || $scope.user.relationship_status === undefined){
      $scope.vars.available = true;
    } else {
      $scope.vars.available = false;
    }
    if ($scope.user.inches >= 0){
      $scope.user.inches = $scope.user.inches;
    } else {
      $scope.user.inches = '';
    }
    var fidLookup = {};
    var fetchMyTags = function(){
      $http.post(server+'api/fetchMyTags', {fid: $scope.user.fid}).success(function(data){
        $scope.user.tags = data.tags;
        $scope.user.comments = data.comments;
        $scope.user.customTags = data.customTags;
        services.createTagArray($scope.user.tags);
        $scope.userTags = services.getTagFidsArray();
        fetchMyTagNames();
      });
      fetchPosts();
      fetchFriendRequests();
    };
    var fetchPosts = function(){
      $http.post(server+'api/fetchUserPosts',{fid: $scope.user.fid, skip: $scope.posts.length}).success(function(data){
        $scope.posts.push(services.preparePosts(data, $scope.user.fid));
        $scope.posts = _.flatten($scope.posts);
        $scope.posts = _.uniq($scope.posts);
        watchPosts();
        // Below 'checkstatus' is to create an array for the checkboxes that is indifferent to if it's poster or user
        for (var i = 0; i < data.length; i++){
          if ($scope.posts[i].image){
            // $scope.posts[i].image['midUrl'] = $scope.posts[i].image.url.split('-small')[0]+'-mid'+$scope.posts[i].image.url.split('-small')[1];
          }
          if (data[i].posterFid === $scope.user.fid){
            $scope.checkStatus.push(data[i].poster);
          } else {
            for (var j = 0; j < data[i].users.length;j++){
              if (data[i].users[j].fid === $scope.user.fid){
                $scope.checkStatus.push(data[i].users[j]);
              }
            }
          }
        }
        if (data.length < fetchPostsLimit){
          $scope.morePosts = false;
        }
      });
    }; 
    var watchPosts = function(){
      for (var i = 0; i < $scope.posts.length; i++){
        $scope.$watch('posts['+i+']', function(newValue, oldValue) {
          if (initializing) {
            $timeout(function() { initializing = false; });
          } else {
            var index;
            for (var j = 0; j < $scope.posts.length; j++){
              if ($scope.posts[j] === newValue){
                index = j;
              }
            }
            $http.post(server+'api/toggleFeedVisibility', {post: $scope.posts[index]});
          }
        }, true);
      }
    }
    var fetchFriendRequests = function(){
      $http.post(server+'api/fetchFriendRequests',{fid: $scope.user.fid}).success(function(data){
        $scope.user.friendRequests = data;
      });
    }
    $scope.loadMore = function(){
      fetchPosts();
    };
    fetchMyTags();
    var fetchMyTagNames = function(){
      $http.post(server+'api/fetchMyTagNames', {tags: $scope.user.tags}).success(function(data){
        fidLookup = data;
        for (var i = 0; i < $scope.userTags.length; i++){
          for (var friend in $scope.userTags[i][1]){
            $scope.userTags[i][1][friend] = fidLookup[friend];
            
          }
        }
        
        $ionicLoading.hide();
      });
    };
    $scope.deleteTag = function(tag, tagger, index1, index2){
      var confirmDelete = function(index){
        if (index === 2){
          for (var cat in $scope.user.tags){
            if ($scope.user.tags[cat][tag]){
              for (var friend in $scope.user.tags[cat][tag]){
                // if friend matches, delete
                if ($scope.user.tags[cat][tag][friend] === tagger){
                  delete $scope.user.tags[cat][tag][friend];
                  // if tag is empty, delete tag from both obj & array
                  if (Object.keys($scope.user.tags[cat][tag]).length === 0){
                    delete $scope.user.tags[cat][tag];
                    $scope.userTags.splice(index1, 1);
                  }
                }
              }
              
            }
          }
          $http.post(server+'api/saveTags', {tags: $scope.user.tags, fid: $scope.user.fid}).success(function(){

          }).error(function(){alert('error in savetags');});
        } 
        // services.createTagArray($scope.user.tags);
        // $scope.userTags = services.getTagFidsArray();
      };
      navigator.notification.confirm(
        '',  // message
        confirmDelete,              // callback to invoke with index of button pressed
        'Delete this tag?',            // title
        ['Cancel','Remove']          // buttonLabels
      );
    };

    var serverTest = function(input){
      $http.post(server+'api/serverTest', {input: input}).success(function(){
      });
    };
    $scope.albums = [];

    $scope.addPhoto = function() {
      $ionicLoading.show({
        templateUrl: "views/loading.html"
      });
      $ionicModal.fromTemplateUrl('views/albumsModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.albumsModal = modal;
        $scope.albumsModal.show();
        $ionicLoading.hide();
      });
    };
    $scope.closeAlbumsModal = function() {
      $scope.albumsModal.hide();
    };     

    $scope.$watch('vars.available', function(newValue, oldValue) {
      if ($scope.vars.available === true){
        $scope.user.relationship_status = 'Available';
      } else {
        $scope.user.relationship_status = 'In a relationship';
      }
      $http.post(server+'api/updateProfile', {fid: $scope.user.fid, property: 'relationship_status', value: $scope.user.relationship_status});
    }, true);

    $scope.updateField = function(propName, model){
      $http.post(server+'api/updateProfile', {fid: $scope.user.fid, property: propName, value: $scope.user[model]});
    };
    $scope.$watch('user.referral', function(newValue, oldValue) {
      var regObj = {
        "name": $scope.user.name,
        "fid": $scope.user.fid,
        "gender": $scope.user.gender,
        "age":$scope.user.age,
        "referrer": $scope.user.referral
      };
      mixpanel.register_once(regObj);
    }, true);

    $scope.fetchAlbums = function(){
      $scope.albumPhotos = albumData.getAlbum();

      FB.api('/me', {fields: 'albums,photos.limit(100)'}, function(resp){
        // console.log(resp);
        if (resp.error){ alert(JSON.stringify(resp.error));}
        // serverTest(resp.photos.data.length);

        $scope.albums = resp.albums.data;
        // alert(JSON.stringify(resp.albums));
        var batcher = [];
        for (var i = 0; i < resp.albums.data.length; i++){
          batcher.push({method: 'GET', relative_url: '/'+$scope.albums[i].cover_photo+'/picture?redirect=0' });
        }
        
        FB.api('/', 'POST', {
           batch: batcher
         }, function (response) {
          $ionicLoading.hide();
          // var batchResp = [];
          // $scope.batchResp = [];
          for (var i = 0; i < response.length; i++){
            // if (response[i].body){  // Check if there's an image
            var parsed = JSON.parse(response[i].body); 
            if (parsed.error){
              $scope.albums[i].coverUrl = '';
            } else 
            {
              $scope.albums[i].coverUrl = parsed.data.url;
            }
          }
          // Add photos user is tagged in at beginning
          if (resp.photos && resp.photos.data[0]){
            var photosOfMe = {
              id: '1',
              name: 'Photos of me',
              coverUrl: resp.photos.data[0].picture};
            $scope.albums.unshift(photosOfMe);
          }
         });
      });
    };
    $scope.fetchAlbums();
    $scope.albumClick = function(index){
      $ionicLoading.show({
        templateUrl: "views/loading.html"
      });
      var fid = $scope.albums[index].id;
      if (fid==='1'){
        fid = 'me';
      }
      $scope.albumPhotos = [];
      // At some point need to allow more than 200 photos viewing 'load more' option
      FB.api('/'+fid, {fields: 'photos.limit(200)'}, function(resp){
        $scope.closeAlbumsModal();
        for (var i = 0; i < resp.photos.data.length; i++){
          $scope.albumPhotos.push({
            picture: resp.photos.data[i].picture, 
            source: resp.photos.data[i].source});
        }
        albumData.setAlbum($scope.albumPhotos);
        $location.path('/albumView');
        $ionicLoading.hide();
      });
    };


    $ionicModal.fromTemplateUrl('views/imageModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.imageModal = modal;
    });

    $scope.fullImage = function(index){
      albumData.setImage($scope.albumPhotos[index].source);
      $scope.fullImageSource = $scope.albumPhotos[index].source;
      $scope.imageModal.show();
    };
    $scope.closeImageModal = function() {
      $scope.imageModal.hide();
    };

    $scope.savePhoto = function(){
      var photoUrl = albumData.getImage();
      $http.post(server+'api/savePhoto',{fid: $scope.user.fid, photoUrl: photoUrl}).success(function(data){
        $scope.user.profilePhotos.push(photoUrl);
        userData.setUser($scope.user);
        $scope.imageModal.hide();
      }).error(function(err) {alert(err);});
    };

    $scope.$on('$destroy', function() {
    });

    $scope.deletePhoto = function(index){
      $scope.user.profilePhotos.splice(index,1);
      $http.post(server+'api/deletePhoto',{fid: $scope.user.fid, index: index}).success(function(data){
      }).error(function(err) {alert('Error in delete photo');});
    };

    $scope.gotoFilter = function(){
      $location.path('/tab/matchFilter');
    };
    var emptyCallback = function(){};

    var deleteCallback = function(index){
      if (index===2){
        $scope.user[tempType].splice(tempIndex, 1);
        $scope.$apply();
        saveApprovals(tempType);
      }
    };
    var flagCallback = function(index){
      if (index === 2){
        $http.post(server+'api/flagUser', {flagItem: $scope.user[tempType][tempIndex], flaggerId: $scope.user.fid}).success(function(data){
          deleteCallback(2);
        });
      }
    };

    var confirmCallback = function(index){
      if (index === 1){
      }
      if (index === 2){
        navigator.notification.confirm(
        'Flagging this comment will delete it and flag the user; if the user is flagged too many times their account will be suspended', 
        flagCallback, 
        'Are you sure?', 
        ['Cancel', 'Flag']
        );
      }
      if (index === 3){
        navigator.notification.confirm(
          '',
          deleteCallback,
          'Delete this comment?',
          ['Cancel', 'Ok']
          );
      }
      if (index === 4){
        $scope.user[tempType][tempIndex].approved = true;
        $scope.$apply();
        saveApprovals(tempType, $scope.user[tempType][tempIndex].text);
      }
    };
    var saveApprovals = function(type, text){
      $http.post(server+'api/saveApprovals', {type: type, user: $scope.user, text: text, poster: $scope.user[tempType][tempIndex].fid}).success(function(data){

      });
    };

    $scope.approvalPopup = function(index, type){
      tempIndex = index;
      tempType = type;
      navigator.notification.confirm(
        '', 
        confirmCallback, 
        'Like the tag?', 
        ['Cancel', 'Flag', 'Delete', 'Yep!']
        );
    };
    $scope.invalidAlert = function(){
      navigator.notification.alert(
          "",
          alertCallback,
          'Sorry! You need a bit more in the "About me" section',
          'Ok!'
        );
    }
    services.checkin('editProfile');

    $scope.sharePost = function(index, type){
      $ionicLoading.show({
        templateUrl: "views/loading.html"
      });
      var postUpdate = function(){
        $http.post(server+'api/updatePost', {post: $scope.posts[index]}).success(function(){
          $ionicLoading.hide();
        });
      }
      // type is friends or nonFriends
      if ($scope.posts[index].posterFid === $scope.user.fid){
        if (!$scope.posts[index].poster){
          $scope.posts[index].poster = {};
          $scope.posts[index].poster[type] = true;
        } else {
            if ($scope.posts[index].poster[type] === true){
            $scope.posts[index].poster[type] = false;
          } else {
            $scope.posts[index].poster[type] = true;
          }
        }
        // $scope.posts[index] = $scope.posts[index];
        // $scope.posts[index].poster[type] = !$scope.posts[index].poster[type] || true;
        postUpdate();
      } else {
        for (var i = 0; i < $scope.posts[index].users.length; i++){
          if ($scope.posts[index].users[i].fid === $scope.user.fid){
            if (!$scope.posts[index].users[i][type]){
              $scope.posts[index].users[i][type] = true;  
            } else {
              $scope.posts[index].users[i][type] = false;
            }
            // $scope.posts[index].users[i][type] = !$scope.posts[index].users[i][type] || true;
          }
        }
        postUpdate();
      }
    };
    $scope.toggleFeedVisibility = function(index){
      $scope.posts[index].publicPost = !$scope.posts[index].publicPost;
      $http.post(server+'api/toggleFeedVisibility', {post: $scope.posts[index]}).success(function(data){

      });
    };
    $scope.requestAccept = function(index){
      $http.post(server+'api/friendRequestAccept', {userFid: $scope.user.fid, userName: $scope.user.name, requesterFid: $scope.user.friendRequests[index].fid, requesterName: $scope.user.friendRequests[index].name}).success(function(data){
        $scope.user.friendRequests.splice(index, 1);
        navigator.notification.alert(
          '',
          emptyCallback,
          'Friend added!',
          'Ok!'
          );
      });
    }
    $scope.requestReject = function(index){
      $http.post(server+'api/friendRequestReject', {userFid: $scope.user.fid, requesterFid: $scope.user.friendRequests[index].fid}).success(function(data){
        $scope.user.friendRequests.splice(index, 1);
        navigator.notification.alert(
          '',
          emptyCallback,
          'Friend request removed',
          'Ok!'
          );
      });
    };
}]);

