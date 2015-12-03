var app = angular.module('mstUtils', []);

app.factory('MstUtils', function () {
    return {
        getLocalName : function (str) {
            return str.replace(/.*?#(.*)$/g, "$1");
        }
    }
});
