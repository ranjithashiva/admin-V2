'use strict';

angular.module('adminApp')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('home.account', {
        url: '/account',        
        templateUrl: 'app/account/list.html',
        controller: 'AccountController'
      })
      .state('home.account.details', {
        url: '/detail',
        templateUrl: 'views/account/details.html',
        controller : 'AccountDetailCtrl'
      })
      .state('home.account.create', {
        url: '/create',
        templateUrl: 'views/account/view.html',
        controller : 'AccountCreateEditCtrl'
      })
      .state('home.account.update', {
        url: '/{accountId:[0-9]*}/edit',
        templateUrl: 'views/account/view.html',
        controller : 'AccountCreateEditCtrl'
      })
      .state('home.account.delete', {
        url: '/{accountId:[0-9]*}/delete',
        templateUrl: 'views/account/list.html',
        controller : 'AccountDeleteCtrl'
      });


  }]);