/*
	@license Angular Panels version 1.0.3
	ⓒ 2015 AHN JAE-HA http://github.com/eu81273
	License: MIT

*/

(function ( angular ) {
	"use strict";

	var module = angular.module( "angular.panels", [] );

	module.constant("panelList", {});
	module.provider("panels", ["panelList", function (panelList) {

		//add panels in config
		this.add = function (panel) {

			//add panel
			if (panel && panel.id) {
				panelList[panel.id] = panel;
			}

			//for chaining
			return this;
		};

		//factory
		this.$get = ['$parse', function ($parse) {
			//document body selector
			var documentBody = angular.element(document.body);
			
			//panels factory
			var panelsFactory = {
				//current opened panel's id
				opened: undefined,

				//panel open method
				open: function (id) {
					//add body overflow hid