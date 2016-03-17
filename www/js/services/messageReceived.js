angular.module('app').service('messageReceived', function ($rootScope, $q, messageStorage, messageNotification, messageService, Contacts) {

    function saveMessage(data, conversation, type) {

        var messageId = Math.random().toString(36).substr(2);
        var messageData = {
            message: {
                body: data.message,
                receivers: JSON.stringify(conversation.receivers)
            }
        };
        var isReceived = 1;

        messageStorage.saveMessageHistory(messageData, type, messageId, conversation.id, isReceived).then(function (resp) {
            //resp.insertId //id del mensaje en bd

            //notificar al inbox para que muestre el mensaje recibido
            //notificar a conversation para que muestre/actualice la conversación recibida
            messageNotification.notifyReceivedMessage(data, resp.insertId, type, conversation.id);
        });
    }

    function processReceivedMessage(data) {
        console.log(data);
        //verificar que si existe ya una conversación asociada
        var receivers = data.additionalData.receivers;
        var type = data.additionalData.type;
        type = (type == 2) ? 'mum' : (type == 1) ? 'email' : 'sms';

        messageStorage.findConversation(type, receivers).then(function (conversation) {
            if (conversation) {
                console.log("entro en el caso que existe", conversation);
                //TODO: actualizar conversación
                saveMessage(data, conversation, type);
            } else {
                //no existe, crearla
                var conversation = messageService.factory().createConversation();
                conversation.type = type;
                conversation.receivers = receivers;
                conversation.lastMessage = data.message;
                Contacts.getContact(receivers[0]).then(function (contact) {
                    if (contact) {
                        conversation.displayName = contact.display_name;
                    }
                    messageStorage.saveConversation(conversation).then(function (idConversation) {
                        conversation.id = idConversation;
                        saveMessage(data, conversation, type);
                    });
                });
            }
        })
    }

    return {
        processReceivedMessage: processReceivedMessage
    };

});