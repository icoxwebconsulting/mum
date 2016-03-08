angular.module('app').service('delayedMessageService', function ($q, messageStorage, messageQueue) {

    function processDelayedMessage(message) {

        var messageData = {
            message: {
                body: message.body,
                receivers: message.receivers
            }
        };

        if (message.at) {
            messageData.message.at = message.at;
        }
        return messageData;
    }

    function run() {
        messageStorage.getDelayedMessages().then(function (messages) {
            var messageData;
            var type;
            for (var i = 0; i < messages.length; i++) {
                messageData = processDelayedMessage(messages[i]);
                type = messages[i].type;
                if (type == 'sms') {
                    messageQueue.addSms(messageData);
                } else if (type == 'email') {
                    messageQueue.addEmail(messageData);
                } else if (type == 'mum') {
                    messageQueue.addMum(messageData);
                }
            }
            messageQueue.processSms();
            messageQueue.processEmail();
            messageQueue.processMum();
        }).catch(function (error) {
            console.log("Error al obtener los mensajes pendientes", error);
        });
    }

    return {
        run: run
    }
});

