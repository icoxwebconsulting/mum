angular.module('app').service('messageStorage', function ($q, sqliteDatastore) {

    function saveConversation(conversation) {
        var deferred = $q.defer();
        sqliteDatastore.saveConversation(conversation).then(function (resp) {
            deferred.resolve(resp.insertId);
        }).catch(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getConversationMessages(idConversation) {
        var deferred = $q.defer();
        sqliteDatastore.getConversationMessages(idConversation).then(function (results) {
            var messages = [];
            for (var i = 0; i < results.rows.length; i++) {
                messages.push(results.rows.item(i));
            }
            deferred.resolve(messages);
        }).catch(function (error) {
            // Tratar el error
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getInboxMessages() {
        var deferred = $q.defer();
        sqliteDatastore.getInboxConversations().then(function (results) {
            var conversations = [];
            var t = {};
            var rec = [];
            for (var i = 0; i < results.rows.length; i++) {
                t = results.rows.item(i);
                rec = JSON.parse(t.receivers);
                conversations.push({
                    id: t.id,
                    displayName: t.display_name,
                    lastMessage: t.last_message,
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
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function deleteConversation(conversation) {
        var deferred = $q.defer();
        sqliteDatastore.deleteConversation(conversation.id).then(function (result) {
            deferred.resolve(result);
        }).catch(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function saveMessageHistory(messageData, type, message, idConversation, isReceived) {
        var deferred = $q.defer();
        sqliteDatastore.saveMessageHistory(messageData, type, message, idConversation, isReceived).then(function (resp) {
            deferred.resolve({
                insertId: resp.insertId,
                toSend: false
            });
        }).catch(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function savePendingMessage(messageData, type, idConversation, isReceived) {
        var deferred = $q.defer();
        sqliteDatastore.savePendingMessage(messageData, type, idConversation, isReceived).then(function (resp) {
            deferred.resolve({
                insertId: resp.insertId,
                toSend: true
            });
        }).catch(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function findConversation(type, receivers) {
        var deferred = $q.defer();
        sqliteDatastore.findConversation(type, receivers).then(function (result) {
            if (result.rows.length > 0) {
                var item = result.rows.item(0);
                deferred.resolve(item);
            } else {
                deferred.resolve(null);
            }
        }).catch(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getDelayedMessages() {
        var deferred = $q.defer();
        sqliteDatastore.getDelayedMessages().then(function (results) {
            var items = [];
            for (var i = 0; i < results.rows.length; i++) {
                items.push(results.rows.item(i));
            }
            deferred.resolve(items);
        }).catch(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function updateConversation(conversation) {
        var deferred = $q.defer();
        sqliteDatastore.updateConversation(conversation).then(function (result) {
            console.log(result);
            deferred.resolve();
        }).catch(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getScheduledMessagesCountByRange(start, end) {
        var deferred = $q.defer();

        var query = "SELECT COUNT(*)" +
            " FROM message_history" +
            " WHERE at BETWEEN ? AND ?" +
            " GROUP BY at";
        var values = [start, end];

        sqliteDatastore.execute(query, values)
            .then(function (result) {
                deferred.resolve(result.rows);
            })
            .catch(function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    }

    return {
        saveConversation: saveConversation,
        getConversationMessages: getConversationMessages,
        getInboxMessages: getInboxMessages,
        getDelayedMessages: getDelayedMessages,
        deleteConversation: deleteConversation,
        saveMessageHistory: saveMessageHistory,
        savePendingMessage: savePendingMessage,
        findConversation: findConversation,
        updateConversation: updateConversation,
        getScheduledMessagesCountByRange: getScheduledMessagesCountByRange
    }
});