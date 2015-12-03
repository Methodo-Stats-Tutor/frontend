// pour récupérer les parametres de la frame avec Query_string.foo
var args = function () { var query_string = {}; var query = window.location.search.substring(1); var vars = query.split("&"); for (var i=0;i<vars.length;i++) { var pair = vars[i].split("="); if (typeof query_string[pair[0]] === "undefined") { query_string[pair[0]] = decodeURIComponent(pair[1]); } else if (typeof query_string[pair[0]] === "string") { var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ]; query_string[pair[0]] = arr; } else { query_string[pair[0]].push(decodeURIComponent(pair[1])); } } return query_string; }();
//pour charger css
function loadjscssfile(filename, filetype){ if (filetype=="js"){ var fileref=document.createElement('script'); fileref.setAttribute("type","text/javascript"); fileref.setAttribute("src", filename); } else if (filetype=="css"){ var fileref=document.createElement("link"); fileref.setAttribute("rel", "stylesheet"); fileref.setAttribute("type", "text/css"); fileref.setAttribute("href", filename); } if (typeof fileref!="undefined") document.getElementsByTagName("head")[0].appendChild(fileref); }
//HashTable
function HashTable(obj) { this.length = 0; this.items = {}; for (var p in obj) { if (obj.hasOwnProperty(p)) { this.items[p] = obj[p]; this.length++; } }; this.setItem = function(key, value) { var previous = undefined; if (this.hasItem(key)) { previous = this.items[key]; } else { this.length++; } this.items[key] = value; return previous; }; this.getItem = function(key) { return this.hasItem(key) ? this.items[key] : undefined; }; this.hasItem = function(key) { return this.items.hasOwnProperty(key); }; this.removeItem = function(key) { if (this.hasItem(key)) { previous = this.items[key]; this.length--; delete this.items[key]; return previous; } else { return undefined; } }; this.keys = function() { var keys = []; for (var k in this.items) { if (this.hasItem(k)) { keys.push(k); } } return keys; }; this.values = function() { var values = []; for (var k in this.items) { if (this.hasItem(k)) { values.push(this.items[k]); } } return values; }; this.each = function(fn) { for (var k in this.items) { if (this.hasItem(k)) { fn(k, this.items[k]); } } }; this.clear = function() { this.items = {}; this.length = 0; }; }
//fonctions clone& hash
function clone(obj) { if (null == obj || "object" != typeof obj) return obj; var copy = obj.constructor(); for (var attr in obj) { if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr]; }; return copy; } function hash(obj){ var clown = clone(obj); delete clown.text; return JSON.stringify(clown); };


if(args.qcm){
    console.log("mode qcm")
    loadjscssfile("tools/css/modeQcm/annotorious.css", "css")
    $.getScript('tools/annotator.js', function() {
        $.getScript('tools/annotorious.modified.min.js', function() {
            init();
            //test();
            window.parent.postMessage(//neccessaire, sais pas trop why
                                      JSON.stringify({"greeting": args.random}), 
                                      "*"    );
        });
    });

}
var readonly = false;
var iframeId = "";
function init(readonly,ifId){
    iframeId = ifId;
    console.log("I am ifreame %s",iframeId);
    initImgs(readonly);
    initTexts(readonly);
};
function initImgs(ro){
    readonly = ro;
    if(readonly){
        Array.prototype.slice.call(document.getElementsByTagName("img")).forEach(function(entry) { anno.makeAnnotatable(entry); })
        anno.hideSelectionWidget();
        anno.addHandler('onAnnotationSelected', function(annotation) { 
            console.log("DESELECTED %s",iframeId+annotation.zone);
            parent.angular.element('#'+iframeId+annotation.zone).prop('checked', false).val(false);
        parent.angular.element('#'+iframeId+annotation.zone).scope().stateChanged('#'+iframeId+annotation.zone);
        });
        anno.addHandler('onAnnotationDeselected', function(annotation) { 
            console.log("SELECTED %s",iframeId+annotation.zone);
            parent.angular.element('#'+iframeId+annotation.zone).prop('checked', true).val(true);
        parent.angular.element('#'+iframeId+annotation.zone).scope().stateChanged('#'+iframeId+annotation.zone);
        });
    }else{
        Array.prototype.slice.call(document.getElementsByTagName("img")).forEach(function(entry) { anno.makeAnnotatable(entry); });
        anno.addHandler('onAnnotationCreated', function(annotation) { 
            annotation.zone = zoneActual.id; annotation.shapes[0].style={};
            changeColorImgs(zoneActual.id,zoneActual.color)
        });

    }
};
function initTexts(readonly){
    //hljs.initHighlightingOnLoad();
    Annotator.Plugin.StoreLogger = function (element) {
        return {
            pluginInit: function () {
                this.annotator
                .subscribe("annotationCreated", function (annotation) {
                    annotation.zone = zoneActual.id;
                    texts.setItem(hash(annotation),annotation);
                    changeColorTexts(zoneActual.id,zoneActual.color)
                })
                .subscribe("annotationUpdated", function (annotation) {
                    texts.setItem(hash(annotation),annotation);
                })
                .subscribe("annotationDeleted", function (annotation) {
                    texts.removeItem(hash(annotation));
                });
            }
        }
    };
    if(readonly){
        $('#page-container').annotator({ readOnly: true }).annotator('addPlugin', 'StoreLogger');
    }else{
        $('#page-container').annotator().annotator('addPlugin', 'StoreLogger');
    }

};
//
zoneActual = {
    id:"zone1",color:"yellow"
};
//


function changeColor(zone, color){
    changeColorImgs(zone, color);
    changeColorTexts(zone, color);
}
function changeColorImgs(zone, color){
    getAnnotsImgs().forEach(function(an){
        if(an.zone === zone ){
            var style = '"style":{"fill":"'+color+'", "hi_fill":"", "stroke":"", "hi_stroke":"#ff3300", "outline":"'+color+'", "hi_outline":"'+color+'", "Ce":2}';
            var dmp = JSON.stringify(an);
            dmp = dmp.replace(/"style":{.*?}/g, style);
            anno.removeAnnotation(an);
            anno.addAnnotation(JSON.parse(dmp));
        };
    });
};
function changeColorTexts(zone, color){
    $(".annotator-hl").map(function(){ if($(this).data("annotation").zone === zone){ $(this).addBack().css("background-color",color); } });
};

function getAnnots(){
    return {
        annotator : getAnnotsTexts(),
        annotorious : getAnnotsImgs()
    }
};
texts = new HashTable(); 
function getAnnotsTexts(){
    return texts.values();

};
function getAnnotsImgs(){
    return anno.getAnnotations();
};

function showZones(zoneIds){
    showZonesTexts(zoneIds);
    showZonesImgs(zoneIds);
}
function showZonesTexts(zoneIds){
    getAnnotsTexts().forEach(function(an){
        if(zoneIds.indexOf(an.zone)===-1)//absent dans les zones à montrer
            texts.removeItem(hash(an));
        $('#page-container').data('annotator').deleteAnnotation(an);
    });
}
function showZonesImgs(zoneIds){
    getAnnotsImgs().forEach(function(an){
        if(zoneIds.indexOf(an.zone)===-1)//absent dans les zones à montrer
            anno.removeAnnotation(an);
    });
}

function restoreAnnots(annots){
    restoreTexts(JSON.parse(annots.annotator));
    restoreImgs(JSON.parse(annots.annotorious));
    var zones = JSON.parse(annots.zones).zones;
    for(i in zones){
        changeColorTexts(zones[i].id, zones[i].color);
    }
}
function restoreTexts(an){
    for(ann in an){
        console.log("restore Ann :%s",an[ann]);
        texts.setItem(hash(an[ann]),an[ann]);
    };
    $('#page-container').data('annotator').loadAnnotations(an);
}
function restoreImgs(an){

    if(readonly){ 
        an.forEach(function(ann){
            ann["editable"] =false; 
            anno.addAnnotation(ann);
        });
    }else{

        an.forEach(function(ann){
            anno.addAnnotation(ann);
        });
    }
}


function removeZones(zones){
    console.log("show zone %o",zones);
    removeZonesTexts(zones);
    removeZonesImgs(zones);
};
function removeZonesTexts(zoneIds){
    getAnnotsTexts().forEach(function(an){
        if(zoneIds.indexOf(an.zone)===-1){//absent dans les zones à montrer
    console.log("show zonetext %o", an);
            $('#page-container').data('annotator').deleteAnnotation(an);
            texts.removeItem(hash(an));
        }
    });
};
function removeZonesImgs(zoneIds){
    getAnnotsImgs().forEach(function(an){
        if(zoneIds.indexOf(an.zone)===-1){//absent dans les zones à montrer
    console.log("show zoneImgs %o", an);
            anno.removeAnnotation(an);
        }
    });
};

function setZoneActual(zone){
    zoneActual= zone;
    changeColor(zone.id,zoneActual.color);
    console.log("zoneactual : %o",zoneActual);
}

function removeAllZones(){
    removeZonesAllTexts();
    removeZonesAllImgs();
};
function removeZonesAllTexts(zoneIds){
    getAnnotsTexts().forEach(function(an){
            $('#page-container').data('annotator').deleteAnnotation(an);
            texts.removeItem(hash(an));
    });
};
function removeZonesAllImgs(zoneIds){
    getAnnotsImgs().forEach(function(an){
            anno.removeAnnotation(an);
    });
};
