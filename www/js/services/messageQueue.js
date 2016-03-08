angular.module('app').service('messageQueue', function ($rootScope, messageRes, $q, messageStorage, userDatastore) {

    var smsQueue = [];
    var emailQueue = [];
    var mumQueue = [];

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
        runSmsQueue();
    }

    function runSmsQueue() {
        if (smsQueue.length > 0) {
            var messageData = smsQueue.shift();
            var idConversation = messageData.idConversation;
            var toUpdate = messageData.toUpdate;
            delete messageData.idConversation;
            delete messageData.toUpdate;
            var isReceived = false;
            messageRes(userDatastore.getTokens().accessToken).sendSms(messageData).$promise.then(function (response) {
                //TODO handle server side error in data
                messageStorage.saveMessageHistory(messageData, 'sms', response.message, idConversation, isReceived).then(function (params) {
                    if (toUpdate) {
                        $rootScope.$emit('sentMessage', {
                            idConversation: idConversation,
                            index: toUpdate,
                            idMessage: response.message
                        });
                    }
                    processSms();
                });
            }).catch(function (error) {
                messageStorage.savePendingMessage(messageData, 'sms', idConversation, isReceived).then(function (params) {
                    processSms();
                });
            });
        }
    }

    function processEmail() {
        runEmailQueue();
    }

    function runEmailQueue() {
        if (emailQueue.length > 0) {
            var messageData = emailQueue.shift();
            var idConversation = messageData.idConversation;
            delete messageData.idConversation;
            var isReceived = false;
            messageRes(userDatastore.getTokens().accessToken).sendEmail(messageData).$promise.then(function (response) {
                //TODO handle server side error in data
                messageStorage.saveMessageHistory(messageData, 'email', response.message, idConversation, isReceived).then(function (params) {
                    processEmail();
                });
            }).catch(function (error) {
                messageStorage.savePendingMessage(messageData, 'email', idConversation, isReceived).then(function (params) {
                    processEmail();
                });
            });
        }
    }

    function processMum() {
        runMumQueue();
    }

    function runMumQueue() {
        if (mumQueue.length > 0) {
            var messageData = mumQueue.shift();
            var idConversation = messageData.idConversation;
            delete messageData.idConversation;
            var isReceived = false;
            messageRes(userDatastore.getTokens().accessToken).sendInstant(messageData).$promise.then(function (response) {
                //TODO handle server side error in data
                messageStorage.saveMessageHistory(messageData, 'mum', response.message, idConversation, isReceived).then(function (params) {
                    processMum();
                });
            }).catch(function (error) {
                messageStorage.savePendingMessage(messageData, 'mum', idConversation, isReceived).then(function (params) {
                    processMum();
                });
            });
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