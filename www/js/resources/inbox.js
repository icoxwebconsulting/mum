angular.module('app.inbox', [])
    .factory('inbox', function ($resource, $q, SERVER_CONF, sqliteDatastore) {

        function getTopMessages() {

            var deferred = $q.defer();
            sqliteDatastore.getConversations().then(function (results) {
                var chats = [];
                var t = {};
                for (var i = 0; i < results.rows.length; i++) {
                    t = results.rows.item(i);
                    chats.push({
                        id: t.id,
                        name: JSON.parse(t.receivers)[0],
                        lastText: "TODO",
                        face: 'img/mike.png',
                        type: t.type,
                        created: t.created,
                        updated: t.updated
                    });
                }
                console.log("por retornar chats", chats);
                deferred.resolve(chats);
            }).catch(function (error) {
                // Tratar el error
                console.log("error en consulta en inbox", error);
                deferred.reject(error);
            });
            return deferred.promise;
        }

        return {
            getTopMessages: getTopMessages
        };

    });
