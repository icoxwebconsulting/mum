angular.module('app.user', [])
  .factory('usuario', function ($http, SERVER_CONF) {

    function isVerified() {
      return window.localStorage.getItem('verified') || false;
    }

    function setVerified() {
      window.localStorage.setItem('verified', true);
    }

    function setNumber(number){
      window.localStorage.setItem('number', number);
    }

    function getNumber(){
      return window.localStorage.getItem('number');
    }

    function sendCode(phone, callback) {
      var config = {
        method: "POST",
        url: SERVER_CONF.HOST + 'send-sms.php' +
        '?number=' + phone
      };

      $http(config)
        .then(function successCallback(response) {
          if (!response.data.error) {
            callback(true);
          } else {
            callback(false);
          }
        }, function errorCallback(response) {
          callback(false);
        });
    }

    function verifyCode(code, callback) {
      var config = {
        method: "POST",
        url: SERVER_CONF.HOST + 'verify-code.php' +
        '?number=' + getNumber() +
        '&code=' + code
      };

      $http(config)
        .then(function successCallback(response) {
          if (!response.data.error) {
            setVerified();
            callback(true);
          } else {
            callback(false);
          }
        }, function errorCallback(response) {
          callback(false);
        });
    }


    return {
      isVerified: isVerified,
      setVerified: setVerified,
      setNumber: setNumber,
      getNumber: getNumber,
      sendCode: sendCode,
      verifyCode: verifyCode
    };
  });