var app = angular.module('mstCourseMaterial', []);
//rest API
app.factory('CourseMaterialRestService', function($http, ROOTS, Session) {

    var urlBase = ROOTS.webServices + '/rest/courseMaterials';
    var dataFactory = {};

    dataFactory.getPublisAnnot = function () {
        return $http.get(urlBase + "/publis/annot");
    };

    dataFactory.getPublis = function () {
        return $http.get(urlBase+"/publis" );
    };

    dataFactory.getCourseMaterials = function () {
        return $http.get(urlBase+"/"+Session.user.uid );
    };
    dataFactory.getPubliAnnot = function (id) {
        return $http.get(urlBase + '/publis/annot/' +  id.replace(/.*?#(.*)$/g, "$1"));
    };

    dataFactory.createCourseMaterialAnnot = function (cust, courseMaterialUid) {
        return $http.post(urlBase + "/annot", {courseMaterialAnnot : cust, userUid : Session.user.uid, courseMaterialUid : courseMaterialUid.replace(/.*?#(.*)$/g, "$1")});
    };

    dataFactory.updateCourseMaterialAnnot = function (cust, courseMaterialAnnotUid) {
        return $http.put(urlBase + "/annot/"+courseMaterialAnnotUid, {courseMaterialAnnot : cust, userUid : Session.user.uid});
    };

    dataFactory.deleteCustomer = function (id) {
        return $http.delete(urlBase + '/' + id);
    };

    return dataFactory;
});


//CREATION D'ANNOTATION PUBLI
app.controller('DocumentAnnotController', function($scope,$rootScope,$http,$sce,$window,$timeout, CourseMaterialRestService, annotsFactory, ContentHeaderFactory, MstUtils, $modal, $log) {

    $scope.headers = ["Choix de la publication","Annotation"];$scope.title = {title:"Publications",subtitle:"Annoter"};$scope.$watch(function(){ return ContentHeaderFactory.getCurrentIndex(); },function(id){ $scope.section = id; }); $scope.$watch(function(){ return $scope.section; },function(id){ ContentHeaderFactory.setCurrentIndex(id); ContentHeaderFactory.setSongs($scope.headers.slice(0,id)); });ContentHeaderFactory.setTitles($scope.title);ContentHeaderFactory.setCurrentIndex(1);
    $scope.$watch(function(){ return $scope.section; },function(id){ if(id===1){$scope.init()} });
    $scope.init = function(){
        console.log("init");
        $scope.nom;
        $scope.ifsrc = [];
        $scope.selectedItem ={};
        $scope.iframe = {};
        $scope.iframe.loaded = false;
        $scope.colorpicker;
        $scope.courseMaterialUid;
        $scope.cmActualUid;
        $scope.dataToRestore={};
        $scope.zones= {} ;
        $scope.zones.zones = {} ;
        $scope.zones.zoneActual = null ;
        $scope.zones.nbZone = 0;
        $scope.zones.idZone = 0;
        $scope.zones.finished = false;
        $scope.annotBegin = false;
        CourseMaterialRestService.getCourseMaterials()
        .success(function (data) {
            $scope.publiList = data;
        }).
            error(function(error) {
            alert("Une erreur est apparue :"+ error.message);
            $scope.status = 'Unable to insert customer: ' + error.message;
        });
    }

    $scope.showZone = function(zone, idIframe){
        annotsFactory.showZone(zone, idIframe)
    }
    $scope.newZone = function(){
        $scope.zones.nbZone++;
        $scope.zones.idZone++;
        var tmp = {
            "id":""+$scope.zones.idZone+"", 
            "label" : "", 
            "color":(function(m,s,c){return (c ? arguments.callee(m,s,c-1) : '#') + s[m.floor(m.random() * s.length)]})(Math,'0123456789ABCDEF',5)
        }
        $scope.zones.zones[tmp.id] = tmp;
        $scope.zones.zoneActual = tmp.id;
        if($scope.iframe.loaded){
            document.getElementById("iframe").contentWindow.setZoneActual($scope.zones.zones[$scope.zones.zoneActual]);
        };
    };

    $scope.setColorPicker = function(id){
        $scope.colorpicker = id;
    }

    $scope.$on("colorpicker-closed",function(event){
        document.getElementById('iframe').contentWindow.changeColor($scope.colorpicker,$scope.zones.zones[$scope.colorpicker].color);
    });
    $scope.modifZone = function(id,idIframe){
        $scope.zones.zoneActual=""+id+"";
        document.getElementById(idIframe).contentWindow.setZoneActual( $scope.zones.zones[$scope.zones.zoneActual] ); 
    }
    $scope.removeZone = function(id,idIframe){
        delete $scope.zones.zones[id];
        $scope.zones.nbZone--;
        if(id===$scope.zones.zoneActual){
            var found = false;
            var dep = $scope.zones.idZone;
            while(dep--){
                if(""+dep+"" in $scope.zones.zones){
                    found =true;
                    $scope.modifZone(dep,'iframe');
                    break;
                }
            }
        }
        console.log("remove : %o",id);
        document.getElementById(idIframe).contentWindow.removeZones([id]);
    }

    $scope.iframeLoadedCallBack = function(){
        $timeout(function(){
            $scope.iframe.loaded =true;
            document.getElementById("iframe").contentWindow.init(false,"iframe");
            if($scope.zones.zoneActual)
                document.getElementById("iframe").contentWindow.setZoneActual($scope.zones.zones[$scope.zones.zoneActual]);
            if($scope.dataToRestore.annotatorJson || $scope.dataToRestore.annotatorJson){
                document.getElementById("iframe").contentWindow.restoreAnnots({annotator:$scope.dataToRestore.annotatorJson,annotorious:$scope.dataToRestore.annotoriousJson,zones:$scope.dataToRestore.json});
            }
        },0);

    };

    $scope.annotate = function(obj){
        $scope.iframe.loaded = false;
        $scope.section = 2;
        $scope.selectedItem = obj;
        $scope.courseMaterialUid = obj.cm.value
        $scope.newZone();
        $scope.loadIframe();
    };

    $scope.continue = function(cmAnnotUri){
        CourseMaterialRestService.getPubliAnnot(cmAnnotUri)
        .success(function(data){
            console.log("continue %o", data);
            $scope.zones = angular.fromJson(data.json);
            $scope.dataToRestore = data;
            $scope.selectedItem.path ={} ;
            $scope.selectedItem.path.value = data.path ;
            $scope.iframe.loaded = false;
            $scope.section = 2;
            $scope.courseMaterialAnnotUid = MstUtils.getLocalName(cmAnnotUri);
            //$scope.courseMaterialUid = data.;
            $scope.loadIframe();
        })
        .error(function(){
            alert("Erreur ")
        })
    };

    $scope.reUse = function(cmAnnotUri){
        CourseMaterialRestService.getPubliAnnot(cmAnnotUri)
        .success(function(data){
            console.log("reUse %o", data);
            $scope.zones = angular.fromJson(data.json);
            $scope.dataToRestore = data;
            $scope.selectedItem.path ={} ;
            $scope.selectedItem.path.value = data.path ;
            $scope.iframe.loaded = false;
            $scope.section = 2;
            $scope.courseMaterialAnnotUid = null;
            $scope.courseMaterialUid = data.courseMaterialUid;
            $scope.loadIframe();
        })
        .error(function(){
            alert("Erreur ")
        })
    };
    $scope.loadIframe =function(){
        $scope.annotBegin=true;
        $scope.ifsrc[0] =$sce.trustAsResourceUrl($scope.selectedItem.path.value+"?mode=modeEdit&random=" + (new Date()).getTime() + Math.floor(Math.random() * 1000000));//random astuce pour supprimer le cache
    }

    $scope.save = function (finished) {
        var cust = {
            nom: $scope.zones.nom,
            publiZone : $scope.zones.zones,
            finished : finished,
            courseMaterialAnnotJson:$scope.zones,
            annotoriousJson : document.getElementById('iframe').contentWindow.getAnnotsImgs(),
            annotatorJson : document.getElementById('iframe').contentWindow.getAnnotsTexts()
        };
        if(!$scope.courseMaterialAnnotUid){//Création
            console.log("create %o", cust);
            CourseMaterialRestService.createCourseMaterialAnnot(cust,$scope.courseMaterialUid)
            .success(function (data) {
                alert("Annotation sauvegardée");
                $scope.courseMaterialAnnotUid = data.cmActualUid;
            }).
                error(function(error) {
                alert("Une erreur est apparue :");
            });
        }else{//mise à jour
            console.log("update %o", cust);
            CourseMaterialRestService.updateCourseMaterialAnnot(cust,$scope.courseMaterialAnnotUid)
            .success(function (data) {
                alert("Annotation sauvegardée");
            }).
                error(function(error) {
                alert("Une erreur est apparue :");
            });
        }
    };

    $scope.getLocalName = function(str){
        return MstUtils.getLocalName(str);
    }

    $scope.getItemsEnCours = function(ch){
        var tmp = []
        angular.forEach($scope.publiList.results.bindings,function(obj){
            if(obj.cm.value===ch.cm.value&&obj.cmAnnotEnCours)
                tmp.push(obj);
        });
        return tmp;
    }; 

    $scope.getItemsFini = function(ch){
        var tmp = []
        angular.forEach($scope.publiList.results.bindings,function(obj){
            if(obj.cm.value===ch.cm.value&&obj.cmAnnotFini)
                tmp.push(obj);
        });
        return tmp;
    };


    $scope.animationsEnabled = true;

    $scope.openContinue = function (id) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'continue.html',
            controller: 'ModalInstanceCtrl',
            size: 'lg',
            resolve: {
                items: function () {
                    return $scope.getItemsEnCours(id);
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.continue(selectedItem)
        }, function () {
            console.log('Modal dismissed at: %s' , new Date());
        });
    };

    $scope.openReUse = function (id) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'reUse.html',
            controller: 'ModalInstanceCtrl',
            size: 'lg',
            resolve: {
                items: function () {
                    return $scope.getItemsFini(id);
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.reUse(selectedItem);
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.openTags = function (zone) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'templates/tags.html',
            controller: 'ModalInstanceTagsCtrl',
            size: 'lg',
            resolve: {
                lastClicked: function () {
                    return zone.tags?zone.tags:{};
                }
            }
        });


        modalInstance.result.then(function (selectedItems) {
            zone.tags = selectedItems;
        }, function () {
            console.log('Modal dismissed at: %s' , new Date());
        });
    };
});



// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

    $scope.items = items;
    $scope.selected = {
    };

    $scope.ok = function (id) {
        $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});


app.controller('ModalInstanceTagsCtrl', function ($scope, $modalInstance, TupleRestService,lastClicked) {
    $scope.selected = {};
    $scope.lastClicked = lastClicked;
    $scope.init = function(){
        $scope.treedata=[
            {
                label: {value:"MST"}, id:{value:"http://methodo-stats-tutor.com#ExternalConcept"}, type: "folder", children: [{}]
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
    $scope.ok = function () {
        $modalInstance.close($scope.lastClicked);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    $scope.deleteTag = function(key){
        delete($scope.lastClicked[key]);
    }
});
