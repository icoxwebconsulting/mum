angular.module('app').service('messageReceived', function ($rootScope, $q, messageReceivedQueue, userDatastore, messageRes) {

    function processReceivedMessage(data) {
        var sender = data.additionalData.sender;
        var type = data.additionalData.type;
        type = (type == 2) ? 'mum' : (type == 1) ? 'email' : 'sms';
        var messageData = {
            message: {
                body: data.message
            }
        };

        messageReceivedQueue.add(messageData, data.additionalData.messageId, type, sender);
    }

    function getAndProcess() {
        if(!userDatastore.isVerified()){
            return;
        }
        messageRes(userDatastore.getTokens().accessToken).getInstants({received: 0}).$promise.then(function (response) {
            var message;
            for (var i = 0; i < response.messages.length; i++) {
                message = response.messages[i];
                processReceivedMessage({
                    additionalData: {
                        sender: message.customer.username,
                        type: 2,
                        messageId: message.message.id
                    },
                    message: message.message.body
                });
            }
        }).catch(function (error) {
            console.error(error);
        });
    }

    return {
        processReceivedMessage: processReceivedMessage,
        getAndProcess: getAndProcess
    };

});