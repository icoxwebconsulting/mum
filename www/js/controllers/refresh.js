angular.module('app').controller('RefreshCtrl', function ($scope, $state, $ionicLoading, $ionicViewService, $timeout) {
  $scope.$on('$ionicView.enter', function (e) {
    $ionicViewService.clearHistory();

    $ionicLoading.show();
    $timeout(function(){
      $ionicLoading.hide();
      $state.go('layout.home');
    },1000)

  });

});
