angular.module('app').controller('ScheduleDetailsCtrl', function ($scope, $state, messageService, DATETIME_FORMAT_CONF) {

    $scope.$on('$ionicView.enter', function (e) {
        $scope.message = messageService.getMessage();
        $scope.date = moment(($scope.message.at).toString()).format('YYYY-MM-DD');
        console.log('scope', $scope);
    });

});