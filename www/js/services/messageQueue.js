angular.module('app').service('messageQueue', function (messageRes, $q, messageStorage, userDatastore, messageNotification) {

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
                    messageNotification.notifySendMessage(idConversation, toUpdate, response.message);
                    processSms();
                });
            }).catch(function (error) {
                messageStorage.savePendingMessage(messageData, 'sms', idConversation).then(function (params) {
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
            var toUpdate = messageData.toUpdate;
            delete messageData.idConversation;
            delete messageData.toUpdate;
            var isReceived = false;
            messageRes(userDatastore.getTokens().accessToken).sendEmail(messageData).$promise.then(function (response) {
                //TODO handle server side error in data
                messageStorage.saveMessageHistory(messageData, 'email', response.message, idConversation, isReceived).then(function (params) {
                    messageNotification.notifySendMessage(idConversation, toUpdate, response.message);
                    processEmail();
                });
            }).catch(function (error) {
                messageStorage.savePendingMessage(messageData, 'email', idConversation).then(function (params) {
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
            var toUpdate = messageData.toUpdate;
            delete messageData.idConversation;
            delete messageData.toUpdate;
            var isReceived = false;
            messageRes(userDatastore.getTokens().accessToken).sendInstant(messageData).$promise.then(function (response) {
                //TODO handle server side error in data
                messageStorage.saveMessageHistory(messageData, 'mum', response.message, idConversation, isReceived).then(function (params) {
                    messageNotification.notifySendMessage(idConversation, toUpdate, response.message);
                    processMum();
                });
            }).catch(function (error) {
                messageStorage.savePendingMessage(messageData, 'mum', idConversation).then(function (params) {
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