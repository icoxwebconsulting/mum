angular.module('app').service('messageStorage', function ($q, sqliteDatastore, DATETIME_FORMAT_CONF) {

    var sqlDateTimeFormat = DATETIME_FORMAT_CONF.dateTimeFormat;

    function saveConversation(conversation) {
        var deferred = $q.defer();

        var query = 'INSERT INTO conversation (id, type, receivers, display_name, image, last_message, is_unread, created, updated) VALUES(?,?,?,?,?,?,?,?,?)';
        var id = uuid.v4();
        var values = [
            id,
            conversation.type,
            JSON.stringify(conversation.receivers), // como json en string,
            conversation.displayName, //nombre para mostrar
            conversation.image || null,
            conversation.lastMessage.slice(0, 20),
            conversation.isUnread,
            moment().format(sqlDateTimeFormat),
            moment().format(sqlDateTimeFormat)
        ];

        sqliteDatastore.execute(query, values).then(function () {
            deferred.resolve(id);
        }).catch(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getConversationMessages(id) {
        var deferred = $q.defer();

        var query = "SELECT id as id_message, type, body, attachment, is_received, created FROM message_history WHERE id_conversation = ?";
        query += " UNION SELECT null as id_message, type, body, path as attachment, 0 as is_received, created FROM pending_message WHERE id_conversation = ? ORDER BY created";

        sqliteDatastore.execute(query, [id, id]).then(function (results) {
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

        var query = 'SELECT * FROM conversation c';
        sqliteDatastore.execute(query).then(function (results) {
            deferred.resolve(results);
        }).catch(function (error) {
            // Tratar el error
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function deleteMessageHistory(id) {
        var query = "DELETE FROM message_history WHERE id_conversation = ?";
        sqliteDatastore.execute(query, [id]);
    }

    function deletePendingMessages(id) {
        var query = "DELETE FROM pending_message WHERE id_conversation = ?";
        sqliteDatastore.execute(query, [id]);
    }

    function deleteFromConversation(id) {
        var query = "DELETE FROM conversation WHERE id = ?";
        sqliteDatastore.execute(query, [id]);
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

    function saveMessageHistory(data, type, messageId, idConversation, isReceived, attachment) {
        var deferred = $q.defer();

        var query = 'INSERT INTO message_history (id, id_conversation, type, body, attachment, about, is_received, from_address, at, created) VALUES(?,?,?,?,?,?,?,?,?,?)';
        var values = [
            messageId,//key obtenida del servidor
            idConversation, //key del registro creado anteriormente en conversation
            type,
            data.message.body || null,
            attachment || null,
            //data.path || null,
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

        var query = 'INSERT INTO pending_message (id_conversation, type, body, path, fileData, fileMimeType, about, from_address, at, receivers, to_update, created) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)';
        var values = [
            idConversation, //key del registro creado anteriormente en conversation
            type,
            data.message.body || null,
            data.path || null,
            data.message.fileData || null,
            data.message.fileMimeType || null,
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
            if (result.rows.length) {
                deferred.resolve(result.rows[0]);
            } else {
                deferred.resolve(null);
            }
        }).catch(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getSchedulesByDate(date) {
        var deferred = $q.defer();
        var query = "select mh.*, c.* from message_history as mh,conversation as c where at like '"+date+"%' and " +
                    "mh.id_conversation = c.id order by mh.at asc";

        sqliteDatastore.execute(query).then(function (results) {
            deferred.resolve(results);
        }).catch(function (error) {
            // Tratar el error
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
        getUnreadMessages: getUnreadMessages,
        getSchedulesByDate: getSchedulesByDate
    }
});