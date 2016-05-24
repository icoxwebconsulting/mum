angular.module('app').service('messageQueue', function (messageRes, $q, messageStorage, userDatastore, messageNotification) {

    var queue = [];

    function add(message, type, idPending) {
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

    function processStorage(messageData, type, sentMessage, idConversation, isReceived, idPending, toUpdate, attachment) {
        messageStorage.saveMessageHistory(messageData, type, sentMessage, idConversation, isReceived, attachment).then(function (params) {
            messageStorage.deletePendingMessage(idPending).then(function () {
                messageNotification.notifySendMessage(idConversation, toUpdate, sentMessage);
                process();
            });
        });
    }

    function process() {
        if (length() > 0) {
            var messageData = queue.shift();
            var idPending = messageData.idPending;
            var type = messageData.type;
            messageData = messageData.data;
            var idConversation = messageData.room;
            var toUpdate = messageData.toUpdate;
            //var attachment = messageData.path;

            delete messageData.toUpdate;
            delete messageData.path;
            if(type != 'mum'){
                delete messageData.room;
            }
            //delete messageData.message.fileData;
            //delete messageData.message.fileMimeType;
            var isReceived = 0;

            if (type == 'sms') {
                messageRes(userDatastore.getTokens().accessToken).sendSms(messageData).$promise.then(function (response) {
                    //TODO handle server side error in data
                    processStorage(messageData, type, response.message, idConversation, isReceived, idPending, toUpdate, response.attachment);
                }).catch(function (error) {
                    process();
                });
            } else if (type == 'email') {
                messageRes(userDatastore.getTokens().accessToken).sendEmail(messageData).$promise.then(function (response) {
                    //TODO handle server side error in data
                    processStorage(messageData, type, response.message, idConversation, isReceived, idPending, toUpdate, response.attachment);
                }).catch(function (error) {
                    process();
                });
            } else if (type == 'mum') {
                messageRes(userDatastore.getTokens().accessToken).sendInstant(messageData).$promise.then(function (response) {
                    //TODO handle server side error in data
                    processStorage(messageData, type, response.message, idConversation, isReceived, idPending, toUpdate, response.attachment);
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