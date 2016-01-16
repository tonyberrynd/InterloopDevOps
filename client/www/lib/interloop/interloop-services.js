angular.module('interloop.services', [])

//Helper Functions for Interloop 

.constant("interloopConfig", {
  "pageSize": 250, 
  "viewLength": 30
})

.factory('interloop', function($rootScope, $uibModal, $q, $injector, $state, $document, md5, interloopConfig, Picklist, Qualifier, CustomField, Rule, View, Appuser){
  
  $rootScope.interloopSpinner = false;
  //TODO - Make User specific
  //Config for all entities and views 
  var config = function(org){
    //build Entity Models 
    var deferred = $q.defer(); 

    angular.forEach(org.entityConfig, function(entityValues, entityName){
      var newEntity = new entity(); 
      newEntity.name = entityName; 
      newEntity.entityModel = $injector.get(entityValues.type); //Points to strongloop model
      newEntity.entityType = entityValues.type; 
      newEntity.gridOptions = new gridOptions(); 
      newEntity.datasource = new datasource(); 
      newEntity.baseState = entityValues.baseState; 
      newEntity.refreshBroadcast = entityValues.refreshBroadcast; 

      //Parse Entity queries 
      newEntity.queries = {}; 
      angular.forEach(entityValues.queries, function(query, queryName){
        newEntity.queries[queryName] = JSON.parse(query); 
      }); 

      //add to entities hash 
      entities[entityName] = newEntity;  //create new entry 
    }); 

     //get items for all entities 
     /* 
    angular.forEach(entities, function(entity){
      getEntityItems(entity);    
    }); 
*/ 

    currentState.entity = entities['Opportunity']; 
    currentState.view =  defaultView('Opportunity'); 

    var promises = []; 
    angular.forEach( entities, function(entity){
        promises.push(function() { return getEntityItems(entity)});
    });

    $q.all([
      getEntityItems(entities.Opportunity), 
      getEntityItems(entities.Company)
    ])
    .then(function(){
      deferred.resolve(); 
    })
    
    return deferred.promise; 

    //return defer;

    /* 
    //get items for all entities 
    var sequence = $q.defer(); 
    sequence.resolve(); 
    sequence = sequence.promise; 

    angular.forEach(entities, function(entity){
      sequence = sequence.then(function(){
        return getEntityItems(entity);  
      });
    */ 
    //setup initial currentState 
    
  }; 

  var unPackView = function(view) {
    var newView = angular.copy(view); 
    newView.columnDefs = unPackColumnDefs(view.columnDefs); 
    newView.query = JSON.parse(view.query); 
    return newView; 
  }; 

  //return an instance of data source 
  var datasource = function() {
    return {
      rowCount: null, // behave as infinite scroll
      pageSize: interloopConfig.pageSize,
      overflowSize: interloopConfig.pageSize,
      totalCount: 0, //count updated from controller   
      getRows: gridGetRows  //function called by grid for new row
    }
  };
  
  //return an instance of a gridOption 
  var gridOptions = function() {
    return {
      columnDefs: {}, 
     //set to internal var above
      headerHeight: 36,
      rowHeight: 40,
      rowSelection: 'single',
      rowDeselection: true,
      enableColResize: true,
      datasource: null, //Attach a new data source instance for this grid
      onRowSelected: null,
      suppressRowClickSelection: true,
      onRowClicked: gridRowClicked,
      rowSelection: 'multiple',
      onSelectionChanged: selectionChanged,
      onColumnResized: function(params){
        if(params.finished == true) {
          params.column.colDef.width = params.column.actualWidth; //update ColumnDefs with new width
        };
      }, 
      onReady: null, //will be wired up in controller 
      enableServerSideSorting: true,
      enableServerSideFilter: true,

      virtualPaging: true, // this is important, if not set, normal paging will be done
      enableSorting: true,
      icons: {
       sortAscending: '<div class="sortIcon ascending"><i class="top bi_interface-top"></i><i class="bottom bi_interface-bottom"></i></div>',
       sortDescending: '<div class="sortIcon descending"><i class="top bi_interface-top"></i><i class="bottom bi_interface-bottom"></i></div>',
       sortUnSort: '<div class="sortIcon"><i class="top bi_interface-top"></i><i class="bottom bi_interface-bottom"></i></div>',
     }
    }
  };

  var gridRowClicked = function (event) {
    //If column has an href or is a check box don't open side panel let href control navigation
    if(event.event.srcElement.attributes.length == 0 || 
      (event.event.srcElement.attributes[0].name !== "href" && event.event.srcElement.className !== "css-checkbox"
        && (event.event.srcElement.control == null || event.event.srcElement.control.type != 'checkbox'))){
      $rootScope.$apply(function () {
        currentState.entity.currentItem = event.data; 
        panelAction('Open', currentState.entity.entityType + 'Glimpse', currentState.entity);
      });
      
    }; 
  };

  
   var entity = function() {
    return {
      name: "", //single name of this entity 
      pluralName: "", //plural name 
      entityModel: {}, //point to entity model - Company, Opportunity, Contact, etc. 
      baseState: "", //text string of route for this state base.companies 
      refreshBroadcast: "", //root scope broadcast message refreshCompanies 
      loaded: false,   //has this entity already been loaded 
      totalCount: 0,  //total # of entities 
      data: [], //loaded data 
      selectedItems: [], //
      currentView: {}, //current view being displayed 
      currentItem: {}, //current selected row 
      currentColumnDefs: [], //column definitions for Ag-grid 
      currentQuery: {}, //current query being used  
      numOfFilters: {},  //count of filters that have been applied 
      refineParams: {},   //the refine params being used in this filter 
      gridOptions: null,  //will be initialized with a new gridOptions object  
      datasource: null, 
      pickLists: [],  //loaded by entity controller 
      views: [], //Loaded by entity controller
      qualifiers: [],     
      defaultColumnDefs: []
    }
  }; 

  var entities = {}; 
  var views = {}; 

  var currentState = {
    view: null,   //current View 
    viewCount: null,  //Total number of views available
    entityType: null,  //current entity type = Company, Opportunity, Contacts, 
    entity: null,  //current entity
    org: null   //org info 
  }; 

  var setCurrentState = function(entity, view){
    currentState.origView = angular.copy(view);  //capture view to restore to on reset 
    currentState.origRefineParams = angular.copy(entity.refineParams);  
    currentState.view = view; 
    currentState.entity = entity; 
    currentState.entityType = entity.entityType; 
  }; 

  //wire up get rows for virtual pagination
  //This function gets called whenever the grid needs a new page of data 
  var gridGetRows = function (params) {
    console.log('asking for ' + params.startRow + ' to ' + params.endRow);
    $rootScope.interloopSpinner = true;
    console.log($rootScope.interloopSpinner);

    if(params.startRow === 0 ){
      currentState.entity.data = [];  //this is first page so clear out data and start over 
    }; 

    if(params != null && params.sortModel.length > 0 ){  //Call came from grid so get Sort Order  
      var order = []; 
      angular.forEach(params.sortModel, function(sortItem){
      order.push(sortItem.colId + " " + sortItem.sort.toUpperCase());  
      }); 
    }; 

    //Setup sort order and page loads 
    currentState.view.query.filter.order = order;   
    currentState.view.query.filter.skip = params.startRow; 
    currentState.view.query.filter.limit = interloopConfig.pageSize; 

    //Update total Count
    currentState.entity.entityModel.count(currentState.view.query.filter).$promise 
    .then(function(data) {
      currentState.entity.totalCount = data.count;
      //read a page of data for current entity
      currentState.entity.entityModel.find(currentState.view.query).$promise
      .then(function(results) {
        Array.prototype.push.apply(currentState.entity.data, results); //Append this read result back to data for this entity
        params.successCallback(results, currentState.entity.totalCount); 
        $rootScope.interloopSpinner = false;
        console.log($rootScope.interloopSpinner);
      });
    });
  };

    var selectionChanged = function (event) {
     currentState.entity.selectedItems = event.selectedRows;
  }; 


  function headerCellRendererFunc(params) {

    var span = document.createElement('div');

    var cb = document.createElement('input');
     cb.setAttribute('type', 'checkbox');
     cb.setAttribute('class', 'css-checkbox');
     cb.setAttribute('id', 'selectAllCheckbox');

     // var label = document.createElement('label')
     // label.htmlFor = "selectAllCheckbox";

      var eHeader = document.createElement('label');
      eHeader.setAttribute('class', 'css-label');
      eHeader.htmlFor = "selectAllCheckbox";
      // eHeader.appendChild(cb);
  
      span.appendChild(cb);
      span.appendChild(eHeader);

      cb.addEventListener('change', function (e) {
          if ($document[0].getElementById('selectAllCheckbox').checked) {
                currentState.entity.gridOptions.api.forEachNode( function (node) {
                var elem = $document[0].getElementById(node.id + '-selectCheckbox')
                elem != null ? elem.checked = true : null;
                currentState.entity.gridOptions.api.selectNode(node, true);
              });
          } else {
              currentState.entity.gridOptions.api.deselectAll();
          } 
      });
      return span; 
    }


function renderCheckbox(params) {

    var span = document.createElement('div');

    var cb = document.createElement('input');
     cb.setAttribute('type', 'checkbox');
     cb.setAttribute('class', 'css-checkbox');
     cb.setAttribute('id', params.node.id + '-selectCheckbox');

     // var label = document.createElement('label')
     // label.htmlFor = "selectAllCheckbox";

    var eHeader = document.createElement('label');
    eHeader.setAttribute('class', 'css-label');
    eHeader.htmlFor = params.node.id + '-selectCheckbox';
    // eHeader.appendChild(cb);

    span.appendChild(cb);
    span.appendChild(eHeader);


    cb.addEventListener('change', function (e) {
      if ($document[0].getElementById(params.node.id + '-selectCheckbox').checked) {
        currentState.entity.gridOptions.api.selectNode(params.node, true)
      } else {
          currentState.entity.gridOptions.api.deselectNode(params.node);
      } 
    });

    return span; 
  }

 
 

   
   //Put render items in object so they are addressable 
  function renderCompany(params) { 
      if (!params.data.name) {
        return '<div class="placeholder"></div>';
      } 
      else { 
        return '<a href="/companies/'+params.data.id+'">'+ '<b>' + params.data.name + '</b>'+ '</a>';
      }
  }; 

  function renderGravatar(params) { 
    var MD5 = new Hashes.MD5;

      if (params.data.email === undefined) {
        return '<span class="gravatar-placeholder"></span>';
      } 
      else { 
        var emailHash = MD5.hex(params.data.email);
        return '<img class="list-gravatar" src="https://www.gravatar.com/avatar/'+ emailHash + '?d=mm">';
      }
  }; 
 
  function renderFullName(params) { 
    
      if (params.data === undefined) {
        return '<div class="placeholder"></div>';
      } 
      else if (params.data.fullName === null || params.data.fullName === undefined) {
        return '';
      }
      else { 
        return '<a href="/contacts/'+params.data.id+'"><b>'+params.data.fullName+'</b></a>';
      }
  }; 

    //Put render items in object so they are addressable 
  function renderOppName(params) {
    // console.log(params)
  // console.log(params.data); 
      if (!params.value) {
        return '<a style="font-weight:600" href="/opportunities/'+params.data.id+'">[No Name]</a>';
      } 
      else if (params.value == null) {
        return '<a style="font-weight:600" href="/opportunities/'+params.data.id+'">[No Name]</a>';
      }
      else { 
        return '<a style="font-weight:600" href="/opportunities/'+params.data.id+'">' +params.data.name+'</a>';
      }
  }; 


  function renderScore(params) { 
      return '<div class="scoreBox">'+Number(params.data.score).toFixed(1)+'</div>';
  };    
  

  function renderQualifiers(params) {  
    return htmlQualifiers(params.data.qualifiers); 
  }; 

  function htmlQualifiers(qualifiers){
    var values = [];
    angular.forEach(qualifiers, function(qualifier, group){
      if (qualifier.indicator == 1) {
         values.push('<icon class="negative fa fa-times-circle" data-toggle="tooltip" title="' + 
            group + ':' + qualifier.name + '"></icon>');
      }
      else if(qualifier.indicator  == 2) {
        values.push('<icon class="neutral fa fa-circle-o" data-toggle="tooltip" title="' + 
          group + ':' + qualifier.name + '"></icon>');
      }
      else {
          values.push('<icon class="positive fa fa-check-circle" data-toggle="tooltip" title="' + 
            group + ':' + qualifier.name + '"></icon>');
      }  
    })
    return values.join(' ');
  }; 

  function renderContacts(params) {

    /*
    var count = Math.floor(Math.random() * 10) + 1
    return '<a href="#/companies/3">'+ count +' Contacts ...</a>';
    */ 
    return htmlContacts(params.data.contacts); 
  }; 

  function htmlContacts(contacts)  {
    var values = []; 
    angular.forEach(contacts, function(contact){
      values.push('<span class="scoreBox">' + getInitials(contact.fullName) + '</span>')
    })
    return '<div>' + values.join('&nbsp') + '</div>'; 
  }; 

  //render email field
  function renderEmail(params) {
    if (!params.value) {
      return '<div class="placeholder"></div>';
    } 
    else {
      return '<a href="mailto:' +params.value+'">'+params.value+'</a>';
    }
  };

  function renderWebSite(params) {
    if (!params.value) {
      return '<div class="placeholder"></div>';
    } 
    else {
      return '<a target="_blank" href="' +params.value+'">'+params.value+'</a>'
    }
  }; 

  function renderName(params) {
    if (!params.data.fullName) {
      return '<div class="placeholder"></div>';
    } 
    else {
      return '<a href="#/contacts/' + params.data.id + '"">'+params.data.fullName+'</a>';
    }
  }; 

  function renderAvatar(params){
      return '<span class="avatar small">' + params.data.fullName.substring(0,1) + '</span>';
  }; 

  function renderDate(params){
      return moment(params.value).format("MMM-DD-YYYY");
  }; 

  function renderCurrency(params){
    var retval; 
    retval = typeof(params.value) === 'number'  
        ? '$' + params.value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
        : '$ 0.00'; 
    
    return '<div style="text-align:right;">' + retval + '</div>';   

  }; 

  function renderMiniBar(params) {
        params.value = params.value || 0; 
        var percentOfMax = params.value/3000000 * 100
        var value = params.value;

        var eDivPercentBar = document.createElement('div');
        eDivPercentBar.className = 'div-percent-bar';
        eDivPercentBar.style.width = percentOfMax + '%';
        eDivPercentBar.style.backgroundColor = '#98E198';

        /* 
        if (percentOfMax < 20) {
            
        } else if (percentOfMax < 60) {
            eDivPercentBar.style.backgroundColor = '#ff9900';
        } else {
            eDivPercentBar.style.backgroundColor = '#00A000';
        }
        */ 

        var eValue = document.createElement('div');
        eValue.className = 'div-percent-value';
        eValue.innerHTML = '$' + params.value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') ;

        var eOuterDiv = document.createElement('div');
        eOuterDiv.className = 'div-outer-div';
        eOuterDiv.appendChild(eValue);
        eOuterDiv.appendChild(eDivPercentBar);

        return eOuterDiv;
  }

   var PRODUCTS = [
   {name: 'Mobile', icon: 'fa fa-mobile' }, 
   {name: 'Media', icon: 'fa fa-television' }, 
   {name: 'Digital', icon: 'fa fa-hdd-o' }, 
   {name: 'Print', icon: 'fa fa-print' }
   ];  
   
   
  function renderProductMix(params) {
        var data = params.data;
        var products = [];

        PRODUCTS.forEach(function (product) {
            if (data.qualifiers != null && data.qualifiers.ProductMix != null && data.qualifiers.ProductMix[product.name]) {
                products.push('<icon class="' + data.qualifiers.ProductMix[product.name].icon + '"></icon>');
            }
        });
        return products.join(' ');
  }


  function renderPercent(params){
    var retval; 
    retval = typeof(params.value) === 'number'  
        ? params.value.toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' %'
        : '0.0 %';   
    return '<div style="text-align:right;">' + retval + '</div>';    
  }
 
  function getNestedField(params){
    //Loop thru fields and check for nulls 
    var fieldNames = params.colDef.field.split(".");
    var obj = params.data;  
    angular.forEach(fieldNames, function(field){
       obj = obj[field] != null ? obj[field] : ""
    })
    return obj; 
  }; 


   //Common Interloop view Actions  
  var panelAction = function(action, panelName, currentEntity) {
    switch(action) {
      case 'Open': 
        openPanel('open' + panelName, currentEntity);   //broadcast to open panel such as openCompanyGlimpse, company object
        break;
      case 'New': 
        currentEntity.currentItem = {}; //blank will create a new item on save 
        openPanel('open' + panelName, currentEntity);   //broadcast to open panel such as openCompanyGlimpse, company object
        break;
    }; 
  }; 

  var openPanel = function(panelName, panelItem) {
    $rootScope.$broadcast(panelName, panelItem);
  };

  //Common Interloop view Actions 
  //TODO - see if entity can be removed and derived instead from view 
  var viewAction = function(action, view, entity) {
    switch(action) {
      case 'Save':
        currentState.view.columnDefs = currentState.entity.gridOptions.columnDefs;  //copy columndefs from current grid   
        saveView(currentState.view); //Standard fields are at top level 
        break;
      case 'Select': 
        selectView(entity, view);  //navigate to selected view 
        //currentState.entity.gridOptions.api.setDatasource();  //Force a refresh 
        break; 
      case 'Update': 
        currentState.view.columnDefs = currentState.entity.gridOptions.columnDefs;  //Copy columnDefs from activty grid 
        updateView(currentState.view); 
        break; 
      case "Delete": 
        deleteView(view); 
        break;
      case "ClearFilters": 
        clearFilters(currentState.view); 
        selectView(currentState.entity, currentState.view);  //Run current view again 
        break; 
    }; 
  }; 

  var clearFilters = function(view){
    entities[view.entityType].refineParams = {}; 
    view.query.filter.where = {}; 
    selectView(entities[view.entityType], view); //reselect view 
  }; 



  //Loads all views - need to add paging - returns promise 
  var getAllViews = function() {
    return View.count({where:{default: false}}).$promise
    .then(function(value) {
      currentState.viewCount = value.count;  //Have count now get first page of views   
      return View.find({ filter: { order: 'created_date DESC',limit:50 } }).$promise
      .then(function(views) {
        //Unpack all the views - convert to JSON from stringify object in db 
        currentState.views = [];  //clear out array 
        angular.forEach(views, function(view, index){
          currentState.views[index] = unPackView(view);  
        });  
      }); 
    }); 
  }; 

  //Save current view as new view and restore original 
  var saveView = function(view) {
    var modalInstance = $uibModal.open({
      templateUrl: 'modules/_shared/modals/newView.html',
      controller: 'NewViewCtrl',
      size: 'md'
    });

    var newView = {name: null, entityType: null, description: null, columnDefs: {}, query: {}}; 

    //results of modal select
    modalInstance.result
    .then(function (viewValues) {
      console.log('save view')
      //if save view
      newView.name = viewValues.name; 
      newView.description = viewValues.description; 
      newView.entityType = view.entityType; 
      newView.hidden = false; 
      newView.default = false; 
      //newView.columnDefs = currentEntity.gridOptions.columnDefs.map(stringifyFn); 
      newView.columnDefs = packColumnDefs(view.columnDefs); 
      newView.query = JSON.stringify(view.query); 

      //TODO - Save New View to views. 
      View.save(newView).$promise  //save view to database 
      .then(function(savedView){
        //successfully saved - so update view List, select saved view settings and read original view back 
        view = angular.copy(currentState.origView);  //restore view as before save 
        setCurrentState(savedView.entityType, unPackView(savedView)); 
        currentState.views.push(currentState.view);  //now push this new view 
        //selectView(entity, view);  
      }); 
    }); 
  }; 

  var defaultView = function(entityType) {
    return _.find(currentState.views,{'entityType': entityType, 'default': true});
  }; 

  var updateView = function(view){
     var newView = angular.copy(view); 
     newView.columnDefs = packColumnDefs(view.columnDefs);  //Stringify for storage
     newView.query = stringifyFn(view.query); //stringify for storage

     View.upsert(newView).$promise  //save view to database 
      .then(function(results){
        //upsert successful replace current view in array 
        var index = _.indexOf(currentState.views, _.find(currentState.views, {id: results.id}));
        currentState.views.splice(index, 1, view);  //Store unpacked version in array
      }); 
  }; 

  //Select view
  var selectView = function(entity, view){
    if(view == null){  //view null or undefined so get defaut
      view = defaultView(entity.entityType);  //Get default view since none set    
    }; 

    //Load default refine settings  
    if(view != null && view.query != null){
      loadRefineParams(entity, view.query);   
    }

    //Set current State and then load view 
    setCurrentState(entity,view);

    //Did State Change or is this just a view update?     
    if($state.current.name === entity.baseState){
      $rootScope.$broadcast(entity.refreshBroadcast, {view: view});   
    }
    else {
      $state.go(currentState.entity.baseState, {view: view}); 
    };     
  }; 

  //creates an array of refineParams used by the refine panel 
  loadRefineParams = function(entity, query){
    //iterate through each refineParam type 
    var whereOr = query.filter.where.and; 
    entity.refineParams = {
      standardFields: {}, 
      customFields: {}, 
      qualifiers: {}
    };

    //Iterate through refineParams
    angular.forEach(whereOr, function(orItems){
      angular.forEach(orItems.or, function(values, fieldName){
        //Get tokens for object description eg. customFields.CampaignType.value : "CT - President"
        var valueText = _.keys(values)[0].split('.'); 

        //Determine which type of field this is 
        if(valueText.length < 3){
          var refineType = "standardFields"; 
          var refineField = valueText[0];   
        }
        else {
          var refineType = valueText[0]; 
          var refineField = valueText[1]; 
        }; 

        //create array if it does not already exist
        if(entity.refineParams[refineType][refineField] == null){
          entity.refineParams[refineType][refineField] = [];  
        }; 

        //Iterate thru values and insert into array 
        angular.forEach(values, function(value){
           entity.refineParams[refineType][refineField].push(value);
          /* TODO - remove after testing 
          if(value === null || value.exists === false){   //no Value is set 
             entity.refineParams[refineType][refineField].noValue = true; 
          }
          else if (value.regexp === ".*"){  //any value is set 
            entity.refineParams[refineType][refineField].anyValue = true; 
          }
          else {  //Standard query 
            entity.refineParams[refineType][refineField].push(value);
          }; 
          */           
        }); 
      });   
    }); 
    updateFilterTotals(entity); 
  }; 

  updateFilterTotals = function(entity) {
    entity.numOfFilters = {}; 
    entity.numOfFilters.total = 0; 
    angular.forEach(entity.refineParams, function(filterFields, filterName){
      var filterCount = _.size(filterFields); 
      entity.numOfFilters[filterName] = filterCount; 
      entity.numOfFilters.total += filterCount; 
    })
  }; 

  //_.toArray(query.filter.where.and[0].or[0])


  //TODO - change to find actual default view 
  var deleteView = function(view) {
    View.deleteById({id: view.id}).$promise
    .then(function(results){
      getAllViews()  //Reload views 
      .then(function(results){
        if(view = currentState.view){
          selectView(currentState.entity); //Select Default view 
        }
      })  
    })
  }; 


  //Packs column defs to allow functions to be stored in JSON 
  var packColumnDefs = function(columnDefs){
    var newColumnDefs = angular.copy(columnDefs); 
    angular.forEach(newColumnDefs, function(colDefItem){
      //Translate functions for cellRenderer and valueGetter
      colDefItem.cellRenderer != null 
        ? colDefItem.cellRenderer = functionName(colDefItem.cellRenderer)
        : delete colDefItem.cellRenderer;

      colDefItem.headerCellRenderer != null 
        ? colDefItem.headerCellRenderer = functionName(colDefItem.headerCellRenderer)
        : delete colDefItem.headerCellRenderer;

      colDefItem.valueGetter != null 
        ? colDefItem.valueGetter = functionName(colDefItem.valueGetter)
        : delete colDefItem.valueGetter;
    });    
    return newColumnDefs; 
  }; 

  //Get name of function so it can be stored in JSON
  var functionName = function(fun) {
    var ret = fun.toString();
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));
    return ret;
  }; 
  

  //unpacks columnDefs functions from JSON data 
  var unPackColumnDefs = function(columnDefs) {
    var newColumnDefs = angular.copy(columnDefs)
    angular.forEach(newColumnDefs, function(colDefItem){
      //Translate functions for cellRenderer and valueGetter
      colDefItem.cellRenderer != null 
        ? colDefItem.cellRenderer = eval(colDefItem.cellRenderer)
        : delete colDefItem.cellRenderer;

      colDefItem.headerCellRenderer != null 
        ? colDefItem.headerCellRenderer = eval(colDefItem.headerCellRenderer)
        : delete colDefItem.headerCellRenderer;

      colDefItem.valueGetter != null 
        ? colDefItem.valueGetter = eval(colDefItem.valueGetter)
        : delete colDefItem.valueGetter;
    });  
    return newColumnDefs; 
  }; 

  
  //Build picklist for entity 
  var getPickLists = function(entity, limitName) {
    //Build query for picklists for this entity 
    var query = {
      filter: {
        where: {useWith: entity.name}, 
        fields: ['name', 'items']
      }
    }; 

    //add limitName if present 
    if(limitName != null) {
      query.filter.where.name = limitName; 
    }; 

    return Picklist.find(query).$promise
    .then(function(results){
      //transform into pickList object from array of picklists 
      //format picklists.name.items
      var picklists = {}; 
      angular.forEach(results, function(picklist){
        picklists[picklist.name] = {}; 
        picklists[picklist.name].items = picklist.items; 
        picklists[picklist.name].name = picklist.name;
      })

      return picklists;  
    })
  }; 

  //TODO - combine qualifiers and custom fields 

  //Load Qualifiers 
  var getQualifiers = function(entity) {
    //Build query for picklists for this entity 
    var query = {
      filter: {
        where: {useWith: entity.name},
        fields: ['name', 'items', 'order']
      }
    }; 

    return Qualifier.find(query).$promise
    .then(function(results){
      //transform into qualifier object from array of qualifiers 
      //format qualifier.name.items
      var qualifiers = {}; 
      angular.forEach(results, function(qualifier){
        qualifiers[qualifier.name] = {}; 
        qualifiers[qualifier.name].items = qualifier.items; 
        qualifiers[qualifier.name].name = qualifier.name; 
        qualifiers[qualifier.name].order = qualifier.order; 
      })
      return qualifiers;  
    })
  }; 

  //Load Custom Fields
  var getCustomFields = function(entity) {
    //Build query for picklists for this entity 
    var query = {
      filter: {
        where: {useWith: entity.name},
        fields: ['name', 'label', 'type', 'items', 'group', 'showInRefine']
      }
    }; 

    return CustomField.find(query).$promise
    .then(function(results){
      //transform into qualifier object from array of qualifiers 
      //format qualifier.name.items
      var customFields = {}; 
      angular.forEach(results, function(customField){
        //build object of fields 
        customFields[customField.name] = {}; 
        angular.forEach(query.filter.fields, function(field){
           customFields[customField.name][field] = customField[field];    
        });
      });
      return customFields;  
    });
  }; 

 //Load Rules Fields
  var getRules = function(entity) {
    //Build query for picklists for this entity 
    var query = {
      filter: {
        where: {useWith: entity.name},
        fields: ['name', 'type', 'action', 'updateField', 'inputObj', 'valueField', 'fields', 'ruleTrigger']
      }
    }; 

    return Rule.find(query).$promise
    .then(function(results){
      //transform into qualifier object from array of qualifiers 
      //format qualifier.name.items
      var rules = {}; 
      angular.forEach(results, function(rule){
        //build object of fields 
        rules[rule.name] = {}; 
        angular.forEach(query.filter.fields, function(field){
           rules[rule.name][field] = rule[field];    
        });
      });
      return rules;  
    });
  }; 
  
  var getEntityItems = function(entity) {
    return $q.all([
      getPickLists(entity)  //Get PickLists
      .then(function(results){
        entity.pickLists = results; 
      }),
      getQualifiers(entity)  //Get Qualifiers
      .then(function(results){
        entity.qualifiers = results; 
      }),
      getCustomFields(entity)  //Get Custom Fields
      .then(function(results){
        entity.customFields = results; 
      }),
      getRules(entity)  //Get Rules
      .then(function(results){
        entity.rules = results; 
      })
    ])
  }; 

  var stringifyFn = function(obj){
   return JSON.stringify(obj, function (key, value) {
      if (typeof value === 'function') {
          return value.toString();
      }
      return value;
   });
  }; 

  var parseFn = function(obj){
    return JSON.parse(obj, function (key, value) {
      if (value && typeof value === "string" && value.substr(0,8) == "function") {
        var startBody = value.indexOf('{') + 1;
        var endBody = value.lastIndexOf('}');
        var startArgs = value.indexOf('(') + 1;
        var endArgs = value.indexOf(')');
        return new Function(value.substring(startArgs, endArgs), value.substring(startBody, endBody));
      }
      return value;
   });
  }; 

   //Process Field Rule 
  //Current types are Total, Average, RemainingPercent 
  //inputObj = arrary of fields 
  //updateObj = field where result is stored 
  //fields = sub selector of fields as an array 
  //currentItem = current selected entity record that rule is applied to 
  var applyRule = function(rule, currentItem) {
    var ruleFn = {
      'Total': function(rule) {
        return calcSum(_.pick(currentItem[rule.inputObj], rule.fields), rule.valueField); 
      }, 
      'Average': function(rule) {
        return calcSum(_.pick(currentItem[rule.inputObj],rule.fields), rule.valueField)/ rule.fields.length; 
      }, 
      'RemainingPercent' : function(rule){
        return 100 - calcSum(_.pick(currentItem[rule.inputObj], rule.fields), rule.valueField); 
      }
    }; 

    if (rule.action)
      return ruleFn[rule.action](rule); 
    else 
        return null; 
  }; 

  //Sum by value field in array of objects or array values if just simple array
  var calcSum = function(arr, valueField){
    if (valueField)
      return _.sum(arr,valueField)
    else 
      return _.sum(arr); 
  }; 

 var getInitials = function(name){
    if(name != null){
      name =  name.replace(/[^A-Z]/g, '').substring(0,2);
    }
    return name != null ? name : ""; 
  }; 

   
  return { 
    config: config, 
    entities: entities,
    currentState: currentState, 
    setCurrentState: setCurrentState, 
    defaultView: defaultView,   //get default view for an entity 
    updateView: updateView, 
    saveView: saveView, 
    //datasource: datasource, 
    gridOptions: gridOptions, 
    viewAction: viewAction, 
    panelAction: panelAction, 
    updateFilterTotals: updateFilterTotals, 
    getPickLists: getPickLists, 
    getQualifiers: getQualifiers, 
    getCustomFields: getCustomFields, 
    getEntityItems: getEntityItems, 
    getAllViews: getAllViews, 
    getInitials: getInitials, 
    htmlQualifiers: htmlQualifiers, 
    applyRule: applyRule
  } 
})


//New View Modal Controller
.controller('NewViewCtrl', function ($scope, $uibModalInstance) {
  $scope.newView = {};   
  
  $scope.newView.name = '';
  $scope.newView.description = '';

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');

  };

  $scope.save = function () {
    $uibModalInstance.close($scope.newView);
  };
})




