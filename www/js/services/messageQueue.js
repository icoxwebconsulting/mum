angular.module('app').service('messageQueue', function (messageRes, $q, messageStorage) {

    var smsQueue = [];
    var emailQueue = [];
    var mumQueue = [];

    var isRunSms = false;
    var isRunEmail = false;
    var isRunMum = false;

    function addSms(msg) {
        smsQueue.push(msg);
    }

    function addEmail(msg) {
        emailQueue.push(msg);
    }

    function addMum(msg) {
        mumQueue.push(msg);
    }

    function lengthSms() {
        return smsQueue.length;
    }

    function lengthEmail() {
        return emailQueue.length;
    }

    function lengthMum() {
        return mumQueue.length;
    }

    function processSms() {
        if (!isRunSms) {
            runSmsQueue();
        }
    }

    function runSmsQueue() {
        if (smsQueue.length > 0) {
            isRunSms = true;
            var messageData = smsQueue[0];
            var idConversation = messageData.idConversation;
            delete messageData.idConversation;

            messageRes.sendSms(messageData).$promise.then(function (response) {
                //TODO handle server side error in data
                console.log(response);
                var isReceived = false;
                messageStorage.saveMessageHistory(messageData, 'sms', response.message, idConversation, isReceived).then(function (params) {
                    //deferred.resolve(params);
                    smsQueue.shift();
                    processSms();
                });
            }).catch(function (error) {
                if (error.code != 500) {
                    var isReceived = false;
                    messageStorage.savePendingMessage(messageData, 'sms', idConversation, isReceived).then(function (params) {
                        //deferred.resolve(params);
                        smsQueue.shift();
                        processSms();
                    });
                } else {
                    console.log("Error en respuesta del servidor", error);
                }
            });
        } else {
            isRunSms = false;
        }
    }

    function processEmail() {
        if (!isRunEmail) {
            runEmailQueue();
        }
    }

    function runEmailQueue() {
        if (emailQueue.length > 0) {
            isRunEmail = true;
            var messageData = emailQueue[0];
            var idConversation = messageData.idConversation;
            delete messageData.idConversation;

            messageRes.sendEmail(messageData).$promise.then(function (response) {
                //TODO handle server side error in data
                console.log(response);
                var isReceived = false;
                messageStorage.saveMessageHistory(messageData, 'email', response.message, idConversation, isReceived).then(function (params) {
                    //deferred.resolve(params);
                    emailQueue.shift();
                    processEmail();
                });
            }).catch(function (error) {
                if (error.code != 500) {
                    var isReceived = false;
                    messageStorage.savePendingMessage(messageData, 'email', idConversation, isReceived).then(function (params) {
                        //deferred.resolve(params);
                        emailQueue.shift();
                        processEmail();
                    });
                } else {
                    console.log("Error en respuesta del servidor", error);
                }
            });
        } else {
            isRunSms = false;
        }
    }

    function processMum() {
        if (!isRunMum) {
            runMumQueue();
        }
    }

    function runMumQueue() {
        if (mumQueue.length > 0) {
            isRunMum = true;
            var messageData = mumQueue[0];
            var idConversation = messageData.idConversation;
            delete messageData.idConversation;

            messageRes.sendInstant(messageData).$promise.then(function (response) {
                //TODO handle server side error in data
                console.log(response);
                var isReceived = false;
                messageStorage.saveMessageHistory(messageData, 'mum', response.message, idConversation, isReceived).then(function (params) {
                    //deferred.resolve(params);
                    mumQueue.shift();
                    processMum();
                });
            }).catch(function (error) {
                if (error.code != 500) {
                    var isReceived = false;
                    messageStorage.savePendingMessage(messageData, 'mum', idConversation, isReceived).then(function (params) {
                        //deferred.resolve(params);
                        mumQueue.shift();
                        processMum();
                    });
                } else {
                    console.log("Error en respuesta del servidor", error);
                }
            });
        } else {
            isRunMum = false;
        }
    }

    return {
        addSms: addSms,
        addEmail: addEmail,
        addMum: addMum,
        lengthSms: lengthSms,
        lengthEmail: lengthEmail,
        lengthMum: lengthMum,
        processSms: processSms,
        processEmail: processEmail,
        processMum: processMum
    }
});