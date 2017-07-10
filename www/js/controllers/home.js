angular.module('app').controller('HomeCtrl', function ($scope, $ionicViewService, $state, userDatastore, messageService) {
    $scope.selected = moment();
    console.log($scope.selected);

    $scope.$on('$ionicView.beforeEnter', function (e) {
        if (userDatastore.getStateCurrentName()){
            userDatastore.removeStateCurrentName();
        }

        if (userDatastore.getObjectMessage()){
            userDatastore.removeObjectMessage();
        }

        messageService.getInboxMessages().then(function (conversations) {
            $scope.conversations = conversations;
        });
        userDatastore.setStateCurrentName($state.current.name);
    });

    $scope.$on('$ionicView.enter', function (e) {
        $ionicViewService.clearHistory();
        if (userDatastore.getScheduleDay()){
            userDatastore.removeScheduleDay();
        }

        if (userDatastore.getEditMessage()){
            $state.go('refresh');
            userDatastore.removeEditMessage();
        }

        $scope.totalScheduleMessages = userDatastore.getScheduleMessages();
    });

});
