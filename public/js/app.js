console.log("app.js is linked");

const app = angular.module("comm_app", []);

app.controller("mainController", ["$http", function($http) {
  this.test = "This is a test of the Angular broadcast system."
}]);
