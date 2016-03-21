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
            messageNotification.notifyReceivedMessage(data, resp.insertId, type, conversation);
        });
    }

    function processReceivedMessage(data) {
        console.log(data);
        //verificar que si existe ya una conversación asociada
        var sender = data.additionalData.sender;
        var type = data.additionalData.type;
        type = (type == 2) ? 'mum' : (type == 1) ? 'email' : 'sms';

        messageStorage.findConversation(type, [sender]).then(function (response) {
            var conversation = messageService.factory().createConversation();
            var date = moment.utc().format("DD-MM-YYYY HH:mm:ss");
            if (response) {
                console.log("entro en el caso que existe", conversation);
                conversation.id = response.id;
                conversation.image = response.image;
                conversation.displayName = response.display_name;
                conversation.type = response.type;
                conversation.receivers = JSON.parse(response.receivers);
                conversation.lastMessage = data.message;
                conversation.created = response.created;
                conversation.updated = date;
                conversation.isUnread = 1;

                messageStorage.updateConversation(conversation).then(function () {
                    saveMessage(data, conversation, type);
                });
            } else {
                //no existe, crearla
                console.log("no existe", conversation);
                conversation.type = type;
                conversation.receivers = [sender];
                conversation.lastMessage = data.message;
                conversation.created = date;
                conversation.updated = date;
                conversation.isUnread = 1;
                Contacts.getContact(sender).then(function (contact) {
                    if (contact) {
                        conversation.displayName = contact.display_name;
                        conversation.image = contact.photo;
                    } else {
                        conversation.displayName = sender;
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