angular.module('interloop.history', [])

.service("$history", function($state, $rootScope, $window) {

  var history = [];

  angular.extend(this, {
    push: function(state, params) {
      history.push({ state: state, params: params });
    },
    all: function() {
      return history;
    },
    go: function(step) {
      // TODO:
      // (2) Attempt to figure out some algorthim for reversing that,
      //     so you can also go forward
      var prev = this.previous(step || -1);
      return $state.go(prev.state, prev.params);
    },
    previous: function(step) {
      return history[history.length - Math.abs(step || 1)];
    },
    back: function() {
      return this.go(-1);
    }
  });

}).run(function($history, $state, $rootScope) {

  $rootScope.$on("$stateChangeSuccess", function(event, to, toParams, from, fromParams) {
    if (!from.abstract) {

      
      $history.push(from, fromParams);
    }
  });

  $history.push($state.current, $state.params);

});



// [State1, State2, 'State3', state2, state5]

// backView = State2
// ForwardView = null


// views = []
// backView
// CurrentView
// ForwardView




