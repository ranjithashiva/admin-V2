'use strict';

angular.module('adminApp')
  .controller('HomeController', ['$scope',  '$state', '$location', '$rootScope',
    function($scope,$state, $location, $rootScope) {
    console.log("Home ctrl");
    
    $scope.tabList = [
               {
                  "heading": "Acount",
                  "active": false,
                  "state":".account"
              },
              {
                  "heading": "Kisok",
                  "active": false,
                  "state":".kiosk"
              },
              {
                  "heading": "Packages",
                  "active": false,
                  "state": ".package"
              },
              {
                  "heading": "Webapps",
                  "active": false,
                  "state":".webapp"
              },
              {
                  "heading": "Loopcards",
                  "active": false,
                  "state":".loopcard"
              },
              {
                  "heading": "Smartcards",
                  "active": false,
                  "state":".smartcard"
              },
              {
                  "heading": "Addcards",
                  "active": false,
                  "state":"addcard"
              }
              

          ];
      var stateName='';
      $scope.tabList.forEach( function (tab) {
        var tabState = tab.state;
        if(stateName  == tabState) {
          tab.active = true;
        }
      });
}]);          