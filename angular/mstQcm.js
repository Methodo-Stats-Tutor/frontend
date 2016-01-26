var app = angular.module('mstQcm', []);

app.factory('QcmRestService',  function($http, ROOTS, Session) {

    var dataFactory = {};
    var urlBase = ROOTS.webServices + '/rest/qcm';
    var encodedString = Session.getEncodedStringForBasicAuth();

    dataFactory.insertQcm = function (qcm) {
        return $http.post(urlBase + "/qcm/save/", qcm);
    };

    dataFactory.createQcm = function (qcm) {
        return $http.post(urlBase + "/qcm/", qcm);
    };

    dataFactory.updateQcm = function (qcm) {
        return $http.put(urlBase + '/qcm/' + qcm.uid,  qcm)
    };

    dataFactory.saveQcmNotion = function (notions, qcmuid) {
        return $http.post(urlBase + '/qcm/savenotion/' + qcmuid, notions)
    };

    dataFactory.getQcmNotion = function (qcm) {
        return $http.get(urlBase + '/qcm/getQcmNotion/' + qcm.uid)
    };

    dataFactory.correctQcmTry = function (qcmTry) {
        return $http.post(urlBase + "/correct/"+ qcmTry.uid, qcmTry);
    };

    dataFactory.getQcms = function () {
        return $http.get(urlBase + "/qcms/" + Session.user.uid,{headers: { 'Authorization': 'Basic ' + encodedString }});
    };

    dataFactory.getQcmTrys = function () {
        return $http.get(urlBase + "/qcmtrys/" + Session.user.uid);
    };

    dataFactory.getQcmToDo = function () {
        return $http.get(urlBase + "/qcmtodo/" + Session.user.uid);
    };
    dataFactory.updateQcmTry = function (cust) {
        return $http.put(urlBase + '/qcmtry/' + cust.uid, cust)
    };

    dataFactory.createQcmTry = function (cust) {
        return $http.post(urlBase + '/qcmtry' , {qcmUid:cust.replace(/.*?#(.*)$/g, "$1"), userUid:Session.user.uid})
    };

    dataFactory.getQcm = function (id) {
        return $http.get(urlBase + '/' +  id.replace(/.*?#(.*)$/g, "$1"));
    };

    dataFactory.getPublis = function () {
        return $http.get(urlBase );
    };

    dataFactory.deleteCustomer = function (id) {
        return $http.delete(urlBase + '/' + id);
        var app = angular.module('mstQcm', []);
    };

    return dataFactory;
});

//QCM CREATE
app.controller('QcmCreateController', function($scope, $sce,$timeout, CourseMaterialRestService, annotsFactory, QcmRestService, ContentHeaderFactory, Session, $modal, MstUtils) {
    $scope.headers = ["Page des qcm","Configuration du qcm","Choix des documents","Édition des questions","Édition des notions"];$scope.title = {title:"QCM",subtitle:"Créer"};$scope.$watch(function(){ return ContentHeaderFactory.getCurrentIndex(); },function(id){ $scope.section = id; }); $scope.$watch(function(){ return $scope.section; },function(id){ ContentHeaderFactory.setCurrentIndex(id); ContentHeaderFactory.setSongs($scope.headers.slice(0,id)); });ContentHeaderFactory.setTitles($scope.title);ContentHeaderFactory.setCurrentIndex(1);
    $scope.ifsrc = [];
    $scope.qcm = {
        userUid : Session.user.uid
    };
    $scope.init = function(){
        $scope.qcm.courseMaterialUid = [];
        $scope.publiAnnot = [];
        $scope.qcm.nbText = 0;
        $scope.qcm.nbQ = 0;
        $scope.qcm.questions = {};
        $scope.qcm.uid;
    }
    $scope.init();
    $scope.hideIframe = function(idIframe){
        $('#'+idIframe).hide();//montre uniquement la bonne
    };

    $scope.showIframe = function(idIframe){
        $('#'+idIframe).show();//montre uniquement la bonne
    };

    $scope.removeIframe = function(index){
        $scope.ifsrc.splice(index, 1);
        $scope.publiAnnot.splice(index, 1);
        $scope.qcm.courseMaterialUid.splice(index, 1);
    };

    $scope.removeZone = function(idQ,idT) { 
        delete $scope.qcm.questions[idQ].choicezone[idT];
    }
    $scope.addChoiceText = function(){
        $scope.qcm.nbText++;
        $scope.qcm.questions[$scope.qcm.nbQ].choicetext[$scope.qcm.nbText]={};
    }
    $scope.removeText = function(idQ,idT) { 
        delete $scope.qcm.questions[idQ].choicetext[idT];
    }
    $scope.newQuestion = function(){
        $scope.qcm.nbQ++;
        $scope.qcm.questions[$scope.qcm.nbQ] = {};
        $scope.qcm.questions[$scope.qcm.nbQ].choicetext = {};
        $scope.qcm.questions[$scope.qcm.nbQ].choicezone = {};
    }

    $scope.removeQuestion = function(ind,q){
        angular.forEach($scope.qcm.questions,function(v,k){
            if(v.rank===ind){
                delete $scope.qcm.questions[k];
                $scope.goQuestion(q);
            } 
        })
    };

    $scope.goQuestion = function(ind){
        angular.forEach($scope.qcm.questions,function(v,k){
            if(v.rank===ind){
                $scope.qcm.nbQ = k;
            } 
        })
    };


    $scope.goSection = function(id){
        $scope.section = id;
    }

    $scope.start = function() {
        $scope.inProgress = true;
        $scope.section = 4;
        $scope.newQuestion();
    };

    $scope.notions = {};
    //sauvegarde du QCM (pas de retour arrière)
    $scope.save = function(){
        $scope.qcm.finished = false;
        if(!$scope.qcm.uid){
        QcmRestService.createQcm($scope.qcm)
        .success(function(data){
            $scope.qcm.uid = data.qcmUid;
        $scope.saveQcm();

        })
        .error(function(error){alert("Une erreur est apparue"+error.message)});
        }else{
        $scope.saveQcm();
        }
    };
    //etape de sauvegarde
    $scope.saveQcm = function(){
        QcmRestService.insertQcm($scope.qcm)
        .success(function(data){
            $scope.qcm.uid = data.qcmUid;
            QcmRestService.getQcmNotion($scope.qcm)
            .success(function(data){ //on passe aux notions abordées par cet exercice
                $scope.section = 5;
                $scope.notions.traite=[];
                $scope.notions.give=[];
                $scope.notions.need=[];
                angular.forEach(data.results.bindings,function(v,k){
                    if(v.TYP.value==='traite')
                        $scope.notions.traite.push(v.NOTION.value)
                    if(v.TYP.value==='need')
                        $scope.notions.need.push(v.NOTION.value)
                    if(v.TYP.value==='give')
                        $scope.notions.give.push(v.NOTION.value)
                })
            })
            .error(function(error){alert("Une erreur est apparue"+error.message)});
        })
        .error(function(error){alert("Une erreur est apparue"+error.message)});
    }
    //Sauvegarde de l'avancement
    $scope.saveTemp = function(){
        $scope.qcm.finished = false;
        if(!$scope.qcm.uid){
        QcmRestService.createQcm($scope.qcm)
        .success(function(data){
            $scope.qcm.uid = data.qcmUid;
            QcmRestService.updateQcm($scope.qcm)
            .success(function(){alert("Avancement enregistré")})
            .error(function(error){alert("Une erreur est apparue : "+error.message)})

        })
        .error(function(error){alert("Une erreur est apparue"+error.message)});
        }
                    
    }
    //Finish : ajout des notions aux qcm
    $scope.saveNotion = function(){
        $scope.qcm.finished = false;
        QcmRestService.saveQcmNotion($scope.notions,$scope.qcm.uid)
        .success(function(data){
            alert("Qcm enregistré")
                $scope.section = 1;
        })
        .error(function(error){alert("Une erreur est apparue"+error.message)});
    }

    //récupération des documents annotés
    CourseMaterialRestService.getPublisAnnot()
    .success(function (data) {
        $scope.publiAnnotList = data;
    }).
        error(function(error) {
        alert("Une erreur est apparue :"+ error.message);
    });

    $scope.selectDocument = function(obj){
        $scope.selectedItem = obj;
        console.log("MORTEL %o",obj);
        $scope.qcm.courseMaterialUid.push(MstUtils.getLocalName(obj.cmAnnot.value));
        CourseMaterialRestService.getPubliAnnot(obj.cmAnnot.value)
        .success(function (data) {
            $scope.publiAnnot.push(data);
            $scope.publiAnnot[$scope.publiAnnot.length-1].loaded=false;
        }).
            error(function(error) {
            alert("Une erreur est apparue :"+ error.message);
            $scope.status = 'Unable to insert customer: ' + error.message;
        });
        $scope.setIframe(obj.path.value);
    }

    $scope.setIframe = function ( path) {
        $scope.ifsrc.push($sce.trustAsResourceUrl(path+"?mode=modeEdit&random=" + (new Date()).getTime() + Math.floor(Math.random() * 1000000)));//random astuce pour supprimer le cache

    }

    $scope.iframeLoadedCallBack = function(){
        $timeout(function(){
            $scope.publiAnnot[$scope.publiAnnot.length-1].loaded=true;
            document.getElementById("iframe"+$scope.publiAnnot[$scope.publiAnnot.length-1].uid).contentWindow.init(true,$scope.publiAnnot[$scope.publiAnnot.length-1].uid);
            document.getElementById("iframe"+$scope.publiAnnot[$scope.publiAnnot.length-1].uid)
            .contentWindow
            .restoreAnnots(
                {
                    annotator   : $scope.publiAnnot[$scope.publiAnnot.length-1].annotatorJson,
                    annotorious : $scope.publiAnnot[$scope.publiAnnot.length-1].annotoriousJson,
                    zones       : $scope.publiAnnot[$scope.publiAnnot.length-1].json
                },
                "readonly"
            );
        },1000);
    }

    QcmRestService.getQcms()
    .success(function(data){
        $scope.qcms = data;
    })
    .error(function(error){alert("Une erreur est apparue : "+error.message)})

    $scope.getQcmsContinue = function(ch){
        var tmp = []
        angular.forEach($scope.qcms.results.bindings,function(obj){
            if(obj.finished.value==="false")
                tmp.push(obj);
        })
        return tmp;
    }; 

    $scope.openContinue = function () {
        var modalInstance = $modal.open({
            animation   : $scope.animationsEnabled,
            templateUrl : 'continue.html',
            controller  :  'qcmModalInstanceCtrl',
            size: 'lg',
            resolve: {
                message: function(){return "Qcm en cours";},
                items: function () {
                    return $scope.getQcmsContinue();
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.continue(selectedItem)
        }, function () {
            console.log('Modal dismissed at: %s' , new Date());
        });
    };

    $scope.continue = function(qcmUri){
        $scope.init();
        $scope.goSection(4);
        QcmRestService.getQcm(qcmUri)
        .success(function(data){
            console.log("continue %o", data);
            var pData = angular.fromJson(data);
            $scope.qcm = angular.fromJson(pData.qcmJson);
            $scope.qcm.uid = pData.uid;
            var referstopubliannot = pData.referstopubliannot;
            angular.forEach(referstopubliannot, function(pub){
                $scope.publiAnnot.push(pub);
                $scope.setIframe(pub.path);
            });
        })
        .error(function(){
            alert("Erreur ")
        })
    };

    $scope.getQcmsReprendre = function(ch){
        var tmp = []
        angular.forEach($scope.qcms.results.bindings,function(obj){
            if(obj.finished.value==="true")
                tmp.push(obj);
        })
        return tmp;
    }; 

    $scope.openReprendre = function () {
        var modalInstance = $modal.open({
            animation   : $scope.animationsEnabled,
            templateUrl : 'continue.html',
            controller  :  'qcmModalInstanceCtrl',
            size: 'lg',
            resolve: {
                message: function(){return "QCM déja validés";},
                items: function () {
                    return $scope.getQcmsReprendre();
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.reprendre(selectedItem)
        }, function () {
            console.log('Modal dismissed at: %s' , new Date());
        });
    };
    $scope.reprendre = function(qcmUri){
        $scope.init();
        $scope.goSection(2);
        QcmRestService.getQcm(qcmUri)
        .success(function(data){
            console.log("continue %o", data);
            var pData = angular.fromJson(data);
            $scope.qcm = angular.fromJson(pData.qcmJson);
            delete $scope.qcm.uid ;//assure qu'une nouvelle instance de ce qcm sera crée
            var referstopubliannot = pData.referstopubliannot;
            angular.forEach(referstopubliannot, function(pub){
                $scope.publiAnnot.push(pub);
                $scope.setIframe(pub.path);
            });
        })
        .error(function(){
            alert("Erreur ")
        })
    };
});

app.controller('qcmModalInstanceCtrl', function ($scope, $modalInstance, items, message) {

    $scope.items = items;
    $scope.message = message;
    $scope.selected = {
    };

    $scope.ok = function (id) {
        $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
app.controller('qcmModalInstanceCtrl', function ($scope, $modalInstance, items, message) {

    $scope.items = items;
    $scope.message = message;
    $scope.selected = {
    };

    $scope.ok = function (id) {
        $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

//QUIZ TRY
app.controller('QcmTryController', function($scope, $sce,$timeout, CourseMaterialRestService, annotsFactory, QcmRestService, ContentHeaderFactory) {
    $scope.headers = ["Choix","Qcm","Résultat"];$scope.title = {title:"QCM",subtitle:"S'entrainer"};$scope.$watch(function(){ return ContentHeaderFactory.getCurrentIndex(); },function(id){ $scope.section = id; }); $scope.$watch(function(){ return $scope.section; },function(id){ ContentHeaderFactory.setCurrentIndex(id); ContentHeaderFactory.setSongs($scope.headers.slice(0,id)); });ContentHeaderFactory.setTitles($scope.title);ContentHeaderFactory.setCurrentIndex(1);
    $scope.ifsrc = [];
    $scope.publiAnnot = []
    $scope.qcmList= [];
    $scope.selectedItem = {};
    $scope.qcmData;
    $scope.qcmTryUid;
    $scope.qcmTry ;
    $scope.qcmData = {};
    $scope.qcmData.questions = {};
    $scope.qcmTry = {finished : false,
        note : null,
    result : { }, //{rank:question, map_choix[{id_choice:id, value:bool, helped:bool}], mark:0-1, tryed:0-2, finished:bool} 
    d8add : null,
    d8last : null,
    uid : $scope.qcmTryUid,
    nowRank : 1
    }

    $scope.save = function(){
        QcmRestService.updateQcmTry({uid:$scope.qcmTry.uid,json:angular.toJson($scope.qcmTry)})
    }

    $scope.endQcm = function(){
        $scope.section=3;
        QcmRestService.correctQcmTry($scope.qcmTry)
        .success(function(data){
            $scope.result = data;
        });

    }

    $scope.continue = function(obj){
        if(obj.json){$scope.qcmTry = angular.fromJson(obj.json)}else{$scope.newQcmTry()}
        $scope.qcmTry.uid = obj.uid.replace(/.*?#(.*)$/g, "$1");
        $scope.refreshQuestion();
        $scope.showCourseMaterials();
    }

    $scope.stateChanged = function (qId) {
        var name = $(qId).attr("name");
        $scope.qcmTry.result[$scope.qcmTry.nowRank].answers[name].value = !$scope.qcmTry.result[$scope.qcmTry.nowRank].answers[name].value;
        $scope.$apply();
    }
    $scope.begin = function(){
        QcmRestService.createQcmTry($scope.selectedItem.qcm.value).success(function(data){
            $scope.newQcmTry()
            $scope.qcmTry.uid = data.qcmTryUid;
            $scope.refreshQuestion();
            $scope.showCourseMaterials();
        });
    }

    $scope.newQcmTry = function(){
        $scope.qcmTry = {finished : false,
            note : null,
        result : { }, //{rank:question, map_choix[{id_choice:id, value:bool, helped:bool}], mark:0-1, tryed:0-2, finished:bool} 
        d8add : null,
        d8last : null,
        uid : $scope.qcmTryUid,
        nowRank : 1
        }
    }

    $scope.refreshQuestion = function(){
        $scope.NowQuestion = $scope.getQuestion($scope.qcmTry.nowRank);
        $scope.qcmTry.result[$scope.qcmTry.nowRank] = {};
        $scope.qcmTry.result[$scope.qcmTry.nowRank].finished = false;
        $scope.qcmTry.result[$scope.qcmTry.nowRank].answers = {};
    }

    $scope.validate = function(){//on ajoute
        $scope.qcmTry.result[$scope.qcmTry.nowRank].finished=true;
        $scope.qcmTry.finished = $scope.isFinished();
        $scope.save();
        if(!$scope.qcmTry.finished)
            $scope.goQuestion(1);
        $scope.hideCourseMaterials();
    };

    $scope.isFinished = function(){
        var f = true;
        var count=0;
        angular.forEach($scope.qcmTry.result,function(a){
            count++;
            if(!a.finished)f=false
        })
    if( f === true && count === $scope.qcmData.questions.length ){
        return true;
    } else{
        return false;
    }
    }

    $scope.getQuestion = function(rank){
        var tmp;
        angular.forEach($scope.qcmData.questions,function(q){
            if(q.rank === rank){tmp = q;}
        });
        return tmp;
    }

    $scope.search = function (shop) {
        var found = false;
        angular.forEach($scope.NowQuestion.choicezone, function (choicezone) {          
            if (choicezone.publizone === shop.uid) {
                found = true;
            }
        });
        return found;
    };

    $scope.hideCourseMaterials = function(){
        var pres = [];
        angular.forEach($scope.qcmData.referstopubliannot, function(V){//Pour toutes les zones...
            $("#box"+V.uid).hide();
            console.log("hide iframe %s",V.uid);
            angular.forEach($scope.NowQuestion.choicezone,     function(v){//Pour toutes les zones...
                if(v.refersCourseMaterialUid === V.uid){
                    $("#box"+V.uid).show();
                    console.log("show iframe %s",V.uid);
                    document.getElementById( "iframe" + V.uid ).contentWindow.removeAllZones( );
                    document.getElementById( "iframe" + V.uid ).contentWindow.restoreAnnots( { annotator : V.annotatorJson, annotorious : V.annotoriousJson, zones : V.json }, "readonly" );
                    document.getElementById( "iframe" + V.uid ).contentWindow.removeZones( $scope.zoneForThisQuestionAndCM(V.uid) );
                }
            })
        })
    }

    $scope.hideCourseMaterial = function(uid){//on masque uniquement si il n'est pas utile à cette question
        var pres = [];
        angular.forEach($scope.qcmData.referstopubliannot, function(V){//Pour toutes les zones...
            if(V.uid===uid)
                $("#box"+V.uid).hide();
            console.log("hide iframe %s",V.uid);
            angular.forEach($scope.NowQuestion.choicezone,     function(v){//Pour toutes les zones...
                if(v.refersCourseMaterialUid === V.uid && V.uid === uid){
                    $("#box"+V.uid).show();
                    console.log("show iframe %s",V.uid);
                    document.getElementById( "iframe" + V.uid ).contentWindow.removeAllZones( );
                    document.getElementById( "iframe" + V.uid ).contentWindow.restoreAnnots( { annotator : V.annotatorJson, annotorious : V.annotoriousJson, zones : V.json }, "readonly" );
                    document.getElementById( "iframe" + V.uid ).contentWindow.removeZones( $scope.zoneForThisQuestionAndCM(V.uid) );
                }
            })
        })
    }


    $scope.showCourseMaterials = function(){
        $scope.publiAnnot = $scope.qcmData.referstopubliannot;
        angular.forEach($scope.qcmData.referstopubliannot,function(publiAnnot){
            $scope.ifsrc.push($sce.trustAsResourceUrl(publiAnnot.path+"?mode=modeQcm&random=" + (new Date()).getTime() + Math.floor(Math.random() * 1000000)));
        })
    };

    $scope.goQuestion = function(ind){
        $scope.qcmTry.nowRank += ind;
        $scope.refreshQuestion( $scope.qcmTry.nowRank );
        $scope.hideCourseMaterials( );
    };

    QcmRestService.getQcmToDo()
    .success(function(data){
        $scope.qcmList = data;
    });

    $scope.setQcmInstance = function(obj){
        $scope.inProgress = false;
        $scope.section=2;
        $scope.selectedItem = obj;
        QcmRestService.getQcm($scope.selectedItem.qcm.value)
        .success(function (data) {
            $scope.qcmData = data;
            if(obj.qcmtry){
                $scope.continue({uid:obj.qcmtry.value, json:obj.json.value});
            }else{
                $scope.begin();
            }
        })
        .error(function(error) {
            alert("Une erreur est apparue :"+ error.message);
        });
    }
    $scope.zoneForThisQuestionAndCM = function(uid){//retourne array de id zone : ["1","4"]...
        console.log("publiAnnotUid %o, nowquestion %o", uid, $scope.NowQuestion);

        var pres = [];
        angular.forEach($scope.NowQuestion.choicezone,function(v){//Pour toutes les zones...
            if(v.refersCourseMaterialUid === uid){
                pres.push(v.publizone.id);
            }
        })
        console.log("les zones sont : %o",pres);
        return pres;
    }
    $scope.iframeLoadedCallBack = function(data){
        $timeout(function(data){
            document.getElementById( "iframe" + data.uid ).contentWindow.init( true, data.uid);
            data.loaded = true;
            $scope.hideCourseMaterial( data.uid );
        },0,true,data);
    }

    $scope.resultText = [];
    $scope.zones = [];
    $scope.id ;
    $scope.finalJson ;
    $scope.qcm = {
        teacher:"moi",
        d8add:"20150101",
        difficulty:"1",
        coursematerials:[],
        questions:[]
    };

});

//$Quiz Try
app.filter('orderObjectBy', function() {
    return function(items, field, reverse) {
        var filtered = [];
        angular.forEach(items, function(item) {
            filtered.push(item);
        });
        filtered.sort(function (a, b) {
            return (a[field] > b[field] ? 1 : -1);
        });
        if(reverse) filtered.reverse();
        return filtered;
    };
});


