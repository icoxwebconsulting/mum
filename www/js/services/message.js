angular.module('app').service('messageSrv', function (messageRes) {

    var mum = {};

    var setMum = function (obj) {
        mum = obj;
    };

    var getMum = function () {
        return mum;
    };

    function sendSms(data) {
        var messageData = {
            message: {
                body: data.body,
                receivers: JSON.stringify([mum.phoneNumber]),
                at: moment.utc(mum.date).format("DD-MM-YYYY HH:mm:ss")
            }
        };

        return messageRes.sendSms(messageData).$promise
            .then(function (response) {
            });
    }

    return {
        setMum: setMum,
        getMum: getMum,
        sendSms: sendSms
    };

});