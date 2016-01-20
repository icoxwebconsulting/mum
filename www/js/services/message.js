angular.module('app').service('messageSrv', function (messageRes) {

    var mum = {};

    var setMum = function (obj) {
        mum = obj;
    };

    var getMum = function () {
        return mum;
    };

    function sendMessage(data) {
        var messageData = {
            message: {
                body: data.body,
                receivers: (mum.type == 'sms') ? JSON.stringify([mum.phoneNumber]) : JSON.stringify([mum.email]),
                at: moment.utc(mum.date).format("DD-MM-YYYY HH:mm:ss")
            }
        };

        if (mum.type == 'email') {
            messageData.about = data.subject;
            messageData.from = mum.email;
            return messageRes.sendEmail(messageData).$promise
                .then(function (response) {
                });
        } else {
            return messageRes.sendSms(messageData).$promise
                .then(function (response) {
                });
        }
    }

    return {
        setMum: setMum,
        getMum: getMum,
        sendMessage: sendMessage
    };

});