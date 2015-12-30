angular.module('app').controller('ProfileCtrl', function ($scope, $ionicModal, usuario) {

  $scope.profile = usuario.getProfile();

  if(!$scope.profile.image){
    usuario.setProfileImage('img/account.png');
    $scope.profile.image = 'img/account.png';
  }

  $ionicModal.fromTemplateUrl('templates/name-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function () {
    $scope.modal.show();
  };

  $scope.acceptChange = function () {
    console.log($scope.profile.name);
    usuario.setProfileName($scope.profile.name);
    $scope.modal.hide();
  };

  $scope.cancelChange = function () {
    $scope.profile = usuario.getProfile();
    $scope.modal.hide();
  };

  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function () {
    $scope.modal.remove();
  });

  // Execute action on hide modal
  $scope.$on('modal.hidden', function () {
    // Execute action
  });

  // Execute action on remove modal
  $scope.$on('modal.removed', function () {
    // Execute action
  });

});
