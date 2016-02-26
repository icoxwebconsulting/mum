angular.module('app').service('delayedMessageSrv', function ($q, sqliteDatastore, messageRes) {

    var messages = [];
    var count = 0;

    function getDelayedMessages() {
        console.log("la puta ostia")
        var deferred = $q.defer();
        sqliteDatastore.getDelayedMessages().then(function (results) {
            console.log("QUE HUEVA")
            var msgs = [];
            for (var i = 0; i < results.rows.length; i++) {
                msgs.push(results.rows.item(i));
            }
            messages = msgs;
            deferred.resolve(messages);
        }).catch(function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function getOneMessage() {
        console.log(count)
        if (count < messages.length) {
            var element = messages[count];
            count += 1;
            return element;
        } else {
            return null;
        }
    }

    function processDelayedMessages() {
        var msg = getOneMessage();

        if (msg) {
            var messageData = {
                message: {
                    body: msg.body,
                    receivers: msg.receivers
                }
            };
            console.log("RECEIVERS", messageData.message.receivers)
            if (msg.at) {
                messageData.message.at = msg.at;
            }

            var isReceived = false;


            console.log("voy a procesar el puto mensaje", msg)

            if (msg.type == 'email') {
                messageRes.sendEmail(messageData).$promise.then(function (response) {
                    //TODO handle server side error in data
                    console.log(response);
                    sqliteDatastore.saveMessageHistory(messageData, msg.type, response.message, msg.id_conversation, isReceived).then(function (resp) {
                        console.log("EXITO!!!", resp);
                        sqliteDatastore.deletePendingMessage(msg.id).then(function () {
                            processDelayedMessages();
                        });
                    });
                }).catch(function (error) {
                    console.log(error);
                    processDelayedMessages();
                });
            } else if (msg.type == 'sms') {
                messageRes.sendSms(messageData).$promise.then(function (response) {
                    sqliteDatastore.saveMessageHistory(messageData, msg.type, response.message, msg.id_conversation, isReceived).then(function (resp) {
                        console.log("EXITO!!!!!!", resp);
                        sqliteDatastore.deletePendingMessage(msg.id).then(function () {
                            processDelayedMessages();
                        });
                    });
                }).catch(function (error) {
                    console.log(error);
                    processDelayedMessages();
                });
            }
        }
    }

    function run() {
        setTimeout(function () {
            getDelayedMessages().then(function () {
                processDelayedMessages();
            });
        }, 3000);
    }

    return {
        run: run
    }
});

