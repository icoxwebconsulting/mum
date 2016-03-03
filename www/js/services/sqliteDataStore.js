angular.module('app.sqliteDataStore', ['ionic', 'app.deviceDataStore'])
    .factory('sqliteDatastore', function ($cordovaSQLite, $q, deviceDatastore) {

        var db;

        function openDatabase() {
            try {
                if (ionic.Platform.isAndroid()) {
                    db = window.sqlitePlugin.openDatabase({name: "mum", location: 1}, function () {
                        //success
                        console.log('success open phone database');
                        return true;
                    }, function (e) {
                        //error
                        console.log('error open phone  database', e);
                        return false
                    });
                } else {
                    console.log('iniciando la bd en windows');
                    db = window.openDatabase('mum', '1.0', 'mum database', 2 * 1024 * 1024);
                    return true;
                }
            } catch (e) {
                console.log(e);
                return false;
            }
        }

        function createTables() {
            $q.all([
                createTableMessageHistory(),
                createTablePendingMessage(),
                createTableConversation()
            ]).then(function (value) {
                console.log("creadas las tablas");
            }, function (reason) {
                // Error callback where reason is the value of the first rejected promise
                console.log("error en la creacion de tablas", reason);
            });
        }

        function execute(query, values) {
            if (!values) {
                values = [];
            }
            var deferred = $q.defer();

            db.transaction(function (tx) {
                tx.executeSql(query, values, function (tx, result) {
                        deferred.resolve(result);
                    },
                    function (transaction, error) {
                        deferred.reject(error);
                    });
            });
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
                'at TEXT,' + //--solo para mensajes programados
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
                'at TEXT,' + //--solo para mensajes programados
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

        function initDb() {
            console.log("antes de iniciar bd");
            openDatabase();
            if (!deviceDatastore.getDbExist()) {
                console.log("va a crear");
                createTables();
            } else {
                console.log("NO va a crear");
            }
        }

        function saveConversation(data) {
            var deferred = $q.defer();

            var query = 'INSERT INTO conversation (type, receivers, display_name, image, last_message, created, updated) VALUES(?,?,?,?,?,?,?)';
            var values = [
                data.type,
                data.receivers, // como json en string,
                data.displayName, //nombre para mostrar
                data.image || null,
                data.lastMessage.slice(0, 20),
                moment.utc().format("DD-MM-YYYY HH:mm:ss"),
                moment.utc().format("DD-MM-YYYY HH:mm:ss")
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
                data.message.about || null,
                data.message.from_address || null,
                data.message.at || null,
                data.message.receivers || null,
                moment.utc().format("DD-MM-YYYY HH:mm:ss")
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
                data.message.about || null,
                is_received,
                data.message.from_address || null,
                data.message.at || null,
                moment.utc().format("DD-MM-YYYY HH:mm:ss")
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
            console.log('y el id es', id);
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
                console.log("VALUE", value);
                deferred.resolve();
            }, function (reason) {
                console.log(reason);
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

        function findConversation(type, receivers){
            var query = "SELECT * FROM conversation WHERE type = '" + type + "' AND receivers = '" + JSON.stringify(receivers) + "'";
            return execute(query, []);
        }

        return {
            execute: execute,
            initDb: initDb,
            //saveSendMessage: saveSendMessage,
            savePendingMessage: savePendingMessage,
            saveMessageHistory: saveMessageHistory,
            saveConversation: saveConversation,
            deleteConversation: deleteConversation,
            getInboxConversations: getInboxConversations,
            getConversationMessages: getConversationMessages,
            getDelayedMessages: getDelayedMessages,
            deletePendingMessage: deletePendingMessage,
            findConversation: findConversation
        };
    });
