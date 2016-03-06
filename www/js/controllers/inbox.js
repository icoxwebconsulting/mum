angular.module('app').controller('InboxCtrl', function ($scope, $rootScope, $state, $ionicPopup, messageService) {

    //$scope.conversation = {
    //    id: null,
    //    image: null,
    //    displayName: "",
    //    type: "",
    //    receivers: [],
    //    lastMessage: "",
    //    created: null,
    //    updated: null
    //};

    messageService.getInboxMessages().then(function (conversations) {
        $rootScope.conversations = conversations;
    });

    $scope.open = function (conversation) {
        messageService.setConversation(conversation);
        messageService.setMessage({
            type: conversation.type,
            body: "",
            date: null,
            from: null,
            subject: null,
            phoneNumber: null,
            email: null,
            displayName: conversation.displayName,
            created: null,
        });
        $state.go('conversation');
    };

    function toDelete() {
        messageService.deleteConversation($scope.conversation).then(function () {
            $rootScope.conversations.splice($rootScope.conversations.indexOf($scope.conversation), 1);
        }).catch(function (error) {
        })
    }

    $scope.deleteConversation = function (conversation) {
        $scope.conversation = conversation;
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
