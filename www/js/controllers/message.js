angular.module('app').controller('MessageCtrl', function ($scope, $rootScope, $state, $ionicLoading, $ionicPopup, messageService) {

    $scope.$on('$ionicView.enter', function () {

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
        var mum = messageService.getMum();

        conversation.receivers = [];
        conversation.receivers.push((mum.type == 'sms') ? JSON.stringify([mum.phoneNumber]) : JSON.stringify([mum.email]));
        conversation.type = mum.type;
        conversation.displayName = mum.displayName;
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
                $ionicLoading.hide();
            });
        }

        messageService.findConversation(mum.type, conversation.receivers).then(function (response) {
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
