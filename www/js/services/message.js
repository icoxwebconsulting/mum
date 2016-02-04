angular.module('app').service('messageSrv', function (messageRes, sqliteDatastore) {

    var mum = {};

    var setMum = function (obj) {
        mum = obj;
    };

    var getMum = function () {
        return mum;
    };

    function saveSendMessage(msj, type, serverData) {
        sqliteDatastore.saveSendMessage(msj, type, serverData)
            .then(function (response) {
                console.log("mensaje enviado y guardado");
            }).catch(function (error) {
            console.log("error al guardar msj", error);
        });

    }

    function sendMessage(data) {
        var messageData = {
            message: {
                body: data.body,
                receivers: (mum.type == 'sms') ? JSON.stringify([mum.phoneNumber]) : JSON.stringify([mum.email]),
                at: moment.utc(mum.date).format("DD-MM-YYYY HH:mm:ss")
            }
        };
        //--tipo de mensaje ((1)sms, (2)email, (3)instant)
        if (mum.type == 'email') {
            messageData.about = data.subject;
            messageData.from = data.from;
            return messageRes.sendEmail(messageData).$promise
                .then(function (response) {
                    saveSendMessage(messageData, 2, response);
                });
        } else {
            return messageRes.sendSms(messageData).$promise
                .then(function (response) {
                    saveSendMessage(messageData, 1, response);
                });
        }
    }

    return {
        setMum: setMum,
        getMum: getMum,
        sendMessage: sendMessage
    };

});