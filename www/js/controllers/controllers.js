angular.module('app.controllers', ['app.user'])

  .controller('InitCtrl', function ($scope, $state, $ionicActionSheet, $timeout, $ionicPopup, $ionicLoading, usuario) {
    $scope.data = {};

    $scope.toVerify = false;

    $scope.sendCode = function () {
      if (!$scope.data.cc) {
        $ionicPopup.alert({
          title: 'Ingrese el código del país'
        });
      } else if (!$scope.data.phone) {
        $ionicPopup.alert({
          title: 'Ingrese el número de teléfono'
        });
      } else {
        $ionicLoading.show({
          template: 'Verificando...'
        });

        usuario.sendCode('+' + $scope.data.cc + $scope.data.phone, function (isSuccess) {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: (isSuccess) ? 'Se envió un mensaje a su teléfono.' : 'No verificado, intente nuevamente.'
          });
          if (isSuccess) {
            $scope.toVerify = true;
            usuario.setNumber($scope.data.cc + $scope.data.phone);
          }
        });
      }
    };

    $scope.verifyCode = function () {
      if (!$scope.data.code) {
        $ionicPopup.alert({
          title: 'Ingrese el código recibido vía SMS'
        });
      } else {
        usuario.verifyCode($scope.data.code, function (isValid) {
          if (isValid) {
            $ionicPopup.alert({
              title: 'Se ha validado correctamente su teléfono.'
            });
            $state.go('layout.home');
          }else{
            $ionicPopup.alert({
              title: 'Código erróneo, verifique y vuelva a intentar.'
            });
          }
        });
      }
    };

  })

  .controller('MainCtrl', function ($scope, $state, $ionicActionSheet, $timeout) {
    $scope.showMenu = function () {

      // Show the action sheet
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          {text: 'Perfil'},
          {text: 'Nuevo grupo'},
          {text: 'Política de privacidad'}
        ],
        titleText: 'Opciones',
        cancelText: 'Cancelar',
        cancel: function () {
          // add cancel code..
        },
        buttonClicked: function (index) {
          switch (index) {
            case 0:
              $state.go('profile');
              break;
            case 2:
              $state.go('terms');
              break;
          }

          return true;
        }
      });

      //// For example's sake, hide the sheet after two seconds
      //$timeout(function() {
      //  hideSheet();
      //}, 2000);

    };
  })

  .controller('ChatsCtrl', function ($scope, $ionicActionSheet, $timeout, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
      Chats.remove(chat);
    };
  })

  .controller('ContactCtrl', function ($scope, Chats) {
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
      Chats.remove(chat);
    };
  })

  .controller('HomeCtrl', function ($scope) {
    $scope.day = moment();
  })

  //.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  //  $scope.chat = Chats.get($stateParams.chatId);
  //})
  //
  //.controller('AccountCtrl', function($scope) {
  //  $scope.settings = {
  //    enableFriends: true
  //  };
  //});

  .directive("calendar", function () {
    return {
      restrict: "E",
      templateUrl: "templates/calendar.html",
      scope: {
        selected: "="
      },
      link: function (scope) {
        scope.selected = _removeTime(scope.selected || moment());
        scope.month = scope.selected.clone();

        var start = scope.selected.clone();
        start.date(1);
        _removeTime(start.day(0));

        _buildMonth(scope, start, scope.month);

        scope.select = function (day) {
          scope.selected = day.date;
        };

        scope.next = function () {
          var next = scope.month.clone();
          _removeTime(next.month(next.month() + 1).date(1));
          scope.month.month(scope.month.month() + 1);
          _buildMonth(scope, next, scope.month);
        };

        scope.previous = function () {
          var previous = scope.month.clone();
          _removeTime(previous.month(previous.month() - 1).date(1));
          scope.month.month(scope.month.month() - 1);
          _buildMonth(scope, previous, scope.month);
        };
      }
    };

    function _removeTime(date) {
      return date.day(0).hour(0).minute(0).second(0).millisecond(0);
    }

    function _buildMonth(scope, start, month) {
      scope.weeks = [];
      var done = false, date = start.clone(), monthIndex = date.month(), count = 0;
      while (!done) {
        scope.weeks.push({days: _buildWeek(date.clone(), month)});
        date.add(1, "w");
        done = count++ > 2 && monthIndex !== date.month();
        monthIndex = date.month();
      }
    }

    function _buildWeek(date, month) {
      var days = [];
      for (var i = 0; i < 7; i++) {
        days.push({
          name: date.format("dd").substring(0, 1),
          number: date.date(),
          isCurrentMonth: date.month() === month.month(),
          isToday: date.isSame(new Date(), "day"),
          date: date
        });
        date = date.clone();
        date.add(1, "d");
      }
      return days;
    }
  });