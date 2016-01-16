angular.module('interloop.config.bootstrap', [])

//Tool tip provider - set defaults
.config(['$uibTooltipProvider', function($uibTooltipProvider){
  $uibTooltipProvider.setTriggers({
    'mouseenter': 'click',
    'mouseenter': 'mouseleave',
    'click': 'click',
    'focus': 'blur',
    'never': 'mouseleave' // <- This ensures the tooltip will go away on mouseleave
  });
  $uibTooltipProvider.options({
	animation: true,
	popupDelay: 100,
	appendToBody: true
  })
}]);