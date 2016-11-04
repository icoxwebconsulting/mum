angular.module('app').controller('ScheduleListCtrl', function ($scope, $state, $ionicLoading, $stateParams, $ionicPopup, messageService) {

    $scope.dateParam = $stateParams;
    var popup;
    $ionicLoading.show();
    messageService.getSchedulesByDate($scope.dateParam.date).then(function (messages) {
        $scope.messages = messages;
        $ionicLoading.hide();
        // console.log('messages:', $scope.messages);
    });


    $scope.open = function (scheduleMessage) {
        messageService.setMessage(scheduleMessage);
        
        if (popup) {
            popup.close();
        }
        $state.go('scheduleDetails');
    };


});
