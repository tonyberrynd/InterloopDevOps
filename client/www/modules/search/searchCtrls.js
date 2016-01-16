angular.module('interloop.search.controllers', [])


.controller('SearchCtrl', function($scope, $rootScope, $stateParams, $timeout, $http, $q, Opportunity, Company, Contact, Appuser) {


//Initialize
//-------------------

$scope.data = {}
$scope.data.showLoader = false;

$rootScope.isOnSearch = true;

//get search from search bar
$scope.thisSearchQuery = $stateParams.searchQuery;

//execute search on first entry if params providers
if ($stateParams.searchQuery) {
   getResults();
}


//Search
//-------------------

	//new search	
	$scope.newSearch = function() {
		  getResults();
	}

	//apply search
	$scope.applySearch = function(searchTerm) {
	  $scope.thisSearchQuery = searchTerm;

	  getSearchResults();
	}

	//clear recent searches
   	$scope.clearRecentSearches = function() {
		$rootScope.activeUser.recentSearches = [];
		Appuser.prototype$updateAttributes({ id: $rootScope.activeUser.id }, $rootScope.activeUser)
		  .$promise.then(function() {
		    console.log('updated latest searches');
		  })
	}


//Local Functions
//-------------------

// **Get Results

function getResults() {

	$stateParams.searchQueryy = $scope.thisSearchQuery;
	getSearchResults();

	if(!$rootScope.activeUser.recentSearches) {
	  $rootScope.activeUser.recentSearches = [];

	    //if unique - push into newly created array
		  if (_.findWhere($scope.activeUser.recentSearches, $scope.thisSearchQuery) == null) {
		     $rootScope.activeUser.recentSearches.push($scope.thisSearchQuery); 
		  }
	}
	else {

	  //if unqiue push into array
	  if (_.findWhere($scope.activeUser.recentSearches, $scope.thisSearchQuery) == null) {
	     $rootScope.activeUser.recentSearches.push($scope.thisSearchQuery); 
	  }

	  if($rootScope.activeUser.recentSearches.length == 8) {
	    $rootScope.activeUser.recentSearches.splice(0,1);
	  }
	}

	//updated user's recent searches
	Appuser.prototype$updateAttributes({ id: $rootScope.activeUser.id }, $rootScope.activeUser)
	  .$promise.then(function() {
	    // console.log('updated latest searches');
	 })
}


// **Get Search Results

function getSearchResults() {
	//null out everything on new search
	$scope.data.opportunityResults = null;
	$scope.data.companyResults = null;
	$scope.data.contactResults = null;
	$scope.data.showLoader = true;

	var getOpps = $http({method: 'GET', url: '/api/Opportunities/search?txt=' + $scope.thisSearchQuery, cache: 'true'});
	var getCompanies = $http({method: 'GET', url: '/api/Companies/search?txt=' + $scope.thisSearchQuery, cache: 'true'});
	var getContacts = $http({method: 'GET', url: '/api/Contacts/search?txt=' + $scope.thisSearchQuery, cache: 'true'});

	$q.all([getOpps, getCompanies, getContacts]).then(function(results){
	  
	  $scope.resultCount = 
	  results[0].data.response.opportunities.length + 
	  results[1].data.response.companies.length + 
	  results[2].data.response.contacts.length 

	  //make sure loader doesn't flash too much
	  $timeout( function() {

	  //opportunity results
	  $scope.data.opportunityResults = results[0].data.response.opportunities;
	  // console.log(angular.toJson(results[0].data.response.opportunities));

	   //company results
	  $scope.data.companyResults = results[1].data.response.companies;
	  // console.log(angular.toJson(results[1].data.response.companies));


	   //company results
	  $scope.data.contactResults = results[2].data.response.contacts;
	  // console.log(angular.toJson(results[2].data.response.contacts));

	  $scope.data.showLoader = false;

	  }, 250);

  });
}



});


