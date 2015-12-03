// pour charger un css
var css = $("<link>", {
  "rel" : "stylesheet",
  "type" :  "text/css",
  "href" : "style.css"
})[0];

css.onload = function(){
  console.log("CSS IN IFRAME LOADED");
};

document
  .getElementsByTagName("head")[0]
  .appendChild(css);

// pour récupérer les parametres de la frame avec Query_string.foo
var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
    return query_string;
}();

// eventuellement scroll :
// http://demos.flesler.com/jquery/scrollTo/
