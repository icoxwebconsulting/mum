angular.module('app').controller('ConversationCtrl', function ($scope, $state, messageSrv) {

    $scope.messages;

    $scope.message;

    $scope.$on('$ionicView.enter', function (e) {
        console.log("en el modulo de conversation");
        messageSrv.getConversationMessages().then(function (msjs) {
            $scope.messages = msjs;
        });

        $scope.conversation = messageSrv.getConversation();
        console.log("la querida conversation", $scope.conversation)
    });

    $scope.remove = function (chat) {
        Chats.remove(chat);
    };

    $scope.open = function (chat) {
        //{id: 1, name: "David", lastText: "da", image: "img/person.png", type: "sms", updated: "04-02-2016 18:46:33"}
        if (chat.type == 'sms') {
            messageSrv.setConversation(chat);
            $state.go('conversation');
        }
        //$state.go('layout.inbox');
    }

    $scope.sendMessage = function () {
        //$ionicLoading.show();
        messageSrv.sendMessage($scope.message)
            .then(function (resp) {
                $ionicLoading.hide();
                $state.go('layout.inbox');
            })
            .catch(function () {
                $ionicLoading.hide();
            });
    };
});
