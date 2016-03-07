angular.module('app').service('messageQueue', function ($rootScope, messageRes, $q, messageStorage, userDatastore) {

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
            var toUpdate = messageData.toUpdate;
            delete messageData.idConversation;
            delete messageData.toUpdate;

            messageRes(userDatastore.getTokens().accessToken).sendSms(messageData).$promise.then(function (response) {
                //TODO handle server side error in data
                var isReceived = false;
                messageStorage.saveMessageHistory(messageData, 'sms', response.message, idConversation, isReceived).then(function (params) {
                    //deferred.resolve(params);
                    if (toUpdate) {
                        $rootScope.$emit('sentMessage', {
                            idConversation: idConversation,
                            index: toUpdate,
                            idMessage: response.message
                        });
                    }
                    smsQueue.shift();
                    processSms();
                });
            }).catch(function (error) {
                var isReceived = false;
                messageStorage.savePendingMessage(messageData, 'sms', idConversation, isReceived).then(function (params) {
                    //deferred.resolve(params);
                    smsQueue.shift();
                    processSms();
                });
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

            messageRes(userDatastore.getTokens().accessToken).sendEmail(messageData).$promise.then(function (response) {
                //TODO handle server side error in data
                var isReceived = false;
                messageStorage.saveMessageHistory(messageData, 'email', response.message, idConversation, isReceived).then(function (params) {
                    //deferred.resolve(params);
                    emailQueue.shift();
                    processEmail();
                });
            }).catch(function (error) {
                var isReceived = false;
                messageStorage.savePendingMessage(messageData, 'email', idConversation, isReceived).then(function (params) {
                    //deferred.resolve(params);
                    emailQueue.shift();
                    processEmail();
                });
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

            messageRes(userDatastore.getTokens().accessToken).sendInstant(messageData).$promise.then(function (response) {
                //TODO handle server side error in data
                var isReceived = false;
                messageStorage.saveMessageHistory(messageData, 'mum', response.message, idConversation, isReceived).then(function (params) {
                    //deferred.resolve(params);
                    mumQueue.shift();
                    processMum();
                });
            }).catch(function (error) {
                var isReceived = false;
                messageStorage.savePendingMessage(messageData, 'mum', idConversation, isReceived).then(function (params) {
                    //deferred.resolve(params);
                    mumQueue.shift();
                    processMum();
                });
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