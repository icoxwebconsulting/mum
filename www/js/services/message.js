angular.module('app').service('messageSrv', function (messageRes) {

    var mum = {};

    var setMum = function (obj) {
        mum = obj;
    };

    var getMum = function () {
        return mum;
    };

    function sendSms(data) {
        return messageRes.sendSms(data).$promise
            .then(function (response) {
                console.log("ok");
            });
    }

    return {
        setMum: setMum,
        getMum: getMum,
        sendSms: sendSms
    };

});