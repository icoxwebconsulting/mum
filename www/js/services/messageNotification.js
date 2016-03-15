angular.module('app').service('messageNotification', function ($rootScope) {

    function notifySendMessage(idConversation, toUpdate, idMessage) {
        if (toUpdate) {
            $rootScope.$emit('sentMessage', {
                idConversation: idConversation,
                index: toUpdate,
                idMessage: idMessage
            });
        }
    }

    function notifyReceivedMessage(data, idMessage, type, idConversation) {
        $rootScope.$emit('receivedMessage', {
            data: data,
            idMessage: idMessage,
            type: type,
            idConversation: idConversation
        });
    }

    return {
        notifySendMessage: notifySendMessage,
        notifyReceivedMessage: notifyReceivedMessage
    }
});