console.log("app.js is linked");

const app = angular.module('community-app', []);

app.controller('MainController', ['$http', function($http) {
  this.test = 'angular is running';
}]);
