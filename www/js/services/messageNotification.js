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

    function notifyReceivedMessage(data, idMessage, type, conversation) {
        $rootScope.$emit('receivedMessage', {
            data: data,
            message: data.message,
            idMessage: idMessage,
            type: type,
            conversation: conversation
        });
    }

    return {
        notifySendMessage: notifySendMessage,
        notifyReceivedMessage: notifyReceivedMessage
    }
});