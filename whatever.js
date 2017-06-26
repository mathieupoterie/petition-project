// service are functions that are used multiple times in an app.
// a custum service are singletons. We refer everytime to the kind of
// "prototype" that is the singleton.
// Service is like a constructor
// factory returns an object with the properties inside of the object. The
// properties are functions.
// provider can be possaed into app.config.
// for this project we will use factories.

// app/articles/article.factory.js
// here we have articles from the database, so we create this get articles functions.


angular.module('app.factory.articles', [])

.factory('serviceHttp', ['$http', function($http){
    var factory = {
        getArticles: function(){
            var data = $http.get('http://localhost:8080/articles')
            .then(function(result){ return result; },
                  function(err) { alert("Error: No data returned"); }
            );
            return data;
        };
    };

    return factory;
}]);



// directives

angular.module('app.nav', [])

.directive('spicedNav', function(){
    return {
        templateUrl: 'app/nav/nav.html', // we can also use template : "<p>Coucou</p>"
        restrict: 'E' // this tells angular in what way we are going to write our directive.,
        // we can also use the controler,
        controller : //quote the service.  injcet $scope in the controller.
        // this is a good way to learn about this. https://docs.angularjs.org/guide/directive
    }
});


// put this in your app.js

myapp.module('app.routes', ['ui.router'])

  .config(function($stateProvider){
      $stateProvider
          .state('home',{
              url: '/',
              views: {
                  'main': {
                      templateUrl: 'app/views/main.html'
                  }
              }
          })

          .state('about',{
              url: '/about',
              views: {
                  'main': {
                      templateUrl: 'app/views/about.html'
                  }
              }
          });
  });

  // same for the navigationangular.module('app.nav', [])

myApp.directive('spicedNav', function(){
    return {
        templateUrl: 'app/nav/nav.html',
        restrict: 'E'
    }
});
