//set CORS to call "appdemo" package on public server
ocpu.seturl("//localhost:8004/ocpu/library/Pubmed4URCPO/R")

//global var
var mysession;

//calls R function: stats::rnorm(n=100, mean=runif(1)):
$("#postbutton").click(function(){
    var rnd = Math.random();
    var req = ocpu.call("getPubMed", {query: 1000, retmax:1}, function(session){
        //assign to global var
        mysession = session;
        
        //read the session properties (just for fun)
        $("#key").text(mysession.getKey());
        $("#location").text(mysession.getLoc());
        
        //retrieve session console (async)
        mysession.getConsole(function(outtxt){
            $("#output").text(outtxt);
        });
        
        //enable the other button
        $("button").removeAttr("disabled");
    }).fail(function(){
        alert("Error: " + req.responseText);
    });
});
