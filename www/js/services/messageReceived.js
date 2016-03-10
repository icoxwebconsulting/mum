angular.module('app').service('messageReceived', function ($rootScope, $q, messageStorage, messageNotification) {

    function saveMessage(data, idConversation) {

        //TODO: armar objeto message
        var isReceived = true;
        var messageData;
        var type, message;
        messageStorage.saveMessageHistory(messageData, type, message, idConversation, isReceived).then(function (resp) {
            //resp.insertId //id del mensaje en bd

            //notificar al inbox para que muestre el mensaje recibido
            //notificar a conversation para que muestre/actualice la conversación recibida
            messageNotification.notifyReceivedMessage(data, resp.insertId);
        });
    }

    function processReceivedMessage(data) {
        console.log(data);
        //verificar que si existe ya una conversación asociada
        //TODO: extraer esta info del mensaje que viene en data
        var type, receivers;
        messageStorage.findConversation(type, receivers).then(function (conversation) {
            if (conversation) {
                saveMessage(data, conversation.id);
            } else {
                //no existe, crearla
                //TODO: definir objeto conversation
                messageStorage.saveConversation(conversation).then(function (idConversation) {
                    saveMessage(data, idConversation);
                });
            }
        })
    }

    pushNotification.listenNotification(processReceivedMessage);

    return {
        processReceivedMessage: processReceivedMessage
    };

});