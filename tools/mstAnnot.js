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

}else{
    console.log("mode edit")
    loadjscssfile("tools/css/modeEdit/annotorious.css", "css")
    $.getScript('tools/annotator.min.js', function() {
        $.getScript('tools/annotorious.test.js', function() {
            init();
            //test();
            //
    window.parent.postMessage(//neccessaire, sais pas trop why
      JSON.stringify({"greeting": args.random}), 
      "*"    );
        });
    });
}

function test(){
test = '{"annotator":[{"ranges":[{"start":"/div[1]/div[1]/div[12]","startOffset":0,"end":"/div[1]/div[1]/div[13]","endOffset":6}],"quote":"FragileR. Dal","highlights":[{},{},{},{},{}],"text":"","zone":"zone1"},{"ranges":[{"start":"/div[1]/div[1]/div[3]/span[4]","startOffset":2,"end":"/div[1]/div[1]/div[3]/span[4]","endOffset":8}],"quote":"nograp","highlights":[{}],"text":"","zone":"zone1"}],"annotorious":[{"src":"http://localhost/mst/mst_files/publi/26347918/bg1.png","text":"","shapes":[{"type":"rect","geometry":{"x":0.9886914378029079,"y":0.5342465753424658,"width":0.11147011308562198,"height":0.21095890410958903},"style":{}}],"context":"http://localhost/mst/mst_files/publi/1090901.html","zone":"zone1"},{"src":"http://localhost/mst/mst_files/publi/26347918/bg1.png","text":"","shapes":[{"type":"rect","geometry":{"x":0.46849757673667203,"y":0.663013698630137,"width":0.1567043618739903,"height":0.1780821917808219},"style":{}}],"context":"http://localhost/mst/mst_files/publi/1090901.html","zone":"zone1"},{"src":"http://localhost/mst/mst_files/publi/26347918/bg1.png","text":"","shapes":[{"type":"rect","geometry":{"x":0.7302100161550888,"y":0.34794520547945207,"width":0.12116316639741519,"height":0.18904109589041096},"style":{}}],"context":"http://localhost/mst/mst_files/publi/1090901.html","zone":"zone1"}]}';
restoreAnnots(test);
showZones(["zone1"]);
changeColor("zone1","#ff3300")
}

function previent(){
    window.parent.postMessage(//neccessaire, sais pas trop why
      JSON.stringify({"greeting": "hello world"}), 
      "*"    );
}
function init(){
    initImgs();
    initTexts();
};
function initImgs(){
    Array.prototype.slice.call(document.getElementsByTagName("img")).forEach(function(entry) { anno.makeAnnotatable(entry); });
    anno.addHandler('onAnnotationCreated', function(annotation) { 
        annotation.zone = zoneActual.id; annotation.shapes[0].style={};
        changeColorImgs(zoneActual.id,zoneActual.color)
    });
};
function initTexts(){
    hljs.initHighlightingOnLoad();
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
    $('#page-container').annotator().annotator('addPlugin', 'StoreLogger');

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
}
function restoreTexts(an){
    for(ann in an){
        console.log("restore Ann :%s",an[ann]);
        texts.setItem(hash(an[ann]),an[ann]);
    };
    $('#page-container').data('annotator').loadAnnotations(an);
}
function restoreImgs(an){
    an.forEach(function(ann){
        anno.addAnnotation(ann);
    });
}


function removeZones(zones){
removeZonesTexts(zones);
removeZonesImgs(zones);
};
function removeZonesTexts(zoneIds){
getAnnotsTexts().forEach(function(an){
    if(zoneIds.indexOf(an.zone)!==-1){//présent dans les zones à montrer
        $('#page-container').data('annotator').deleteAnnotation(an);
	    texts.removeItem(hash(an));
    }
});
};
function removeZonesImgs(zoneIds){
    getAnnotsImgs().forEach(function(an){
    if(zoneIds.indexOf(an.zone)!==-1){//présent dans les zones à montrer
        anno.removeAnnotation(an);
    }
    });
};

function setZoneActual(zone){
    zoneActual= zone;
    changeColor(zone.id,zoneActual.color);
    console.log("zoneactual : %o",zoneActual);
}
