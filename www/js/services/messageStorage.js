angular.module('app').service('messageStorage', function ($q, sqliteDatastore, DATETIME_FORMAT_CONF) {

    var sqlDateTimeFormat = DATETIME_FORMAT_CONF.dateTimeFormat;

    function saveConversation(conversation) {
        var deferred = $q.defer();

        var query = 'INSERT INTO conversation (type, receivers, display_name, image, last_message, is_unread, created, updated) VALUES(?,?,?,?,?,?,?,?)';
        var values = [
            conversation.type,
            JSON.stringify(conversation.receivers), // como json en string,
            conversation.displayName, //nombre para mostrar
            conversation.image || null,
            conversation.lastMessage.slice(0, 20),
            conversation.isUnread,
            moment().format(sqlDateTimeFormat),
            moment().format(sqlDateTimeFormat)
        ];

        sqliteDatastore.execute(query, values).then(function (resp) {
            deferred.resolve(resp.insertId);
        }).catch(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getConversationMessages(id) {
        var deferred = $q.defer();

        var query = 'SELECT id as id_message, type, body, is_received, created FROM message_history WHERE id_conversation = ' + id;
        query += ' UNION SELECT null as id_message, type, body, 0 as is_received, created FROM pending_message WHERE id_conversation = ' + id + ' ORDER BY created';
        var values = [];

        sqliteDatastore.execute(query, values).then(function (results) {
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

        var query = 'SELECT  c.id, c.type, c.receivers, c.created, c.updated, c.display_name, c.image, c.last_message ' +
            'FROM conversation c';
        sqliteDatastore.execute(query).then(function (results) {
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

    function deleteMessageHistory(id) {
        var query = 'DELETE FROM message_history WHERE id_conversation = ' + id;
        sqliteDatastore.execute(query, []);
    }

    function deletePendingMessages(id) {
        var query = 'DELETE FROM pending_message WHERE id_conversation = ' + id;
        sqliteDatastore.execute(query, []);
    }

    function deleteFromConversation(id) {
        var query = 'DELETE FROM conversation WHERE id = ' + id;
        sqliteDatastore.execute(query, []);
    }

    function deleteConversation(conversation) {
        var deferred = $q.defer();
        $q.all([
            deleteMessageHistory(conversation.id),
            deletePendingMessages(conversation.id),
            deleteFromConversation(conversation.id)
        ]).then(function (value) {
            deferred.resolve(value);
        }, function (reason) {
            deferred.reject();
        });

        return deferred.promise;
    }

    function saveMessageHistory(data, type, messageId, idConversation, isReceived) {
        var deferred = $q.defer();

        var query = 'INSERT INTO message_history (id, id_conversation, type, body, about, is_received, from_address, at, created) VALUES(?,?,?,?,?,?,?,?,?)';
        var values = [
            messageId,//key obtenida del servidor
            parseInt(idConversation), //key del registro creado anteriormente en conversation
            type,
            data.message.body || null,
            data.about || null,
            isReceived || 0,
            data.from || null,
            data.message.at || null,
            moment.utc().format(sqlDateTimeFormat)
        ];

        sqliteDatastore.execute(query, values).then(function (resp) {
            deferred.resolve({
                insertId: resp.insertId,
                toSend: false
            });
        }).catch(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function savePendingMessage(data, type, idConversation) {
        var deferred = $q.defer();

        var query = 'INSERT INTO pending_message (id_conversation, type, body, about, from_address, at, receivers, to_update, created) VALUES(?,?,?,?,?,?,?,?,?)';
        var values = [
            parseInt(idConversation), //key del registro creado anteriormente en conversation
            type,
            data.message.body || null,
            data.about || null,
            data.from || null,
            data.message.at || null,
            data.message.receivers,
            data.toUpdate,
            moment().format(sqlDateTimeFormat)
        ];

        sqliteDatastore.execute(query, values).then(function (resp) {
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

        var query = "SELECT * FROM conversation WHERE type = '" + type + "' AND receivers = '" + JSON.stringify(receivers) + "'";

        sqliteDatastore.execute(query).then(function (result) {
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

        var query = 'SELECT * FROM pending_message';

        sqliteDatastore.execute(query).then(function (results) {
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

        var query = "UPDATE conversation  SET display_name = ?, image = ?, last_message = ?, is_unread = ?, updated = ? WHERE id = ?";

        var values = [
            conversation.displayName,
            conversation.image,
            conversation.lastMessage.slice(0, 20),
            conversation.isUnread,
            conversation.updated,
            conversation.id
        ];

        sqliteDatastore.execute(query, values).then(function (result) {
            deferred.resolve();
        }).catch(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getScheduledMessagesCountByRange(start, end) {
        var deferred = $q.defer();

        var values = [start.format(sqlDateTimeFormat), end.format(sqlDateTimeFormat)];

        var query = "SELECT COUNT(*) AS count, at " +
            "FROM message_history " +
            "WHERE at BETWEEN ? AND ? " +
            "GROUP BY at";
        sqliteDatastore.execute(query, values).then(function (result) {
            deferred.resolve(result.rows);
        }).catch(function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function getOnePendingMessage() {
        var deferred = $q.defer();
        var query = "SELECT * FROM pending_message ORDER BY created LIMIT 1";

        sqliteDatastore.execute(query).then(function (result) {
            if (result.rows.length > 0) {
                deferred.resolve(result.rows[0]);
            } else {
                deferred.resolve(null);
            }
        }).catch(function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function deletePendingMessage(id) {
        var deferred = $q.defer();
        var query = 'DELETE FROM pending_message WHERE id = ' + id;

        sqliteDatastore.execute(query).then(function (result) {
            deferred.resolve(result);
        }).catch(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getUnreadMessages() {
        var deferred = $q.defer();

        var query = 'SELECT COUNT(id) as count FROM conversation WHERE is_unread = 1';
        var values = [];

        sqliteDatastore.execute(query, values).then(function (result) {
            if(result.rows.length){
                deferred.resolve(result.rows[0]);
            }else{
                deferred.resolve(null);
            }
        }).catch(function (error) {
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
        getScheduledMessagesCountByRange: getScheduledMessagesCountByRange,
        getOnePendingMessage: getOnePendingMessage,
        deletePendingMessage: deletePendingMessage,
        getUnreadMessages: getUnreadMessages
    }
});