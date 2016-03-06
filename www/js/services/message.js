angular.module('app').service('messageService', function ($q, messageStorage, messageQueue) {

    var message = {
        type: "",
        body: "",
        date: null,
        from: null,
        subject: null,
        phoneNumber: null,
        email: null,
        displayName: "",
        created: null,
    };

    var conversation = {
        id: null,
        image: null,
        displayName: "",
        type: "",
        receivers: [],
        lastMessage: "",
        created: null,
        updated: null
    };

    var setMessage = function (obj) {
        message = obj;
    };

    var getMessage = function () {
        return message;
    };

    var setConversation = function (c) {
        conversation = c;
    };

    var getConversation = function () {
        return conversation;
    };

    function sendMessage(message, conversation) {

        var deferred = $q.defer();

        var messageData = {
            message: {
                body: message.body,
                receivers: JSON.stringify(conversation.receivers)
            },
            idConversation: conversation.id
        };

        if (message.date) {
            messageData.message.at = moment.utc(message.date).format("DD-MM-YYYY HH:mm:ss");
        }

        //--tipo de mensaje ((1)sms, (2)email, (3)instant)
        if (message.type == 'email') {
            messageData.about = message.subject;
            messageData.from = message.from;

            console.log("QUEUE MESSAGE DATA EMAIL", messageData);

            messageQueue.addEmail(messageData);
            messageQueue.processEmail();
            deferred.resolve();

        } else if (message.type == 'sms') {

            console.log("QUEUE  MESSAGE DATA SMS", messageData);

            messageQueue.addSms(messageData);
            messageQueue.processSms();
            deferred.resolve();

        } else if (message.type == 'mum') {

            console.log("QUEUE MESSAGE DATA MUM", messageData);

            messageQueue.addMum(messageData);
            messageQueue.processMum();
            deferred.resolve();

        }

        return deferred.promise;
    }

    function saveConversation(conversation) {
        return messageStorage.saveConversation(conversation);
    }

    function getConversationMessages(idConversation) {
        return messageStorage.getConversationMessages(idConversation);
    }

    function getInboxMessages() {
        return messageStorage.getInboxMessages();
    }

    function deleteConversation(conversation) {
        return messageStorage.deleteConversation(conversation);
    }

    function findConversation(type, receivers) {
        return messageStorage.findConversation(type, receivers);
    }

    return {
        setMessage: setMessage,
        getMessage: getMessage,
        setConversation: setConversation,
        getConversation: getConversation,
        saveConversation: saveConversation,
        sendMessage: sendMessage,
        getConversationMessages: getConversationMessages,
        getInboxMessages: getInboxMessages,
        deleteConversation: deleteConversation,
        findConversation: findConversation
    };

});