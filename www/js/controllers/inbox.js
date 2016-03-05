angular.module('app').controller('InboxCtrl', function ($scope, $rootScope, $state, $ionicPopup, messageService) {

    $scope.chats;
    $scope.conversation;

    messageService.getInboxMessages().then(function (conversations) {
        $rootScope.conversations = conversations;
    });

    $scope.open = function (conversation) {
        messageService.setConversation(conversation);
        $state.go('conversation');

    };

    function toDelete() {
        messageService.deleteConversation($scope.conversation).then(function () {
            $rootScope.conversations.splice($rootScope.conversations.indexOf($scope.conversation), 1);
        }).catch(function (error) {
        })
    }

    $scope.deleteConversation = function (c) {
        $scope.conversation = c;
        $ionicPopup.alert({
            title: 'Eliminar conversación',
            subTitle: '¿Desea eliminar la conversación?',
            scope: $scope,
            buttons: [
                {
                    text: '<b>Aceptar</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        toDelete();
                    }
                },
                {text: 'Cancelar'}
            ]
        });
    };
});
