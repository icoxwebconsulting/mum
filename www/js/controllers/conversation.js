angular.module('app').controller('ConversationCtrl', function ($scope, $state, messageService) {

    $scope.conversation = {};
    $scope.messages = [];
    $scope.message;

    $scope.$on('$ionicView.enter', function (e) {
        $scope.conversation = messageService.getConversation();
        if ($scope.conversation.id) {
            messageService.getConversationMessages().then(function (msjs) {
                $scope.messages = msjs;
            });
        }
    });

    $scope.remove = function (chat) {
        Chats.remove(chat);
    };

    $scope.sendMessage = function () {
        var type = $scope.conversation.type;
        var mum = {
            type: type,
            date: null,
            phoneNumber: (type == 'sms') ? $scope.conversation.receivers : null,
            email: (type == 'email') ? $scope.conversation.receivers : null,
            displayName: $scope.conversation.displayName
        };

        messageService.setMum(mum);

        $scope.messages.push({
            about: null,
            at: null,
            from_address: null,
            id: null,
            id_conversation: $scope.conversation.id,
            body: $scope.message,
            to_send: true,
            created: moment.utc().format("DD-MM-YYYY HH:mm:ss")
        });

        var lastItem = $scope.messages.length - 1;

        var message = $scope.message;
        $scope.message = "";

        function sendMessage() {
            messageService.sendMessage({
                body: message
            }, $scope.conversation.id).then(function (params) {
                //TODO: manejo después del envío
                $scope.messages[lastItem].id = params.id;
                $scope.messages[lastItem].to_send = params.toSend;

            }).catch(function (error) {
                $scope.message = "";
                console.log("error", error);
            });
        }

        if (!$scope.conversation.id) {
            messageService.saveConversation($scope.conversation).then(function (insertId) {
                $scope.conversation.id = insertId;
                sendMessage();
            });
        } else {
            sendMessage();
        }
    };
});
