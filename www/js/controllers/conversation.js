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

        messageSrv.sendMessage({
            body: $scope.message
        }, {
            id_message: $scope.conversation.id,
            id_conversation: $scope.conversation.id_conversation
        }).then(function (resp) {
                //TODO: manejo después del envío
                console.log("resp", resp)
            })
            .catch(function (error) {
                console.log("error", error)
            });
    };
});
