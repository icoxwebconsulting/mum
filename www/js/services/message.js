angular.module('app').service('messageSrv', function (messageRes, $q, sqliteDatastore) {

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
                sqliteDatastore.saveMessageHistory(messageData, mum.type, response.message, idConversation, isReceived).then(function (resp) {
                    var toSend = false;
                    deferred.resolve(resp.insertId, toSend);
                });
            }).catch(function (error) {
                if (error.code != 500) {
                    sqliteDatastore.savePendingMessage(messageData, mum, idConversation, isReceived).then(function (resp) {
                        var toSend = true;
                        deferred.resolve(resp.insertId, toSend);
                    });
                }
            });
        } else if (mum.type == 'sms'){
            messageRes.sendSms(messageData).$promise.then(function (response) {
                //TODO handle server side error in data
                console.log(response);
                sqliteDatastore.saveMessageHistory(messageData, mum.type, response.message, idConversation, isReceived).then(function (resp) {
                    var toSend = false;
                    deferred.resolve(resp.insertId, toSend);
                });
            }).catch(function (error) {
                if (error.code != 500) {
                    sqliteDatastore.savePendingMessage(messageData, mum, idConversation).then(function (resp) {
                        var toSend = true;
                        deferred.resolve(resp.insertId, toSend);
                    });
                }
            });
        }

        return deferred.promise;
    }

    function saveConversation(conversation) {
        var deferred = $q.defer();
        sqliteDatastore.saveConversation(conversation).then(function (resp) {
            deferred.resolve(resp.insertId);
        }).catch(function (error) {
            console.log("error en el manejo de conversation", error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getConversationMessages() {
        var deferred = $q.defer();
        sqliteDatastore.getConversationMessages(conversation.id).then(function (results) {
            var messages = [];
            for (var i = 0; i < results.rows.length; i++) {
                messages.push(results.rows.item(i));
            }
            deferred.resolve(messages);
        }).catch(function (error) {
            // Tratar el error
            console.log(error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getInboxMessages() {
        var deferred = $q.defer();
        sqliteDatastore.getInboxConversations().then(function (results) {
            conversations = [];
            var t = {};
            var rec = [];
            for (var i = 0; i < results.rows.length; i++) {
                t = results.rows.item(i);
                rec = JSON.parse(t.receivers);
                conversations.push({
                    id: t.id,
                    id_conversation: t.id_conversation,
                    name: t.display_name,
                    lastText: (t.body)? t.body : t.body2,
                    image: (t.image) ? t.image : 'img/person.png',
                    type: t.type, //--tipo de mensaje ((1)sms, (2)email, (3)instant),
                    receivers: rec,
                    created: t.created,
                    updated: t.updated
                });
            }
            deferred.resolve(conversations);
        }).catch(function (error) {
            // Tratar el error
            console.log("error en consulta en inbox", error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function deleteConversation(conversation) {
        var deferred = $q.defer();
        sqliteDatastore.deleteConversation(conversation.id_conversation).then(function (result) {
            conversations.splice(conversations.indexOf(conversation), 1);
            deferred.resolve(conversations);
        }).catch(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
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