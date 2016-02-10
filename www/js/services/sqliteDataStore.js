angular.module('app.sqliteDataStore', ['ionic', 'app.deviceDataStore'])
    .factory('sqliteDatastore', function ($cordovaSQLite, $q, deviceDatastore) {

        var db;
        var tables = ["Message", "InstantMessage", "SMSMessage", "EmailMessage", "ScheduledMessage"];

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
            var defered = $q.defer();
            var promise = defered.promise;

            db.transaction(function (tx) {
                tx.executeSql(query, values, function (tx, result) {
                        defered.resolve(result);
                    },
                    function (transaction, error) {
                        defered.reject(error);
                    });
            });
            return promise;
        }

        function createTableMessageHistory() {
            var query = 'CREATE TABLE IF NOT EXISTS message_history (' +
                'id TEXT primary key,' + //key obtenida del servidor
                'id_conversation TEXT,' + //fk contra conversation
                'type INTEGER,' + //fk contra conversation, tipo de mensaje ((1)sms, (2)email, (3)instant)
                'body TEXT,' + // -- de todos
                'about TEXT,' + //-- de email
                'from_address TEXT,' + // de email
                'at TEXT,' + //--solo para mensajes programados
                'created DATETIME)';
            return execute(query);
        }

        function createTablePendingMessage() {
            var query = 'CREATE TABLE IF NOT EXISTS pending_message (' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
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
                'id_message TEXT,' + //<- id del mensaje segun tabla en backend
                'receivers TEXT,' + //arreglo de personas que recibieron el mensaje
                'display_name TEXT,' + //nombre para mostrar
                'image TEXT,' +
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

        function saveSendMessage(data, mum, serverData) { //serverData = {"message":"56b0d96fa7538","delivered":false}
            var defered = $q.defer();
            var promise = defered.promise;

            var query = 'INSERT INTO conversation (type, id_message, receivers, display_name, image, created, updated) VALUES(?,?,?,?,?,?,?)';
            var values = [
                mum.type,
                "", //TODO: quitar id_message?
                data.message.receivers, // como json en string,
                mum.displayName, //nombre para mostrar
                data.image || null,
                moment.utc().format("DD-MM-YYYY HH:mm:ss"),
                moment.utc().format("DD-MM-YYYY HH:mm:ss")
            ];

            db.transaction(function (tx) {
                tx.executeSql(query, values,
                    function (tx, result) {
                        console.log("primer query ejecutado");
                        var values2 = [
                            serverData.message,
                            result.insertId, //key del registro creado anteriormente en conversation
                            mum.type,
                            data.message.body || null,
                            data.message.about || null,
                            data.message.from_address || null,
                            data.message.at || null,
                            moment.utc().format("DD-MM-YYYY HH:mm:ss")
                        ];

                        var query2 = 'INSERT INTO message_history (id, id_conversation, type, body, about, from_address, at, created) VALUES(?,?,?,?,?,?,?,?)';
                        tx.executeSql(query2, values2,
                            function (tx, result) {
                                console.log("segundo query ejecutado");
                                defered.resolve(result);
                            },
                            function (transaction, error) {
                                defered.reject(error);
                            });
                    },
                    function (transaction, error) {
                        defered.reject(error);
                    });
            });
            return promise;
        }

        function saveDelayMessage() {

        }

        function getInboxConversations() {
            var defered = $q.defer();
            var promise = defered.promise;

            db.transaction(function (tx) {
                var query = 'SELECT  c.id, c.type, c.receivers, c.created, c.updated, c.display_name, c.image, ' +
                    'SUBSTR(mh.body,0,20) as body, mh.about, mh.from_address, mh.at ' +
                    'FROM    conversation c INNER JOIN ' +
                    '(SELECT  id_conversation, ' +
                    'MAX(created) MaxDate ' +
                    'FROM    message_history ' +
                    'GROUP BY id_conversation ' +
                    ') MaxDates ON c.id = MaxDates.id_conversation INNER JOIN ' +
                    'message_history mh ON   MaxDates.id_conversation = mh.id_conversation ' +
                    'AND MaxDates.MaxDate = mh.created ';
                tx.executeSql(query, [], function (tx, result) {
                        defered.resolve(result);
                    },
                    function (transaction, error) {
                        defered.reject(error);
                    });
            });
            return promise;
        }

        function getConversationMessages(id) {
            console.log('y el id es', id);
            var query = 'SELECT * FROM message_history WHERE id_conversation = '+id+' ORDER BY created';
            var values = [];
            return execute(query, values);
        }

        return {
            execute: execute,
            initDb: initDb,
            saveSendMessage: saveSendMessage,
            getInboxConversations: getInboxConversations,
            getConversationMessages: getConversationMessages
        };
    });
