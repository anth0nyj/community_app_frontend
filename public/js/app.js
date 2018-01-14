console.log("app.js is linked");

const app = angular.module("comm_app", []);

app.controller("mainController", ["$http", function($http) {
  this.url = 'http://localhost:3000';
  this.user = {};

  this.login = (userPass) => {
    console.log(userPass);

    $http({
      method: 'POST',
      url: this.url + '/users/login',
      data: { user: { username: userPass.username, password: userPass.password }},
    }).then(response => {
      console.log(response);
      this.user = response.data.user;
      localStorage.setItem('token', JSON.stringify(response.data.token));
    });
  }

  this.getUsers = () => {
    $http({
      url: this.url + '/users',
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(response => {
      console.log(response);
      if (response.data.status == 401) {
        this.error = "Unauthorized";
      } else {
        this.users = response.data;
      }
    })
  }

  this.logout = () => {
    localStorage.clear('token');
    location.reload();
  }
  
}]);
