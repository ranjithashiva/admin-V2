'use strict';

angular.module('adminApp')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('home.account', {
        url: '/account',
        views: {
          '': {
            templateUrl: 'app/account/account.html',
            controller: 'AccountController'
          }
          
        }

      });


  }]);