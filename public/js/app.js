console.log("app.js is linked");

const app = angular.module("comm_app", []);

app.controller("mainController", ["$http", function($http) {
  this.url = 'https://entertheconnexus-api.herokuapp.com' || 'http://localhost:3000';
  this.user = {};
  this.logged = false;
  this.allCommunities = [];
  this.userCommunities = [];
  this.showCommunity = {};
  this.showPost = {};
  this.currentEdit = {};
  this.editp = false;
  this.editr = false;
  this.create = false;
  this.createComm = false;
  this.createPost = false;
  this.createReply = false;
  this.formData = {};
  this.deleteObj = {};
  this.clickedLog = false;
  this.ledgers = [];
  this.userLedgers = [];

  this.getLedgers = (user) => {
    $http({
      method: 'GET',
      url: this.url + '/ledgers',
    }).then(response => {
      this.ledgers = response.data;
      console.log(this.ledgers);
      for (ledger of this.ledgers) {
        if (ledger.user_id == user.id) {
          this.userLedgers.push(ledger);
          for (comm of this.allCommunities) {
            if (ledger.community_id == comm.id) {
              this.userCommunities.push(comm);
            }
          }
        }
      }
      console.log(this.userCommunities);
    })
  };

  this.login = (userPass) => {
    // console.log(userPass);

    $http({
      method: 'POST',
      url: this.url + '/users/login',
      data: { user: { username: userPass.username, password: userPass.password }}
    }).then(response => {
      // console.log(response);
      this.user = response.data.user;
      console.log('USER DATA:', this.user);
      this.logged = true;
      this.clickedLog = false;
      localStorage.setItem('token', JSON.stringify(response.data.token));
      this.getLedgers(this.user);
    });
  }

  this.register = (regData) => {
    console.log(regData);

    $http({
      method: 'POST',
      url: this.url + '/users/create',
      data: { user: { username: regData.username, password: regData.password }}
    }).then(response => {
      console.log(response);
      this.user = response.data.user;
      console.log('USER DATA:', this.user);
      this.logged = true;
      this.clickedLog = false;
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
      // console.log(response.data);
      this.allCommunities = response.data;
      this.showCommunity = this.allCommunities[0];
      this.showPost = this.showCommunity.posts[0];
      console.log('All Communities:', this.allCommunities);
      // console.log('Default Show Community:', this.showCommunity);
      // console.log('Default Show Post', this.showPost);
    }, error => {
      console.error(error.message);
    }).catch( err => console.error('Catch', err));
  }

  this.joinComm = (community) => {
    console.log(community);
    console.log(this.user);
    $http({
      method: 'POST',
      url: this.url + '/ledgers',
      data: { user_id: this.user.id, community_id: community.id }
    }).then(response => {
      console.log(response.data);
    })
  }

  this.getAllCommunities();

  this.editPostModal = ( post) => {
    this.editp = true;
    this.currentEdit = angular.copy(post);
    console.log(this.currentEdit);
  }

  this.editReplyModal = ( reply) => {
    this.editr = true;
    this.currentEdit = angular.copy(reply);
    console.log(this.currentEdit);
  }

  this.editPost = () => {
    $http({
      url: this.url + '/posts/' + this.currentEdit.id,
      method: 'PUT',
      data: this.currentEdit
    }).then(response => {
      console.log(response.data);
      const updateByIndex = this.showCommunity.posts.findIndex(item => item.id === response.data.id);
      this.showCommunity.posts.splice(updateByIndex, 1, response.data);
    }, error => {
      console.error(error.message);
    }).catch(err => console.error('Catch', err));

    this.editp = false;
    this.currentEdit = {};
  }

  this.editReply = () => {
    $http({
      url: this.url + '/posts/' + this.currentEdit.post_id + '/replies/' + this.currentEdit.id,
      method: 'PUT',
      data: this.currentEdit
    }).then(response => {
      console.log(response.data);
      const updateByIndex = this.showPost.replies.findIndex(item => item.id === response.data.id);
      this.showPost.replies.splice(updateByIndex, 1, response.data);
    }, error => {
      console.error(error.message);
    }).catch(err => console.error('Catch', err));

    this.editr = false;
    this.currentEdit = {};
  }

  this.dontEdit = () => {
    this.editr = false;
    this.editp = false;
    this.currentEdit = {};
  }

  this.addCommModal = () => {
    this.create = true;
    this.createComm = true;
  }

  this.addPostModal = () => {
    this.create = true;
    this.createPost = true;
  }

  this.addReplyModal = () => {
    this.create = true;
    this.createReply = true;
  }

  this.dontAdd = () => {
    this.create = false;
    this.createReply = false;
    this.createPost = false;
    this.createComm = false;
    this.formData = {};
  }

  this.addCommunity = () => {
    $http({
      method: 'POST',
      url: this.url + '/communities',
      data: this.formData
    }).then( response => {
      this.allCommunities.push(response.data);
      this.create = false;
      this.createComm = false;
    }, error => {
      console.error(error.message);
    }).catch(err => console.err('Catch', err));
  }

  this.addPost = () => {
    this.formData.community_id = this.showCommunity.id ;
    this.formData.user_id = this.user.id;
    $http({
      method: 'POST',
      url: this.url + '/posts',
      data: this.formData
    }).then( response => {
      this.showCommunity.posts.push(response.data);
      this.create = false;
      this.createPost = false;
    }, error => {
      console.error(error.message);
    }).catch(err => console.err('Catch', err));
  }

  this.addReply = () => {
    this.formData.user_id = this.user.id;
    this.formData.post_id = this.showPost.id;
    $http({
      method: 'POST',
      url: this.url + '/posts/' + this.formData.post_id + '/replies',
      data: this.formData
    }).then( response => {
      this.showPost.replies.push(response.data);
      this.create = false;
      this.createReply = false;
    }, error => {
      console.error(error.message);
    }).catch(err => console.err('Catch', err));

  }

  this.deletePost = (post) => {
    this.deleteObj = post;
    $http({
      method: 'DELETE',
      url: this.url + '/posts/' + this.deleteObj.id
    }).then(response => {
      const removeByIndex = this.showCommunity.posts.findIndex(item => item.id === this.deleteObj.id);
      this.showCommunity.posts.splice(removeByIndex, 1);
      this.deleteObj = {};
    }, error => {
      console.error(error.message);
    }).catch(err => console.err('Catch', err));
  }

  this.deleteReply = (reply) => {
    this.deleteObj = reply;
    $http({
      method: 'DELETE',
      url: this.url + '/posts/' + this.showPost.id + '/replies/' + this.deleteObj.id
    }).then(response => {
      const removeByIndex = this.showPost.replies.findIndex(item => item.id === this.deleteObj.id);
      this.showPost.replies.splice(removeByIndex, 1);
      this.deleteObj = {};
    }, error => {
      console.error(error.message);
    }).catch(err => console.err('Catch', err));
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
