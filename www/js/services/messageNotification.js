angular.module('app').service('messageNotification', function ($rootScope, messageRes, userDatastore) {

    function notifySendMessage(idConversation, toUpdate, idMessage) {
        $rootScope.$emit('sentMessage', {
            idConversation: idConversation,
            index: toUpdate,
            idMessage: idMessage
        });
    }

    function notifyReceivedMessage(data, idMessage, type, conversation) {

        $rootScope.$emit('receivedMessage', {
            data: data,
            message: data.message,
            idMessage: idMessage,
            type: type,
            conversation: conversation
        });

        if (type == 'mum') {
            messageRes(userDatastore.getTokens().accessToken).notifyReceived({messageId: idMessage}, {}).$promise.then(function (response) {
            }).catch(function (error) {
                console.error(error);
            });
        }
    }

    return {
        notifySendMessage: notifySendMessage,
        notifyReceivedMessage: notifyReceivedMessage
    }
});