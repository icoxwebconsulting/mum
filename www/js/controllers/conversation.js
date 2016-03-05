angular.module('app').controller('ConversationCtrl', function ($scope, $rootScope, $state, messageService) {

    $scope.conversation = {};
    $scope.messages = [];
    $scope.message = {
        subject: null,
        body: "",
        from: null,
        date: null
    };

    $scope.$on('$ionicView.enter', function (e) {
        $scope.conversation = messageService.getConversation();
        if ($scope.conversation.id) {
            messageService.getConversationMessages().then(function (msjs) {
                $scope.messages = msjs;
            });
        }
    });

    $scope.$on('$ionicView.leave', function (e) {
        $scope.messages = [];
    });

    $scope.sendMessage = function () {
        var type = $scope.conversation.type;
        var date = moment.utc().format("DD-MM-YYYY HH:mm:ss");
        var mum = {
            type: type,
            date: null,
            phoneNumber: (type != 'email') ? $scope.conversation.receivers : null,
            email: (type == 'email') ? $scope.conversation.receivers : null,
            displayName: $scope.conversation.displayName
        };

        messageService.setMum(mum);

        $scope.messages.push({
            about: $scope.message.subject,
            at: null,
            from_address: $scope.message.from,
            id: $scope.conversation.id,
            body: $scope.message.body,
            to_send: true,
            created: date
        });

        $scope.conversation.lastMessage = $scope.message.body;
        $scope.conversation.created = date;
        $scope.conversation.updated = date;
        $scope.message.body = "";

        function processSend() {
            var message = $scope.message;
            message.body = $scope.conversation.lastMessage;
            messageService.sendMessage(message, $scope.conversation.id).then(function () {
                //TODO:
            }).catch(function (error) {
                console.log("error", error);
            });
        }

        if (!$scope.conversation.id) {
            messageService.findConversation(type, $scope.conversation.receivers).then(function (response) {
                if (response) {
                    $scope.conversation = {
                        id: response.id,
                        displayName: response.display_name,
                        image: response.image,
                        lastMessage: response.last_message,
                        receivers: JSON.parse(response.receivers),
                        type: response.type,
                        updated: response.updated,
                        created: response.created
                    }
                } else {
                    messageService.saveConversation($scope.conversation).then(function (insertId) {
                        $scope.conversation.id = insertId;
                        $rootScope.conversations.unshift($scope.conversation);
                        processSend();
                    });
                }
            });
        } else {
            processSend();
        }
    };
});
