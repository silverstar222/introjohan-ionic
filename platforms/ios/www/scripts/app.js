var mainApp = angular.module('revealApp', [
  // 'angular-gestures',
  'revealApp.controller.main',
  'revealApp.controller.menu',
  'revealApp.controller.editFriend',
  'revealApp.controller.matches',
  'revealApp.controller.matchlist',
  'revealApp.controller.matchFilter',
  'revealApp.controller.login',
  'revealApp.controller.editProfile',
  'revealApp.controller.chat',
  'revealApp.controller.feed',
  'revealApp.controller.post',
  // 'revealApp.controller.swipeTest',
  'revealApp.service.serverInfo',
  'revealApp.service.friendData',
  'revealApp.service.userData',
  'revealApp.service.matchData',
  'revealApp.service.spinner',
  'revealApp.service.albumData',
  'revealApp.service.services',
  // 'ngRoute',
  // 'ngTouch',
  // 'angular-carousel'
  // 'ionic.contrib.ui.cards',
  // 'mobile-angular-ui.directives.carousel',
  // 'vr.directives.slider'
  // 'ajoslin.mobile-navigate'
  'pasvaz.bindonce',
  // 'vintagejs',
  'ionic'
])
.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('menu', {
      url: "/menu",
      abstract: true,
      templateUrl: "views/menu.html",
      controller: 'MenuCtrl'
    })
    .state('tabs', {
      url: "/tab",
      abstract: true,
      templateUrl: "views/tabs.html",
      controller: 'TabsCtrl'
    })
    .state('albumView', {
      url: '/albumView',
      templateUrl: 'views/albumView.html',
      controller: 'EditProfileCtrl'
    })
    .state('tabs.main', {
      url: '/main',
      views: {
        'main-tab' :{
          templateUrl: 'views/main.html',
          controller: 'MainCtrl'
        }
      }
    })
    
    .state('tabs.feed', {
      url: '/feed',
      views: {
        'main-tab' :{
          templateUrl: 'views/feed.html',
          controller: 'FeedCtrl'
        }
      }
    })
    .state('tabs.post', {
      url: '/post',
      views: {
        'post-tab' :{
          templateUrl: 'views/post.html',
          controller: 'PostCtrl'
        }
      }
    })
    .state('tabs.friendCards', {
      url: '/friendCards',
      views: {
        'friendCards-tab' :{
          templateUrl: 'views/friendCards.html',
          controller: 'EditFriendCtrl'
        }
      }
    })
    .state('tabs.matches', {
      url: '/matches',
      views: {
        'matches-tab' :{
          templateUrl: 'views/matches.html',
          controller: 'MatchesCtrl'
        }
      }
    })
    .state('tabs.editFriend', {
      url: '/editFriend',
      views: {
        'main-tab' :{
          templateUrl: 'views/editFriend.html',
          controller: 'EditFriendCtrl'
        }
      }
    })
    .state('tabs.matchlist', {
      url: '/matchlist',
      views: {
        'matchlist-tab' :{
          templateUrl: 'views/matchlist.html',
          controller: 'MatchlistCtrl'
        }
      }
    })
    .state('tabs.chat', {
      url: '/chat',
      views: {
        'matchlist-tab' :{
          templateUrl: 'views/chat.html',
          controller: 'ChatCtrl'
        }
      }
    })
    .state('tabs.editProfile', {
      url: '/editProfile',
      views: {
        'editProfile-tab' :{
          templateUrl: 'views/editProfile.html',
          controller: 'EditProfileCtrl'
        }
      }
    })
    .state('tabs.matchFilter', {
      url: '/matchFilter',
      views: {
        'editProfile-tab' :{
          templateUrl: 'views/matchFilter.html',
          controller: 'MatchFilterCtrl'
        }
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
      ,
      resolve: {
        getStatus: function(services){
          return services.getStatus();
        }
      }
    })
    .state('friendCards', {
      url: '/friendCards',
      templateUrl: 'views/friendCards.html',
      controller: 'EditFriendCtrl'
    })
    .state('editProfile', {
      url: '/editProfile',
      templateUrl: 'views/editProfile.html',
      controller: 'EditProfileCtrl'
    })
    .state('tabs.editFriend.default', {
      url: "/default",
      templateUrl: "views/editFriendPartials/default.html",
      controller: 'EditFriendCtrl'
      
    })
    .state('tabs.chatMatches', {
      url: '/chatMatches',
      views: {
        'matchlist-tab' :{
          templateUrl: 'views/matches.html',
          controller: 'MatchesCtrl'
        }
      }
    })
    .state('tabs.editFriend.introFriend', {
      url: "/introFriend",
      templateUrl: "views/editFriendPartials/introFriend.html"
    })
    .state('tabs.editFriend.comment', {
      url: "/comment",
      templateUrl: "views/editFriendPartials/comment.html"
    })
    .state('tabs.editFriend.activitiesTags', {
      url: "/activitiesTags",
      templateUrl: "views/editFriendPartials/activitiesTags.html"
    })
    .state('tabs.editFriend.traitsTags', {
      url: "/traitsTags",
      templateUrl: "views/editFriendPartials/traitsTags.html"
    })
    .state('tabs.editFriend.friendDetails', {
      url: "/friendDetails",
      templateUrl: "views/editFriendPartials/friendDetails.html",
      controller: 'EditFriendCtrl'
    })
    // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});


mainApp.directive( "carouselExampleItem", function($rootScope, $swipe){
  return function(scope, element, attrs){
      var startX = null;
      var startY = null;
      var endAction = "cancel";
      var carouselId = element.parent().parent().attr("id");

      var translateAndRotate = function(x, y, z, deg){
        element[0].style["-webkit-transform"] =
           "translate3d("+x+"px,"+ y +"px," + z + "px) rotate("+ deg +"deg)";
        element[0].style["-moz-transform"] =
           "translate3d("+x+"px," + y +"px," + z + "px) rotate("+ deg +"deg)";
        element[0].style["-ms-transform"] =
           "translate3d("+x+"px," + y + "px," + z + "px) rotate("+ deg +"deg)";
        element[0].style["-o-transform"] =
           "translate3d("+x+"px," + y  + "px," + z + "px) rotate("+ deg +"deg)";
        element[0].style["transform"] =
           "translate3d("+x+"px," + y + "px," + z + "px) rotate("+ deg +"deg)";
      }

      $swipe.bind(element, {
        start: function(coords) {
          startX = coords.x;
          startY = coords.y;
        },

        cancel: function(e) {
          translateAndRotate(0, 0, 0, 0);
          e.stopPropagation();
        },

        end: function(coords, e) {
          if (endAction == "prev") {
            $rootScope.carouselPrev(carouselId);
          } else if (endAction == "next") {
            $rootScope.carouselNext(carouselId);
          }
          translateAndRotate(0, 0, 0, 0);
          e.stopPropagation();
        },

        move: function(coords) {
          if( startX != null) {
            var deltaX = coords.x - startX;
            var deltaXRatio = deltaX / element[0].clientWidth;
            if (deltaXRatio > 0.3) {
              endAction = "next";
            } else if (deltaXRatio < -0.3){
              endAction = "prev";
            }
            translateAndRotate(deltaXRatio * 200, 0, 0, deltaXRatio * 15);
          }
        }
      });
    }
})

.directive('noScroll', function() {

  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {

      $element.on('touchmove', function(e) {
        e.preventDefault();
      });
    }
  }
})

.directive('easedInputPlaces', function($timeout, $http, services) {
    return {
        restrict: 'E',
        template: '<div><input class="my-eased-input" type="text" ng-model="currentInputValue" ng-change="update()" placeholder="{{placeholder}}"/></div>',
        scope: {
            value: '=',
            timeout: '@',
            http: '@',
            placeholder: '@'
        },
        transclude: true,
        link: function ($scope) {
            $scope.timeout = parseInt($scope.timeout);
            $scope.update = function (){
                if ($scope.pendingPromise) { $timeout.cancel($scope.pendingPromise); }
                $scope.pendingPromise = $timeout(function () { 
                    // $scope.value = $scope.currentInputValue;
                    var query = $scope.currentInputValue;
                    var lat = services.getLat();
                    var lon = services.getLon();
                    console.log(lon);
                    $http.get('https://api.foursquare.com/v2/venues/search?client_id=OBWUSB3VNU5Z43LLFRQJ11LBAYNGHWRJZMUOSD0SR15DWOBP&client_secret=YYMQJDVR0UJ4WAZJLXXF5JGW5UOSWEFDOIN2Z1VLXKJW1VUO&v=20130815&limit=50&ll='+lat+','+lon+'&query='+query).success(function(data){
                      $scope.value = data.response;
                    });
                    // $scope.searchLocations($scope.value);
                }, $scope.timeout);
            };
        }
    }
})
.directive('easedInput', function($timeout) {
    return {
        restrict: 'E',
        template: '<div><input class="my-eased-input" type="text" ng-model="currentInputValue" ng-change="update()" placeholder="{{placeholder}}"/></div>',
        scope: {
            value: '=',
            timeout: '@',
            placeholder: '@'
        },
        transclude: true,
        link: function ($scope) {
            $scope.timeout = parseInt($scope.timeout);
            $scope.update = function (){
                if ($scope.pendingPromise) { $timeout.cancel($scope.pendingPromise); }
                $scope.pendingPromise = $timeout(function () { 
                    $scope.value = $scope.currentInputValue;
                }, $scope.timeout);
            };
        }
    }
})
.directive('imageonload', function($timeout) {
    return {
        restrict: 'A',
        link: function($scope, element, attrs) {
            element.bind('load', function() {
              $timeout(function(){
                $scope.loadedImage();
              },0);
              // $scope.imageStatus.loaded = true;
                // alert('image is loaded');
            });
        }
    };
})
.directive('autoFocus', function($timeout) {
    return {
        restrict: 'AC',
        link: function(_scope, _element) {
            $timeout(function(){
                _element[0].focus();
                // window.scrollTo(0,0);
            }, 0);
        }
    };
});


