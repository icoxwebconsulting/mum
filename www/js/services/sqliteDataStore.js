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
                'type INTEGER,' + //fk contra conversation
                'body TEXT,' +
                'message TEXT,' + //-- de sms y email
                'about TEXT,' + //-- de email
                'from_address TEXT,' + // de email
                'at TEXT,' + //--solo para mensajes programados
                'created DATETIME)';
            return execute(query);
        }

        function createTablePendingMessage() {
            var query = 'CREATE TABLE IF NOT EXISTS pending_message (' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
                'body TEXT,' +
                'message TEXT,' + //-- de sms y email
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
                'message TEXT,' + //<- id del mensaje segun tabla en backend
                'receivers TEXT,' + //arreglo de personas que recibieron el mensaje
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

        function saveSendMessage(data, type, serverData) {
            var defered = $q.defer();
            var promise = defered.promise;

            var query = 'INSERT INTO conversation (type, message, receivers, created, updated) VALUES(?,?,?,?,?)';
            var values = [
                type,
                "", //TODO: quitar message?
                data.message.receivers,
                moment.utc().format("DD-MM-YYYY HH:mm:ss"),
                moment.utc().format("DD-MM-YYYY HH:mm:ss")
            ];


            db.transaction(function (tx) {
                tx.executeSql(query, values,
                    function (tx, result) {
                        console.log("primer query ejecutado");
                        var values2 = [
                            0, //TODO: obtener clave del servidor de serverData
                            db.lastInsertRowId, //key del registro creado anteriormente en conversation
                            type,
                            data.message.body || null,
                            data.message.message || null,
                            data.message.about || null,
                            data.message.from_address || null,
                            data.message.at || null,
                            moment.utc().format("DD-MM-YYYY HH:mm:ss")
                        ];

                        var query2 = 'INSERT INTO message_history (id, id_conversation, type, body, message, about, from_address, at, created) VALUES(?,?,?,?,?,?,?,?,?)';
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

        function getConversations(){
            sqliteDatastore
                .execute('SELECT * FROM conversation')
                .then(function (data) {
                    chats = data;
                    return chats;
                })
                .catch(function (error) {
                    // Tratar el error
                    console.log("error en consulta", error);
                });
        }

        return {
            execute: execute,
            initDb: initDb,
            saveSendMessage: saveSendMessage
        };
    });
