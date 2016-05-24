angular.module('app.sqliteDataStore', ['ionic', 'app.deviceDataStore'])
    .factory('sqliteDatastore', function ($cordovaSQLite, $q, APP_STORE_CONF) {

        var db;

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
                'id_conversation VARCHAR(255) NOT NULL,' + //fk contra conversation
                'type INTEGER,' + //fk contra conversation, tipo de mensaje ((1)sms, (2)email, (3)instant)
                'body TEXT,' + // -- de todos
                'attachment TEXT,' + //upload file
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
                'id_conversation VARCHAR(255) NOT NULL,' + //fk contra conversation
                'type INTEGER,' + //fk contra conversation, tipo de mensaje ((1)sms, (2)email, (3)instant)
                'body TEXT,' + // -- de todos
                'path TEXT,' + // file path
                'fileData TEXT,' + // -- file string
                'fileMimeType TEXT,' + // -- file mime type
                'about TEXT,' + //-- de email
                'from_address TEXT,' + // de email
                'at DATETIME,' + //--solo para mensajes programados
                'receivers TEXT,' + //guarda arreglo con los destinatarios, solo en esta tabla, una vez enviado se crea conversation
                'to_update INTEGER,' +
                'created DATETIME)';
            return execute(query);
        }

        function createTableConversation() {
            var query = 'CREATE TABLE IF NOT EXISTS conversation (' +
                'id VARCHAR(255) NOT NULL,' +
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
                // 'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
                'phone_number TEXT UNIQUE,' +
                'display_name TEXT,' +
                'photo TEXT,' +
                'email TEXT UNIQUE,' +
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
                setDbExist(true);
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

        return {
            execute: execute,
            initDb: initDb
        };
    });
