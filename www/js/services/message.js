angular.module('app').service('messageService', function ($q, messageStorage, messageQueue, DATETIME_FORMAT_CONF) {

    function factory() {
        function messageFactory() {
            this.createMessage = function () {
                var message = {
                    type: "",
                    body: "",
                    date: null,
                    from: null,
                    subject: null,
                    phoneNumber: null,
                    email: null,
                    displayName: "",
                    created: null
                };

                return message;
            };

            this.createConversation = function () {
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

                return conversation;
            }
        }

        var factory = new messageFactory();
        return factory;
    }

    var message;

    var conversation;

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
            idConversation: conversation.id,
            toUpdate: (message.hasOwnProperty('toUpdate')) ? message.toUpdate : null
        };

        if (message.date) {
            messageData.message.at = moment.utc(message.date).format(DATETIME_FORMAT_CONF.dateTimeFormat);
        }

        if (message.type == 'email') {
            messageData.about = message.subject;
            messageData.from = message.from;
        }

        messageStorage.savePendingMessage(messageData, message.type, messageData.idConversation).then(function (params) {
            messageQueue.add(messageData, message.type, params.insertId);
            messageQueue.process();
            deferred.resolve();
        });

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

    function updateConversation(conversation) {
        return messageStorage.updateConversation(conversation);
    }

    return {
        factory: factory,
        setMessage: setMessage,
        getMessage: getMessage,
        setConversation: setConversation,
        getConversation: getConversation,
        saveConversation: saveConversation,
        sendMessage: sendMessage,
        getConversationMessages: getConversationMessages,
        getInboxMessages: getInboxMessages,
        deleteConversation: deleteConversation,
        findConversation: findConversation,
        updateConversation: updateConversation
    };

});