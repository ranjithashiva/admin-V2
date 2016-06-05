/*globals noty */
'use strict';

angular.module('adminApp', [ 'ngRoute',
  'ui.router',
  'toastr' 
  ])
  .config(['$urlRouterProvider','$locationProvider', '$httpProvider', function($urlRouterProvider,$locationProvider, $httpProvider) {
   
    $urlRouterProvider.otherwise('/login');

    var supports_history_api = function() {
      return !!(window.history && history.pushState);
    }
    if(supports_history_api()) {
      $locationProvider.html5Mode(true).hashPrefix('!');
    } else {
      $locationProvider.html5Mode(false);      
    }
    
  }])
  
  
.run(['$rootScope','$timeout', '$location',  '$window', '$state', function($rootScope, $timeout, $location,  $window, $state) {
 $rootScope.$on('$stateChangeSuccess', function(event) {
    if (!$window.ga)
      return;
    $window.ga('send', 'pageview', { page: $location.path() });
  });
 $rootScope.$on('$stateChangeStart', function(event, next) {
      /*Auth.isLoggedInAsync(function(loggedIn) {
      if (next.authenticate && !loggedIn) {
        $location.path('/login');
      }
    }); */   
  });
  
}]);
