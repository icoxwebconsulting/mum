angular.module('app').service('messageService', function ($q, messageStorage, messageQueue) {

    //mum = message
    var mum = {
        type: "",
        date: "",
        phoneNumber: "",
        email: "",
        displayName: ""
    };

    var conversation = {
        id: "",
        image: "",
        displayName: "",
        type: "",
        receivers: [],
        lastMessage: "",
        created: "",
        updated: ""
    };

    var setMum = function (obj) {
        mum = obj;
    };

    var getMum = function () {
        return mum;
    };

    var setConversation = function (c) {
        conversation = c;
    };

    var getConversation = function () {
        return conversation;
    };

    function sendMessage(message, idConversation) {
        var deferred = $q.defer();

        var messageData = {
            message: {
                body: message.body,
                receivers: JSON.stringify(conversation.receivers)
            },
            idConversation: idConversation
        };

        if (message.date) {
            messageData.message.at = moment.utc(message.date).format("DD-MM-YYYY HH:mm:ss");
        }

        //--tipo de mensaje ((1)sms, (2)email, (3)instant)
        if (conversation.type == 'email') {

            messageData.about = message.subject;
            messageData.from = message.from;
            messageQueue.addEmail(messageData);
            messageQueue.processEmail();
            deferred.resolve();

        } else if (conversation.type == 'sms') {

            messageQueue.addSms(messageData);
            messageQueue.processSms();
            deferred.resolve();

        } else if (conversation.type == 'mum') {

            messageQueue.addMum(messageData);
            messageQueue.processMum();
            deferred.resolve();

        }

        return deferred.promise;
    }

    function saveConversation(conversation) {
        return messageStorage.saveConversation(conversation);
    }

    function getConversationMessages() {
        return messageStorage.getConversationMessages(conversation.id);
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
        setMum: setMum,
        getMum: getMum,
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