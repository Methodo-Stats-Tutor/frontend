var app = angular.module('mstrUtils', []);

app.factory('MstUtils', function () {
    return {
        getLocalName : function (str) {
            return str.replace(/.*?#(.*)$/g, "$1");
        }
    }
});
