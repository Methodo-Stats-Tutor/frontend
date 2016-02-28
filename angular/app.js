//Define an angular module for our app
var mstApp = angular.module('mstAPP', ['ngRoute','ngResource','ngSanitize','angularFileUpload','doubleScrollBars','ngPostMessage','datatables','angular.filter','mstIdent','mstQcm','mstUtils','mstCourseMaterial','ui.bootstrap','colorpicker.module','treeControl','mstConstant']);

mstApp.controller('ApplicationController', function ($scope, USER_ROLES, AuthService, $window, UserRestService,Session) {
    $scope.currentUser = null;
    $scope.isConnected = null;
    $scope.userRoles = USER_ROLES;
    $scope.isAuthorized = AuthService.isAuthorized;
    $scope.$watch(function(){ return $window.innerHeight; },function(id){ $scope.pageHeight = id ;})
    $scope.$watch(function(){ return $window.innerWidth; },function(id){ $scope.pageWidth = id ;})
    $scope.setCurrentUser = function (user) {
        $scope.currentUser = user;
    };

    $scope.$watch(function(){ return Session.user; }, function(id){ $scope.currentUser = id ;})
    $scope.$watch(function(){ return Session.isConnected; }, function(id){ $scope.isConnected = id ;})
    $scope.debug=false;
});


mstApp.service('translationService', function($resource) {     

    this.getTranslation = function ($scope, language, page) {
        var path = 'templates/translation.json';
        var ssid = 'someid_' + language;

        if (sessionStorage) {
            if (sessionStorage.getItem(ssid)) {
                $scope.tr = JSON.parse(sessionStorage.getItem(ssid));
            } else {
                $resource(path).get(function(data) {
            $scope.tr = data[page][language];
                    sessionStorage.setItem(ssid, JSON.stringify($scope.tr));
                });
            };
        } else {
            $resource(path).get(function (data) {
            $scope.tr = data[page][language];
            });
        }
    };
});

app.factory('UserRestService',  function($http, ROOTS, Session) {
    var dataFactory = {};
    var urlBase = ROOTS.webServices + '/rest';
    var encodedString = Session.getEncodedStringForBasicAuth();

    dataFactory.updateUserProfile = function ( data) {
        return $http.put(urlBase + "/ident/user/"+Session.user.uid, data);
    };
    dataFactory.getUserProfile = function () {
        return $http.get(urlBase + "/ident/user/"+Session.user.uid);
    };

    return dataFactory;
});

app.factory('AdminRestService',  function($http, ROOTS, Session) {
    var dataFactory = {};
    var urlBase = ROOTS.webServices + '/rest';
    var encodedString = Session.getEncodedStringForBasicAuth();

    dataFactory.refreshOnto = function ( data) {
        return $http.get(urlBase + "/admin/refreshonto/");
    };

    return dataFactory;
});
//rest API
app.factory('TupleRestService',  function($http, ROOTS, Session) {
    var dataFactory = {};
    var urlBase = ROOTS.webServices + '/rest';
    var encodedString = Session.getEncodedStringForBasicAuth();

    dataFactory.getTupleRestServices = function () {
        return $http.get(urlBase + "/tuples/");
    };

    dataFactory.getOntoDetails = function (uri) {
        return $http.get(urlBase + "/tuples/getOntoDetails/"+uri.replace(/.*?#(.*)$/g, "$1"));
    };

    dataFactory.getOntoCytoGraph = function (usrId) {
        return $http.get(urlBase + "/tuples/getOntoCytoGraph/"+usrId);
    };

    dataFactory.getQuery = function (query) {
        return $http.post(urlBase + "/tuples/getQuery/",query);
    };

    dataFactory.getQueryOnto = function (query) {
        return $http.post(urlBase + "/tuples/getQueryOnto/",query);
    };
    dataFactory.getChildrenOnto = function (query) {
        return $http.post(urlBase + "/tuples/getChildrenOnto/",query);
    };
    dataFactory.getQueryOntoSearch = function (query) {
        return $http.post(urlBase + "/tuples/getQueryOntoSearch/",query);
    };

    dataFactory.getOntoIdInfo = function (query) {
        return $http.post(urlBase + "/tuples/getOntoIdInfo/",query);
    };

    return dataFactory;
});

mstApp.run(function ($rootScope, AUTH_EVENTS, AuthService) {
    $rootScope.$on('$stateChangeStart', function (event, next) {
        var authorizedRoles = next.data.authorizedRoles;
        if (!AuthService.isAuthorized(authorizedRoles)) {
            event.preventDefault();
            if (AuthService.isAuthenticated()) {
                //	 user is not allowed
                $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
            } else {
                // user is not logged in
                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            }
        }
    });
});

//Gestion des routes pour les pages
mstApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/accueil', {
        templateUrl: 'templates/accueil.html',
        controller: 'AccueilController'
    }).
        when('/conceptCloud', {
        templateUrl: 'templates/concept-cloud.html',
        controller: 'ConceptCloudController'
    }).
        when('/TripleStore', {
        templateUrl: 'templates/triple-store.html',
        controller: 'TripleStoreController'
    }).
        when('/tripleStoreQuery', {
        templateUrl: 'templates/triple-store-query.html',
        controller: 'TripleStoreQueryController'
    }).
        when('/ontologyQuery', {
        templateUrl: 'templates/triple-store-query.html',
        controller: 'OntologyController'
    }).
        when('/ontologyTree', {
        templateUrl: 'templates/onto-tree.html',
        controller: 'OntologyTreeController'
    }).
        when('/documentUpload', {
        templateUrl: 'templates/document-upload.html',
        controller: 'DocumentUploadController'
    }).
        when('/documentAnnot', {
        templateUrl: 'templates/document-annot.html',
        controller: 'DocumentAnnotController'
    }).
        when('/documentSearch', {
        templateUrl: 'templates/document-search.html',
        controller: 'DocumentSearchController'
    }).
        when('/qcmCreate', {
        templateUrl: 'templates/qcm-create.html',
        controller: 'QcmCreateController'
    }).
        when('/ocpu', {
        templateUrl: 'templates/ocpu-test.html',
        controller: 'OcpuTestPlotController'
    }).
        when('/qcmTry', {
        templateUrl: 'templates/qcm-try.html',
        controller: 'QcmTryController'
    }).
        when('/404', {
        templateUrl: 'templates/404.html'
    }).
        when('/500', {
        templateUrl: 'templates/500.html'
    }).
        when('/login', {
        templateUrl: 'templates/blank.html',
        controller: 'IdentController'
    }).
        when('/profile', {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileController'
    }).
        when('/admin', {
        templateUrl: 'templates/admin.html',
        controller: 'AdminController'
    }).
        otherwise({
        redirectTo: '/login'
    });
}]);

//Define Routing for app
mstApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

mstApp.controller('AccueilController', function($scope, $window,  ContentHeaderFactory) {
    $scope.headers = ["Choux-Fleur"];$scope.title = {title:"",subtitle:""};$scope.$watch(function(){ return ContentHeaderFactory.getCurrentIndex(); },function(id){ $scope.section = id; }); $scope.$watch(function(){ return $scope.section; },function(id){ ContentHeaderFactory.setCurrentIndex(id); ContentHeaderFactory.setSongs($scope.headers.slice(0,id)); });ContentHeaderFactory.setTitles($scope.title);ContentHeaderFactory.setCurrentIndex(1);
    var CLR = {
        branch:"violet",
        code:"orange",
        blue:"#094AB2",
        red:"#AC193D",
        orange:"#DC572E",
        green:"#008A00",
        violet:"#A700AE"
    }
    $scope.theUI = 
        {
        nodes:{
            "Méthodo-Stats<br>TUTOR":{color:"grey", shape:"dot", alpha:1}, 
            "À Propos":{color:"grey",  alpha:0, link:"/mst/#/profile"}, 

            "Partie<br>Admin":{color:CLR.violet, shape:"dot", alpha:1},
            "Triple Store":{color:CLR.violet,  alpha:0, link:"/mst/#/tripleStoreQuery"}, 

            "Mes Infos":{color:CLR.blue, shape:"dot", alpha:1},
            "Mon Profil":{color:CLR.blue,  alpha:0, link:"/mst/#/profile"}, 
            "Mes Notes":{color:CLR.blue,  alpha:0, link:"/mst/#/profile"}, 

            "Documents":{color:CLR.green, shape:"dot", alpha:1},
            "Charger":{color:CLR.green, alpha:0, link:'/mst/#/documentUpload'},
            "Annoter":{color:CLR.green, alpha:0, link:'/mst/#/documentAnnot'},
            "Parcourir":{color:CLR.green, alpha:0, link:'/mst/#/documentBrowse'},

            "Exercices":{color:CLR.red, shape:"dot", alpha:1}, 
            "Proposer":{color:CLR.red, alpha:0, link:'/mst/#qcmCreate'},
            "S'entrainer":{color:CLR.red, alpha:0, link:'/mst/#qcmTry'},

            "Ontologie":{color:CLR.orange, shape:"dot", alpha:1}, 
            "Parcourir ":{color:CLR.orange, alpha:0, link:'/mst/#ontologyTree'},
            "Éditer":{color:CLR.orange, alpha:0, link:'/mst/#qcmTry'}
        },
        edges:{
            "Méthodo-Stats<br>TUTOR":{
                "Mes Infos":{length:4},
                "Partie<br>Admin":{length:4},
                "À Propos":{length:4},
                "Exercices":{length:4},
                "Ontologie":{length:4},
                "Documents":{length:4}
            },
            "Partie<br>Admin":{
                "Triple Store":{}
            },
            "Mes Infos":{
                "Mon Profil":{},
                "Mes Notes":{}
            },
            "Exercices":{
                "Proposer":{},
                "S'entrainer":{}
            }, 
            "Ontologie":{
                "Parcourir ":{},
                "Éditer":{}
            },
            "Documents":{               
                "Charger":{},
                "Annoter":{},
                "Parcourir":{}
            }, 
            "À propos":{               
            }

        }
    };

    $scope.iframeLoadedCallBack = function(){
        $scope.$apply(function(){
            document.getElementById("arbor").contentWindow.voieLactee( $scope.theUI); 
        });

    };

});


mstApp.controller('ConceptCloudController', function($scope, $window,  ContentHeaderFactory, TupleRestService, Session) {
    $scope.headers = ["Choux-Fleur"];$scope.title = {title:"",subtitle:""};$scope.$watch(function(){ return ContentHeaderFactory.getCurrentIndex(); },function(id){ $scope.section = id; }); $scope.$watch(function(){ return $scope.section; },function(id){ ContentHeaderFactory.setCurrentIndex(id); ContentHeaderFactory.setSongs($scope.headers.slice(0,id)); });ContentHeaderFactory.setTitles($scope.title);ContentHeaderFactory.setCurrentIndex(1);
    $scope.init = function(){
    };
    $scope.init();

    $scope.label ;
    $scope.comment;
    $scope.infoConcept = function(uri){
TupleRestService.getOntoDetails(uri)
        .success( function(data) {
            if(data.results.bindings[0]){
                $scope.label = data.results.bindings[0].NOTIONLAB.value;
                $scope.comment = data.results.bindings[0].NOTIONCOMM.value;
            }
        });
    $scope.$apply();
    };

    $scope.getToto = function(){
        TupleRestService.getOntoCytoGraph(Session.user.uid)
        .success(function(data){
            return(data);
            //document.getElementById("cyto").contentWindow.voieLactee( $scope.theUI); 
            //document.getElementById("cyto").contentWindow.addData( data.elements ); 
        })
    };
    
    $scope.iframeLoadedCallBack = function(){
        $scope.$apply(function(){
        TupleRestService.getOntoCytoGraph(Session.user.uid)
        .success(function(data){
           // document.getElementById("cyto").contentWindow.addData( data.elements ); 
        });
        });

    };
});

mstApp.directive('contentHeader',function(){
    return {
        restrict: 'E',
        templateUrl: 'templates/content-header.html',
        controller: function($scope,ContentHeaderFactory) {
            $scope.$watch( function () { 
                return ContentHeaderFactory.getCurrentSong()
            }, function ( id ) {
                this.subMenus = id;
            }); 
        },
        controllerAs:'ch'
    };
});


mstApp.controller("TripleStoreController", function($scope, TupleRestService, ContentHeaderFactory, Session, AuthService,ContentHeaderFactory) {
    $scope.headers = ["Triple Store"];$scope.title = {title:"Triple Store",subtitle:""};$scope.$watch(function(){ return ContentHeaderFactory.getCurrentIndex(); },function(id){ $scope.section = id; }); $scope.$watch(function(){ return $scope.section; },function(id){ ContentHeaderFactory.setCurrentIndex(id); ContentHeaderFactory.setSongs($scope.headers.slice(0,id)); });ContentHeaderFactory.setTitles($scope.title);


    TupleRestService.get()
    .success( function(data) {
        $scope.result = data;
    });
});

mstApp.controller("TripleStoreQueryController", function($scope, TupleRestService, ContentHeaderFactory, Session, AuthService,ContentHeaderFactory) {
    $scope.headers = ["Triple Store"];$scope.title = {title:"Triple Store",subtitle:""};$scope.$watch(function(){ return ContentHeaderFactory.getCurrentIndex(); },function(id){ $scope.section = id; }); $scope.$watch(function(){ return $scope.section; },function(id){ ContentHeaderFactory.setCurrentIndex(id); ContentHeaderFactory.setSongs($scope.headers.slice(0,id)); });ContentHeaderFactory.setTitles($scope.title);
    $scope.query ="PREFIX mst: <http://methodo-stats-tutor.com#>\nPREFIX text: <http://jena.apache.org/text#>\n PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \nSELECT * \n{?subject ?predicat ?object}"
    $scope.error;
    $scope.getQuery = function(){
        TupleRestService.getQuery($scope.query)
        .success( function(data) {
            $scope.error = null;
            $scope.result = null;
            if(data.results){
                $scope.result = data;
            }else{
                $scope.error = data;
            }
        });
    }
});

mstApp.controller("OntologyController", function($scope, TupleRestService, ContentHeaderFactory, Session, AuthService,ContentHeaderFactory) {
    $scope.headers = ["Triple Store"];$scope.title = {title:"Triple Store",subtitle:""};$scope.$watch(function(){ return ContentHeaderFactory.getCurrentIndex(); },function(id){ $scope.section = id; }); $scope.$watch(function(){ return $scope.section; },function(id){ ContentHeaderFactory.setCurrentIndex(id); ContentHeaderFactory.setSongs($scope.headers.slice(0,id)); });ContentHeaderFactory.setTitles($scope.title);
    $scope.query ="PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \nPREFIX owl: <http://www.w3.org/2002/07/owl#>\nSELECT * \n{?subject ?predicat ?object}"
    $scope.error;
    $scope.getQuery = function(){
        TupleRestService.getQueryOnto($scope.query)
        .success( function(data) {
            $scope.error = null;
            $scope.result = null;
            if(data.results){
                $scope.result = data;
            }else{
                $scope.error = data;
            }
        });
    }
});

mstApp.controller("OntologyTreeController", function($scope, TupleRestService, ContentHeaderFactory, Session, AuthService,ContentHeaderFactory) {
    $scope.headers = ["Triple Store"];$scope.title = {title:"Triple Store",subtitle:""};$scope.$watch(function(){ return ContentHeaderFactory.getCurrentIndex(); },function(id){ $scope.section = id; }); $scope.$watch(function(){ return $scope.section; },function(id){ ContentHeaderFactory.setCurrentIndex(id); ContentHeaderFactory.setSongs($scope.headers.slice(0,id)); });ContentHeaderFactory.setTitles($scope.title);
    $scope.init = function(){
        $scope.treedata=[
            {label: {value:"STATO"}, id:{value:"http://purl.obolibrary.org/obo/BFO_0000001"}, type: "folder", children: [{}]
            },
            {label: {value:"OBI"}, id:{value:"http://www.ifomis.org/bfo/1.1#Entity"}, type: "folder", children: [{}]
            }

        ];
    }
    $scope.init();

    $scope.showToggle = function(node) {
        if(node.children && node.children[0].label === undefined){//si on a pas encore été cherché ce noeud OU si il n'y a pas de children
            TupleRestService.getChildrenOnto(node.id.value)
            .success( function(data) {
                    var count = 0;
                angular.forEach(data.results.bindings,function(k){
                    k.count=count++;
                    k.children = [{}];
                    k.type  = (k.hasChildren.value > 0) ? "folder" : "pic";
                    k.children  = (k.hasChildren.value > 0) ? [{}] : null;
                });
                node.children = data.results.bindings;

            });

        }

    };

    $scope.showSelected = function(node) {
        TupleRestService.getOntoIdInfo(node.id.value)
        .success( function(data) {
            if(data.results.bindings[0]){
                node.descr = data.results.bindings[0].descr;
                node.rcommand = data.results.bindings[0].rcommand;
            }
        });
        $scope.selectedNode = node;
    };
    $scope.lastClicked={};
    $scope.buttonClick = function($event, node) {
        if($scope.lastClicked[node.id.value]){
            delete($scope.lastClicked[node.id.value]);
        }
        else{$scope.lastClicked[node.id.value]=node;};
        $event.stopPropagation();
    }
    $scope.searchPattern ="";
    $scope.treedump=[];
    $scope.errorSearch="";
    $scope.searchOnto = function() {
            $scope.treedump = $scope.treedata;
            TupleRestService.getQueryOntoSearch($scope.searchPattern)
            .success( function(data) {
                $scope.errorSearch="";
                if(!data.results.bindings[0]){
            $scope.treedump = [];
                    $scope.errorSearch = "Aucun résultat trouvé";
                }else{
                    var count = 0;
                angular.forEach(data.results.bindings,function(k){
                    k.count=count++;
                    k.children = [{}];
                    k.type  = (k.hasChildren.value > 0) ? "folder" : "pic";
                    k.children  = (k.hasChildren.value > 0) ? [{}] : null;
                });
                    $scope.treedata = data.results.bindings;
                }
            });
    }

    $scope.treeback = function(){
            $scope.treedata = $scope.treedump;
            $scope.treedump = [];
    }
    $scope.opts = {
        equality: function(node1, node2) {
            return false;
        }
    }
});
mstApp.controller("ContentHeaderController", function($scope, ContentHeaderFactory) {
    $scope.subMenus;
    $scope.titles;
    $scope.setCurrentIndex = function(id){
        ContentHeaderFactory.setCurrentIndex(id)
    }

    $scope.$watch( function () { 
        return ContentHeaderFactory.getTitles()
    }, function ( id ) {
        $scope.titles = id;
    }); 

    $scope.$watch( function () { 
        return ContentHeaderFactory.getCurrentSong()
    }, function ( id ) {
        $scope.subMenus = id;
    }); 
});

mstApp.factory( 'ContentHeaderFactory', function() {
    var subMenus = [];
    var titles= {};
    var index =1;
    return {
        getCurrentSong: function () { return subMenus; },
        setCurrentIndex: function ( id ) { index = id; },
            setTitles: function ( id ) { titles.title =id.title; titles.subtitle = id.subtitle; },
            getTitles: function (  ) { return titles },
        getCurrentIndex: function (  ) { return index; },
        setSongs: function ( id ) { subMenus = id; }
    };
});

//OCPU
mstApp.controller('DocumentUploadController', function($scope, FileUploader,ContentHeaderFactory, ROOTS, Session,translationService) {
    $scope.headers = ["Chargement"];$scope.pagetitle = {title:"Publications",subtitle:"Charger"};$scope.$watch(function(){ return ContentHeaderFactory.getCurrentIndex(); },function(id){ $scope.section = id; }); $scope.$watch(function(){ return $scope.section; },function(id){ ContentHeaderFactory.setCurrentIndex(id); ContentHeaderFactory.setSongs($scope.headers.slice(0,id)); });ContentHeaderFactory.setTitles($scope.pagetitle);ContentHeaderFactory.setCurrentIndex(1);
    translationService.getTranslation($scope, "fr","document-upload");  
    ocpu.seturl(ROOTS.ocpu + "/library/Pubmed4URCPO/R")
    $scope.getFromPmid = function(){
        $scope.console ="ok";
        $scope.result={};
        $scope.req = ocpu.call("getPubMed", {query: $scope.search, retmax:1,httpProxy:ROOTS.httpProxy}, function(session){
            session.getObject(function(data){
                $("#pmid").val(data[0].PMID[0]);
                $scope.pmid = data[0].PMID[0];
                $("#title").val(data[0].ArticleTitle[0]);
                $scope.title = data[0].ArticleTitle[0];
                $("#journal").val(data[0].Journal[0]);
                $scope.journal = data[0].Journal[0];
                $("#author").val(JSON.stringify(data[0].Author,["LastName"]));
                $scope.author = data[0].Author[0].LastName;
                $("#abstract").val(data[0].AbstractText[0]);
                $scope.abstract = data[0].AbstractText[0];
            });
        }).fail(function(){
            alert("Error: " + $scope.req.responseText);
        }).success(function(){ });

    }

    var uploaderPubli = $scope.uploaderPubli = new FileUploader({
        url: ROOTS.webServices + '/rest/files/upload/publi/',
        queueLimit: 1,
        onBeforeUploadItem  : function(item) {
            item.formData = [{ 
                pmid: $scope.pmid?$scope.pmid:"", 
                journal: $scope.journal?$scope.pmid:"", 
                title : $scope.title?$scope.title:"", 
                author : $scope.author?$scope.author:"", 
                abstract : $scope.abstract?$scope.abstract:"",
                userUid : Session.user.uid?Session.user.uid:""
            }];
        },
        onErrorItem : function(item, response, status, headers){
            $scope.error =  response;
        },
        onSuccessItem : function(item, response, status, headers) {
            alert("Fichier chargé avec succès")
        }
    });

    var uploaderPicture = $scope.uploaderPicture = new FileUploader({
        url: ROOTS.webServices + '/rest/files/upload/picture/',
        queueLimit: 1,
        onBeforeUploadItem  : function(item) {
            item.formData = [{ 
                title : $scope.title, 
                description : $scope.description,
                userUid : Session.user.uid
            }];
        },
        onErrorItem : function(item, response, status, headers){
            $scope.error =  response;
        },
        onSuccessItem : function(item, response, status, headers) {
            alert("Fichier chargé avec succès")
        }
    });
});

//calls R function: stats::rnorm(n=100, mean=runif(1)):
mstApp.controller('OcpuTestPlotController', function($scope,ContentHeaderFactory,ROOTS) {

    $scope.headers = ["Choix"];$scope.title = {title:"Exercice",subtitle:"Stats"};$scope.$watch(function(){ return ContentHeaderFactory.getCurrentIndex(); },function(id){ $scope.section = id; }); $scope.$watch(function(){ return $scope.section; },function(id){ ContentHeaderFactory.setCurrentIndex(id); ContentHeaderFactory.setSongs($scope.headers.slice(0,id)); });ContentHeaderFactory.setTitles($scope.title);ContentHeaderFactory.setCurrentIndex(1);

    ocpu.seturl(ROOTS.ocpu + "/library/Pubmed4URCPO/R")

    $scope.testPlot = function(){
        var req = $("#plotdiv").rplot("testPlot", {symetric:$scope.test
        });

        //optional
        req.fail(function(){
            alert("R returned an error: " + req.responseText); 
        });
    };
});

mstApp.filter('nullFilter', function() {
    return function(num) {
        if(num) return num;
    };
});


app.factory('annotsFactory', ['$rootScope', function ($rootScope) {
    return{
        zoneActual:{},
        beginAnnots : function(mode,idIframe){
            document.getElementById(idIframe).contentWindow.beginAnnot({"beginAnnot":mode})
        },
        showZone : function(zoneDemande,idIframe){
            this.zoneActual = zoneDemande;
            document.getElementById(idIframe).contentWindow.showZone({"zoneActual":{"id":zoneDemande,color:"red"}})
        },
        sendMessage : function(obj){
            $rootScope.$emit(
                '$messageOutgoing',
                angular.toJson(obj)
            );
        },
        askSave : function(){
            this.sendMessage({"askSave":1})
        },
        restoreAnnots: function(publiZone, idIframe){
            document.getElementById(idIframe).contentWindow.restoreAnnots({ "restore":1, "annotatorJson":publiZone.AnnotatorJson, "annotoriousJson":publiZone.AnnotoriousJson })
        }
    }
}]);

mstApp.directive('iframeOnload', [function(){
    return {
        scope: {
            callBack: '&iframeOnload'
        },
        link: function(scope, element, attrs){
            element.on('load', function(){
                return scope.callBack({element:element});
            })
        }
    }
}]);

mstApp.controller('IndexHeaderController', function($scope,  AuthService) {
});

mstApp.controller('IndexLeftSideBarController', function($scope,  AuthService) {
});


mstApp.factory('httpErrorResponseInterceptor', ['$q', '$location',
               function($q, $location) {
                   return {
                       response: function(responseData) {
                           return responseData;
                       },
                       responseError: function error(response) {
                           switch (response.status) {
                               case 401:
                                   $location.path('/login');
                               break;
                               case 404:
                                   $location.path('/404');
                               break;
                               case 500:
                                   $location.path('/500');
                               break;
                               default:
                                   $location.path('/error');
                           }

                           return $q.reject(response);
                       }
                   };
               }
]);

//Http Intercpetor to check auth failures for xhr requests
mstApp.config(['$httpProvider',
              function($httpProvider) {
                  $httpProvider.interceptors.push('httpErrorResponseInterceptor');
              }
]);

//PROFILE
mstApp.controller('ProfileController', function($scope,$rootScope,$http,$sce,$window, UserRestService, annotsFactory, ContentHeaderFactory,Session) {
    $scope.headers = ["Édition du profil"];$scope.title = {title:"Mes",subtitle:"informations"};$scope.$watch(function(){ return ContentHeaderFactory.getCurrentIndex(); },function(id){ $scope.section = id; }); $scope.$watch(function(){ return $scope.section; },function(id){ ContentHeaderFactory.setCurrentIndex(id); ContentHeaderFactory.setSongs($scope.headers.slice(0,id)); });ContentHeaderFactory.setTitles($scope.title);ContentHeaderFactory.setCurrentIndex(1);
    $scope.profile = Session.user;

    $scope.updateUser = function(){
        UserRestService.updateUserProfile($scope.profile)
        .success(function(data){
            Session.updateUser($scope.profile);
        })
        .error(function(data){alert(data)})
    }

});
//ADMIN
mstApp.controller('AdminController', function($scope,$rootScope,$http,$sce,$window, AdminRestService, annotsFactory, ContentHeaderFactory,Session) {
    $scope.headers = ["Administration"];$scope.title = {title:"Gestion",subtitle:"du site"};$scope.$watch(function(){ return ContentHeaderFactory.getCurrentIndex(); },function(id){ $scope.section = id; }); $scope.$watch(function(){ return $scope.section; },function(id){ ContentHeaderFactory.setCurrentIndex(id); ContentHeaderFactory.setSongs($scope.headers.slice(0,id)); });ContentHeaderFactory.setTitles($scope.title);ContentHeaderFactory.setCurrentIndex(1);
    $scope.profile = Session.user;

    $scope.refreshOnto = function(){
        AdminRestService.refreshOnto($scope.profile)
        .success(function(data){
            alert("Ontologie chargée");
        })
        .error(function(data){alert("Erreur lors du chargement:"+data)})
    }
});
