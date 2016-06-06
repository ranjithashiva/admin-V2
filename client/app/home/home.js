'use strict';

angular.module('adminApp')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('home', {
         url: '/home',
         abstract: true,
         views: {
          '': {
            templateUrl: 'app/home/home.html',
            controller: 'HomeController'
          }
        }  
      });
  }]);