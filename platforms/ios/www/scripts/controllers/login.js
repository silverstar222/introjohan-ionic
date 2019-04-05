angular.module('revealApp.controller.login', [])
  // .controller('LoginCtrl', ['$scope', '$http', '$location', 'userData', 'matchData', 'spinner', 'serverInfo', '$ionicPopup', '$ionicLoading', 'services', '$timeout', '$ionicSwipeCardDelegate', function ($scope, $http, $location, userData, matchData,spinner,serverInfo, $ionicPopup,$ionicLoading,services,$timeout,$ionicSwipeCardDelegate) {
  .controller('LoginCtrl', ['$scope', '$http', '$location', 'userData', 'matchData', 'spinner', 'serverInfo', '$ionicPopup', '$ionicLoading', 'services', '$timeout', function ($scope, $http, $location, userData, matchData,spinner,serverInfo, $ionicPopup,$ionicLoading,services,$timeout) {
    var server = serverInfo.getServer();
    var userExistsData;
    var date;

    $scope.currentSlide = 0;
    $scope.match = {profilePhotos: [
    'img/FeedNearby.jpg',
    'img/CreatePost.jpg',
    'img/Matches_2_Ty2.jpg'
    // ,'img/group2.png'
    ]};
    mixpanel.track('Login');
    
    $scope.serverTest = function(input){
      $http.post(server+'api/serverTest', {input: input}).success(function(){
      }).error(function(data){console.log(data);});
    };
    var token;
      
    $scope.user = userData.getUser();
    var alertCallback = function(){};
    
    var login = function(){
      services.checkKill(function(){
        services.checkServer(function(){loginContinue();}, function(){
        });  
      });
      //geoSuccess({coords: {longitude: '-122.435', latitude: '37.7918'}});   
    };
    var loginContinue = function(){
      // console.log('1');
      // var tempDate = new Date();
      // console.log(tempDate - date);
      FB.login(function(data){
        if (data.error){ 
          alert(JSON.stringify(data.error));
          $ionicLoading.hide();
        }
        $ionicLoading.hide();
        $ionicLoading.show({
          template: '<i class="icon ion-loading-c iconLarge"></i><br><div>Talking to Facebook...</div>'
        });
      //   console.log('2');
      //   var tempDate = new Date();
      // console.log(tempDate - date);
        token = data.authResponse.accessToken;
        $http.post(server+'api/checkUserAccount', {fid:data.authResponse.userID}).success(function(data){
      //     console.log('3');
      //     var tempDate = new Date();
      // console.log(tempDate - date);
          if (data[0] && data[0].hasAccount){
            userExistsData = 1;             // Full account
          } else {
            if (data[0]){
              userExistsData = 0;           // Friend created account
            } else {
              userExistsData = undefined;   // No account
            }
          }
          if (data[0] && data[0].hasAccount){  // user already has account
            $scope.user = data[0];
            postMyData();
          } else {                              // user has been created by friend or has no account
            fetchMyData();
          }
        });
      }, {scope: 'email,friends_location,user_birthday,user_photos,friends_relationships,user_education_history,friends_birthday'}
      );
    };
    $scope.loginClick = function(){
      // date = new Date();
      $ionicLoading.show({
        template: '<i class="icon ion-loading-c iconLarge"></i><br><div>Logging in...</div>'
      });
      // $ionicLoading.show({
      //   templateUrl: "views/loading.html"
      //   // template: 'hello1'
      //   });
      services.checkServer(login, alertCallback);
    };


    var fetchMyData = function(){
      FB.api('/me', {fields: 'id,email,name,birthday,picture,location,gender,photos,friends,education'}, function(resp){
      //   console.log('4');
      //   var tempDate = new Date();
      // console.log(tempDate - date);
        if (resp.error){ alert(JSON.stringify(resp.error));}
        // Make sure real person w/ friends
        resp.token = token;
        resp.fid = resp.id;
        delete resp.id;
        $scope.user = resp;
        // For final live version, change below to larger number
        if (resp.friends && resp.friends.data.length > 1){
          postMyData();
        }
        else {
          $ionicLoading.hide();
          navigator.notification.alert(
            'In order to prevent potential spam, your account needs more connections to log in.',
            $ionicLoading.hide,
            'Sorry!',
            'Ok!'
          );
        }

      });
    };
    var saveLocal = function(){
      window.localStorage.setItem('isLoggedIn','true');
      window.localStorage.setItem('user', JSON.stringify($scope.user));
    };
    var geoSuccess = function(position){
      // console.log('5');
      // var tempDate = new Date();
      // console.log(tempDate - date);
      $scope.user.latlon = [position.coords.longitude, position.coords.latitude];
      userData.setUser($scope.user);
 
        $http.post(server+'api/postGeo', {fid: $scope.user.fid, position: position}).success(function(data){
      //     console.log('8');
      //     var tempDate = new Date();
      // console.log(tempDate - date);
          if (data==='true'){
            saveLocal();
            if (userExistsData){
              $location.path('/tab/feed');
              mixpanel.track('LoggingIn');
            } else {
              var alertCallback = function(){};
              var gotoEditProfile = function(){
                $location.path('/tab/feed');
                $scope.$apply();
              };
              navigator.notification.alert(
                'Make sure you allow push notifications!',
                gotoEditProfile,
                'Want to know if someone wants to meet?',
                'Ok!'
              );
              var regObj = {
                "name": $scope.user.name,
                "fid": $scope.user.fid,
                "gender": $scope.user.gender,
                "age":$scope.user.age
              };
              mixpanel.register(regObj);
              mixpanel.track('AccountCreated');
              mixpanel.track('$signup');
            }
          } else {
            navigator.notification.alert(
            'Intro may not be available in your area yet, or you may need to turn on location preferences for Intro',
              callbackToLogin,
              'Sorry!',
              'Ok!');
            $ionicLoading.hide();
            $location.path('/login');
            $scope.$apply();
          }
        }).error(function(err){
          navigator.notification.alert(
            'An error occurred. You may need to change location preferences, or Intro may not be available in your area yet.',
            callbackToLogin,
            'Sorry!',
            'Ok!');
          $ionicLoading.hide();
          $location.path('/login');
          $scope.$apply();
        });
      // }
    };

    var postMyData = function(){
     $http.post(server+'api/postMyData', {userData: $scope.user, userExistsData: userExistsData}).success(function(data){
      // console.log('6');
      // var tempDate = new Date();
      // console.log(tempDate - date);
        $scope.user = data;
        $scope.user.token = token;
        userData.setUser($scope.user);
        if(userExistsData){
          getLocation();
        } else {
          // fetchFriends();
          // NEW:
          services.fetchFriends($scope.user);
          getLocation(); 
        }
      }).error(function(err){
        alert('Error in postMyData');
        $ionicLoading.hide();
      });
    };
    var callbackToLogin = function(){
    };

    var geoLocationError = function(err){
      console.log('geoerror');
      navigator.notification.alert(
        'Your location is needed to help find matches for you. Please change this under Settings-> Privacy-> Location Services, and then log in again. We will never reveal your exact location to any party. You will now be logged out.',
        callbackToLogin,
        'Sorry!',
        'Ok!');
      $ionicLoading.hide();
      $location.path('/login');
      $scope.$apply();
    };

    var getLocation = function(){
      // console.log('7');
      // var tempDate = new Date();
      // console.log(tempDate - date);
      $ionicLoading.hide();
      $ionicLoading.show({
        template: '<i class="icon ion-loading-c iconLarge"></i><br><div>Tidying up...</div>'
      });
      navigator.geolocation.getCurrentPosition(geoSuccess, geoLocationError);
    };

    var fetchFriends = function(){
      $ionicLoading.hide();
      $ionicLoading.show({
        template: '<i class="icon ion-loading-c iconLarge"></i><br><div>Finding your friends...</div>'
      });
      FB.api('/me/friends', { fields: 'id,name,picture.width(640).height(640),location,gender,relationship_status,birthday' },  function(response) {
        if (response.error) {
          alert(JSON.stringify(response.error));
        } else {
          $ionicLoading.hide();
          $ionicLoading.show({
            template: '<i class="icon ion-loading-c iconLarge"></i><br><div>Finding people nearby...</div>'
          });
          $scope.friendData = response.data;
          postFriendData();
        }
       }
     )};
    var postFriendData = function(){
      // Rename id to fid so that it saves to mongoose properly
      for (var i = 0; i < $scope.friendData.length; i++){
        $scope.friendData[i].fid = $scope.friendData[i].id;
        delete $scope.friendData[i].id;
      }
      $http.post(server+'api/postFriendData', {user: $scope.user, friendData: $scope.friendData, token: $scope.user.token}).success(function(data){
        getLocation();
        }).error(function(err){
          alert('Error in postFriendData');
          $ionicLoading.hide();
      });
    };

    
    // THIS SHOULD GO SOMEWHERE ELSE
    var eula = "SIMPLEBITS INC.\n \n\
Intro or SimpleBits Applications for Apple-Branded Products Running iOS\n\
END USER LICENSE AGREEMENT\n\n\
PLEASE READ THIS END USER LICENSE AGREEMENT CAREFULLY. BY DOWNLOADING, INSTALLING, ACCESSING OR USING ANY INTRO OR SIMPLEBITS APPLICATIONS FOR APPLE-BRANDED PRODUCTS RUNNING THE IOS OPERATING SYSTEM (“IOS PRODUCTS”) (“INTRO OR SIMPLEBITS APPLICATIONS”), YOU AGREE TO USE SUCH INTRO OR SIMPLEBITS APPLICATIONS SOLELY IN ACCORDANCE WITH THE TERMS AND CONDITIONS OF THIS END USER LICENSE AGREEMENT (THE “AGREEMENT”), AND YOU AGREE THAT YOU ARE BOUND BY AND ARE A PARTY TO THIS AGREEMENT. YOU WARRANT THAT YOU ARE AT LEAST EIGHTEEN YEARS OLD AND THAT YOU HAVE THE LEGAL CAPACITY TO ENTER INTO CONTRACTS.\n\
YOUR USE OF THE INTRO OR SIMPLEBITS APPLICATIONS IS EXPRESSLY CONDITIONED ON YOUR ACCEPTANCE OF THE TERMS AND CONDITIONS OF THIS AGREEMENT. IF YOU DO NOT AGREE TO THE TERMS AND CONDITIONS OF THIS AGREEMENT, YOU MAY NOT DOWNLOAD, INSTALL, ACCESS OR USE THE INTRO OR SIMPLEBITS APPLICATIONS\n\
1.About This Agreement. This Agreement applies to all Software and Documentation made available by SimpleBits Inc. (“Company”) to you and is made between you and Company (the “Parties”). Neither Apple Inc. nor any subsidiary or affiliate of Apple Inc. (collectively and individually referenced in this Agreement as \"Apple\") is a party to this Agreement. Except as specifically provided in Section 2, this Agreement does not confer any enforceable rights or remedies upon any Person other than the Parties. “Software” means Intro or SimpleBits Application computer programs, in object code format, including without limitation firmware. The term “Software” also includes any updates, upgrades or other new features, functionality or enhancements to the Software made available to you. \"Documentation\" means any on-line, read me, help files, or other related explanatory materials that accompany the Software. The Parties acknowledge that this Agreement is concluded between themselves only, and not with Apple, and Company, not Apple, is solely responsible for the Software and the content thereof. \
2.License. The Software and Documentation are licensed, not sold, to you by Company. Subject to the terms and conditions of this Agreement, you are hereby granted a limited, non-exclusive, non-sublicensable and nontransferable right to run one copy of the object code version of the Software on any iOS Product that you own or control for personal, non-commercial purposes only, all in accordance with the Usage Rules set forth in the Apple App Store Terms of Service (available at http://www.apple.com/legal/itunes/appstore/us/terms.html). This license does not allow you to use the Software on any iOS Product that you do not own or control, and you may not distribute or make the Software available over a network where it could be used by multiple devices at the same time. You agree to use your best efforts to prevent and protect the contents of the Software and Documentation from unauthorized disclosure or use. The Software and Documentation contain confidential information of the Company and accordingly you agree not to use or disclose the Software or Documentation except as expressly permitted under this Agreement. Company and its Licensors reserve all rights, including but not limited to ownership and intellectual property rights, not expressly granted to you. The Parties acknowledge and agree that Company’s Licensors and Apple are the intended third party beneficiaries of this Agreement and, upon your acceptance of the terms and conditions of this Agreement, have the express right to rely upon and directly enforce the terms of this Agreement against you as a third party beneficiary hereof. There are no implied licenses granted by Company under this Agreement. Except as specified above, you shall have no rights to the Software. \n\
3.Use. \n\
3.1Limitation on Use: You may not use the Software or Documentation except as permitted in this Agreement. Without limiting the foregoing, you may not use the Software or Documentation for operating your or your employer's business, developing other applications for ongoing use, or providing services to others. Except with Company’s prior written consent, you may not: (i) alter, modify or create any derivative works of the Software, the underlying source code, or the Documentation in any way, including without limitation customization, translation or localization; (ii) port, reverse compile, reverse assemble, reverse engineer, or otherwise attempt to separate any of the components of the Software or derive the source code for the Software (except to the extent applicable laws specifically prohibit such restriction); (iii) copy, redistribute, encumber, sell, rent, lease, sublicense, or otherwise transfer rights to the Software or Documentation; (iv) remove or alter any trademark, logo, copyright or other proprietary notices, legends, symbols or labels in the Software or Documentation; (v) block, disable or otherwise affect any advertising, advertisement banner window, links to other sites and services, or other features that constitute an integral part of the Software. You may not cause or permit any third party to do any of the foregoing.\n\
3.2Third Party Software. You acknowledge that the Software may contain copyrighted software of Company's suppliers which are obtained under a license from such suppliers (\"Third Party Software\"). All third party Licensors and suppliers retain all right, title and interest in and to such Third Party Software and all copies thereof, including all copyright and other intellectual property rights. Your use of any Third Party Software shall be subject to, and you shall comply with, the terms and conditions of this Agreement, and the applicable restrictions and other terms and conditions set forth in any Third Party Software documentation or printed materials, including without limitation an end user license agreement. Subject to the foregoing, the Third Party Software may include certain open source software (\"Open Source Software\"). Notwithstanding anything to the contrary herein, the license terms in this Agreement apply only to the portions of the Software that do not comprise the Open Source Software, whose different license terms are described in Section 16 of this Agreement. \n\
4.Proprietary Rights. You acknowledge and agree that the Software belongs to Company or its Licensors. You agree that you neither own nor hereby acquire any claim or right of ownership to the Software and Documentation or to any related patents, copyrights, trademarks or other intellectual property. Company and its Licensors retain all right, title and interest in and to all copies of the Documentation and the Software at all times, regardless of the form or media in or on which the original or other copies may subsequently exist. This license is not a sale of the original or any subsequent copy. The Software and Documentation are protected by copyright and other intellectual property laws and by international treaties. You may not make any copies of the Software except for your own personal use. Any and all other copies of the Software or Documentation made by you are in violation of this license. All content accessed through the Software is the property of the applicable content owner and may be protected by applicable copyright law. This license gives you no rights to such content. All trademarks used in connection with the Software and Documentation are owned by Company, its affiliates and/or its Licensors and other suppliers, and no license to use any such trademarks is provided hereunder. All suggestions or feedback provided by you to Company with respect to the Software shall be Company’s property and deemed confidential information of Company. You and Company acknowledge that, in the event of any third party claim that the Software or your possession and use of the Software infringes that third party’s intellectual property rights, Company, not Apple, will be solely responsible for the investigation, defense, settlement, and discharge of any such intellectual property claim. \n\
5.No Support. This Agreement does not entitle you to receive from Company, its Licensors, or Apple hard-copy documentation, support, telephone assistance, maintenance, or enhancements or updates to the Software or Documentation. The Parties acknowledge and agree that Apple has no obligation whatsoever to furnish any maintenance or support services with respect to the Software. \n\
6.Product Claims. The Parties acknowledge that Company, not Apple, is responsible for addressing any claims made by you or third parties relating to the Software or your possession and/or use of the Software, including, but not limited to: (i) product liability claims; (ii) any claim that the Software fails to conform to any applicable legal or regulatory requirement; and (iii) claims arising under consumer protection or similar legislation.\n\
7.Term and Termination. This Agreement and your right to use the Software and Documentation may be terminated by you or by Company at any time upon written notice. This Agreement automatically terminates if you fail to comply with its terms and conditions. Immediately upon termination, you shall cease to use and return or destroy all copies of the Software and Documentation in your possession, custody or control and if requested you shall certify to Company in writing that such return or destruction has occurred. The following sections of this Agreement survive any expiration or termination hereof: 1 and 4-16.\n\
8.Services; Third Party Materials. The Software may enable access to Company’s and third party services and web sites (collectively and individually, \"Services\"). Use of the Services may require Internet access and that you accept additional terms and conditions.\n\
9.NO WARRANTY. YOU AGREE THAT THE SOFTWARE AND DOCUMENTATION ARE PROVIDED “AS IS” AND THAT COMPANY AND ITS LICENSORS MAKE NO OTHER WARRANTY AS TO THE SOFTWARE OR DOCUMENTATION, INCLUDING WITHOUT LIMITATION UNINTERRUPTED USE, ACCURACY, AND DATA LOSS. COMPANY AND ITS LICENSORS DISCLAIM ALL OTHER WARRANTIES OR CONDITIONS, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, NON-INFRINGEMENT AND FITNESS FOR A PARTICULAR PURPOSE (EVEN IF COMPANY KNOWS OR SHOULD HAVE KNOW OF SUCH PURPOSE), RELATED TO THE SOFTWARE OR DOCUMENTATION, ITS USE OR ANY INABILITY TO USE IT, THE RESULTS OF ITS USE AND THIS AGREEMENT. COMPANY AND ITS LICENSORS DO NOT WARRANT THAT THE SOFTWARE OR DOCUMENTATION OR ANY RESULTS OF USE THEREOF WILL BE FREE OF DEFECTS, ERRORS OR VIRUSES, RELIABLE OR ABLE TO OPERATE ON AN UNINTERRUPTED BASIS OR IN A PARTICULAR ENVIRONMENT OR THAT ERRORS THEREIN, IF ANY, WILL BE CORRECTED.\n\
COMPANY IS SOLELY RESPONSIBLE FOR ANY WARRANTIES NOT EFFECTIVELY DISCLAIMED UNDER THIS AGREEMENT. IN THE EVENT THAT THE SOFTWARE FAILS TO CONFORM TO ANY APPLICABLE WARRANTY NOT EFFECTIVELY DISCLAIMED UNDER THIS AGREEMENT, YOU MAY NOTIFY APPLE AND APPLE MAY REFUND TO YOU THE PURCHASE PRICE FOR THE SOFTWARE. SUCH REFUND SHALL, TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, BE APPLE’S ONLY OBLIGATION WITH RESPECT TO ANY APPLICABLE WARRANTY WITH RESPECT TO THE SOFTWARE. ANY OTHER APPLICABLE CLAIMS, LOSSES, LIABILITIES, DAMAGES, COSTS, OR EXPENSES ATTRIBUTABLE TO THE FAILURE TO CONFORM TO ANY APPLICABLE WARRANTY NOT EFFECTIVELY DISCLAIMED BY COMPANY UNDER THIS AGREEMENT SHALL BE COMPANY’S SOLE RESPONSIBILITY. \n\
10.LIMITATION OF LIABILITY. TO THE FULLEST EXTENT PERMITTED BY LAW, COMPANY, ITS LICENSORS, AND APPLE SHALL NOT BE LIABLE FOR ANY DAMAGES, WHETHER IN CONTRACT OR TORT (INCLUDING NEGLIGENCE) OR ANY OTHER LEGAL OR EQUITABLE THEORY, ARISING FROM THIS AGREEMENT, INCLUDING WITHOUT LIMITATION ANY INDIRECT, CONSEQUENTIAL, SPECIAL, EXEMPLARY, INCIDENTAL DAMAGES, EVEN IF COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. YOU AGREE THAT YOU SHALL HAVE THE SOLE RESPONSIBILITY FOR PROTECTING YOUR DATA, BY PERIODIC BACKUP OR OTHERWISE, USED IN CONNECTION WITH THE SOFTWARE. IN ANY CASE, COMPANY’S SOLE LIABILITY AND YOUR EXCLUSIVE REMEDY UNDER ANY PROVISION OF THIS AGREEMENT SHALL BE THE REPLACEMENT OF THE SOFTWARE FOUND TO BE DEFECTIVE, WITH THE EXCEPTION OF DEATH OR PERSONAL INJURY CAUSED BY THE NEGLIGENCE OF COMPANY TO THE EXTENT APPLICABLE LAW PROHIBITS THE LIMITATION OF DAMAGES IN SUCH CASES.\n\
11.Injunctive Relief. You acknowledge and agree that your breach or threatened breach of this Agreement shall cause Company irreparable damage for which recovery of money damages would be inadequate and that Company therefore may obtain timely injunctive relief to protect its rights under this Agreement in addition to any and all other remedies available at law or in equity.\n\
12.Export Controls. The Software and Documentation and the underlying information and technology may not be downloaded or otherwise exported or re-exported (i) into (or to a national or resident of) any country that is subject to a U.S. Government embargo or has been designated by the U.S. Government as a “terrorist supporting” country; or (ii) to anyone on the U.S. Treasury Department’s list of Specially Designated Nationals or the U.S. Commerce Department’s Table of Deny Orders. By downloading or using the Software and/or Documentation, you are agreeing to the foregoing and you represent and warrant that you (a) are not located in, under the control of, or a national or resident of any such country or on any such list, (b) are not listed on any U.S. Government list of prohibited or restricted parties, and (c) you agree to comply with all export laws and other applicable laws.\n\
13.U.S. Government End Users. The Software and Documentation each were developed by private financing and constitute “Commercial Items,” as that term is defined at 48 C.F.R. §2.101. The Software consists of “Commercial Computer Software” and “Commercial Computer Software Documentation,” as such terms are used in 48 C.F.R. §12.212. Consistent with 48 C.F.R. §12.212 and 48 C.F.R. §227.7202-1 through 227.7202-4, all U.S. Government End Users acquire only those rights in the Software and the Documentation that are specifically provided by this Agreement. Consistent with 48 C.F.R. §12.211, all U.S. Government End Users acquire only technical data and the rights in that data customarily as specifically provided in this Agreement.\n\
14.Miscellaneous. (a) This Agreement constitutes the entire agreement between the Parties concerning the subject matter hereof, which may only be modified by a written amendment signed by an authorized executive of Company. (b) Except to the extent applicable law, if any, provides otherwise, this Agreement shall be governed by the laws of California, U.S.A., excluding its conflict of law provisions. (c) You expressly agree that jurisdiction for any claim or dispute arising from the use of the Software and/or Documentation resides in the federal and state courts situated in San Francisco County, California, U.S.A., and you consent to the personal jurisdiction thereof. (d) This Agreement shall not be governed by the United Nations Convention on Contracts for the International Sale of Goods. (e) If any part of this Agreement is held invalid or unenforceable, that part shall be construed to reflect the parties' original intent, and the remaining portions remain in full force and effect, or Company may at its option terminate this Agreement. (f) The controlling language of this Agreement is English. If you have received a translation into another language, it has been provided for your convenience only. (g) A waiver by either party of any term or condition of this Agreement or any breach thereof, in any one instance, shall not waive such term or condition or any subsequent breach thereof. (h) You may not assign or otherwise transfer by operation of law or otherwise this Agreement or any rights or obligations herein. Company may assign this Agreement to any entity at its sole discretion. (i) This Agreement shall be binding upon and shall inure to the benefit of the parties, their successors and permitted assigns. (j) If you have any questions, complaints, or claims with respect to the Software, you may contact Company at: admin@makeanintro.com.\n\
15.User Outside the U.S. \n\
If you are using the Software or Documentation outside the U.S.A., then the following shall apply: (a) You confirm that this Agreement and all related documentation is and will be in the English language; (b) you are responsible for complying with any local laws in your jurisdiction which might impact your right to import, export or use the Software and Documentation or any services accessed or used in connection with the Software and Documentation, and you represent that you have complied with any regulations or registration procedures required by applicable law to make this license enforceable. \n\
16.Open Source Software. The Software may include the following Open Source Software and any such Open Source Software is subject to the following additional license terms and conditions:\n\
17. Use of content\n\
Prohibited Content. You will not post, transmit or deliver to any other user, either directly or indirectly, any User Content that violates any third-party rights or any applicable law, rule or regulation or is prohibited under this Agreement or any other Intro or SimpleBits Inc. policy governing your use of the Services (\"Prohibited Content\"). Prohibited Content includes without limitation User Content that:\n\
is obscene, pornographic, profane, defamatory, abusive, offensive, indecent, sexually oriented, threatening, harassing, inflammatory, inaccurate, misrepresentative, fraudulent or illegal;\n\
promotes racism, bigotry, hatred or physical harm of any kind against any group or individual;\n\
is intended to, or does, harass, or intimidate any other user or third party;\n\
may infringe or violate any patent, trademark, trade secret, copyright or other intellectual or proprietary right of any party, including User Content that contains others' copyrighted content (e.g., photos, images, music, movies, videos, etc.) without obtaining proper permission first;\n\
contains video, audio, photographs, or images of another person without his or her express written consent (or in the case of a minor, the minor's legal guardian) or otherwise violates anyone's right of privacy or publicity;\n\
promotes or enables illegal or unlawful activities, such as instructions on how to make or buy illegal weapons or drugs;\n\
violates someone's data privacy or data protection rights;\n\
contains viruses, time bombs, trojan horses, cancelbots, worms or other harmful, or disruptive codes, components or devices;\n\
contains any advertising, fundraising or promotional content; or\n\
is, in the sole judgment of Intro or SimpleBits Inc., objectionable or restricts or inhibits any person from using or enjoying the Services or exposes Intro or SimpleBits Inc. or its users to harm or liability of any type.\n\
(i) Copyright 2014 SimpleBits Inc.\n\
Licensed under the Apache License, Version 2.0 (the \"License\");\n\
you may not use this file except in compliance with the License.\n\
You may obtain a copy of the License at\n\
http://www.apache.org/licenses/LICENSE-2.0\n\
Unless required by applicable law or agreed to in writing, software\n\
distributed under the License is distributed on an \"AS IS\" BASIS,\n\
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
See the License for the specific language governing permissions and\n\
limitations under the License.\n\
By downloading, installing, accessing or using any Intro or SimpleBits Application, you represent that you have reviewed and agree to be bound by this Agreement. If you do not agree to be bound by this Agreement in its entirety, do not attempt to download, install, access or use any Intro or SimpleBits Applications.";

$scope.eulaAlert= function(){
  navigator.notification.alert(
    eula, 
    alertCallback, 
    'End User License Agreement', 'Ok');
};

$scope.privacyPolicyAlert = function(){
  navigator.notification.alert(
    privPol, 
    alertCallback, 
    'We care about your privacy', 'Ok');
};
var privPol = "\nWe don't post anything to Facebook or other third parties without your permission\n \n\
Your information is only used to help verify who you are and provide quality matches to you\n \n\
Others cannot contact you unless you've been matched\n \n\
Your location is protected - when posting you select what location you want to show. Other members will only be able to see their distance from you in miles, and no distances closer than 2 miles will be shown\n\n\
Feel free to contact us with any questions or concerns at privacy@thisisintro.com";

}]);


