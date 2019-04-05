angular.module("revealApp.service.userData", [])
  .factory('userData', [ function () {
    var user;
    var testState = false;
    //testState = true;
    if (testState){
      user = {
        testState: true,
        latlon: ['-122.435', '37.7918'],
        // fid: '700077',
        // name: 'Ian Driver',
        // fid: '16013273', 
        // name: 'Cindy',
        // fid: '100007022686973',
        // name: 'testuser',
        fid: '2402426',
        name: 'Eric Lau',
        // fid: '673720172',
        // name: "Bryan O'Connell",
        "matchesRemaining":100,
        "education" : [ 
            {
                "school" : {
                    "id" : "103976952971929",
                    "name" : "Scarsdale High School"
                },
                "type" : "High School"
            }, 
            {
                "school" : {
                    "id" : "126533127390327",
                    "name" : "Massachusetts Institute of Technology (MIT)"
                },
                "type" : "College"
            }, 
            {
                "degree" : {
                    "id" : "196378900380313",
                    "name" : "MBA"
                },
                "school" : {
                    "id" : "103100539729466",
                    "name" : "Harvard Business School"
                },
                "type" : "Graduate School"
            }
        ],
        // ELin
        // "education" : [ 
        //     {
        //         "school" : {
        //             "id" : "103976952971929",
        //             "name" : "Scarsdale High School"
        //         },
        //         "type" : "High School"
        //     }, 
        //     {
        //         "school" : {
        //             "id" : "126533127390327123",
        //             "name" : "Boston College"
        //         },
        //         "type" : "College"
        //     }
        // ],
        //Driver 
        // "education" : [ 
        //     {
        //         "school" : {
        //             "id" : "1039761232971929",
        //             "name" : "Ark High School"
        //         },
        //         "type" : "High School"
        //     }, 
        //     {
        //         "school" : {
        //             "id" : "126533127390327",
        //             "name" : "Massachusetts Institute of Technology (MIT)"
        //         },
        //         "type" : "College"
        //     }, 
        //     {
        //         "degree" : {
        //             "id" : "196378900380313",
        //             "name" : "MBA"
        //         },
        //         "school" : {
        //             "id" : "10310053971239466",
        //             "name" : "Columbia"
        //         },
        //         "type" : "Graduate School"
        //     }
        // ],
        // Boco
        // "education" : [ 
        //     {
        //         "school" : {
        //             "id" : "121233127390327",
        //             "name" : "Limerick"
        //         },
        //         "type" : "College"
        //     }, 
        //     {
        //         "degree" : {
        //             "id" : "196378900380313",
        //             "name" : "MBA"
        //         },
        //         "school" : {
        //             "id" : "103100539729466",
        //             "name" : "Harvard Business School"
        //         },
        //         "type" : "Graduate School"
        //     }
        // ],
        // Elau
        // "education" : [ 
        //     {
        //         "school" : {
        //             "id" : "12123312739031237",
        //             "name" : "Northwestern"
        //         },
        //         "type" : "College"
        //     }, 
        //     {
        //         "degree" : {
        //             "id" : "196378900380313",
        //             "name" : "MBA"
        //         },
        //         "school" : {
        //             "id" : "103100539729466",
        //             "name" : "Harvard Business School"
        //         },
        //         "type" : "Graduate School"
        //     }
        // ],
        "unreadMessages" : 1,
        "unreadTags" : 0,
        "unseenMatches" : 0, 
        "matches": [ 
            {
                "fid" : "1601373",
                "date" : "2014-07-31T23:11:22.067Z",
                "unseenChat" : 1
            },
            {
                "fid" : "2402426",
                "date" : "2014-07-31T23:11:22.067Z",
                "unseenChat" : 1
            }
        ],
            "profilePhotos" : [ 
        "https://graph.facebook.com/704345/picture?redirect=1&height=9999&width=9999"
    ],

        "filters" : {
            "gender" : "Men",
            "allAges" : true,
            "maxAge" : 40,
            "minAge" : 18,
            "distance" : 60
        },


        "friends" : {
        "data" : [ 
            {
                "name" : "Dan Kanivas",
                "id" : "665"
            }, 
            {
                "name" : "Bryan O'Connell",
                "id" : "673720172"
            }, 
            {
                "name" : "Allisonasdfasdfafa Tanenhaus",
                "id" : "3366"
            }, 
            {
                "name" : "Sarah asdfjliadjf asdf Schacter",
                "id" : "6335"
            }, 
            {
                "name" : "Kevinadfasdfa asdf asdfa asdfTung",
                "id" : "100524"
            }, 
            {
                "name" : "Edward Kim",
                "id" : "104991"
            }, 
            {
                "name" : "Ed Hsieh",
                "id" : "704345"
            }, 
            {
                "id" : "2623",
                "name" : "Michael Chang"
            }, 
            {
                "id" : "2684",
                "name" : "Joe Jackson"
            }, 
            {
                "id" : "2623",
                "name" : "Michael Chang"
            }, 
            {
                "id" : "2684",
                "name" : "Joe Jackson"
            }, 
            {
                "id" : "2684",
                "name" : "Joe Jackson"
            }, 
            {
                "id" : "2623",
                "name" : "Michael Chang"
            }, 
            {
                "id" : "2684",
                "name" : "Joe Jackson"
            }, 
            {
                "id" : "2684",
                "name" : "Joe Jackson"
            }, 
            {
                "id" : "2623",
                "name" : "Michael Chang"
            }, 
            {
                "id" : "2684",
                "name" : "Joe Jackson"
            }, 
            {
                "id" : "2684",
                "name" : "Joe Jackson"
            }, 
            {
                "id" : "2623",
                "name" : "Michael Chang"
            }, 
            {
                "id" : "2684",
                "name" : "Joe Jackson"
            }, 
            {
                "id" : "2684",
                "name" : "Joe Jackson"
            }, 
            {
                "id" : "2623",
                "name" : "Michael Chang"
            }, 
            {
                "id" : "2684",
                "name" : "Joe Jackson"
            }, 
            {
                "id" : "2623",
                "name" : "Michael Chang"
            }, 
            {
                "id" : "2684",
                "name" : "Joe Jackson"
            }, 
            {
                "id" : "2879",
                "name" : "Pablo Tsutsumi"
            }, 
            {
                "id" : "2902",
                "name" : "Frances Cashin"
            }]}
        };
    }
    return {
      setUser: function(arg){
        user = arg;
      },
      getUser: function(){
        return user;
      },
      testState: testState,
      data: {unreadMessages: 0, unreadTags: 0, unseenMatches:0, matches: []}
    };
  }]);