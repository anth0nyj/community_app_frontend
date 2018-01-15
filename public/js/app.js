console.log("app.js is linked");

const app = angular.module("comm_app", []);

app.controller("mainController", ["$http", function($http) {
  this.url = 'http://localhost:3000';
  this.user = {};
  this.logged = false;
  this.allCommunities = [];
  this.userCommunities = [];
  this.showCommunity = {};
  this.showPost = {};
  this.currentEdit = {};
  this.editp = false;
  this.editr = false;

  this.login = (userPass) => {
    console.log(userPass);

    $http({
      method: 'POST',
      url: this.url + '/users/login',
      data: { user: { username: userPass.username, password: userPass.password }},
    }).then(response => {
      console.log(response);
      this.user = response.data.user;
      console.log('USER DATA:', this.user);
      this.logged = true;
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
    this.logged = false;
  }


  this.getAllCommunities = () => {
    $http({
      url: this.url + '/communities',
      method: 'GET'
    }).then(response => {
      this.allCommunities = response.data;
      this.showCommunity = this.allCommunities[0];
      this.showPost = this.showCommunity.posts[0];
      console.log('All Communities:', this.allCommunities);
      console.log('Default Show Community:', this.showCommunity);
      console.log('Default Show Post', this.showPost);
    }).catch( err => console.error('Catch', err));
  }

  this.getAllCommunities();

  this.editPostModal = ( post ) => {
    this.editp = true;
    this.currentEdit = angular.copy(post);
    console.log(this.currentEdit);
  }

  this.editReplyModal = ( reply) => {
    this.editr = true;
    this.currentEdit = angular.copy(reply);
    console.log(this.currentEdit);
  }

  this.editPost = (id) => {
    $http({
      url: this.url + '/posts/' + id,
      method: 'PUT',
      data: this.currentEdit
    }).then(response => {
      console.log(response.data);
      const updateByIndex = this.showCommunity.posts.findIndex(item => item.id === response.data.id);
      this.showCommunity.posts.splice(updateByIndex, 1, response.data);
    }).catch(err => console.error('Catch', err));

    this.editp = false;
    this.currentEdit = {};
  }

  this.editReply = (reply) => {
    $http({
      url: this.url + '/posts/' + reply.post_id + '/replies/' + reply.id,
      method: 'PUT',
      data: this.currentEdit
    }).then(response => {
      console.log(response.data);
      const updateByIndex = this.showPost.replies.findIndex(item => item.id === response.data.id);
      this.showPost.replies.splice(updateByIndex, 1, response.data);
    }).catch(err => console.error('Catch', err));

    this.editr = false;
    this.currentEdit = {};
  }

  this.dontEdit = () => {
    this.editr = false;
    this.editp = false;
    this.currentEdit = {};
  }

  this.showThisCommunity = (communityClicked) => {
    this.showCommunity = communityClicked;
    this.showPost = this.showCommunity.posts[0];
    // console.log('Clicked on:', this.showCommunity);
    // console.log('Now viewing updated posts:', this.showPost);
  }

  this.showThisPost = (postClicked) => {
    this.showPost = postClicked;
    // console.log('CLICKED ON A DIFF POST', this.showPost);
  }

}]);
