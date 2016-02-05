angular.module('app.inbox', [])
    .factory('inbox', function ($resource, $q, SERVER_CONF, sqliteDatastore) {

        function getTopMessages() {
            var deferred = $q.defer();
            sqliteDatastore.getInboxConversations().then(function (results) {
                var chats = [];
                var t = {};
                var rec = [];
                for (var i = 0; i < results.rows.length; i++) {
                    t = results.rows.item(i);
                    rec = JSON.parse(t.receivers);
                    chats.push({
                        id: t.id,
                        name: t.display_name,
                        lastText: t.body,
                        image: (t.image)? t.image : 'img/person.png',
                        type: t.type, //--tipo de mensaje ((1)sms, (2)email, (3)instant)
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
