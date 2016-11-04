angular.module('app').service('messageService', function ($q, messageStorage, messageQueue, DATETIME_FORMAT_CONF) {

    function factory() {
        function messageFactory() {
            this.createMessage = function () {
                var message = {
                    id: null,
                    type: "",
                    body: "",
                    date: null,
                    path: null,
                    fileData: null,
                    fileMimeType: null,
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
                    updated: null,
                    isUnread: 0
                };

                return conversation;
            };

            this.createSchedule = function(){
                var schedule = {
                    id: null,
                    id_conversation: null,
                    type: "",
                    body: "",
                    attachment: "",
                    about: "",
                    from_address: "",
                    at: null,
                    is_received: null,
                    status: null,
                    created: null,
                    receivers: null,
                    display_name: "",
                    image: "",
                    last_message: "",
                    is_unread: null
                };

                return schedule;
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
            room: conversation.id,
            message: {
                body: message.body,
                receivers: JSON.stringify(conversation.receivers)
            },
            toUpdate: (message.hasOwnProperty('toUpdate')) ? message.toUpdate : null
        };

        if (message.date) {
            messageData.message.at = moment.utc(message.date).format(DATETIME_FORMAT_CONF.dateTimeFormat);
        }

        if (message.type == 'email') {
            messageData.about = message.subject;
            messageData.from = message.from;
        }

        if (message.fileData && message.fileMimeType) {
            messageData.path = message.path;
            messageData.message.fileData = message.fileData;
            messageData.message.fileMimeType = message.fileMimeType;

        }

        messageStorage.savePendingMessage(messageData, message.type, messageData.room).then(function (params) {
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
        var deferred = $q.defer();

        messageStorage.getInboxMessages().then(function (results) {
            var conversations = [];
            var t = {};
            var rec = [];
            var factoria = factory();
            var conversation;
            for (var i = 0; i < results.rows.length; i++) {
                t = results.rows.item(i);
                rec = JSON.parse(t.receivers);
                conversation = factoria.createConversation();
                conversation.id = t.id;
                conversation.image = (t.image) ? t.image : 'img/person.png';
                conversation.displayName = t.display_name;
                conversation.type = t.type;
                conversation.receivers = rec;
                conversation.lastMessage = t.last_message.substring(0, 19);
                conversation.created = t.created;
                conversation.updated = t.updated;
                conversation.isUnread = t.is_unread;
                conversations.push(conversation);
            }
            deferred.resolve(conversations);
        });

        return deferred.promise;
    }

    function getSchedulesByDate(date) {

        var deferred = $q.defer();

        messageStorage.getSchedulesByDate(date).then(function (results) {

            var schedules = [];
            var t = {};
            var factoria = factory();
            var schedule;
            for (var i = 0; i < results.rows.length; i++) {
                t = results.rows.item(i);
                schedule = factoria.createSchedule();
                schedule.id = t.id;
                schedule.id_conversation = t.id_conversation;
                schedule.type = t.type;
                schedule.body = t.body;
                schedule.attachment = t.attachment;
                schedule.about = t.about;
                schedule.from_address = t.from_address;
                schedule.at = t.at;
                schedule.is_received = t.is_received;
                schedule.status = t.status;
                schedule.created = t.created;

                // var receiversClean = t.receivers.replace(/[^a-zA-Z 0-9.]+/g,'');
                schedule.receivers = t.receivers.replace(/[^a-zA-Z 0-9.]+/g,'');
                schedule.display_name = t.display_name;
                schedule.image = t.image;
                schedule.last_message = t.last_message;
                schedule.is_unread = t.is_unread;
                schedules.push(schedule);
            }
            deferred.resolve(schedules);
        });
        return deferred.promise;

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

    function getUnreadMessages() {
        return messageStorage.getUnreadMessages();
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
        updateConversation: updateConversation,
        getUnreadMessages: getUnreadMessages,
        getSchedulesByDate: getSchedulesByDate
    };

});