angular.module('interloop.analytics.controllers', [])


.controller('AnalyticsCtrl', function($scope, $state, Analytics) {

  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; 

    $scope.data = {}; 
    $scope.data.filter = {}; 
    $scope.data.filter.accountManager = {"or": []}; //Push or Pop selections from here 
    $scope.data.showType = "$"; 
    $scope.data.selection = {}; 

    //Mongo Query to get Monthly Goals 
    //TODO - Move to Database 
    $scope.data.goalsQuery = [
        {"$match": {"$or": []} }, 
        { "$unwind": "$goals.2016"},
        { "$group": {
            "_id": "$goals.2016.month", "order" : {"$max": "$goals.2016.order"}, "total" : {"$sum": "$goals.2016.value"}}
        },
        { "$sort": { "order" : 1 }},
        { "$project": {"month" : "$_id", "total": 1, "_id" :0}}
    ]; 

    $scope.data.monthlyBillQuery = [
        { "$match": { "$and": [ {"stage.value": "Bill"}, {"$or": [{}] }]} }, 
        { "$group": { 
          "_id" : {"$month" : "$estimatedClose"}, 
          "oppTotal" : {"$sum" :  {"$divide" : ["$value",1000]} }, 
          "mobileTotal" : {"$sum" : {"$divide" : ["$customFields.EstMobile", 1000]}}, 
          "mediaTotal" : { "$sum" : {"$divide" : ["$customFields.EstMedia", 1000]} }, 
          "mailTotal" : { "$sum" : {"$divide" : ["$customFields.EstMail", 1000]} }, 
          "otherTotal" : { "$sum" : {"$divide" : ["$customFields.EstOther", 1000]}}
        }},
        { "$sort": { "_id" : 1 }} , 
        { "$project": { "doc": {"_id": {"$ifNull": ["$_id", 0]}, 
            "oppTotal" : "$oppTotal" , 
            "mobileTotal" : "$mobileTotal",
            "mediaTotal" : "$mediaTotal",
            "mailTotal" : "$mailTotal",
            "otherTotal" : "$otherTotal"
        }}}, // Stage 4
        { "$group": { "_id": null, "max": {"$max": "$doc.oppTotal"}, "results" : {"$push": "$doc"}}}, // Stage 
        { "$project": { "results": 1, "_id": 0, "max" : 1}} // Stage 6  
    ]; 

    var toggleArrayItem = function (a, v) {
        var i = _.findIndex(a,v);
        if (i === -1)
            a.push(v);
        else
        a.splice(i,1);
    }

    $scope.selectChart = function(){
        zingchart.exec("Team", "setselection", {"selection" : $scope.data.selection}); 
    }; 

    $scope.teamRenderer = {
        events: {
            animation_end: function(p){
                console.log("done"); 
                zingchart.exec("Team", "setselection", {"selection": $scope.data.selection}); 
            }, 
            node_click: function(p){
                var value = {}; 
                if(p.scaletext === 'No Acct Mgr'){
                    value = {"accountManager.value" : {$exists: false}}; 
                } else {
                    value = {"accountManager.value" : p.scaletext}; 
                };

                toggleArrayItem($scope.data.filter.accountManager.or, value); 
                var filterString = JSON.stringify($scope.data.filter.accountManager); 
                $scope.getOppStats(filterString); 
                $scope.getMonthlyStats(filterString); 
                //$scope.data.filter.accountManager = !$scope.data.filter.accountManager;  
            } 
        }
    };

    //Toggle display between #, $, etc. 
    $scope.showType = function(showType){
        var data = {"selection": []}; 
        $scope.data.selection = zingchart.exec("Team", "getselection"); 
        data.selection[0] = []; //replace null 
        $scope.showTeam(showType); 
        $scope.showPipeline(showType); 
        $scope.data.showType = showType; 
    }; 


    $scope.getTeamStats = function(filter) {
        Analytics.accountMgr(filter).$promise
        .then(function(results){
            $scope.data.accountMgr = results;
            $scope.showTeam($scope.data.showType);  
        });
    }; 

     $scope.showTeam = function(showType){
        var metricType = 'Count'; 
        var displayType = "%data-rvalues"; 
        var offset = "-120px"; 
        if(showType === '$'){
            metricType = 'Total';
            displayType = "$%data-rvalues"; 
            offset = "-65px"; 
        }; 
        $scope.teamChartConfig["scale-x"].values = _.pluck($scope.data.accountMgr.results, '_id'); 
        $scope.teamChartConfig["series"][0].values = _.pluck($scope.data.accountMgr.results, 'opp' + metricType); 
        $scope.teamChartConfig["series"][1].values = _.times($scope.data.accountMgr.results.length, 
            function(n) { return n = $scope.data.accountMgr['max' + metricType]}); 
        $scope.teamChartConfig["series"][1]["data-rvalues"] = _.pluck($scope.data.accountMgr.results, 'opp' + metricType); 
        $scope.teamChartConfig["series"][1]["value-box"].text =  displayType; 
        $scope.teamChartConfig["series"][1]["value-box"]["offset-x"] = offset;
    };



    $scope.getMonthlyStats = function(filter){
        Analytics.monthly({"where" : filter}).$promise
        .then(function(results){
            $scope.data.monthly = results; 

            //Get Monthly Bill Results 
            Analytics.query({"collection": "Opportunity"}, $scope.data.monthlyBillQuery).$promise
            .then(function(monthlyBill){
                $scope.data.monthlyBill = monthlyBill.results[0]; 
                angular.forEach($scope.data.monthlyBill.results, function(month){
                    $scope.monthlyChartConfig.series[0].values[month["_id"]-1] = month.oppTotal;
                    $scope.monthlyChartConfig.series[1].values[month["_id"]-1] = month.mobileTotal; 
                    $scope.monthlyChartConfig.series[3].values[month["_id"]-1] = month.mediaTotal; 
                    $scope.monthlyChartConfig.series[5].values[month["_id"]-1] = month.mailTotal; 
                    $scope.monthlyChartConfig.series[7].values[month["_id"]-1] = month.otherTotal;  
                })
            });

            //fix up filter before sending; 
            $scope.data.goalsQuery[0].$match.$or = $scope.data.filter.accountManager.or.length === 0 
                ? [{}] 
                : $scope.data.filter.accountManager.or; 

            Analytics.query({"collection" : "Goal"}, $scope.data.goalsQuery).$promise
            .then(function(goals){
                $scope.data.goals = goals.results; 
                $scope.monthlyChartConfig.series[9].values = _.pluck(goals.results, 'total'); //Monthly Goals
                var tempArray = angular.copy($scope.monthlyChartConfig.series[9].values); 
                _.map(tempArray, function(item,i){ if(i > 0) tempArray[i] += tempArray[i-1];}); 
                $scope.monthlyChartConfig.series[10].values = tempArray;

                var max = _.max(tempArray);
                var ticks = 5; 
                var unroundedTickRange = max/(ticks) ; 
                var length = unroundedTickRange.toString().length-1; 
                var pow10x = Math.pow(10,length); 
                var tickRange = Math.ceil(unroundedTickRange/pow10x * 10) / 10 * pow10x; 
                var scaleMax = tickRange * ticks;                
                $scope.monthlyChartConfig["scale-y-2"].values = "0:" + scaleMax.toString() + ":" + tickRange.toString();   
            })

            var scale = Math.pow(10, $scope.data.monthly.max.toString().length -1);
            var max = Math.ceil($scope.data.monthly.max * scale) / scale; 

            $scope.monthlyChartConfig["scale-y"].values = "0:" + max.toString() + ":" + scale.toString();  

            //loop thru monthly data 
            angular.forEach($scope.data.monthly.results, function(month){
                $scope.monthlyChartConfig.series[1].values[month["_id"]-1] = month.mobileTotal; 
                $scope.monthlyChartConfig.series[3].values[month["_id"]-1] = month.mediaTotal; 
                $scope.monthlyChartConfig.series[5].values[month["_id"]-1] = month.mailTotal; 
                $scope.monthlyChartConfig.series[7].values[month["_id"]-1] = month.otherTotal; 
            })
        }); 
    }; 



    $scope.getOppStats = function(filter){
        Analytics.oppStats({"where": filter}).$promise
        .then(function(results){
            $scope.data.oppStats = results;
            $scope.data.oppStats.counts = []; 
            $scope.data.oppStats.totals = []; 
            $scope.data.oppStats.labels = []; 
            $scope.pipelineChartConfig.series = [];  //Clear out series and labesl 
            $scope.pipelineChartConfig["scale-y"].labels = []; 
            angular.forEach($scope.data.oppStats.results, function(stat){
                $scope.data.oppStats.labels.push(stat.stage); 
                $scope.data.oppStats.counts.push({"values": [stat.count]}); 
                $scope.data.oppStats.totals.push({"values" : [stat.total]}); 
            }); 
            //$scope.pipelineChartConfig.series = $scope.data.oppStats.counts;  
            $scope.pipelineChartConfig["scale-y"].labels = $scope.data.oppStats.labels;  
            $scope.showPipeline($scope.data.showType); 

        });
    }; 

    $scope.showPipeline = function(showType){
        var metricType = 'counts'; 
        var displayType = "%v"; 
        if(showType === '$'){
            metricType = 'totals';
            displayType = "$%v"
        }; 
        $scope.pipelineChartConfig.series = $scope.data.oppStats[metricType];
        $scope.pipelineChartConfig.plot["value-box"].text =  displayType; 

    };

    $scope.getOppStats(); 
    $scope.getTeamStats(); 
    $scope.getMonthlyStats(); 

    //Configuration for Team Performance chart 
    $scope.teamChartConfig = {
        "type":"hbar",
        "id": "Team", 
        "plotarea": {
            "adjust-layout": false,
            "margin":"40px 10px 10px 10px",
            "width": "95%"
        },
        "background-color":"#fff",
        "border-color":"#E9EFF2",
        "border-width":"1px",
        "border-radius":"4px",
        "title":{
            "margin-top":"7px",
            "margin-left":"9px",
            "text":"TEAM PERFORMANCE",
            "background-color":"none",
            "shadow":0,
            "text-align":"left",
            "font-family":"Arial",
            "font-size":"11px",
            "font-color":"#707d94"
        },
        "scale-y":{
            "line-color":"none",
            "tick":{
                "visible":false
            },
            "item":{
                "visible":false
            },
            "guide":{
                "visible":false
            }
        },
        "scale-x":{
            "values": [],
            "line-color":"none",
            "tick":{
                "visible":false
            },
            "item":{
                "width":150,
                "text-align":"left",
                "offset-x":156,
                "offset-y":-12,
                "font-color":"#8391a5",
                "font-family":"Arial",
                "font-size":"11px",
                "padding-bottom":"8px"
            },
            "guide":{
                "visible":false
            }
        },
        "plot":{
            "bars-overlap":"100%",
            "bar-width":"12px",
            "thousands-separator":",",
            "tooltip":{
                "font-color":"#ffffff",
                "background-color":"#707e94",
                "font-family":"Arial",
                "font-size":"11px",
                "border-radius":"6px",
                "shadow":false,
                "padding":"5px 10px"
            },
            "hover-state":{
                "background-color":"#707e94"
            },
            "animation":{
                "effect":"ANIMATION_FADE_IN"
            }, 
            "selection-mode":"one",
                "selected-state":{
                "background-color":"green"
             }
        },
        "series":[
            {
                "values":[],
                "-animation":{
                    "method":0,
                    "effect":4,
                    "speed":2000,
                    "sequence":0
                },
                "z-index":2,
                "styles":[
                  { "background-color":"#48BFF2"},
                  { "background-color":"#48BFF2"},
                  { "background-color":"#48BFF2"},
                  { "background-color":"#48BFF2"},
                  { "background-color":"#48BFF2"},
                  { "background-color":"#48BFF2"}
                ],
                "tooltip-text":"$%node-value"
            },
            {
                "max-trackers":0,
                "values":[],
                "data-rvalues":[],
                "background-color":"#d9e4eb",
                "z-index":1,
                "value-box":{
                    "visible":true,
                    "offset-y":"-12px",
                    "offset-x":"-120px",
                    "text-align":"right",
                    "font-color":"#8391a5",
                    "font-family":"Arial",
                    "font-size":"11px",
                    "text":"$%data-rvalues",
                    "padding-bottom":"8px"
                }
            }
        ]
    };

     //Configuration for pipeline chart 
    $scope.pipelineChartConfig = {
        "type":"hfunnel",
        "id": "Pipeline", 
        "background-color":"#fff",
        "border-color":"#E9EFF2",
        "border-width":"1px",
        "border-radius":"4px",
        "title":{
            "margin-top":"7px",
            "margin-left":"12px",
            "text":"CURRENT PIPELINE",
            "background-color":"none",
            "shadow":0,
            "text-align":"left",
            "font-family":"Arial",
            "font-size":"11px",
            "font-color":"#707d94"
        },
        "plot":{
            "animation":{
                "effect":"ANIMATION_FADE_IN"
            }, 
            "min-exit": "15%", 
            "value-box": {
                "text": "%v",
                "placement": "in",
                "font-color": "white",
                "font-size": 12,
                "font-weight": "normal"
            },
             "thousands-separator": ","
        },
        "plotarea":{
            //"margin":"5px 5px 5px 5px",  
            "adjust-layout":true
        },
         "scale-y":{
             "labels":[]
         },
        "series": []
    };

    //Configuration for monthly results 
    $scope.monthlyChartConfig = {
        "id": "Monthly", 
        "type":"mixed",
        "background-color":"#fff",
        "border-color":"#E9EFF2",
        "border-width":"1px",
        "border-radius":"4px",
        "-webkit-box-shadow":"0 1px 1px rgba(0,0,0,.1)",
        "height":"100%",
        "width":"100%",
        "title":{
            "margin-top":"7px",
            "margin-left":"9px",
            "font-family":"Arial",
            "text":"FORECAST",
            "background-color":"none",
            "shadow":0,
            "text-align":"left",
            "font-size":"11px",
            "font-weight":"bold",
            "font-color":"#8391a5"
        },
        "legend": {
        "layout": "float",
        "adjust-layout":true,
        "background-color": "none",
        "align":"center",
        "border-width": 0,
        "shadow": 0
        },
        "scale-y":{
            "values":"0:150:30",
            "line-color":"none",
            "tick":{
                "visible":false
            },
            "item":{
                "font-color":"#8391a5",
                "font-family":"Arial",
                "font-size":"10px",
                "padding-right":"5px"
            },
            "guide":{
                "rules":[
                    {
                 "rule":"%i == 0",
                 "line-width":0
                    },
                    {
                        "rule":"%i > 0",
                       "line-style":"solid",
                        "line-width":"1px",
                        "line-color":"#d2dae2",
                         "alpha":0.4 
                    }
                ]
            }
        },
        "scale-y-2":{
            "values":null,  //right side scale
            "line-color":"none",
            "tick":{
                "visible":false
            },
            "item":{
                "font-color":"#8391a5",
                "font-family":"Arial",
                "font-size":"10px",
                "padding-right":"5px"
            },
            "guide":{
                "rules":[
                    {
                 "rule":"%i == 0",
                 "line-width":0
                    },
                    {
                        "rule":"%i > 0",
                       "line-style":"solid",
                        "line-width":"1px",
                        "line-color":"#d2dae2",
                         "alpha":0.4 
                    }
                ]
            }
        },
        "scale-x":{
                "items-overlap":true,
                "max-items":9999,
                "values":["Jan","Feb","Mar","Apr ","May","June","July","Aug", "Sep", "Oct", "Nov", "Dec"],
                "offset-y":"1px",
                "line-color":"#d2dae2",
                "item":{
                    "font-color":"#8391a5",
                    "font-family":"Arial",
                    "font-size":"11px",
                    "padding-top":"2px"
                },
                "tick":{
                    "visible":false,
                    "line-color":"#d2dae2"
                },
                "guide":{
                    "visible":false
                }
        },
        "plotarea":{
            "margin":"45px 45px 45px 45px"
        },
        "plot":{
                "bar-width":"50px",
                "exact":true,
                "hover-state":{
                    "visible":false
                },
                "animation":{
                    "effect":"ANIMATION_FADE_IN"
                },
                "tooltip":{
                    "font-color":"#fff",
                    "font-family":"Arial",
                    "font-size":"11px",
                    "border-radius":"6px",
                    "shadow":false,
                    "padding":"5px 10px"
                }
        },
        "series":[
                {  
                    "type": "area",   //cummulative totals area
                    "text": "Total $", 
                    "stack-type":"normal", 
                    "background-color":"#bdc3c7", 
                    "line-color":"#bdc3c7", 
                    "marker":{ /* Marker object */
                        "background-color":"#bdc3c7", /* hexadecimal or RGB value */
                        "size":3, /* in pixels */
                    },
                    "scales":"scale-x,scale-y-2", 
                    "alpha-area": .7, 
                    "values":[]
                    //"values":[45,130,170,230,320,390]
                },
                 {
                    "type": "bar",
                    "stacked": true, 
                    "text": "Mobile",
                    "values": [10,20,10,15,20, 15],                    
                    "background-color":"#67E1F5"
                },
                {
                    "type": "bar",
                    "stacked": true, 
                    "text": "Mobile Opps",
                    "legend-item":{
                        "visible": false
                    },
                    "legend-marker":{
                        "visible": false
                    },
                    "values": [null, null, null, null, null, null, 20,30,35,40,35, 35],                    
                    "background-color":"#67E1F5", 
                    "alpha": .3, 
                     "scales":"scale-x,scale-y",

                },  
                {
                    "type": "bar",
                    "stacked": true, 
                    "text": "Media",
                    "values": [15,25,10,15,30,25],                    
                    "background-color":"#27D39A"
                },
                {
                    "type": "bar",
                    "stacked": true, 
                    "text": "Media Opps",
                    "legend-item":{
                        "visible": false
                    },
                    "legend-marker":{
                        "visible": false
                    },
                    "values": [null, null, null, null, null,null, 15,15,30,35,20,25],                    
                    "background-color":"#27D39A", 
                    "alpha": .3, 
                     "scales":"scale-x,scale-y",
                },
                {
                    "type": "bar",
                    "stacked": true, 
                    "text": "Mail",
                    "values": [10,20,10,15,20, 15],                    
                    "background-color":"#F0E561"
                }, 
                 {
                    "type": "bar",
                    "stacked": true, 
                    "text": "Mail Opps",
                    "legend-item":{
                        "visible": false
                    },
                    "legend-marker":{
                        "visible": false
                    },
                    "values": [null, null, null, null, null,null,20,10,30,10,20, 35],                    
                    "background-color":"#F0E561", 
                    "alpha": .3, 
                     "scales":"scale-x,scale-y",
                }, 
                 {
                    "type": "bar",
                    "stacked": true, 
                    "text": "Other",
                    "values": [10,20,10,15,20, 15],                    
                    "background-color":"#F4B664"
                }, 
                 { //Pipeline Projection -- green 
                  "type":"line", 
                  "line-color":"#2ecc71", 
                  "marker":{ /* Marker object */
                    "background-color":"#2ecc71", /* hexadecimal or RGB value */
                    "size":3, /* in pixels */
                    }, 
                    "scales":"scale-x,scale-y-2",
                    "values":[null, null, null, null, null, 390, 470, 550, 610, 710, 825, 950],
                     "text": "Forecast"
                },
                {   //Monthly Quota 
                    "type":"line", 
                    "line-color":"transparent",
                    "legend-item":{
                        "visible": false
                    },
                    "legend-marker":{
                        "visible": false
                    },
                    "marker":{ /* Marker object */
                    "type":"star4",
                    "background-color":"#f1c40f", /* hexadecimal or RGB value */
                    "border-width":"0px",
                    "size":4, /* in pixels */
                    }, 
                    "line-style": "dashed",
                    "scales":"scale-x,scale-y",
                    "values":[],
                     "text": "Quota",
                     "alpha": .5
                },

                { 
                  "type":"line", 
                  "line-color":"#f1c40f", 
                  "marker":{ /* Marker object */
                    "background-color":"#f1c40f", /* hexadecimal or RGB value */
                    "size":3, /* in pixels */
                    }, 
                    "line-style": "dashed",
                    "scales":"scale-x,scale-y-2",
                    "values":[75,150,225,300,375,450,525,600,675,750,825,900],
                     "text": "Quota", 
                     "alpha": .5
                },   
            ]
    }; 


})