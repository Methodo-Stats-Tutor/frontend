    hljs.initHighlightingOnLoad();

    window.parent.postMessage(//neccessaire, sais pas trop why
      JSON.stringify({"greeting": "hello world"}), 
      "*"    );

window.addEventListener("message", function(e){
		//if ( e.origin !== "http://localhost" )
		//return;
		var tmp = JSON.parse(e.data);
		if(tmp.zoneActual){//MOVE ON ANNOT
			}else{if(tmp.askSave){//SAVE ANNOT
		dumpImg();dumpText();
		var dump ={
		"annotoriousJson":JSON.stringify(imgs),
		"annotatorJson":JSON.stringify(texts)
		};
		window.parent.postMessage(
			JSON.stringify({"dump": dump}), 
			"*"    );
		}else{if(tmp.beginAnnot){//BEGIN ANNOT
		}else{if(tmp.restore){//on restore en passant 2 jsons
		}else{}}}}}, false);

function restoreAnnots(tmp){
			restoreTextFromJson(tmp.annotatorJson); restoreImgFromJson(tmp.annotoriousJson);
}

function showZone(tmp){
	dumpImg();dumpText();
		deleteImg();deleteText()
		setZoneActual(tmp.zoneActual);
		//colorAnnots(tmp.zoneActual.id,tmp.zoneActual.color);
		colorAnnots(tmp.zoneActual.id,"rgba(255, 255, 0, 0.8)");
		restoreImg(tmp.zoneActual.id);restoreText(tmp.zoneActual.id);

}

function beginAnnot(tmp){
if(!isBegin){
			if(tmp.beginAnnot=="readonly"){
				readonly=true;
				$('#page-container').annotator({ readOnly: true }).annotator('addPlugin', 'StoreLogger');
	Array.prototype.slice.call(document.getElementsByTagName("img")).forEach(function(entry) { anno.makeAnnotatable(entry); })
				anno.hideSelectionWidget();
			}else{
	Array.prototype.slice.call(document.getElementsByTagName("img")).forEach(function(entry) { anno.makeAnnotatable(entry); })
			$('#page-container').annotator().annotator('addPlugin', 'StoreLogger');
			}
			idPubli=tmp.idPubli;
			isBegin = true;
}
}

function HashTable(obj)
{
    this.length = 0;
    this.items = {};
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            this.items[p] = obj[p];
            this.length++;
        }
    }

    this.setItem = function(key, value)
    {
        var previous = undefined;
        if (this.hasItem(key)) {
            previous = this.items[key];
        }
        else {
            this.length++;
        }
        this.items[key] = value;
        return previous;
    }

    this.getItem = function(key) {
        return this.hasItem(key) ? this.items[key] : undefined;
    }

    this.hasItem = function(key)
    {
        return this.items.hasOwnProperty(key);
    }
   
    this.removeItem = function(key)
    {
        if (this.hasItem(key)) {
            previous = this.items[key];
            this.length--;
            delete this.items[key];
            return previous;
        }
        else {
            return undefined;
        }
    }

    this.keys = function()
    {
        var keys = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                keys.push(k);
            }
        }
        return keys;
    }

    this.values = function()
    {
        var values = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                values.push(this.items[k]);
            }
        }
        return values;
    }

    this.each = function(fn) {
        for (var k in this.items) {
            if (this.hasItem(k)) {
                fn(k, this.items[k]);
            }
        }
    }

    this.clear = function()
    {
        this.items = {}
        this.length = 0;
    }
}
      
//le style de la page

function createSheet(){
sheet=document.createElement('style');
sheet.setAttribute("id", "styleSheetId");
document.body.appendChild(sheet);
console.log("createSheet %s",sheet)
}

function deleteSheet(){
var sheetToBeRemoved = document.getElementById('styleSheetId');
var sheetParent = sheetToBeRemoved.parentNode;
sheetParent.removeChild(sheetToBeRemoved);
console.log("deletesheet %s",sheet)
}

function dumpImg(){
if(zoneActual.id!="vide")
imgs.setItem(zoneActual.id, anno.getAnnotations());
}

function dumpText(){
if(zoneActual.id!="vide")
texts.setItem(zoneActual.id, textsTmp.values());
}

function restoreImg(idr){
if(!readonly){
imgs.each(function(k, v) {
if(k==idr){
v.forEach(function(ann){
anno.addAnnotation(ann);
});
}
})
}else{
imgs.each(function(k, v) {
if(k==idr){
v.forEach(function(ann){
ann["editable"] =false;
anno.addAnnotation(ann);
});
}
});
}
}

function restoreText(idr){
texts.each(function(k, v) {
if(k==idr){
v.forEach(function(ann){
$('#page-container').data('annotator').loadAnnotations([ann]);
textsTmp.setItem(hash(ann),ann);
})
}
})
}

function restoreImgFromJson(json){
var tmp = JSON.parse(json);
imgs.items = tmp.items;
imgs.length = tmp.length;
}

function restoreTextFromJson(json){
var tmp = JSON.parse(json)
texts.items = tmp.items;
texts.length = tmp.length;
}

function deleteImg(){
anno.removeAll();
}

function deleteText(){
textsTmp.each(function(k,v){$('#page-container').data('annotator').deleteAnnotation(v);});
textsTmp = new HashTable();
}

function colorImg(id,color){
anno.setProperties({"fill":color});
}

function colorElement(id, color) {
sheet.innerHTML = ".annotator-hl{background:"+color+"}";
//sheet.innerHTML = "."+id+" { background-color: "+color+";} ";
//console.log("id %s ; color %s, sheet %s",id,color,sheet.innerHTML)
}

function setZoneActual(obj){
zoneActual=obj;
}

function colorAnnots(id,color){
colorElement(id,color);
colorImg(id,color);
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function hash(obj){//remove de text = seule diff quand update permet l'unicité des objets
var clown = clone(obj)
delete clown.text
return JSON.stringify(clown)
}

Annotator.Plugin.StoreLogger = function (element) {
  return {
    pluginInit: function () {
      this.annotator
          .subscribe("annotationCreated", function (annotation) {
	    textsTmp.setItem(hash(annotation),annotation);
          })
          .subscribe("annotationUpdated", function (annotation) {
	    textsTmp.setItem(hash(annotation),annotation);
          })
          .subscribe("annotationDeleted", function (annotation) {
	    textsTmp.removeItem(hash(annotation));
          });
    }
  }
};

createSheet();

var zoneActual = {id:"vide",color:"blue"};
var imgs = new HashTable();
var textsTmp = new HashTable();
var texts = new HashTable();
var readonly;
var idPubli;
var isBegin = false
