angular.module('tetrisApp', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'partials/game.html',
                controller: 'TetrisController'
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);