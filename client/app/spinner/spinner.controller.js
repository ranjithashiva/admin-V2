angular.module('adminApp')
.controller('SpinnerCtrl',['$scope', '$rootScope', '$modalInstance', function($scope, $rootScope, $modalInstance) {
    $rootScope.$watch('xhr', function() {
      if($rootScope.xhr < 1) {
        $modalInstance.close();  
      }
    });
  }]);