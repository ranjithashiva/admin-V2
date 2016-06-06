'use strict';

angular.module('adminApp')
  .controller('LoginCtrl',['$scope', '$window', '$location', '$state', 'toastr' ,
   function ($scope, $window, $location, $state, toastr) {
    console.log("In ctrl");

    $scope.user = {
      'username': 'Ranjitha',
      'adType': 'Admin'      
    };

    var setLandingPage = function() {
      var currentUser = $scope.user;//Auth.getCurrentUser();
      if(currentUser) {
        var adType=currentUser.adType;
        if(adType==='SuperUser' || adType==='' || adType==='Admin') {          
            $state.go('home.account');
        }
        else {
	        var msg="Authentication not available for this current directory";
	        toastr.warning(msg,null);  
      	}
      }        
    }

    $scope.login = function() {
		 setLandingPage(); 
    }    
    

  }]);
