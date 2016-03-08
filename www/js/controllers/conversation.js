angular.module('app').controller('ConversationCtrl', function ($scope, $rootScope, $state, messageService) {

    $scope.messages = [];

    $scope.message = {
        type: "",
        body: "",
        date: null,
        from: null,
        subject: null,
        phoneNumber: null,
        email: null,
        displayName: "",
        created: null
    };

    $scope.conversation = {
        id: null,
        image: null,
        displayName: "",
        type: "",
        receivers: [],
        lastMessage: "",
        created: null,
        updated: null
    };

    $scope.$on('$ionicView.enter', function (e) {
        $scope.conversation = messageService.getConversation();
        if ($scope.conversation.id) {
            messageService.getConversationMessages($scope.conversation.id).then(function (msjs) {
                $scope.messages = msjs;
            });
        }
        $scope.message = messageService.getMessage();
    });

    $scope.$on('$ionicView.leave', function (e) {
        messageService.updateConversation($scope.conversation).then(function () {
            $scope.messages = [];
        });
    });

    $rootScope.$on('sentMessage', function (e, toUpdate) {
        if (toUpdate.idConversation = $scope.conversation.id) {
            $scope.messages[toUpdate.index].id_message = toUpdate.idMessage;
        }
    });

    $scope.sendMessage = function () {
        var type = $scope.conversation.type;
        var date = moment.utc().format("DD-MM-YYYY HH:mm:ss");

        $scope.messages.push({
            about: $scope.message.subject,
            at: null,
            from_address: $scope.message.from,
            id: $scope.conversation.id,
            body: $scope.message.body,
            to_send: true,
            is_received: false,
            created: date
        });

        var lastItem = $scope.messages.length - 1;

        $scope.conversation.lastMessage = $scope.message.body;
        $scope.conversation.updated = date;
        $scope.message.body = "";

        function processSend() {
            var message = $scope.message;
            message.body = $scope.conversation.lastMessage;
            message.toUpdate = lastItem;
            console.log("Antes de procesar envio", message, $scope.conversation)
            messageService.sendMessage(message, $scope.conversation).then(function () {
                //TODO:
                console.log("mensaje encolado");
            }).catch(function (error) {
                console.log("error", error);
            });
        }

        if (!$scope.conversation.id) {
            messageService.findConversation(type, $scope.conversation.receivers).then(function (response) {
                if (response) {
                    $scope.conversation = {
                        id: response.id,
                        image: response.image,
                        displayName: response.display_name,
                        type: response.type,
                        receivers: JSON.parse(response.receivers),
                        lastMessage: response.last_message,
                        created: response.created,
                        updated: response.updated
                    };
                    processSend();
                } else {
                    $scope.conversation.created = date;
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
