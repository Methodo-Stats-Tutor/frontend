app.service('translationService', function($resource) {  
    this.getTranslation = function($scope, language) {
        var languageFilePath = 'templates/translate.json';
        $resource(languageFilePath).get(function (data) {
            $scope.translation = data;
        });
    };
};
