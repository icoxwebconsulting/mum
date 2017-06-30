angular.module('app').controller('InboxCtrl', function ($scope, $rootScope, $state, $ionicPopup, $filter, messageService, $ionicViewService, $ionicLoading, $timeout, userDatastore) {

    $scope.conversation = messageService.factory().createConversation();
    var popup;
    var valid = false;

    messageService.getInboxMessages().then(function (conversations) {
        $scope.conversations = conversations;
        console.info('$scope.conversations', $scope.conversations);
    });

    $scope.$on('$ionicView.beforeEnter', function (e) {
        valid = false;
        $ionicViewService.clearHistory();
        messageService.getInboxMessages().then(function (conversations) {
            $scope.conversations = conversations;
        });
        userDatastore.setStateCurrentName($state.current.name);
    });

    $rootScope.$on('addConversation', function (e, data) {
        $scope.conversations.unshift(data.conversation);
    });

    $scope.$on('$ionicView.enter', function (e) {
        $ionicViewService.clearHistory();
        $ionicLoading.show();
        $timeout(function(){
          $ionicLoading.hide();
        },1000)
    });

    $scope.open = function (conversation) {
        messageService.setConversation(conversation);
        var message = messageService.factory().createMessage();
        message.type = conversation.type;
        message.displayName = conversation.displayName;
        messageService.setMessage(message);
        if (popup) {
            popup.close();
        }
        if (valid == false){
            $state.go('conversation');
        }
    };

    function toDelete() {
        messageService.deleteConversation($scope.conversation).then(function () {
            $scope.conversations.splice($scope.conversations.indexOf($scope.conversation), 1);
        }).catch(function (error) {
        })
    }

    $scope.deleteConversation = function (conversation) {
        valid = true;
        $scope.conversation = conversation;
        popup = $ionicPopup.alert({
            title: 'Eliminar conversación',
            subTitle: '¿Desea eliminar la conversación?',
            scope: $scope,
            buttons: [
                {
                    text: '<b>Aceptar</b>',
                    type: 'button-mum',
                    onTap: function (e) {
                        toDelete();
                    }
                },
                {text: 'Cancelar'}
            ]
        });
        valid = false;
    };

    $rootScope.$on('receivedMessage', function (e, data) {
        if($state.current.name == 'conversation' && messageService.getConversation().id == data.conversation.id){
            data.conversation.isUnread = 0;
        }

        if (data.conversation.lastMessage.indexOf("http://188.138.127.") != -1) {
            data.conversation.lastMessage = "Imagen";
        }
        var found;
        for (var i = 0; i < $scope.conversations.length; i++) {
            if ($scope.conversations[i]['id'] == data.conversation.id) {
                found = $scope.conversations[i];
                break;
            }
        }

        if (found) {
            $scope.conversations.splice($scope.conversations.indexOf(found), 1);
        }
        $scope.conversations.unshift(data.conversation);

        $scope.totalScheduleMessages = userDatastore.getScheduleMessages();
    });
});
