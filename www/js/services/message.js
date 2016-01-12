angular.module('app').service('messageSrv', function () {

    var mum = {};

    var setMum = function (obj) {
        mum = obj;
    };

    var getMum = function () {
        return mum;
    };

    return {
        setMum: setMum,
        getMum: getMum
    };

});