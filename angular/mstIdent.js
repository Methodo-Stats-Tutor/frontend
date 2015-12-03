
var app = angular.module('mstIdent', []);


app.controller('IdentController', function($scope, $rootScope,  $sce,$window,$location,AUTH_EVENTS, AuthService) {
	$scope.credentials = {
		username: 'admin',
		password: 'admin'
	};

	$scope.login = function (credentials) {
		AuthService.login(credentials).then(function (user) {
			$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
			$scope.setCurrentUser(user);
			$location.url('accueil');
		}, function () {
			$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
		});
	};

	$scope.logout = function (credentials) {
		AuthService.logout();
		$scope.setCurrentUser(null);
		$location.url('login');

	};
});

app.constant('AUTH_EVENTS', {
	loginSuccess: 'auth-login-success',
	loginFailed: 'auth-login-failed',
	logoutSuccess: 'auth-logout-success',
	sessionTimeout: 'auth-session-timeout',
	notAuthenticated: 'auth-not-authenticated',
	notAuthorized: 'auth-not-authorized'
});

app.constant('USER_ROLES', {
	all: '*',
	admin: 'admin',
	teacher: 'teacher',
	student: 'student',
	guest: 'guest'
});

app.factory('AuthService', function ($http, Session, ROOTS) {
	var authService = {};

	var urlBase = ROOTS.webServices + '/rest/ident';
	authService.login = function (credentials) {
		return $http.post(urlBase + "/post", credentials)
		.then(function (res) {
			Session.create(res.data, credentials.password);
			return res.data;
		});
	};
	authService.logout = function (credentials) {
		Session.destroy();
	};

	authService.isAuthenticated = function () {
		return !!Session.user.uid;
	};

	authService.isAuthorized = function (authorizedRoles) {
		if (!angular.isArray(authorizedRoles)) {
			authorizedRoles = [authorizedRoles];
		}
		return (authService.isAuthenticated() &&
			authorizedRoles.indexOf(Session.user.role) !== -1);
	};

	return authService;
})

app.service('Session', function () {
    this.user ={};
    this.user.uid =null;
    this.user.password =null;
    this.isConnected= false;
	this.create = function (data, userPassword) {
        this.user = {};
		this.user.uid = data.uid;
		this.user.fName = data.fName;
		this.user.lName = data.lName;
		this.user.role = data.role;
		this.user.d8Add = data.d8Add;
		this.user.password = userPassword;
        this.isConnected = true;
	};

    this.updateUser = function(data){
    this.user.fName = data.fName;
    this.user.lName = data.lName;
    }

	this.destroy = function () {
        this.isConnected = false;
		this.user = null;
	
	};

	this.getEncodedStringForBasicAuth = function(){
		var string = this.user.uid + ":" + this.user.password;
		var encodedString = btoa(string);
		return encodedString;
	};
});



