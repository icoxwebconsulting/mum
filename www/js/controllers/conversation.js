angular.module('app').controller('ConversationCtrl', function ($scope, $state, messageSrv) {

    $scope.conversation;
    $scope.messages;
    $scope.message;

    $scope.$on('$ionicView.enter', function (e) {
        console.log("en el modulo de conversation");
        messageSrv.getConversationMessages().then(function (msjs) {
            $scope.messages = msjs;
        });

        $scope.conversation = messageSrv.getConversation();
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
            displayName: $scope.conversation.name
        };

        messageSrv.setMum(mum);

        $scope.messages.push({
            about: null,
            at: null,
            from_address: null,
            id: null,
            id_conversation: $scope.conversation.id,
            body: $scope.message,
            created: moment.utc().format("DD-MM-YYYY HH:mm:ss")
        });

        messageSrv.sendMessage({
            body: $scope.message
        }, {
            id_message: $scope.conversation.id,
            id_conversation: $scope.conversation.id_conversation
        }).then(function (resp) {
                //TODO: manejo después del envío
                $scope.message = "";
                console.log("resp", resp)
            })
            .catch(function (error) {
                $scope.message = "";
                console.log("error", error)
            });
    };
});
