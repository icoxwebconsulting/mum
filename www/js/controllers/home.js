angular.module('app').controller('HomeCtrl', function ($scope, $ionicViewService, $state, userDatastore) {
    $scope.selected = moment();
    console.log($scope.selected);

    $scope.$on('$ionicView.beforeEnter', function (e) {
        if (userDatastore.getStateCurrentName()){
            userDatastore.removeStateCurrentName();
        }
        userDatastore.setStateCurrentName($state.current.name);
    });

    $scope.$on('$ionicView.enter', function (e) {
        $ionicViewService.clearHistory();
        if (userDatastore.getScheduleDay()){
            userDatastore.removeScheduleDay();
        }

        $scope.totalScheduleMessages = userDatastore.getScheduleMessages();
    });

});
