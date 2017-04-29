angular.module('ionic-image-upload', ['ionic', 'ngCordova'])

.run(function($rootScope) {
  ionic.Platform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true)
      cordova.plugins.Keyboard.disableScroll(true)
    }
    if(window.StatusBar) {
      StatusBar.styleDefault()
    }
  })
})

.directive('file', function() {
  return {
    restrict: 'AE',
    scope: {
      file: '@'
    },
    link: function(scope, el, attrs){
      el.bind('change', function(event){
        var files = event.target.files
        var file = files[0]
        if(file && typeof(file) !== undefined && file.size > 0){
          scope.file = file
          scope.$parent.file = file
        } else {
          scope.file = {}
          scope.$parent.file = {}
        }
        scope.$apply()
      })
    }
  }
})

.controller('UploadController', function ($scope, $ionicLoading){
  var imageUploader = new ImageUploader()
  $scope.result = {}
  $scope.file = {}
  $scope.upload = function() {
    $ionicLoading.show({
      template: 'Uploading...'
    })
    imageUploader.push($scope.file)
      .then((data) => {
        console.debug('Upload complete. Data:', data)
        $ionicLoading.hide()
        $scope.result.url = data.url
        $scope.$digest()
      })
      .catch((err) => {
        console.error(err)
        $ionicLoading.hide()
        $scope.result.error = err
      })
  }
})
