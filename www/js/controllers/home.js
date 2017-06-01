angular.module('app').controller('HomeCtrl', function ($scope, $ionicViewService, userDatastore) {
    $scope.selected = moment();
    console.log($scope.selected)

    $scope.$on('$ionicView.enter', function (e) {
        $ionicViewService.clearHistory();
        if (userDatastore.getScheduleDay()){
            userDatastore.removeScheduleDay();
        }

        $scope.totalScheduleMessages = userDatastore.getScheduleMessages();
    });

});
