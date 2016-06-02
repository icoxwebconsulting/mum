angular.module('app').service('messageReceivedQueue', function (messageStorage, messageService, userDatastore, messageNotification, Contacts) {

    var queue = [];
    var isRunning = false;

    function add(message, idMessage, type, sender) {
        if(length() == 0){
            isRunning = false;
        }
        queue.push({
            data: message,
            type: type,
            sender: sender,
            idMessage: idMessage
        });
        process();
    }

    function length() {
        return queue.length;
    }

    function saveMessage(messageData, messageId, conversation, type) {
        var attachment = (messageData.message.body.indexOf("http://188.138.127.53/mum/framework/web/")  != -1)? messageData.message.body : null;
        messageStorage.saveMessageHistory(messageData, type, messageId, conversation.id, 1, attachment).then(function () {
            //notificar al inbox para que muestre el mensaje recibido
            //notificar a conversation para que muestre/actualice la conversación recibida
            messageNotification.notifyReceivedMessage(messageData, messageId, type, conversation);
            nextElement();
        }).catch(function (error) {
            if(error.code == 6){
                messageNotification.notifyReceived(messageId);
            }
            nextElement();
        });
    }

    function process() {
        if (!isRunning) {
            nextElement();
        }
    }

    function nextElement() {
        if (length() > 0) {
            isRunning = true;
            var element = queue.shift();
            var messageData = element.data;
            var type = element.type;
            var sender = new Array(element.sender);
            var idMessage = element.idMessage;

            messageStorage.findConversation(type, sender).then(function (response) {
                var conversation = messageService.factory().createConversation();
                var date = moment.utc().format("DD-MM-YYYY HH:mm:ss");
                if (response) {
                    conversation.id = response.id;
                    conversation.image = response.image;
                    conversation.displayName = response.display_name;
                    conversation.type = response.type;
                    conversation.receivers = JSON.parse(response.receivers);
                    conversation.lastMessage = messageData.message.body.substring(0, 19);
                    conversation.created = response.created;
                    conversation.updated = date;
                    conversation.isUnread = 1;

                    messageStorage.updateConversation(conversation).then(function () {
                        saveMessage(messageData, idMessage, conversation, type);
                    });
                } else {
                    //no existe, crearla
                    conversation.type = type;
                    conversation.receivers = sender;
                    conversation.lastMessage = messageData.message.body.substring(0, 19);
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
                            saveMessage(messageData, idMessage, conversation, type);
                        });
                    });
                }
            });
        } else {
            isRunning = false;
        }
    }

    return {
        add: add,
        length: length,
        process: process
    }
});