angular.module('app').service('messageService', function (messageRes, $q, messageStorage, messageQueue) {

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
        receivers: "",
        lastMessage: ""
    };

    var conversations = [];

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

    function sendMessage(data, idConversation) {
        var deferred = $q.defer();

        var messageData = {
            message: {
                body: data.body,
                receivers: (mum.type == 'sms') ? JSON.stringify([mum.phoneNumber]) : JSON.stringify([mum.email])
            },
            idConversation: idConversation
        };

        if (mum.date) {
            messageData.message.at = moment.utc(mum.date).format("DD-MM-YYYY HH:mm:ss");
        }

        //--tipo de mensaje ((1)sms, (2)email, (3)instant)
        if (mum.type == 'email') {

            messageData.about = data.subject;
            messageData.from = data.from;
            messageQueue.addEmail(messageData);
            messageQueue.processEmail();
            deferred.resolve();
        } else if (mum.type == 'sms') {

            messageQueue.addSms(messageData);
            messageQueue.processSms();
            deferred.resolve();
        } else if (mum.type == 'mum') {

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

    return {
        setMum: setMum,
        getMum: getMum,
        setConversation: setConversation,
        getConversation: getConversation,
        saveConversation: saveConversation,
        sendMessage: sendMessage,
        getConversationMessages: getConversationMessages,
        getInboxMessages: getInboxMessages,
        deleteConversation: deleteConversation
    };

});