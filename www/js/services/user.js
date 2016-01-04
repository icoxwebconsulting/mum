angular.module('app.user', []).factory('usuario', function ($http, SERVER_CONF) {

    var profile = {
      name: "",
      image: ""
    };

    function isVerified() {
      return window.localStorage.getItem('verified') || false;
    }

    function setVerified() {
      window.localStorage.setItem('verified', true);
    }

    function setNumber(number) {
      window.localStorage.setItem('number', number);
    }

    function getNumber() {
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

    function getProfile() {
      return profile = {
        name: window.localStorage.getItem('name'),
        image: window.localStorage.getItem('image')
      };
    }

    function setProfileImage(image) {
      if (image != undefined) {
        profile = {
          image: image
        };
        window.localStorage.setItem('image', image);
      }
    }

    function setProfileName(name) {
      if (name != undefined) {
        profile = {
          name: name
        };
        window.localStorage.setItem('name', name);
      }
    }

    return {
      isVerified: isVerified,
      setVerified: setVerified,
      setNumber: setNumber,
      getNumber: getNumber,
      sendCode: sendCode,
      verifyCode: verifyCode,
      getProfile: getProfile,
      setProfileImage: setProfileImage,
      setProfileName: setProfileName
    };
  });
