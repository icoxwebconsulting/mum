angular.module('app').controller('MessageCtrl', function ($scope, $rootScope, $state, $ionicLoading, $ionicPopup, messageService) {

    $scope.$on('$ionicView.enter', function () {
        if ($rootScope.previousState != 'layout.inbox') {
            $scope.mum = messageService.getMum();
        }
    });

    $scope.message = {
        subject: "",
        body: "",
        from: ""
    };

    $scope.sendMessage = function () {
        $ionicLoading.show();
        var conversation = {};
        var mum = messageService.getMum();
        conversation.message = $scope.message.body;
        conversation.receivers = [];
        conversation.receivers.push((mum.type == 'sms') ? JSON.stringify([mum.phoneNumber]) : JSON.stringify([mum.email]));
        conversation.type = mum.type;
        conversation.displayName = mum.displayName;
        conversation.lastMessage = $scope.message.body;

        messageService.saveConversation(conversation).then(function (insertId) {
            conversation.id = insertId;
            $rootScope.conversations.unshift(conversation);
            messageService.sendMessage($scope.message, insertId).then(function () {
                $ionicLoading.hide();
                $scope.message = "";
                $state.go('layout.inbox');
            }).catch(function (error) {
                console.log('hay un error', error);
                $ionicLoading.hide();
            });
        });

    };

});
