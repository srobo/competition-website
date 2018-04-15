var configure_interpolation = function() {
    return function(app) {
        app.config(function($interpolateProvider) {
            $interpolateProvider.startSymbol('[[ ');
            $interpolateProvider.endSymbol(' ]]');
        });
    };
}();
