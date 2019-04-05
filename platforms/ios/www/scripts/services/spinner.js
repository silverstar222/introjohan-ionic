angular.module("revealApp.service.spinner", [])
  .factory('spinner', [ function () {
    return {
      hide: function(){
        window.wizSpinner.hide();
      },
      show: function(){
        var options = {
        customSpinner : false,
        position : "middle",
        label : "Loading...",
        bgColor: "#000",
        opacity:0.5,
        color: "#fff"
        };
      window.wizSpinner.show(options);
      }
    };
  }]);