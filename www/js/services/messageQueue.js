angular.module('app').service('messageQueue', function (messageRes, $q, messageStorage, userDatastore, messageNotification) {

    var queue = [];

    function add(message, type, idPending) {
        console.log("MENSAJE PENDIENTE EN COLA",message, type, idPending);
        queue.push({
            data: message,
            type: type,
            idPending: idPending
        });
        process();
    }

    function length() {
        return queue.length;
    }

    function processStorage(messageData, type, sentMessage, idConversation, isReceived, idPending, toUpdate) {
        messageStorage.saveMessageHistory(messageData, type, sentMessage, idConversation, isReceived).then(function (params) {
            messageStorage.deletePendingMessage(idPending).then(function () {
                console.log("para notify", idConversation, toUpdate, sentMessage);
                messageNotification.notifySendMessage(idConversation, toUpdate, sentMessage);
                process();
            });
        });
    }

    function process() {
        if (length() > 0) {
            console.log("hay elementos para el process");
            var messageData = queue.shift();
            var idPending = messageData.idPending;
            var type = messageData.type;
            messageData = messageData.data;
            var idConversation = messageData.idConversation;
            var toUpdate = messageData.toUpdate;

            delete messageData.idConversation;
            delete messageData.toUpdate;
            var isReceived = false;

            if (type == 'sms') {
                messageRes(userDatastore.getTokens().accessToken).sendSms(messageData).$promise.then(function (response) {
                    //TODO handle server side error in data
                    processStorage(messageData, type, response.message, idConversation, isReceived, idPending, toUpdate);
                }).catch(function (error) {
                    process();
                });
            } else if (type == 'email') {
                messageRes(userDatastore.getTokens().accessToken).sendEmail(messageData).$promise.then(function (response) {
                    //TODO handle server side error in data
                    processStorage(messageData, type, response.message, idConversation, isReceived, idPending, toUpdate);
                }).catch(function (error) {
                    process();
                });
            } else if (type == 'mum') {
                messageRes(userDatastore.getTokens().accessToken).sendInstant(messageData).$promise.then(function (response) {
                    //TODO handle server side error in data
                    processStorage(messageData, type, response.message, idConversation, isReceived, idPending, toUpdate);
                }).catch(function (error) {
                    process();
                });
            }


        }
    }

    return {
        add: add,
        length: length,
        process: process
    }
});