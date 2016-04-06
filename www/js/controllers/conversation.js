angular.module('app').controller('ConversationCtrl', function ($scope, $rootScope, $state, $ionicScrollDelegate, messageService, focus) {

    var message;

    $scope.messages = [];
    $scope.conversation;
    $scope.body = "";
    $scope.subject = "";
    $scope.from = null;

    $scope.$on('$ionicView.enter', function (e) {
        $scope.conversation = messageService.getConversation();
        $scope.conversation.isUnread = 0;
        message = messageService.getMessage();
        if ($scope.conversation.id) {
            messageService.getConversationMessages($scope.conversation.id).then(function (msjs) {
                $scope.messages = msjs;
                $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
            });
        }
    });

    $scope.$on('$ionicView.leave', function (e) {
        $scope.messages = [];
        messageService.updateConversation($scope.conversation).then(function () {
            $scope.conversation = messageService.factory().createConversation();
        });
    });

    $rootScope.$on('sentMessage', function (e, toUpdate) {
        if (toUpdate.idConversation = $scope.conversation.id) {
            $scope.messages[toUpdate.index].id_message = toUpdate.idMessage;
        }
    });

    $rootScope.$on('receivedMessage', function (e, data) {
        if ($rootScope.currentState == "conversation" && $scope.conversation.id == data.conversation.id) {
            var date = moment.utc().format("DD-MM-YYYY HH:mm:ss");
            $scope.messages.push({
                about: (data.type = 'email') ? "" : null,
                at: null,
                from_address: (data.type = 'email') ? "" : null,
                id: data.idMessage, //TODO: revisar que se cambio de idConversation
                body: data.message,
                to_send: false,
                is_received: true,
                created: date
            });

            $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
        }
    });

    $scope.sendMessage = function () {
        if ($scope.body == "" || $scope.body.length < 1) {
            return;
        }

        var type = $scope.conversation.type;
        var date = moment.utc().format("DD-MM-YYYY HH:mm:ss");
        message.created = date;
        $scope.conversation.lastMessage = $scope.body;
        $scope.conversation.updated = date;
        $scope.messages.push({
            about: (type = 'email') ? $scope.subject : null,
            at: null,
            from_address: (type = 'email') ? $scope.from : null,
            id: $scope.conversation.id,
            body: $scope.body,
            to_send: true,
            is_received: false,
            created: date
        });
        //$ionicScrollDelegate.$getByHandle('mainScroll').resize();
        $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();

        var lastItem = $scope.messages.length - 1;

        function processSend() {
            message.body = $scope.body;
            message.toUpdate = lastItem;
            if (type == 'email') {
                message.from = $scope.from;
                message.subject = $scope.subject;
            }
            $scope.body = "";
            focus('inputMsj');
            messageService.sendMessage(message, $scope.conversation).then(function () {
                //TODO:
            }).catch(function (error) {
            });
        }

        if (!$scope.conversation.id) {
            messageService.findConversation(type, $scope.conversation.receivers).then(function (response) {
                if (response) {
                    $scope.conversation.id = response.id;
                    $scope.conversation.image = response.image;
                    $scope.conversation.displayName = response.display_name;
                    $scope.conversation.type = response.type;
                    $scope.conversation.receivers = JSON.parse(response.receivers);
                    $scope.conversation.lastMessage = response.last_message;
                    $scope.conversation.created = response.created;
                    $scope.conversation.updated = response.updated;

                    processSend();
                } else {
                    $scope.conversation.created = date;
                    messageService.saveConversation($scope.conversation).then(function (insertId) {
                        $scope.conversation.id = insertId;
                        $rootScope.$emit('addConversation', {
                            conversation: $scope.conversation
                        });
                        processSend();
                    });
                }
            });
        } else {
            processSend();
        }
    };
});
