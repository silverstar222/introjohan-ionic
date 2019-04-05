angular.module('revealApp.controller.post', [])
  .controller('PostCtrl', ['$scope', '$http', '$location', '$window', 'userData', 'spinner', 'friendData', 'serverInfo', '$rootScope', '$ionicPopup', '$ionicLoading', 'services', '$ionicScrollDelegate', '$ionicModal', '$timeout', function ($scope, $http, $location, $window, userData, spinner, friendData,serverInfo,$rootScope,$ionicPopup,$ionicLoading,services,$ionicScrollDelegate,$ionicModal,$timeout) {

    mixpanel.track('Post');
    if (cordova){
      cordova.plugins.Keyboard.disableScroll(true);
    }
    $ionicLoading.show({
      templateUrl: "views/loading.html",
    });
    $scope.friendSearch = {name: ''};
    var tempFriends;
    $scope.introLogo = "<img src='img/intro3_white_cropped.png' class='title centerItem headerLogo'>";
    $scope.filtered = {places: [], friends: [], events: []};
    $scope.newEvent = {name: '', duration: '4 hours'};
    $scope.content = { textContent:'', locationSearch: null, publicPost: true};

    $scope.currentName="";                  //Specify the typing name of friend in text area
    $scope.startPos=0;                      //Specify the current editing word's starting position in text area
    var endPos=0;                        //Specify the current editing word's ending position in text area
    $scope.isFriendName=false;              //Specify whether current editing word is friend's name or normal text
    $scope.show=false;                      //Specify whether to show the list of friend or not
    $scope.textareaStyle="postCommentsBox"; //Specify the class of the textbox
    $scope.isKeyboardOpen=true;            //Specify whether the keyboard is opened or not


    var lat;
    var lon;
    var friendNames=",";
    var namesStartPositions=[];               //Start positions of the friends' name in the textarea
    var namesEndPositions=[];                 //End position of the friends' names in the textarea
    var lengthofSpace=0;                      //Length of continuing spaces in current typing word-for substring() function's problem
    var headerHeight=64;                      //Height of top header bar
    var bottomHeight=49;                      //Height of bottom footer
    var focusForced=true;                    //Specify whether text area is focused by manually or not

    var server = serverInfo.getServer();
    $scope.user = userData.getUser();
    var compressedImage;
    services.checkServer(function(){}, function(){
      $scope.user = null;
      $scope.friendData = null;
      $location.path('/login');
    }, $scope.user.fid);
    $scope.selectedFriends = [];
    $scope.popup = {stopShowing: false};
    $http.post(server+'api/checkFirst', {fid: $scope.user.fid, page: 'Post'}).success(function(data){
      $scope.firstTime = data['firstPost'];
      if ($scope.firstTime){
        var alertPopup = $ionicPopup.alert({
          title: 'Create a post',
          scope: $scope,
          template: "People are much more likely to view your profile and match with you if you create posts<br><br>Say what you're up to, where you are, or who you're with<br><br><input type='checkbox' ng-model='popup.stopShowing'> <span ng-click='popup.stopShowing = !popup.stopShowing'>Got it, don't show this again!</span>"
        });
        alertPopup.then(function(res) {
          if ($scope.popup.stopShowing){
            $http.post(server+'api/changeFirst', {fid: $scope.user.fid, page: 'Post'}).success(function(){
            });
          }
        });
      }
      //$ionicLoading.hide();
      fetchRecentTags();
    }).error(function(err){console.log(err);});

    //$http.post(server+'api/fetchFriends', {fid: $scope.user.fid}).success(function(data){
    $http.post(server+'api/fetchFriends', {fid:"2402426"}).success(function(data){
      $scope.user.friends = {data: data};
      userData.setUser($scope.user);
      $scope.friendData = data;
      // THIS SCREWS UP THE ID/FID OF FRIENDS, SHOULD JUST LEAVE AS ID
      for (var i = 0; i < data.length; i++){
        $scope.friendData[i].fid = data[i].id;
        delete $scope.friendData[i].id;
      }
      // THIS SHOULD PROLLY BE CLEANED UP, JUST PUT IN USER      
      services.setFriendData(data);
      $scope.friends=data;
      for(var index=0;index<data.length;index++){
        friendNames+=data[index].name+",";
      }
      $ionicLoading.hide();
    });

    var setUserCity = function(){
      $http.get('https://api.foursquare.com/v2/venues/search?client_id=OBWUSB3VNU5Z43LLFRQJ11LBAYNGHWRJZMUOSD0SR15DWOBP&client_secret=YYMQJDVR0UJ4WAZJLXXF5JGW5UOSWEFDOIN2Z1VLXKJW1VUO&v=20130815&limit=3&ll='+$scope.user.latlon[1]+','+$scope.user.latlon[0]).success(function(data){
        var places = data.response.venues;
        $scope.selectedPlace = undefined;
        var i = 0;
        while (!$scope.selectedPlace){
          if (places[i].location.city){
            $scope.selectedPlace = {location: places[i].location, name: places[i].location.city};
            $scope.user.currentCity = {location: places[i].location, name: places[i].location.city};
          } else {
            i++;
          }
        }
        // console.log($scope.selectedPlace);
        userData.setUser($scope.user);
      });
    }
    if (!$scope.user.currentCity){
      setUserCity();
    } else {
      $scope.selectedPlace = $scope.user.currentCity;
    }

    var fetchRecentTags = function(){
      $http.post(server+'api/fetchRecentTags', {fid: $scope.user.fid}).success(function(data){
        if (data[0]){
          $scope.user.recentlyTagged = data[0].recentlyTagged;
          // addCollectionBuffer();
        }
      });
    };
    var addCollectionBuffer = function(){
      for (var i = 0; i < $scope.user.recentlyTagged.length+2; i++){
        $scope.user.friends.data.unshift({name: '', id: ''});
      }
      // console.log($scope.user.friends.data);
    };

    var fetchEvents = function(){
      lat = $scope.user.latlon[1];
      lon = $scope.user.latlon[0];
      $http.post(server+'api/fetchEvents', {lat: lat, lon: lon, fid: $scope.user.fid}).success(function(data){
        $scope.events = data;
        for (var i = 0; i < data.length; i++){
          $scope.events[i].distance = Math.round(services.getDistance(data[i].latlon[1], data[i].latlon[0], lat, lon)*10)/10;
        }
      });
    };
    $scope.createEvent = function(){
      var number = Number($scope.newEvent.duration.split(' ')[0]);
      if (number===30){
        number = 0.5;
      }
      $http.post(server+'api/createEvent', {lat: lat, lon: lon, name: $scope.newEvent.name, duration: number, creator: {fid: $scope.user.fid, name: $scope.user.name}}).success(function(data){
        $scope.selectedEvent = data;
        $scope.eventsModal.hide();
      });
    };

    $scope.getCamera = function(sourceType){
      var options = {
        quality: 20,
        // destinationType: Camera.DestinationType.DATA_URL,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: sourceType,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
        encodingType: 0,     // 0=JPG 1=PNG
        allowEdit: 0,
        correctOrientation: 1,
        saveToPhotoAlbum: 0
      };
      navigator.camera.getPicture(cameraSuccess, onFail, options);
    };

    $scope.testFilter = function(){
      cameraSuccess('hi');

    };
    // $scope.testFilter();
    // $scope.testFilter2 = function(){
    //   console.log('running');
    //   Caman("#imageToFilter", function () {
    //     this.revert(false);
    //     this.vintage();
    //     this.render();
    //   });
    // };
    // $scope.testFilter3 = function(){
    //   console.log('running');
    //   Caman("#imageToFilter", function () {
    //     this.revert(false);
    //     this.lomo();
    //     this.render();
    //   });
    // };
    // $scope.tempImage2 = 'img/testimg3.jpg';
    

    // $brightness.on('click', function(e){
    //   e.preventDefault();
    //   Caman('#maincanvas', 'img/testimg3.jpg', function(){
    //     this.brightness(10);
    //     this.contrast(0);
    //     this.render(function(){
    //       // some callback function after rendering
    //     });
    //   });
    // });

    // $noise.on('click', function(e){
    //   e.preventDefault();
    //   Caman('#maincanvas', 'img/testimg3.jpg', function(){
    //     this.noise(10);
    //     this.render();
    //   });
    // });

    $scope.closeFilterModal = function(){
      $scope.filtersModal.hide();
    };

    $scope.saveFilter = function(){
      $scope.filtersModal.hide();
      saveCanvas();
      // var img = document.getElementById("filter");
      // console.log(canvas);
      // $scope.newimg = img.src;
      // var url = canvas.toDataURL();
      // var newImg = document.createElement("img");
      // newImg.src = img.src;
      // document.body.appendChild(newImg);
      // $scope.tempImage
    };
    // $scope.filterModel = {};


    function cameraSuccess(imageURI) {
      $scope.tempImage = imageURI;
      // $scope.tempImage = 'img/testimg5.jpg';
      $scope.$apply();

      // FILTERS:
      // $ionicModal.fromTemplateUrl('views/posts/filtersModal.html', {
      //   scope: $scope,
      //   animation: 'slide-in-right'
      // }).then(function(modal) {
      //   $scope.filtersModal = modal;
      //   $scope.filtersModal.show();
      //   var canvas = document.getElementById("canvas");
      //   var ctx = canvas.getContext("2d");
      //   var img = new Image();
      //   img.onload = function () {
      //     canvas.height = canvas.width * (img.height / img.width);
      //     drawImageIOSFix(ctx, img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
      //   }
      //   img.src = imageURI;
      // });
    };
    // $scope.filterous = function(){
    //   var f = new Filterous(filterous);
    //   f.filterImage('grayscale');
    //   f.render();
    // };

    // function downScaleImage(img, scale) {
    //     var imgCV = document.createElement('canvas');
    //     imgCV.width = img.width;
    //     imgCV.height = img.height;
    //     var imgCtx = imgCV.getContext('2d');
    //     imgCtx.drawImage(img, 0, 0);
    //     return downScaleCanvas(imgCV, scale);
    // }
          /// step 1
          // var oc = document.createElement('canvas'),
          // octx = oc.getContext('2d');
          // oc.width = img.width * 0.5;
          // oc.height = img.height * 0.5;
          // console.log(oc.width);
          // console.log(oc.height);
          // octx.drawImage(img, 0, 0, oc.width, oc.height);
          /// step 2
          ///octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);
          // console.log(canvas.width);
          // console.log(canvas.height);
          // ctx.drawImage(oc, 0, 0, oc.width, oc.height,
          // 0, 0, canvas.width, canvas.height);
          // ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // compressedImage = canvas.toDataURL('image/jpeg');
          
          // $scope.tempImage = canvas.toDataURL('image/jpeg');
        // compressedImage = canvas.toDataURL('image/jpeg');

        // Caman('#canvas', function(){
        //   // this.revert(false);
        //   this.resize({
        //     width: 320
        //   });
        //   this.render(function(){
        //     console.log('presave');
        //     compressedImage = canvas.toDataURL('image/jpeg');
        //     var canvas2 = document.getElementById("canvas2");
        //     // var ctx = canvas2.getContext("2d");
        //     var img2 = new Image();
        //     // img.onload = function () {
        //     //   canvas2.height = canvas2.width * (img.height / img.width);
        //     //   var oc = document.createElement('canvas2'),
        //     //   octx = oc.getContext('2d');
        //     //   oc.width = img.width * 0.5;
        //     //   oc.height = img.height * 0.5;
        //     //   octx.drawImage(img, 0, 0, oc.width, oc.height);
        //     //   ctx.drawImage(oc, 0, 0, oc.width, oc.height,
        //     //   0, 0, canvas2.width, canvas2.height);
        //     // }
        //     img2.src = compressedImage;
        //   });
        // });
        // var canvas = $('#maincanvas2');
        // var ctx    = canvas[0].getContext("2d");
        

        // var $reset      = $('#resetbtn');
        // var $brightness = $('#brightnessbtn');
        // var $noise      = $('#noisebtn');
        // var $vintage = $('#vintagebtn');
        // Caman('#canvas', function(){
          // this.revert(false);
          // this.render(function () {
          //   this.save('edspath');
            // console.log('ok');
          // });
        // });
        
        // $reset.on('click', function(e){
        //   e.preventDefault();
        //   this.revert(false);
        //   this.render();
        // });
        // $brightness.on('click', function(e){
        //   e.preventDefault();
        //   Caman('#canvas', function(){
        //     this.revert(false);
        //     this.sinCity();
        //     this.render(function(){
        //     });
        //   });
        // });
        // $vintage.on('click', function(e){
        //   e.preventDefault();
        //   Caman('#canvas', function(){
        //     this.revert(false);
        //     this.vintage();
        //     this.render(function(){
        //     });
        //   });
        // });
    //     // $ionicLoading.hide();
      // console.log('in camerasuccess2');
      
    var saveCanvas = function(){
      window.canvas2ImagePlugin.saveImageDataToLibrary(
        function(msg){
          console.log('msg is');
          console.log(msg);
          compressedImage = msg;
          console.log(compressedImage);
        },
        function(err){
          console.log(err);
        },
        document.getElementById('canvas')
      );
    };

    $scope.sepia = function(){
      Caman('#canvas', function(){
        this.revert(false);
        this.sepia(60);
        this.render(function(){
        });
      });
    };
    $scope.orangePeel = function(){
      Caman('#canvas', function(){
        this.revert(false);
        // this.orangePeel();
        this.colorize('#ff9000',30);
        this.render(function(){
        });
      });
    };
    $scope.love = function(){
      Caman('#canvas', function(){
        this.revert(false);
        this.colorize('#c42007',30);
        this.render(function(){
        });
      });
    };
    $scope.sinCity = function(){
      Caman('#canvas', function(){
        this.revert(false);
        // this.sinCity();
        this.contrast(100);
        this.posterize(80);
        this.clip(30);
        this.greyscale();
        this.render(function(){
        });
      });
    };
    $scope.lomo = function(){
      Caman('#canvas', function(){
        this.revert(false);
        this.gamma(1.6);
        this.contrast(40);
        this.render(function(){
        });
      });
    };
    $scope.bw = function(){
      Caman('#canvas', function(){
        this.revert(false);
        this.greyscale();
        this.render(function(){
        });
      });
    };
    $scope.haze = function(){
      Caman('#canvas', function(){
        this.revert(false);
        this.stackBlur(4);
        this.render(function(){
        });
      });
    };
    $scope.focus = function(){
      Caman('#canvas', function(){
        this.revert(false);
        this.vignette('40%', 40);
        this.saturation(-20);
        // this.sepia(70);
        // this.vibrance(100);
        this.render(function(){
        });
      });
    };
    $scope.testFiltering = function(){
      Caman('#canvas', function(){
        var date = new Date();
        this.revert(false);
        this.sepia(70);
        this.vibrance(100);
        this.render(function(){
          var newDate = new Date();
          console.log(newDate - date);
        });
      });
    };
    $scope.getMarginTop = function(){
      return $scope.user.recentlyTagged.length * 44+122+'px';
    }
    $scope.getTop = function(){
      return $scope.user.recentlyTagged.length * 44+122+'px';
    }
    $scope.getHeight = function(){
      return $scope.filtered.friends.length * 44;
      // console.log($scope.user.recentlyTagged.length * 44+100);
      
      // return $scope.user.recentlyTagged.length * 44+116+'px';
    }

    // $scope.compress = function(){
    //   Caman('#canvas', function(){
    //     // this.revert(false);
    //     console.log('here1');
    //     this.resize({
    //       width: 320
    //     });
    //     this.render(function(){
    //       console.log('here2');
    //       var canvas = document.getElementById("canvas");
    //       compressedImage = canvas.toDataURL('image/jpeg');
    //       var canvas2 = document.getElementById("canvas2");
    //       var ctx = canvas2.getContext("2d");
    //       var img2 = new Image();
    //       img2.onload = function () {
    //         ctx.drawImage(img2, 0,0);
    //         console.log('here3');
    //       //   canvas2.height = canvas2.width * (img.height / img.width);
    //       //   var oc = document.createElement('canvas2'),
    //       //   octx = oc.getContext('2d');
    //       //   oc.width = img.width * 0.5;
    //       //   oc.height = img.height * 0.5;
    //       //   octx.drawImage(img, 0, 0, oc.width, oc.height);
    //       //   ctx.drawImage(oc, 0, 0, oc.width, oc.height,
    //       //   0, 0, canvas2.width, canvas2.height);
    //       }
    //       img2.src = compressedImage;
    //       console.log('here4');
    //     });
    //   });
    // };

    // var canvas = $('#maincanvas');
    // var ctx    = canvas[0].getContext("2d");
    // var $reset      = $('#resetbtn');
    // var $brightness = $('#brightnessbtn');
    // var $noise      = $('#noisebtn');
    // $reset.on('click', function(e){
    //   e.preventDefault();
    //   var img = new Image();
    //   img.src = "img/tempimage4.jpg";
    //   ctx.save();
    //   ctx.setTransform(1, 0, 0, 1, 0, 0);
    //   ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
    //   ctx.restore();
    //   ctx.drawImage(img, 0, 0);
    //   Caman('#maincanvas', 'img/tempimage4.jpg', function(){
    //     this.revert(false);
    //     this.render();
    //   });
    // });
    // $brightness.on('click', function(e){
    //   e.preventDefault();
    //   Caman('#maincanvas', function(){
    //     // this.opacity(50);
    //     this.brightness(50);
    //     // this.sinCity();
    //     this.render(function(){
    //     });
    //   });
    // });
      // $ionicLoading.hide();
    // });
    $scope.closeFilterModal = function(){
      $scope.filtersModal.hide();
    };

    function win(r) {
      for (var i = 0; i < tempFriends.length; i++){ // notify each friend
        $http.post(server+'api/pushNotification',{fid: tempFriends[i].fid, tagType: 'unreadTags', message: 'Someone posted about you!'}, function(){
        });
      }
      $ionicLoading.hide();
      services.setPosts(undefined);
      $location.path('/tab/feed');
      mixpanel.track('Post.saved');
      $scope.$apply();
        console.log("Code = " + r.responseCode);
        console.log("Response = " + r.response);
        console.log("Sent = " + r.bytesSent);
        // removefile();
        postSavedRoutine();
        // $location.path('/tab/feed');
        // $scope.$apply();
        // function removefile(){
        //   console.log('here1');
        //   // var removeFile = function(fileEntry){
        //   //   console.log('here2a');
        //   //     fileEntry.remove(success, fail);
        //   //     // console.log('here4');
        //   // };
        //   console.log('here2');
        //   // window.resolveLocalFileSystemURL('file:///'+compressedImage, removeFile, fail);
        //   var onFileSystemSuccess = function(fileSystem){
        //     fileSystem.root.getFile('file:///'+compressedImage, {create: false, exclusive: false}, gotRemoveFileEntry, fail);
        //   };
        //   window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
        // }

        // function gotRemoveFileEntry(fileEntry){
        //   console.log('here3');
        //     console.log(fileEntry);
        //     fileEntry.remove(success, fail);
        // }

        // function success(entry) {
        //     console.log("Removal succeeded");
        // }

        // function fail(error) {

        //     console.log("Error removing file: " + error);
        //     console.log("Error removing file: " + error.code);
        //     console.log(JSON.stringify(error));
        // }
    }

    function fail(error) {
        alert("An error has occurred: Code = " + error.code);
        console.log("upload error source " + error.source);
        console.log("upload error target " + error.target);
    }

    function onFail(message) {
      console.log('Failed because: ' + message);
    }
    

    var placesGeoSuccess = function(position){
      lat = $scope.user.latlon[1];
      lon = $scope.user.latlon[0];
      services.setLat(lat);
      services.setLon(lon);
      
      $http.get('https://api.foursquare.com/v2/venues/search?client_id=OBWUSB3VNU5Z43LLFRQJ11LBAYNGHWRJZMUOSD0SR15DWOBP&client_secret=YYMQJDVR0UJ4WAZJLXXF5JGW5UOSWEFDOIN2Z1VLXKJW1VUO&v=20130815&limit=30&ll='+lat+','+lon).success(function(data){
      // $http.get('https://api.foursquare.com/v2/venues/search?client_id=OBWUSB3VNU5Z43LLFRQJ11LBAYNGHWRJZMUOSD0SR15DWOBP&client_secret=YYMQJDVR0UJ4WAZJLXXF5JGW5UOSWEFDOIN2Z1VLXKJW1VUO&v=20130815&ll='+lat+','+lon).success(function(data){
        $scope.places = data.response;
        $ionicModal.fromTemplateUrl('views/posts/placesModal.html', {
          scope: $scope,
          animation: 'slide-in-right'
        }).then(function(modal) {
          $scope.placesModal = modal;
          $scope.placesModal.show();
          $ionicLoading.hide();
        });
      }).error(function(err){console.log('error'+err)});
    };
    var geoLocationError = function(){
      alert('location needed');
    };

    $scope.getPlaces = function(){
      $ionicLoading.show({
        templateUrl: "views/loading.html",
      });
      placesGeoSuccess();
      // navigator.geolocation.getCurrentPosition(placesGeoSuccess, geoLocationError);
    };
    $scope.closePlacesModal = function(){
      $scope.placesModal.hide();
    }
    $scope.closePeopleModal = function(){
      $scope.peopleModal.hide();
    }
    $scope.closeEventsModal = function(){
      $scope.eventsModal.hide();
    }
    $scope.selectPlace = function(index){
      $scope.selectedPlace = $scope.filtered.places[index];
      $scope.closePlacesModal();
    };
    $scope.getPeople = function(){
      //window.location.href = 'views/sample.html';
      /*$ionicLoading.show({
        templateUrl: "views/loading.html",
      });
      $ionicModal.fromTemplateUrl('views/posts/peopleModal.html', {
        scope: $scope,
        animation: 'slide-in-right'
      }).then(function(modal) {
        $scope.peopleModal = modal;
        $scope.peopleModal.show();
        $ionicLoading.hide();
      });*/
      $scope.isFriendName=true;
      $scope.startPos=endPos;
      $scope.content.textContent=$scope.content.textContent.substring(0,$scope.startPos)+Array(lengthofSpace+1).join(" ")+"@"+$scope.content.textContent.substring($scope.startPos,$scope.content.textContent.length);
      $scope.show=true;
      hideHeader();
      $scope.scrollStyle="bottom:300px;";
      if($scope.textareaStyle!="postCommentsBox-editing"){
        $scope.textareaStyle="postCommentsBox-editing";
        hideHeader();
      }
      focusForced=true;
      window.setTimeout(function() {document.getElementById("text").setSelectionRange($scope.startPos+lengthofSpace+2,$scope.startPos+lengthofSpace+2);document.getElementById("text").focus();},0);
      lengthofSpace=0;
    };
    $scope.getEvents = function(){
      $ionicLoading.show({
        templateUrl: "views/loading.html",
      });
      fetchEvents();
      $ionicModal.fromTemplateUrl('views/posts/eventsModal.html', {
        scope: $scope,
        animation: 'slide-in-right'
      }).then(function(modal) {
        $scope.eventsModal = modal;
        $scope.eventsModal.show();
        $ionicLoading.hide();
      });
    };
    $scope.removeFriend = function(index){
      $scope.selectedFriends.splice(index, 1);
    };
    $scope.selectFriend = function(index, arr){
      $scope.friendSearch.name = '';
      var isNewFriend = -1;
      var fid = arr[index].id || arr[index].fid;
      var name = arr[index].name;
      var newFriend = {fid: fid, name: name, pos:$scope.startPos}; 
      /*for (var i = 0; i < $scope.selectedFriends.length; i++){
        if ($scope.selectedFriends[i].fid===newFriend.fid){
          isNewFriend = i;
        }
      }
      if (isNewFriend===-1){*/
        $scope.selectedFriends.push(newFriend);
      /*} else {
        $scope.selectedFriends.splice(isNewFriend, 1);
      }*/

      //Add the current friend's name position to array
      namesStartPositions.push($scope.startPos);
      namesEndPositions.push($scope.startPos+name.length);
      $scope.isFriendName=false;
      $scope.curName="";
      $scope.show=false;
      showHeader();

      //Insert friend's name to text area
      $scope.content.textContent=$scope.content.textContent.substring(0,$scope.startPos+1)+name+" "+$scope.content.textContent.substring($scope.startPos+name.length+1,$scope.content.textContent.length);
      endPos=$scope.startPos+name.length+1;
      //Revert text area and list of friend back to original state  
      focusForced=true;
      window.setTimeout(function() { document.getElementById("text").setSelectionRange($scope.startPos+name.length+1,$scope.startPos+name.length+1); document.getElementById("text").focus();},0);
      lengthofSpace=0;
    };

    $scope.savePost = function(){
      $ionicLoading.show({
        templateUrl: "views/loading.html",
      });
      tempFriends = $scope.selectedFriends;
      var selectedLatLon = undefined;
      for (var i = 0; i < tempFriends.length; i++){
        delete tempFriends[i]['$$hashKey'];
      }
      if ($scope.selectedPlace){
        selectedLatLon = [$scope.selectedPlace.location.lng, $scope.selectedPlace.location.lat];
        if ($scope.selectedPlace['$$hashKey']){
          delete $scope.selectedPlace['$$hashKey'];
        }
      }
      if ($scope.selectedEvent){
        if ($scope.selectedEvent['$$hashKey']){
          delete $scope.selectedEvent['$$hashKey'];
        }
      }
      var params = {
        fid: $scope.user.fid, 
        name: $scope.user.name, 
        content: $scope.content.textContent, 
        users: tempFriends, 
        atEvent: $scope.selectedEvent,
        place: $scope.selectedPlace, 
        latlon: selectedLatLon,
        publicPost: $scope.content.publicPost,
        poster: {shareFriends: true, shareNonFriends: true}
      };
      if ($scope.tempImage){
        params.users = JSON.stringify(params.users); // Need to stringify objects
        params.atEvent = JSON.stringify(params.atEvent);
        params.poster = JSON.stringify(params.poster);
        params.place = JSON.stringify(params.place);
        var options = new FileUploadOptions();
        options.fileKey="file";
        options.fileName=$scope.tempImage.substr($scope.tempImage.lastIndexOf('/')+1);
        options.mimeType="image/jpeg";
        options.params = params;
        var ft = new FileTransfer();
        ft.upload($scope.tempImage, encodeURI(server+"api/saveAdvPost"), win, fail, options);
        // ft.upload(compressedImage, encodeURI(server+"api/saveAdvPost"), win, fail, options);
      } else {
        $http.post(server+'api/saveAdvPost', params).success(function(data){
          for (var i = 0; i < tempFriends.length; i++){ // notify each friend
            $http.post(server+'api/pushNotification',{fid: tempFriends[i].fid, tagType: 'unreadTags', message: 'Someone posted about you!'}, function(){
            });
          }
          services.setPosts(undefined);
          $location.path('/tab/feed');
          mixpanel.track('Post.saved');
          $scope.$apply();
          $ionicLoading.hide();
          // postSavedRoutine();
        }).error(function(err){console.log(err);});
        
      }
      // console.log('sent to postImage');
    };

    var postSavedRoutine = function(){
      for (var i = 0; i < tempFriends.length; i++){ // notify each friend
        $http.post(server+'api/pushNotification',{fid: tempFriends[i].fid, tagType: 'unreadTags', message: 'Someone posted about you!'}, function(){
        });
      }
      services.setPosts(undefined);
      $location.path('/tab/feed');
      mixpanel.track('Post.saved');
      $scope.$apply();
    }

    $scope.toFeed = function(){
      $location.path('/tab/feed');
    };
    $scope.deletePhoto = function(){
      $scope.tempImage = undefined;
    };

    $scope.selectEvent = function(index){
      $scope.selectedEvent = $scope.events[index];
      $scope.eventsModal.hide();
    };
    $scope.searchLocations = function(input){
      var query = encodeURI(input);
      $http.get('https://api.foursquare.com/v2/venues/search?client_id=OBWUSB3VNU5Z43LLFRQJ11LBAYNGHWRJZMUOSD0SR15DWOBP&client_secret=YYMQJDVR0UJ4WAZJLXXF5JGW5UOSWEFDOIN2Z1VLXKJW1VUO&v=20130815&limit=30&ll='+lat+','+lon+'&query='+query).success(function(data){
        $scope.locationData = data.response;
      });
    };

    //Function which occurs when the textarea is focused
    $scope.textareaFocused=function(){
      $scope.textareaStyle="postCommentsBox-editing";
      $scope.isKeyboardOpen=true;
      //hideHeader();
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    //Function which deals with user input in context text area
    $scope.onKeyUp=function(keyEvent){
      var cursorPos=keyEvent.target.selectionEnd;       //position of the cursor in textarea
      endPos=cursorPos;                                 //specify the end position of current typing character
      var c= String.fromCharCode(keyEvent.keyCode);
      var isWordcharacter = c.match(/\w/);              //Specify whether it is printable character or not
      curName="";

      if(keyEvent.keyCode==32){                         //Specify the length of continuing spaces on typing word
        lengthofSpace++;                                //substring skips the spaces at end of word, so we need to
      }                                                 //insert those spaces manually
      else{
        lengthofSpace=0;
      }

      //Check if the word on current cursor is pre-memorized friend's name
      for(var index=0;index<namesStartPositions.length;index++){
        if (cursorPos>=namesStartPositions[index]&&cursorPos<=namesEndPositions[index]+1){
          if(isWordcharacter!=null||keyEvent.keyCode==8){
            //Remove the friend in the array of selected friends
            namesStartPositions.splice(index,1);
            namesEndPositions.splice(index,1);
            $scope.selectedFriends.splice(index,1);
            break;
          }
          else{
            return true;
          }
        }
      }

      $scope.isFriendName=false;

      //Find the previous @ symbol
      for(var index=cursorPos;index>=0;index--){
        if($scope.content.textContent.charAt(index)=="@"){
          $scope.startPos=index;
          $scope.isFriendName=true;
          break;
        }
      }

      //If there is friends whose name contains the typing words
      if($scope.isFriendName==true){
        //typing word - characters from previous @ to current cursor
        var curName=$scope.content.textContent.substring($scope.startPos+1,cursorPos);
        for(var i=0;i<(cursorPos-$scope.startPos-1)-curName.length;i++)
          curName+=" ";                               //because substring function ignores last white spaces
        
        var isExist=false;
        if(friendNames.toLowerCase().indexOf(curName.toLowerCase())>-1) isExist=true;
        //$scope.friendSearch.name=curName;

        if(isExist){
          $scope.friendSearch.name=curName;
          if($scope.show!=true){
            $scope.show=true;
            $scope.scrollStyle="bottom:300px;";
            hideHeader();
          }
          $ionicScrollDelegate.scrollTop();
        }
        else if(curName!=""){                         //if there is no friend who matches the name
          if($scope.show!=false){
            $scope.show=false;
            showHeader();
          }
        }        
      }
      else{                                           //if there is no @ character
        if($scope.show!=false){
          $scope.show=false;
          showHeader();
        }
      }
    };

    $scope.keyboardClosed=function(){
      //If friends' list isn't appeared now, then increase height of textarea to full
      if($scope.scrollStyle!="bottom:300px;"){
        $scope.textareaStyle="postCommentsBox";
      }
      if(focusForced==true){
        focusForced=false;
      }
      else{
        //showHeader();
        $scope.isKeyboardOpen=false;
      }
    }

    /**
 * Detecting vertical squash in loaded image.
 * Fixes a bug which squash image vertically while drawing into canvas for some images.
 * This is a bug in iOS6 devices. This function from https://github.com/stomita/ios-imagefile-megapixel
 * 
 */
function detectVerticalSquash(img) {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = ih;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var data = ctx.getImageData(0, 0, 1, ih).data;
    // search image edge pixel position in case it is squashed vertically.
    var sy = 0;
    var ey = ih;
    var py = ih;
    while (py > sy) {
        var alpha = data[(py - 1) * 4 + 3];
        if (alpha === 0) {
            ey = py;
        } else {
            sy = py;
        }
        py = (ey + sy) >> 1;
    }
    var ratio = (py / ih);
    return (ratio===0)?1:ratio;
}

/**
 * A replacement for context.drawImage
 * (args are for source and destination).
 */
function drawImageIOSFix(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
    var vertSquashRatio = detectVerticalSquash(img);
 // Works only if whole image is displayed:
 // ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh / vertSquashRatio);
 // The following works correct also when only a part of the image is displayed:
    ctx.drawImage(img, sx * vertSquashRatio, sy * vertSquashRatio, 
                       sw * vertSquashRatio, sh * vertSquashRatio, 
                       dx, dy, dw, dh );
}

/**
 * Hide top header bar and bottom footer
*/
function hideHeader(){
  document.getElementsByClassName("nav-title-slide-ios7")[0].style.top=-headerHeight+"px";
  document.getElementsByClassName("tabs")[0].style.bottom=-bottomHeight+"px";
  document.getElementsByClassName("mainWrapper")[0].style.top="0px";
}

/**
 * Show top header bar and bottom footer
*/
function showHeader(){
  document.getElementsByClassName("nav-title-slide-ios7")[0].style.top="0px";
  document.getElementsByClassName("tabs")[0].style.bottom="0px";
  document.getElementsByClassName("mainWrapper")[0].style.top=headerHeight+"px";
}


  }])

.filter('starsWith', function(){
  return function(friends, name){
    var matching_friends = [];    
    var count=0;
    //Show only first 5 friends who matches start of their name with keyword
    for(var i = 0; i < friends.length; i++){
      if(friends[i].name.toLowerCase().indexOf(name.toLowerCase())==0){
        matching_friends.push(friends[i]);
        count++;
        if(count==5) break;
      }
    }
      //Return matching friends
      return matching_friends;
  }
});
