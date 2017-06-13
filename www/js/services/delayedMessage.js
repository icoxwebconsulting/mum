angular.module('app').service('delayedMessageService', function ($q, messageStorage, messageQueue, DATETIME_FORMAT_CONF) {

    function processDelayedMessage(message) {

        var messageData = {
            message: {
                body: message.body,
                receivers: message.receivers
            },
            idConversation: message.id_conversation,
            toUpdate: message.to_update
        };

        if (message.at) {
            messageData.message.at = moment.utc(message.at).format(DATETIME_FORMAT_CONF.dateTimeFormat);
        }

        if (message.type == 'email') {
            messageData.about = message.about;
            messageData.from = message.from_address;
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
                messageQueue.add(messageData, type, messages[i].id);
            }
            messageQueue.process();
        }).catch(function (error) {
        });
    }

    return {
        run: run
    }
});

