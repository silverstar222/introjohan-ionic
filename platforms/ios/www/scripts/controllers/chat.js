angular.module('revealApp.controller.chat', [])
  .controller('ChatCtrl', ['$scope', '$http', '$location', 'spinner', 'userData', 'matchData', 'serverInfo', '$ionicScrollDelegate', 'services', '$ionicLoading', '$timeout', function ($scope, $http, $location, spinner,userData,matchData,serverInfo,$ionicScrollDelegate,services,$ionicLoading,$timeout) {
    var server = serverInfo.getServer();
    var socket = io.connect(server);
    services.setSocket(socket);
    $scope.user = userData.getUser();
    $scope.match = matchData.getUser();
    mixpanel.track('chat');
    // cordova.plugins.Keyboard.disableScroll(true);
    $scope.test = function(){
      alert('ok');
      console.log('ok');
    };
    $scope.userIcon = "<a class='title' href='#/tab/chatMatches'><img src='https://graph.facebook.com/"+$scope.match.fid+"/picture?redirect=1&height=50&width=50' class='chatHeaderPhoto'></a>";
    services.checkServer(function(){}, function(){
      $scope.user = null;
      $scope.friendData = null;
      $location.path('/login');
    }, $scope.user.fid);
    $scope.msg = {};
    $scope.msgs = [];
    var arr = [];
    var room = [$scope.user.fid, $scope.match.fid].sort().join();
    // Rooms are named as 'smallerUserFid,largerUserFid'
    var serverTest = function(input){
      $http.post(server+'api/serverTest', {input: input}).success(function(){
        spinner.hide();
      });
    };
    $scope.messages = function(){
      $location.path('/tab/matchlist');
      $ionicLoading.show({
        templateUrl: "views/loading.html"
      });
    };
    var randomPlaceholder;
    $http.post(server+'api/fetchContent', {type: 'Questions'}).success(function(data){
      arr = data;
      randomPlaceholder = arr[Math.floor(Math.random()*arr.length)];
    });
    $scope.placeholderText = function(){
      return randomPlaceholder;
    };


    $http.post(server+'api/resetChatBadge', {userFid: $scope.user.fid, matchFid: $scope.match.fid}).success(function(){
      var badgesCount;
      for (var i = 0; i < $scope.user.matches.length; i++){
        if (userData.data.matches[i].fid === $scope.match.fid){
          badgesCount = userData.data.matches[i].unseenChat;
          userData.data.matches[i].unseenChat = 0;
        }
      }
      userData.data.unreadMessages = Math.max(userData.data.unreadMessages-badgesCount,0);
    });
    var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    var socket = services.getSocket();

    socket.emit('joinroom', room);
    $http.post(server+'api/fetchHistory', {userFid: $scope.user.fid, matchFid: $scope.match.fid}).success(function(data){
      console.log(data);
      for (var i = 0; i < data.length; i++){
        var date = new Date(data[i].date);
        data[i].date = formatDate(date);
      }
      $scope.msgs = data;
    	for (var i = 0; i < data.length; i++){
    		if($scope.user.fid === data[i].sender){
          $scope.msgs[i].sender = 'You';
	  		} else {
          $scope.msgs[i].sender = $scope.match.name.split(' ')[0];
    		}
    	}
      $timeout(function(){
      	$ionicScrollDelegate.scrollBottom(true);
        $ionicLoading.hide();
      },350);
    });
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
    $scope.submitText = function(){
      var timestamp = new Date();
      $scope.msgs.push({text: $scope.msg.text, sender: 'You', date: formatDate(timestamp)})
      $ionicScrollDelegate.scrollBottom(true);
      socket.emit('sendmsg', $scope.msg.text, room, $scope.user.fid, $scope.match.fid, timestamp);
      $http.post(server+'api/pushNotification', {fid: $scope.match.fid, tagType: 'unreadMessages', message: 'Someone sent you a message!', senderFid: $scope.user.fid}).success(function(data){

      }).error(function(data){console.log(err);});
      $scope.msg.text = '';
    };
    socket.on('relaymsg', function(data){
      data.sender = $scope.match.name.split(' ')[0];
      date = new Date(data.date);
      // below is a temp fix for a bug related to date
      if (date.getFullYear()){
        data.date = formatDate(date);
      }
      $scope.msgs.push(data);
      if ($location.path()==='/tab/chat'){
        $ionicScrollDelegate.scrollBottom(true);
      }
      $scope.$apply();
    });

    var blockOptions = function(index){
      if (index === 2){
        $http.post(server+'api/blockUser', {userFid: $scope.user.fid, matchFid: $scope.match.fid }).success(function(data){
          $location.path('/tab/matchlist');
          $scope.$apply();
        });
      }
    };
    var promptOptions = function(index){
      if (index === 3){
      }
      if (index === 2){
        var msg = 'See something inappropriate or offensive? We take these incidents seriously. Please click "Report" below to report inappropriate activity and so we can take the appropriate actions. Thank you!';
        services.report(msg, $scope.user.fid, $scope.match.fid);
      }
      if (index === 1){
        navigator.notification.confirm(
        "This will hide the user's messages and remove them from your chat list",  // message
        blockOptions,                  // callback to invoke
        'Hide user?',            // title
        ['Cancel', 'Hide user']             // buttonLabels
      );
      }
    };

    $scope.flag = function(){
      console.log('flag');
      navigator.notification.confirm(
        "You can hide this user or flag the user from here",  // message
        promptOptions,                  // callback to invoke
        'Trouble?',            // title
        ['Hide user','Flag user', 'Cancel']             // buttonLabels
      );
    }
    services.checkin('chat');
   
}]);

