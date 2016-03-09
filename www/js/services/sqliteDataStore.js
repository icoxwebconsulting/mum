angular.module('app.sqliteDataStore', ['ionic', 'app.deviceDataStore'])
    .factory('sqliteDatastore', function ($cordovaSQLite, $q, APP_STORE_CONF, DATETIME_FORMAT_CONF) {

        var db;

        var sqlDateTimeFormat = DATETIME_FORMAT_CONF.dateTimeFormat;

        function getDbExist() {
            return window.localStorage.getItem('db_exist') || null;
        }

        function setDbExist(dbExist) {
            window.localStorage.setItem('db_exist', dbExist);
        }

        function openDatabase() {
            var deferred = $q.defer();

            try {
                if (!APP_STORE_CONF.webStore) {
                    db = window.sqlitePlugin.openDatabase({name: "mum", location: 1}, function () {
                        //success
                        deferred.resolve(true);
                    }, function (e) {
                        //error
                        deferred.reject(e);
                    });
                } else {
                    db = window.openDatabase('mum', '1.0', 'mum database', 2 * 1024 * 1024);
                    deferred.resolve(true);
                }
            } catch (e) {
                deferred.reject(e);
            }

            return deferred.promise;
        }

        function createTableMessageHistory() {
            var query = 'CREATE TABLE IF NOT EXISTS message_history (' +
                'id TEXT primary key,' + //key obtenida del servidor
                'id_conversation INTEGER,' + //fk contra conversation
                'type INTEGER,' + //fk contra conversation, tipo de mensaje ((1)sms, (2)email, (3)instant)
                'body TEXT,' + // -- de todos
                'about TEXT,' + //-- de email
                'from_address TEXT,' + // de email
                'at DATETIME,' + //--solo para mensajes programados
                'is_received INTEGER,' + //especifica si es un mensaje recibido
                'status INTEGER,' + //0 - to send, 1 sent, 2 delivered ??? 3 read?
                'created DATETIME)';
            return execute(query);
        }

        function createTablePendingMessage() {
            var query = 'CREATE TABLE IF NOT EXISTS pending_message (' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
                'id_conversation INTEGER,' + //fk contra conversation
                'type INTEGER,' + //fk contra conversation, tipo de mensaje ((1)sms, (2)email, (3)instant)
                'body TEXT,' + // -- de todos
                'about TEXT,' + //-- de email
                'from_address TEXT,' + // de email
                'at DATETIME,' + //--solo para mensajes programados
                'receivers TEXT,' + //guarda arreglo con los destinatarios, solo en esta tabla, una vez enviado se crea conversation
                'created DATETIME)';
            return execute(query);
        }

        function createTableConversation() {
            var query = 'CREATE TABLE IF NOT EXISTS conversation (' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
                'type INTEGER,' + //--tipo de mensaje ((1)sms, (2)email, (3)instant)
                'receivers TEXT,' + //arreglo de personas que recibieron el mensaje
                'display_name TEXT,' + //nombre para mostrar
                'image TEXT,' +
                'last_message TEXT,' +
                'is_unread INTEGER DEFAULT 0,' +
                'created DATETIME,' + //fecha de creacion
                'updated DATETIME)'; // fecha de actualizacion
            return execute(query);
        }

        function createTableContacts() {
            var query = 'CREATE TABLE IF NOT EXISTS contacts (' +
                'phone_number TEXT PRIMARY KEY,' +
                'display_name TEXT,' +
                'photo TEXT,' +
                'email TEXT,' +
                'mum_id TEXT' +
                ')';
            return execute(query);
        }

        function createTables() {
            $q.all([
                createTableMessageHistory(),
                createTablePendingMessage(),
                createTableConversation(),
                createTableContacts()
            ]).then(function (value) {
                setDbExist();
            }, function (reason) {
                // Error callback where reason is the value of the first rejected promise
            });
        }

        function execute(query, values) {
            if (!values) {
                values = [];
            }
            var deferred = $q.defer();

            function exec() {
                db.transaction(function (tx) {
                    tx.executeSql(query, values, function (tx, result) {
                            deferred.resolve(result);
                        },
                        function (transaction, error) {
                            deferred.reject(error);
                        });
                });
            }

            if (!db) {
                openDatabase()
                    .then(function () {
                        exec();
                    });
            } else {
                exec();
            }

            return deferred.promise;
        }

        function initDb() {
            openDatabase();
            if (!getDbExist()) {
                createTables();
            } else {
            }
        }

        function saveConversation(data) {
            var deferred = $q.defer();

            var query = 'INSERT INTO conversation (type, receivers, display_name, image, last_message, created, updated) VALUES(?,?,?,?,?,?,?)';
            var values = [
                data.type,
                JSON.stringify(data.receivers), // como json en string,
                data.displayName, //nombre para mostrar
                data.image || null,
                data.lastMessage.slice(0, 20),
                moment().format(sqlDateTimeFormat),
                moment().format(sqlDateTimeFormat)
            ];

            db.transaction(function (tx) {
                tx.executeSql(query, values,
                    function (tx, result) {
                        deferred.resolve(result);
                    },
                    function (transaction, error) {
                        deferred.reject(error);
                    });
            });

            return deferred.promise;
        }

        function savePendingMessage(data, type, idConversation) {
            var deferred = $q.defer();

            var query = 'INSERT INTO pending_message (id_conversation, type, body, about, from_address, at, receivers, created) VALUES(?,?,?,?,?,?,?,?)';
            var values = [
                parseInt(idConversation), //key del registro creado anteriormente en conversation
                type,
                data.message.body || null,
                data.about || null,
                data.from || null,
                data.message.at || null,
                data.message.receivers,
                moment().format(sqlDateTimeFormat)
            ];

            db.transaction(function (tx) {
                tx.executeSql(query, values,
                    function (tx, result) {
                        deferred.resolve(result);
                    },
                    function (transaction, error) {
                        deferred.reject(error);
                    });
            });

            return deferred.promise;
        }

        function saveMessageHistory(data, type, messageId, idConversation, is_received) {
            var deferred = $q.defer();

            var query = 'INSERT INTO message_history (id, id_conversation, type, body, about, is_received, from_address, at, created) VALUES(?,?,?,?,?,?,?,?,?)';
            var values = [
                messageId,//key obtenida del servidor
                parseInt(idConversation), //key del registro creado anteriormente en conversation
                type,
                data.message.body || null,
                data.about || null,
                is_received,
                data.from || null,
                data.message.at || null,
                moment.utc().format(sqlDateTimeFormat)
            ];

            db.transaction(function (tx) {
                tx.executeSql(query, values,
                    function (tx, result) {
                        deferred.resolve(result);
                    },
                    function (transaction, error) {
                        deferred.reject(error);
                    });
            });

            return deferred.promise;
        }

        function getInboxConversations() {
            var deferred = $q.defer();

            db.transaction(function (tx) {
                var query = 'SELECT  c.id, c.type, c.receivers, c.created, c.updated, c.display_name, c.image, c.last_message ' +
                    'FROM conversation c';

                tx.executeSql(query, [], function (tx, result) {
                        deferred.resolve(result);
                    },
                    function (transaction, error) {
                        deferred.reject(error);
                    });
            });
            return deferred.promise;
        }

        function getConversationMessages(id) {
            var query = 'SELECT id as id_message, type, body, is_received, created FROM message_history WHERE id_conversation = ' + id;
            query += ' UNION SELECT null as id_message, type, body, null as is_received, created FROM pending_message WHERE id_conversation = ' + id + ' ORDER BY created';
            var values = [];
            return execute(query, values);
        }

        function deleteMessageHistory(id) {
            var query = 'DELETE FROM message_history WHERE id_conversation = ' + id;
            execute(query, []);
        }

        function deletePendingMessages(id) {
            var query = 'DELETE FROM pending_message WHERE id_conversation = ' + id;
            execute(query, []);
        }

        function deleteFromConversation(id) {
            var query = 'DELETE FROM conversation WHERE id = ' + id;
            execute(query, []);
        }

        function deleteConversation(id) {
            var deferred = $q.defer();
            $q.all([
                deleteMessageHistory(id),
                deletePendingMessages(id),
                deleteFromConversation(id)
            ]).then(function (value) {
                deferred.resolve();
            }, function (reason) {
                deferred.reject();
            });

            return deferred.promise;
        }

        function getDelayedMessages() {
            var query = 'SELECT * FROM pending_message';
            return execute(query, []);
        }

        function deletePendingMessage(id) {
            var query = 'DELETE FROM pending_message WHERE id = ' + id;
            return execute(query, []);
        }

        function findConversation(type, receivers) {
            var query = "SELECT * FROM conversation WHERE type = '" + type + "' AND receivers = '" + JSON.stringify(receivers) + "'";
            return execute(query, []);
        }

        function updateConversation(conversation) {
            var deferred = $q.defer();

            var query = "UPDATE conversation  SET display_name = '?', image = '?', last_message = '?', updated = '?' WHERE id = ?";

            var values = [
                conversation.displayName,
                conversation.image,
                conversation.lastMessage.slice(0, 20),
                conversation.updated,
                conversation.id
            ];

            db.transaction(function (tx) {
                tx.executeSql(query, values,
                    function (tx, result) {
                        deferred.resolve(result);
                    },
                    function (transaction, error) {
                        deferred.reject(error);
                    });
            });

            return deferred.promise;
        }

        function getScheduledMessagesCountByRange(start, end) {
            var values = [start.format(sqlDateTimeFormat), end.format(sqlDateTimeFormat)];

            var query = "SELECT COUNT(*) AS count, at " +
                "FROM message_history " +
                "WHERE at BETWEEN ? AND ? " +
                "GROUP BY at";

            return execute(query, values);
        }

        return {
            execute: execute,
            initDb: initDb,
            savePendingMessage: savePendingMessage,
            saveMessageHistory: saveMessageHistory,
            saveConversation: saveConversation,
            deleteConversation: deleteConversation,
            getInboxConversations: getInboxConversations,
            getConversationMessages: getConversationMessages,
            getDelayedMessages: getDelayedMessages,
            deletePendingMessage: deletePendingMessage,
            findConversation: findConversation,
            updateConversation: updateConversation,
            getScheduledMessagesCountByRange: getScheduledMessagesCountByRange
        };
    });
