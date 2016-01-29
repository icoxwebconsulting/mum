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
                createTableMessage(),
                createTableScheduledMessage()
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

        function createTableMessage() {
            var query = 'CREATE TABLE IF NOT EXISTS message (' +
                'id TEXT primary key,' +
                'customer TEXT,' +
                'body TEXT,' +
                'type TEXT,' + //--tipo de mensaje (sms, email, instant)
                'room TEXT,' + //--de instant
                'message TEXT,' + //-- de sms y email
                'about TEXT,' + //-- de email
                'from_address TEXT,' + // de email
                'at TEXT,' + //--solo para mensajes programados
                'created TEXT,' +
                'updated TEXT)';
            return execute(query);
        }

        function createTableScheduledMessage() {
            var query = 'CREATE TABLE IF NOT EXISTS message_receiver (' +
                'id TEXT,' +
                'customer TEXT,' +
                'message TEXT,' +
                'receivers TEXT,' +
                'created TEXT,' +
                'updated TEXT)';
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

        return {
            execute: execute,
            initDb: initDb
        };
    });
