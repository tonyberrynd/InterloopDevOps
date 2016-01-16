angular.module('interloop.directives', [])

.directive('title', ['$rootScope', '$timeout',
  function($rootScope, $timeout) {
    return {
      link: function() {

        var listener = function(event, toState) {

          $timeout(function() {
            $rootScope.pageTitle = (toState.data && toState.data.pageTitle) 
            ? toState.data.pageTitle 
            : 'Interloop';
          });
        };

        $rootScope.$on('$stateChangeSuccess', listener);
      }
    };
  }
])

//for tasks - detect enter key
.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
 
                event.preventDefault();
            }
        });
    };
})

//autofucos on show
.directive('autofocus', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link : function($scope, $element) {
      $timeout(function() {
        $element[0].focus();
      });
    }
  }
}])

.directive('countTo', ['$timeout', function ($timeout) {
    return {
        replace: false,
        scope: true,
        link: function (scope, element, attrs) {

            var e = element[0];
            var num, refreshInterval, duration, steps, step, countTo, value, increment;

            var calculate = function () {
                refreshInterval = 30;
                step = 0;
                scope.timoutId = null;
                countTo = parseInt(attrs.countTo) || 0;
                scope.value = parseInt(attrs.value, 10) || 0;
                duration = (parseFloat(attrs.duration) * 1000) || 0;

                steps = Math.ceil(duration / refreshInterval);
                increment = ((countTo - scope.value) / steps);
                num = scope.value;
            }

            var tick = function () {

                function numberWithCommas(x) {
                    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
                scope.timoutId = $timeout(function () {
                    num += increment;
                    step++;
                    if (step >= steps) {
                        $timeout.cancel(scope.timoutId);
                        num = countTo;
                        e.textContent = numberWithCommas(countTo);
                    } else {
                        var Content = Math.round(num);
                        tick();
                        e.textContent = numberWithCommas(Content);
                    }
                }, refreshInterval);

            }

            var start = function () {
                if (scope.timoutId) {
                    $timeout.cancel(scope.timoutId);
                }
                calculate();
                tick();
            }

            attrs.$observe('countTo', function (val) {
                if (val) {
                    start();
                }
            });

            attrs.$observe('value', function (val) {
                start();
            });

            return true;
        }
    }

}])


