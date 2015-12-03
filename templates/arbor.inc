<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"> 
<head>
<meta charset="utf-8"/> 
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/> 
<title></title>
</head> 
<body onload="setSize();"> 

<canvas id="sitemap" name="sitemap"  style="background-color:#FFFFFF;"></canvas>
<script src="/mst/plugins/jQuery/jQuery-2.1.4.min.js"></script>

<script src="/mst/js/ext/arbor/arbor.js" type="text/javascript"></script>
<script src="/mst/js/ext/arbor/arbor-tween.js" type="text/javascript"></script>
<script src="/mst/js/ext/arbor/arbor-graphics.js" type="text/javascript"></script>
<script src="/mst/js/ext/arbor/site.js" type="text/javascript"></script>
<script>

setSize = function(){
    var h = parent.document.getElementById('arbor');
    var w = parent.document.getElementById('md');
    var canvas = document.getElementById("sitemap");  
      canvas.width = w.offsetWidth-45;
      canvas.height= h.height-45;
}

     
function voieLactee(ui){
        var sys = arbor.ParticleSystem()
        sys.parameters({stiffness:900, repulsion:2000, gravity:true, dt:0.015})
        sys.renderer = Renderer("#sitemap")
        sys.graft(ui)
    }
</script>
</body> 
</html>
