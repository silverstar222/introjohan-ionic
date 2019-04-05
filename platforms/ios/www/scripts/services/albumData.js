angular.module("revealApp.service.albumData", [])
  .factory('albumData', [function () {
    var photos = [];
    var fullImage;
    return {
      setAlbum: function(arg){
        photos = arg;
      },
      getAlbum: function(){
        return photos;
      },
      setImage: function(arg){
        fullImage = arg;
      },
      getImage: function(){
        return fullImage;
      }
    };
  }]);