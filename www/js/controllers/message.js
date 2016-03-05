angular.module('app').controller('MessageCtrl', function ($scope, $rootScope, $state, $ionicLoading, $ionicPopup, messageService) {

    $scope.$on('$ionicView.enter', function () {
        if ($rootScope.previousState != 'layout.inbox') {
            $scope.mum = messageService.getMum();
        }
    });

    $scope.message = {
        subject: "",
        body: "",
        from: "",
        date: ""
    };

    $scope.sendMessage = function () {
        $ionicLoading.show();
        var conversation = {};

        conversation.receivers = [];
        conversation.receivers.push(($scope.mum.type == 'sms') ? $scope.mum.phoneNumber : $scope.mum.email);
        conversation.type = $scope.mum.type;
        conversation.displayName = $scope.mum.displayName;
        conversation.lastMessage = $scope.message.body;

        function processSend(message, idConversation) {
            messageService.sendMessage(message, idConversation).then(function () {
                $ionicLoading.hide();
                $scope.message = {
                    subject: "",
                    body: "",
                    from: "",
                    date: ""
                };
                $state.go('layout.inbox');
            }).catch(function (error) {
                console.log('hay un error', error);
                $ionicLoading.hide();
            });
        }

        messageService.findConversation($scope.mum.type, conversation.receivers).then(function (response) {
            console.log(response);
            if (response) {
                conversation.id = response.id;
                processSend($scope.message, conversation.id);
            } else {
                messageService.saveConversation(conversation).then(function (insertId) {
                    conversation.id = insertId;
                    $rootScope.conversations.unshift(conversation);
                    processSend($scope.message, conversation.id);
                });
            }
        });
    };

});
