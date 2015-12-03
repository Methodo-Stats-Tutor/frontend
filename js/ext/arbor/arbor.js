//
//  arbor.js - version 0.91
//  a graph vizualization toolkit
//
//  Copyright (c) 2015 Samizdat Drafting Co.
//  Physics code derived from springy.js, copyright (c) 2010 Dennis Hotson
// 
//  Permission is hereby granted, free of charge, to any person
//  obtaining a copy of this software and associated documentation
//  files (the "Software"), to deal in the Software without
//  restriction, including without limitation the rights to use,
//  copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the
//  Software is furnished to do so, subject to the following
//  conditions:
// 
//  The above copyright notice and this permission notice shall be
//  included in all copies or substantial portions of the Software.
// 
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
//  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
//  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
//  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
//  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
//  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
//  OTHER DEALINGS IN THE SOFTWARE.
//

(function($){

  /*        etc.js */  var trace=function(msg){if(typeof(window)=="undefined"||!window.console){return}var len=arguments.length;var args=[];for(var i=0;i<len;i++){args.push("arguments["+i+"]")}eval("console.log("+args.join(",")+")")};var dirname=function(a){var b=a.replace(/^\/?(.*?)\/?$/,"$1").split("/");b.pop();return"/"+b.join("/")};var basename=function(b){var c=b.replace(/^\/?(.*?)\/?$/,"$1").split("/");var a=c.pop();if(a==""){return null}else{return a}};var _ordinalize_re=/(\d)(?=(\d\d\d)+(?!\d))/g;var ordinalize=function(a){var b=""+a;if(a<11000){b=(""+a).replace(_ordinalize_re,"$1,")}else{if(a<1000000){b=Math.floor(a/1000)+"k"}else{if(a<1000000000){b=(""+Math.floor(a/1000)).replace(_ordinalize_re,"$1,")+"m"}}}return b};var nano=function(a,b){return a.replace(/\{([\w\-\.]*)}/g,function(f,c){var d=c.split("."),e=b[d.shift()];$.each(d,function(){if(e.hasOwnProperty(this)){e=e[this]}else{e=f}});return e})};var objcopy=function(a){if(a===undefined){return undefined}if(a===null){return null}if(a.parentNode){return a}switch(typeof a){case"string":return a.substring(0);break;case"number":return a+0;break;case"boolean":return a===true;break}var b=($.isArray(a))?[]:{};$.each(a,function(d,c){b[d]=objcopy(c)});return b};var objmerge=function(d,b){d=d||{};b=b||{};var c=objcopy(d);for(var a in b){c[a]=b[a]}return c};var objcmp=function(e,c,d){if(!e||!c){return e===c}if(typeof e!=typeof c){return false}if(typeof e!="object"){return e===c}else{if($.isArray(e)){if(!($.isArray(c))){return false}if(e.length!=c.length){return false}}else{var h=[];for(var f in e){if(e.hasOwnProperty(f)){h.push(f)}}var g=[];for(var f in c){if(c.hasOwnProperty(f)){g.push(f)}}if(!d){h.sort();g.sort()}if(h.join(",")!==g.join(",")){return false}}var i=true;$.each(e,function(a){var b=objcmp(e[a],c[a]);i=i&&b;if(!i){return false}});return i}};var objkeys=function(b){var a=[];$.each(b,function(d,c){if(b.hasOwnProperty(d)){a.push(d)}});return a};var objcontains=function(c){if(!c||typeof c!="object"){return false}for(var b=1,a=arguments.length;b<a;b++){if(c.hasOwnProperty(arguments[b])){return true}}return false};var uniq=function(b){var a=b.length;var d={};for(var c=0;c<a;c++){d[b[c]]=true}return objkeys(d)};var arbor_path=function(){var a=$("script").map(function(b){var c=$(this).attr("src");if(!c){return}if(c.match(/arbor[^\/\.]*.js|dev.js/)){return c.match(/.*\//)||"/"}});if(a.length>0){return a[0]}else{return null}};
  /*     kernel.js */  var Kernel=function(b){var k=window.location.protocol=="file:"&&navigator.userAgent.toLowerCase().indexOf("chrome")>-1;var a=(window.Worker!==undefined&&!k);var i=null;var c=null;var f=[];f.last=new Date();var l=null;var e=null;var d=null;var h=null;var g=false;var j={system:b,tween:null,nodes:{},init:function(){if(typeof(Tween)!="undefined"){c=Tween()}else{if(typeof(arbor.Tween)!="undefined"){c=arbor.Tween()}else{c={busy:function(){return false},tick:function(){return true},to:function(){trace("Please include arbor-tween.js to enable tweens");c.to=function(){};return}}}}j.tween=c;var m=b.parameters();if(a){trace("arbor.js/web-workers",m);l=setInterval(j.screenUpdate,m.timeout);i=(m.workerUrl)?new Worker(m.workerUrl):new Worker(arbor_path()+"arbor.js");i.onmessage=j.workerMsg;i.onerror=function(n){trace("physics:",n)};i.postMessage({type:"physics",physics:objmerge(m,{timeout:Math.ceil(m.timeout)})})}else{trace("arbor.js/single-threaded",m);i=Physics(m.dt,m.stiffness,m.repulsion,m.friction,j.system._updateGeometry,m.integrator);j.start()}return j},graphChanged:function(m){if(a){i.postMessage({type:"changes",changes:m})}else{i._update(m)}j.start()},particleModified:function(n,m){if(a){i.postMessage({type:"modify",id:n,mods:m})}else{i.modifyNode(n,m)}j.start()},physicsModified:function(m){if(!isNaN(m.timeout)){if(a){clearInterval(l);l=setInterval(j.screenUpdate,m.timeout)}else{clearInterval(d);d=null}}if(a){i.postMessage({type:"sys",param:m})}else{i.modifyPhysics(m)}j.start()},workerMsg:function(n){var m=n.data.type;if(m=="geometry"){j.workerUpdate(n.data)}else{trace("physics:",n.data)}},_lastPositions:null,workerUpdate:function(m){j._lastPositions=m;j._lastBounds=m.bounds},_lastFrametime:new Date().valueOf(),_lastBounds:null,_currentRenderer:null,screenUpdate:function(){var n=new Date().valueOf();var m=false;if(j._lastPositions!==null){j.system._updateGeometry(j._lastPositions);j._lastPositions=null;m=true}if(c&&c.busy()){m=true}if(j.system._updateBounds(j._lastBounds)){m=true}if(m){var o=j.system.renderer;if(o!==undefined){if(o!==e){o.init(j.system);e=o}if(c){c.tick()}o.redraw();var p=f.last;f.last=new Date();f.push(f.last-p);if(f.length>50){f.shift()}}}},physicsUpdate:function(){if(c){c.tick()}i.tick();var n=j.system._updateBounds();if(c&&c.busy()){n=true}var o=j.system.renderer;var m=new Date();var o=j.system.renderer;if(o!==undefined){if(o!==e){o.init(j.system);e=o}o.redraw({timestamp:m})}var q=f.last;f.last=m;f.push(f.last-q);if(f.length>50){f.shift()}var p=i.systemEnergy();if((p.mean+p.max)/2<0.05){if(h===null){h=new Date().valueOf()}if(new Date().valueOf()-h>1000){clearInterval(d);d=null}else{}}else{h=null}},fps:function(n){if(n!==undefined){var q=1000/Math.max(1,targetFps);j.physicsModified({timeout:q})}var r=0;for(var p=0,o=f.length;p<o;p++){r+=f[p]}var m=r/Math.max(1,f.length);if(!isNaN(m)){return Math.round(1000/m)}else{return 0}},start:function(m){if(d!==null){return}if(g&&!m){return}g=false;if(a){i.postMessage({type:"start"})}else{h=null;d=setInterval(j.physicsUpdate,j.system.parameters().timeout)}},stop:function(){g=true;if(a){i.postMessage({type:"stop"})}else{if(d!==null){clearInterval(d);d=null}}}};return j.init()};
  /*      atoms.js */  var Node=function(a){this._id=_nextNodeId++;this.data=a||{};this._mass=(a.mass!==undefined)?a.mass:1;this._fixed=(a.fixed===true)?true:false;this._p=new Point((typeof(a.x)=="number")?a.x:null,(typeof(a.y)=="number")?a.y:null);delete this.data.x;delete this.data.y;delete this.data.mass;delete this.data.fixed};var _nextNodeId=1;var Edge=function(b,c,a){this._id=_nextEdgeId--;this.source=b;this.target=c;this.length=(a.length!==undefined)?a.length:1;this.data=(a!==undefined)?a:{};delete this.data.length};var _nextEdgeId=-1;var Particle=function(a,b){this.p=a;this.m=b;this.v=new Point(0,0);this.f=new Point(0,0)};Particle.prototype.applyForce=function(a){this.f=this.f.add(a.divide(this.m))};var Spring=function(c,b,d,a){this.point1=c;this.point2=b;this.length=d;this.k=a};Spring.prototype.distanceToParticle=function(a){var c=that.point2.p.subtract(that.point1.p).normalize().normal();var b=a.p.subtract(that.point1.p);return Math.abs(b.x*c.x+b.y*c.y)};var Point=function(a,b){if(a&&a.hasOwnProperty("y")){b=a.y;a=a.x}this.x=a;this.y=b};Point.random=function(a){a=(a!==undefined)?a:5;return new Point(2*a*(Math.random()-0.5),2*a*(Math.random()-0.5))};Point.prototype={exploded:function(){return(isNaN(this.x)||isNaN(this.y))},add:function(a){return new Point(this.x+a.x,this.y+a.y)},subtract:function(a){return new Point(this.x-a.x,this.y-a.y)},multiply:function(a){return new Point(this.x*a,this.y*a)},divide:function(a){return new Point(this.x/a,this.y/a)},magnitude:function(){return Math.sqrt(this.x*this.x+this.y*this.y)},normal:function(){return new Point(-this.y,this.x)},normalize:function(){return this.divide(this.magnitude())}};
  /*     system.js */  var ParticleSystem=function(e,s,f,g,v,m,t,a,q){var k=[];var i=null;var l=0;var w=null;var n=0.04;var j=[20,20,20,20];var o=null;var p=null;if(typeof e=="object"){var u=e;f=u.friction;e=u.repulsion;v=u.fps;m=u.dt;s=u.stiffness;g=u.gravity;t=u.precision;a=u.integrator;q=u.workerUrl}if(a!="verlet"&&a!="euler"){a="euler"}f=isNaN(f)?0.5:f;e=isNaN(e)?1000:e;v=isNaN(v)?55:v;s=isNaN(s)?600:s;m=isNaN(m)?0.02:m;t=isNaN(t)?0.6:t;g=(g===true);var r=(v!==undefined)?1000/v:1000/50;var c={workerUrl:q,integrator:a,repulsion:e,stiffness:s,friction:f,dt:m,gravity:g,precision:t,timeout:r};var b;var d={renderer:null,tween:null,nodes:{},edges:{},adjacency:{},names:{},kernel:null};var h={parameters:function(x){if(x!==undefined){if(!isNaN(x.precision)){x.precision=Math.max(0,Math.min(1,x.precision))}$.each(c,function(z,y){if(x[z]!==undefined){c[z]=x[z]}});d.kernel.physicsModified(x)}return c},fps:function(x){if(x===undefined){return d.kernel.fps()}else{h.parameters({timeout:1000/(x||50)})}},start:function(){d.kernel.start()},stop:function(){d.kernel.stop()},addNode:function(A,D){D=D||{};var E=d.names[A];if(E){E.data=D;return E}else{if(A!=undefined){var z=(D.x!=undefined)?D.x:null;var F=(D.y!=undefined)?D.y:null;var C=(D.fixed)?1:0;var B=new Node(D);B.name=A;d.names[A]=B;d.nodes[B._id]=B;B.__defineGetter__("p",function(){var y=this;var x={};x.__defineGetter__("x",function(){return y._p.x});x.__defineSetter__("x",function(G){d.kernel.particleModified(y._id,{x:G})});x.__defineGetter__("y",function(){return y._p.y});x.__defineSetter__("y",function(G){d.kernel.particleModified(y._id,{y:G})});x.__proto__=Point.prototype;return x});B.__defineSetter__("p",function(x){this._p.x=x.x;this._p.y=x.y;d.kernel.particleModified(this._id,{x:x.x,y:x.y})});B.__defineGetter__("mass",function(){return this._mass});B.__defineSetter__("mass",function(x){this._mass=x;d.kernel.particleModified(this._id,{m:x})});B.__defineSetter__("tempMass",function(x){d.kernel.particleModified(this._id,{_m:x})});B.__defineGetter__("fixed",function(){return this._fixed});B.__defineSetter__("fixed",function(x){this._fixed=x;d.kernel.particleModified(this._id,{f:x?1:0})});k.push({t:"addNode",id:B._id,m:B.mass,x:z,y:F,f:C});h._notify();return B}}},pruneNode:function(y){var x=h.getNode(y);if(typeof(d.nodes[x._id])!=="undefined"){delete d.nodes[x._id];delete d.names[x.name]}$.each(d.edges,function(A,z){if(z.source._id===x._id||z.target._id===x._id){h.pruneEdge(z)}});k.push({t:"dropNode",id:x._id});h._notify()},getNode:function(x){if(x._id!==undefined){return x}else{if(typeof x=="string"||typeof x=="number"){return d.names[x]}}},eachNode:function(x){$.each(d.nodes,function(A,z){if(z._p.x==null||z._p.y==null){return}var y=(w!==null)?h.toScreen(z._p):z._p;x.call(h,z,y)})},addEdge:function(B,C,A){B=h.getNode(B)||h.addNode(B);C=h.getNode(C)||h.addNode(C);A=A||{};var z=new Edge(B,C,A);var D=B._id;var E=C._id;d.adjacency[D]=d.adjacency[D]||{};d.adjacency[D][E]=d.adjacency[D][E]||[];var y=(d.adjacency[D][E].length>0);if(y){$.extend(d.adjacency[D][E].data,z.data);return}else{d.edges[z._id]=z;d.adjacency[D][E].push(z);var x=(z.length!==undefined)?z.length:1;k.push({t:"addSpring",id:z._id,fm:D,to:E,l:x});h._notify()}return z},pruneEdge:function(C){k.push({t:"dropSpring",id:C._id});delete d.edges[C._id];for(var z in d.adjacency){for(var D in d.adjacency[z]){var A=d.adjacency[z][D];for(var B=A.length-1;B>=0;B--){if(d.adjacency[z][D][B]._id===C._id){d.adjacency[z][D].splice(B,1)}}}}h._notify()},getEdges:function(y,x){y=h.getNode(y);x=h.getNode(x);if(!y||!x){return[]}if(typeof(d.adjacency[y._id])!=="undefined"&&typeof(d.adjacency[y._id][x._id])!=="undefined"){return d.adjacency[y._id][x._id]}return[]},getEdgesFrom:function(x){x=h.getNode(x);if(!x){return[]}if(typeof(d.adjacency[x._id])!=="undefined"){var y=[];$.each(d.adjacency[x._id],function(A,z){y=y.concat(z)});return y}return[]},getEdgesTo:function(x){x=h.getNode(x);if(!x){return[]}var y=[];$.each(d.edges,function(A,z){if(z.target==x){y.push(z)}});return y},eachEdge:function(x){$.each(d.edges,function(B,z){var A=d.nodes[z.source._id]._p;var y=d.nodes[z.target._id]._p;if(A.x==null||y.x==null){return}A=(w!==null)?h.toScreen(A):A;y=(w!==null)?h.toScreen(y):y;if(A&&y){x.call(h,z,A,y)}})},prune:function(y){var x={dropped:{nodes:[],edges:[]}};if(y===undefined){$.each(d.nodes,function(A,z){x.dropped.nodes.push(z);h.pruneNode(z)})}else{h.eachNode(function(A){var z=y.call(h,A,{from:h.getEdgesFrom(A),to:h.getEdgesTo(A)});if(z){x.dropped.nodes.push(A);h.pruneNode(A)}})}return x},graft:function(y){var x={added:{nodes:[],edges:[]}};if(y.nodes){$.each(y.nodes,function(A,z){var B=h.getNode(A);if(B){B.data=z}else{x.added.nodes.push(h.addNode(A,z))}d.kernel.start()})}if(y.edges){$.each(y.edges,function(B,z){var A=h.getNode(B);if(!A){x.added.nodes.push(h.addNode(B,{}))}$.each(z,function(F,C){var E=h.getNode(F);if(!E){x.added.nodes.push(h.addNode(F,{}))}var D=h.getEdges(B,F);if(D.length>0){D[0].data=C}else{x.added.edges.push(h.addEdge(B,F,C))}})})}return x},merge:function(y){var x={added:{nodes:[],edges:[]},dropped:{nodes:[],edges:[]}};$.each(d.edges,function(C,B){if((y.edges[B.source.name]===undefined||y.edges[B.source.name][B.target.name]===undefined)){h.pruneEdge(B);x.dropped.edges.push(B)}});var A=h.prune(function(C,B){if(y.nodes[C.name]===undefined){x.dropped.nodes.push(C);return true}});var z=h.graft(y);x.added.nodes=x.added.nodes.concat(z.added.nodes);x.added.edges=x.added.edges.concat(z.added.edges);x.dropped.nodes=x.dropped.nodes.concat(A.dropped.nodes);x.dropped.edges=x.dropped.edges.concat(A.dropped.edges);return x},tweenNode:function(A,x,z){var y=h.getNode(A);if(y){d.tween.to(y,x,z)}},tweenEdge:function(y,x,B,A){if(A===undefined){h._tweenEdge(y,x,B)}else{var z=h.getEdges(y,x);$.each(z,function(C,D){h._tweenEdge(D,B,A)})}},_tweenEdge:function(y,x,z){if(y&&y._id!==undefined){d.tween.to(y,x,z)}},_updateGeometry:function(A){if(A!=undefined){var x=(A.epoch<l);b=A.energy;var B=A.geometry;if(B!==undefined){for(var z=0,y=B.length/3;z<y;z++){var C=B[3*z];if(x&&d.nodes[C]==undefined){continue}d.nodes[C]._p.x=B[3*z+1];d.nodes[C]._p.y=B[3*z+2]}}}},screen:function(x){if(x==undefined){return{size:(w)?objcopy(w):undefined,padding:j.concat(),step:n}}if(x.size!==undefined){h.screenSize(x.size.width,x.size.height)}if(!isNaN(x.step)){h.screenStep(x.step)}if(x.padding!==undefined){h.screenPadding(x.padding)}},screenSize:function(x,y){w={width:x,height:y};h._updateBounds()},screenPadding:function(A,B,x,y){if($.isArray(A)){trbl=A}else{trbl=[A,B,x,y]}var C=trbl[0];var z=trbl[1];var D=trbl[2];if(z===undefined){trbl=[C,C,C,C]}else{if(D==undefined){trbl=[C,z,C,z]}}j=trbl},screenStep:function(x){n=x},toScreen:function(z){if(!o||!w){return}var y=j||[0,0,0,0];var x=o.bottomright.subtract(o.topleft);var B=y[3]+z.subtract(o.topleft).divide(x.x).x*(w.width-(y[1]+y[3]));var A=y[0]+z.subtract(o.topleft).divide(x.y).y*(w.height-(y[0]+y[2]));return arbor.Point(B,A)},fromScreen:function(B){if(!o||!w){return}var A=j||[0,0,0,0];var z=o.bottomright.subtract(o.topleft);var y=(B.x-A[3])/(w.width-(A[1]+A[3]))*z.x+o.topleft.x;var x=(B.y-A[0])/(w.height-(A[0]+A[2]))*z.y+o.topleft.y;return arbor.Point(y,x)},_updateBounds:function(y){if(w===null){return}if(y){p=y}else{p=h.bounds()}var B=new Point(p.bottomright.x,p.bottomright.y);var A=new Point(p.topleft.x,p.topleft.y);var D=B.subtract(A);var x=A.add(D.divide(2));var z=4;var F=new Point(Math.max(D.x,z),Math.max(D.y,z));p.topleft=x.subtract(F.divide(2));p.bottomright=x.add(F.divide(2));if(!o){if($.isEmptyObject(d.nodes)){return false}o=p;return true}var E=n;_newBounds={bottomright:o.bottomright.add(p.bottomright.subtract(o.bottomright).multiply(E)),topleft:o.topleft.add(p.topleft.subtract(o.topleft).multiply(E))};var C=new Point(o.topleft.subtract(_newBounds.topleft).magnitude(),o.bottomright.subtract(_newBounds.bottomright).magnitude());if(C.x*w.width>1||C.y*w.height>1){o=_newBounds;return true}else{return false}},energy:function(){return b},bounds:function(){var y=null;var x=null;$.each(d.nodes,function(B,A){if(!y){y=new Point(A._p);x=new Point(A._p);return}var z=A._p;if(z.x===null||z.y===null){return}if(z.x>y.x){y.x=z.x}if(z.y>y.y){y.y=z.y}if(z.x<x.x){x.x=z.x}if(z.y<x.y){x.y=z.y}});if(y&&x){return{bottomright:y,topleft:x}}else{return{topleft:new Point(-1,-1),bottomright:new Point(1,1)}}},nearest:function(z){if(w!==null){z=h.fromScreen(z)}var y={node:null,point:null,distance:null};var x=h;$.each(d.nodes,function(D,A){var B=A._p;if(B.x===null||B.y===null){return}var C=B.subtract(z).magnitude();if(y.distance===null||C<y.distance){y={node:A,point:B,distance:C};if(w!==null){y.screenPoint=h.toScreen(B)}}});if(y.node){if(w!==null){y.distance=h.toScreen(y.node.p).subtract(h.toScreen(z)).magnitude()}return y}else{return null}},_notify:function(){if(i===null){l++}else{clearTimeout(i)}i=setTimeout(h._synchronize,20)},_synchronize:function(){if(k.length>0){d.kernel.graphChanged(k);k=[];i=null}}};d.kernel=Kernel(h);d.tween=d.kernel.tween||null;return h};
  /* barnes-hut.js */  var BarnesHutTree=function(){var b=[];var a=0;var e=null;var d=0.5;var c={init:function(g,h,f){d=f;a=0;e=c._newBranch();e.origin=g;e.size=h.subtract(g)},insert:function(j){var f=e;var g=[j];while(g.length){var h=g.shift();var m=h._m||h.m;var p=c._whichQuad(h,f);if(f[p]===undefined){f[p]=h;f.mass+=m;if(f.p){f.p=f.p.add(h.p.multiply(m))}else{f.p=h.p.multiply(m)}}else{if("origin" in f[p]){f.mass+=(m);if(f.p){f.p=f.p.add(h.p.multiply(m))}else{f.p=h.p.multiply(m)}f=f[p];g.unshift(h)}else{if(f.size.x>0||f.size.y>0){var l=f.size.divide(2);var n=new Point(f.origin);if(p[0]=="s"){n.y+=l.y}if(p[1]=="e"){n.x+=l.x}var o=f[p];f[p]=c._newBranch();f[p].origin=n;f[p].size=l;f.mass=m;f.p=h.p.multiply(m);f=f[p];if(o.p.x===h.p.x&&o.p.y===h.p.y){var k=l.x*0.08;var i=l.y*0.08;o.p.x=Math.min(n.x+l.x,Math.max(n.x,o.p.x-k/2+Math.random()*k));o.p.y=Math.min(n.y+l.y,Math.max(n.y,o.p.y-i/2+Math.random()*i))}g.push(o);g.unshift(h)}}}}},applyForces:function(m,g){var f=[e];while(f.length){node=f.shift();if(node===undefined){continue}if(m===node){continue}if("f" in node){var k=m.p.subtract(node.p);var l=Math.max(1,k.magnitude());var i=((k.magnitude()>0)?k:Point.random(1)).normalize();m.applyForce(i.multiply(g*(node._m||node.m)).divide(l*l))}else{var j=m.p.subtract(node.p.divide(node.mass)).magnitude();var h=Math.sqrt(node.size.x*node.size.y);if(h/j>d){f.push(node.ne);f.push(node.nw);f.push(node.se);f.push(node.sw)}else{var k=m.p.subtract(node.p.divide(node.mass));var l=Math.max(1,k.magnitude());var i=((k.magnitude()>0)?k:Point.random(1)).normalize();m.applyForce(i.multiply(g*(node.mass)).divide(l*l))}}}},_whichQuad:function(i,f){if(i.p.exploded()){return null}var h=i.p.subtract(f.origin);var g=f.size.divide(2);if(h.y<g.y){if(h.x<g.x){return"nw"}else{return"ne"}}else{if(h.x<g.x){return"sw"}else{return"se"}}},_newBranch:function(){if(b[a]){var f=b[a];f.ne=f.nw=f.se=f.sw=undefined;f.mass=0;delete f.p}else{f={origin:null,size:null,nw:undefined,ne:undefined,sw:undefined,se:undefined,mass:0};b[a]=f}a++;return f}};return c};
  /*    physics.js */  var Physics=function(a,m,n,e,h,o){var f=BarnesHutTree();var c={particles:{},springs:{}};var l={particles:{}};var p=[];var k=[];var d=0;var b={sum:0,max:0,mean:0};var g={topleft:new Point(-1,-1),bottomright:new Point(1,1)};var j=1000;var i={integrator:["verlet","euler"].indexOf(o)>=0?o:"euler",stiffness:(m!==undefined)?m:1000,repulsion:(n!==undefined)?n:600,friction:(e!==undefined)?e:0.3,gravity:false,dt:(a!==undefined)?a:0.02,theta:0.4,init:function(){return i},modifyPhysics:function(q){$.each(["stiffness","repulsion","friction","gravity","dt","precision","integrator"],function(s,t){if(q[t]!==undefined){if(t=="precision"){i.theta=1-q[t];return}i[t]=q[t];if(t=="stiffness"){var r=q[t];$.each(c.springs,function(v,u){u.k=r})}}})},addNode:function(v){var u=v.id;var r=v.m;var q=g.bottomright.x-g.topleft.x;var t=g.bottomright.y-g.topleft.y;var s=new Point((v.x!=null)?v.x:g.topleft.x+q*Math.random(),(v.y!=null)?v.y:g.topleft.y+t*Math.random());c.particles[u]=new Particle(s,r);c.particles[u].connections=0;c.particles[u].fixed=(v.f===1);l.particles[u]=c.particles[u];p.push(c.particles[u])},dropNode:function(t){var s=t.id;var r=c.particles[s];var q=$.inArray(r,p);if(q>-1){p.splice(q,1)}delete c.particles[s];delete l.particles[s]},modifyNode:function(s,q){if(s in c.particles){var r=c.particles[s];if("x" in q){r.p.x=q.x}if("y" in q){r.p.y=q.y}if("m" in q){r.m=q.m}if("f" in q){r.fixed=(q.f===1)}if("_m" in q){if(r._m===undefined){r._m=r.m}r.m=q._m}}},addSpring:function(u){var t=u.id;var q=u.l;var s=c.particles[u.fm];var r=c.particles[u.to];if(s!==undefined&&r!==undefined){c.springs[t]=new Spring(s,r,q,i.stiffness);k.push(c.springs[t]);s.connections++;r.connections++;delete l.particles[u.fm];delete l.particles[u.to]}},dropSpring:function(t){var s=t.id;var r=c.springs[s];r.point1.connections--;r.point2.connections--;var q=$.inArray(r,k);if(q>-1){k.splice(q,1)}delete c.springs[s]},_update:function(q){d++;$.each(q,function(r,s){if(s.t in i){i[s.t](s)}});return d},tick:function(){i.tendParticles();if(i.integrator=="euler"){i.updateForces();i.updateVelocity(i.dt);i.updatePosition(i.dt)}else{i.updateForces();i.cacheForces();i.updatePosition(i.dt);i.updateForces();i.updateVelocity(i.dt)}i.tock()},tock:function(){var q=[];$.each(c.particles,function(s,r){q.push(s);q.push(r.p.x);q.push(r.p.y)});if(h){h({geometry:q,epoch:d,energy:b,bounds:g})}},tendParticles:function(){$.each(c.particles,function(r,q){if(q._m!==undefined){if(Math.abs(q.m-q._m)<1){q.m=q._m;delete q._m}else{q.m*=0.98}}q.v.x=q.v.y=0})},updateForces:function(){if(i.repulsion>0){if(i.theta>0){i.applyBarnesHutRepulsion()}else{i.applyBruteForceRepulsion()}}if(i.stiffness>0){i.applySprings()}i.applyCenterDrift();if(i.gravity){i.applyCenterGravity()}},cacheForces:function(){$.each(c.particles,function(r,q){q._F=q.f})},applyBruteForceRepulsion:function(){$.each(c.particles,function(r,q){$.each(c.particles,function(t,s){if(q!==s){var v=q.p.subtract(s.p);var w=Math.max(1,v.magnitude());var u=((v.magnitude()>0)?v:Point.random(1)).normalize();q.applyForce(u.multiply(i.repulsion*(s._m||s.m)*0.5).divide(w*w*0.5));s.applyForce(u.multiply(i.repulsion*(q._m||q.m)*0.5).divide(w*w*-0.5))}})})},applyBarnesHutRepulsion:function(){if(!g.topleft||!g.bottomright){return}var r=new Point(g.bottomright);var q=new Point(g.topleft);f.init(q,r,i.theta);$.each(c.particles,function(t,s){f.insert(s)});$.each(c.particles,function(t,s){f.applyForces(s,i.repulsion)})},applySprings:function(){$.each(c.springs,function(u,q){var t=q.point2.p.subtract(q.point1.p);var r=q.length-t.magnitude();var s=((t.magnitude()>0)?t:Point.random(1)).normalize();q.point1.applyForce(s.multiply(q.k*r*-0.5));q.point2.applyForce(s.multiply(q.k*r*0.5))})},applyCenterDrift:function(){var r=0;var s=new Point(0,0);$.each(c.particles,function(u,t){s.add(t.p);r++});if(r==0){return}var q=s.divide(-r);$.each(c.particles,function(u,t){t.applyForce(q)})},applyCenterGravity:function(){$.each(c.particles,function(s,q){var r=q.p.multiply(-1);q.applyForce(r.multiply(i.repulsion/100))})},updateVelocity:function(r){var s=0,q=0,t=0;$.each(c.particles,function(x,u){if(u.fixed){u.v=new Point(0,0);u.f=new Point(0,0);return}if(i.integrator=="euler"){u.v=u.v.add(u.f.multiply(r)).multiply(1-i.friction)}else{u.v=u.v.add(u.f.add(u._F.divide(u._m)).multiply(r*0.5)).multiply(1-i.friction)}u.f.x=u.f.y=0;var v=u.v.magnitude();if(v>j){u.v=u.v.divide(v*v)}var v=u.v.magnitude();var w=v*v;s+=w;q=Math.max(w,q);t++});b={sum:s,max:q,mean:s/t,n:t}},updatePosition:function(q){var s=null;var r=null;$.each(c.particles,function(v,t){if(i.integrator=="euler"){t.p=t.p.add(t.v.multiply(q))}else{var u=t.f.multiply(0.5*q*q).divide(t.m);t.p=t.p.add(t.v.multiply(q)).add(u)}if(!s){s=new Point(t.p.x,t.p.y);r=new Point(t.p.x,t.p.y);return}var w=t.p;if(w.x===null||w.y===null){return}if(w.x>s.x){s.x=w.x}if(w.y>s.y){s.y=w.y}if(w.x<r.x){r.x=w.x}if(w.y<r.y){r.y=w.y}});g={topleft:r||new Point(-1,-1),bottomright:s||new Point(1,1)}},systemEnergy:function(q){return b}};return i.init()};var _nearParticle=function(b,c){var c=c||0;var a=b.x;var f=b.y;var e=c*2;return new Point(a-c+Math.random()*e,f-c+Math.random()*e)};

  // if called as a worker thread, set up a run loop for the Physics object and bail out
  if (typeof(window)=='undefined') return (function(){
  /* hermetic.js */  $={each:function(d,e){if($.isArray(d)){for(var c=0,b=d.length;c<b;c++){e(c,d[c])}}else{for(var a in d){e(a,d[a])}}},map:function(a,c){var b=[];$.each(a,function(f,e){var d=c(e);if(d!==undefined){b.push(d)}});return b},extend:function(c,b){if(typeof b!="object"){return c}for(var a in b){if(b.hasOwnProperty(a)){c[a]=b[a]}}return c},isArray:function(a){if(!a){return false}return(a.constructor.toString().indexOf("Array")!=-1)},inArray:function(c,a){for(var d=0,b=a.length;d<b;d++){if(a[d]===c){return d}}return -1},isEmptyObject:function(a){if(typeof a!=="object"){return false}var b=true;$.each(a,function(c,d){b=false});return b}};
  /*     worker.js */  var PhysicsWorker=function(){var b=20;var a=null;var d=null;var c=null;var g=[];var f=new Date().valueOf();var e={init:function(h){e.timeout(h.timeout);a=Physics(h.dt,h.stiffness,h.repulsion,h.friction,e.tock,h.integrator);return e},timeout:function(h){if(h!=b){b=h;if(d!==null){e.stop();e.go()}}},go:function(){if(d!==null){return}c=null;d=setInterval(e.tick,b)},stop:function(){if(d===null){return}clearInterval(d);d=null},tick:function(){a.tick();var h=a.systemEnergy();if((h.mean+h.max)/2<0.05){if(c===null){c=new Date().valueOf()}if(new Date().valueOf()-c>1000){e.stop()}else{}}else{c=null}},tock:function(h){h.type="geometry";postMessage(h)},modifyNode:function(i,h){a.modifyNode(i,h);e.go()},modifyPhysics:function(h){a.modifyPhysics(h)},update:function(h){var i=a._update(h)}};return e};var physics=PhysicsWorker();onmessage=function(a){if(!a.data.type){postMessage("¿kérnèl?");return}if(a.data.type=="physics"){var b=a.data.physics;physics.init(a.data.physics);return}switch(a.data.type){case"modify":physics.modifyNode(a.data.id,a.data.mods);break;case"changes":physics.update(a.data.changes);physics.go();break;case"start":physics.go();break;case"stop":physics.stop();break;case"sys":var b=a.data.param||{};if(!isNaN(b.timeout)){physics.timeout(b.timeout)}physics.modifyPhysics(b);physics.go();break}};
  })()


  arbor = (typeof(arbor)!=='undefined') ? arbor : {}
  $.extend(arbor, {
    // object constructors (don't use ‘new’, just call them)
    ParticleSystem:ParticleSystem,
    Point:function(x, y){ return new Point(x, y) },

    // immutable object with useful methods
    etc:{      
      trace:trace,              // ƒ(msg) -> safe console logging
      dirname:dirname,          // ƒ(path) -> leading part of path
      basename:basename,        // ƒ(path) -> trailing part of path
      ordinalize:ordinalize,    // ƒ(num) -> abbrev integers (and add commas)
      objcopy:objcopy,          // ƒ(old) -> clone an object
      objcmp:objcmp,            // ƒ(a, b, strict_ordering) -> t/f comparison
      objkeys:objkeys,          // ƒ(obj) -> array of all keys in obj
      objmerge:objmerge,        // ƒ(dst, src) -> like $.extend but non-destructive
      uniq:uniq,                // ƒ(arr) -> array of unique items in arr
      arbor_path:arbor_path,    // ƒ() -> guess the directory of the lib code
    }
  })
  
})(this.jQuery)