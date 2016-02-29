angular.module('app').service('messageService', function (messageRes, $q, messageStorage) {

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
        lastText: ""
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
            }
        };

        if (mum.date) {
            messageData.message.at = moment.utc(mum.date).format("DD-MM-YYYY HH:mm:ss");
        }

        var isReceived = false;
        //--tipo de mensaje ((1)sms, (2)email, (3)instant)
        if (mum.type == 'email') {
            messageData.about = data.subject;
            messageData.from = data.from;

            messageRes.sendEmail(messageData).$promise.then(function (response) {
                //TODO handle server side error in data
                console.log(response);
                messageStorage.saveMessageHistory(messageData, mum.type, response.message, idConversation, isReceived).then(function (params) {
                    deferred.resolve(params);
                });
            }).catch(function (error) {
                if (error.code != 500) {
                    messageStorage.savePendingMessage(messageData, mum, idConversation, isReceived).then(function (params) {
                        deferred.resolve(params);
                    });
                }
            });
        } else if (mum.type == 'sms') {
            messageRes.sendSms(messageData).$promise.then(function (response) {
                //TODO handle server side error in data
                console.log(response);
                messageStorage.saveMessageHistory(messageData, mum.type, response.message, idConversation, isReceived).then(function (params) {
                    deferred.resolve(params);
                });
            }).catch(function (error) {
                if (error.code != 500) {
                    messageStorage.savePendingMessage(messageData, mum, idConversation, isReceived).then(function (params) {
                        deferred.resolve(params);
                    });
                }
            });
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