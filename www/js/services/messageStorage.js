angular.module('app').service('messageStorage', function ($q, sqliteDatastore) {

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
            console.log(error);
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
                    id_conversation: t.id_conversation,
                    name: t.display_name,
                    lastText: (t.body) ? t.body : t.body2,
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

    return {
        saveConversation: saveConversation,
        getConversationMessages: getConversationMessages,
        getInboxMessages: getInboxMessages,
        deleteConversation: deleteConversation,
        saveMessageHistory: saveMessageHistory,
        savePendingMessage: savePendingMessage
    }
});