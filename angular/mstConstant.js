var app = angular.module('mstConstant', []);
app.constant('ROOTS', {
    webServices: 'http://localhost:8081/mst',
    ocpu: '//localhost:8004/ocpu',
    httpProxy: 'http://10.172.139.21:3128/'
});
