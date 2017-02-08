//"use strict";
sap.ui.define(['jquery.sap.global', 'gogemba/util/Controller'],
	function(jQuery, Controller) {

	var App = Controller.extend("gogemba.controller.App", {
		onInit : function () {
			var app = this.getView().byId("customContent");
			app.setBackgroundImage(jQuery.sap.getModulePath("gogemba") + "/images/background.jpg");
			
			this._createFooterButtons();
		},
		
		onExit: function() {
			var elem = document.getElementById("location");
			elem.parentNode.removeChild(elem);
			
			elem = document.getElementById("settings");
			elem.parentNode.removeChild(elem);
			
			elem = document.getElementById("back");
			elem.parentNode.removeChild(elem);
			
			sap.ui.core.ResizeHandler.deregister(this._resizeHandler);
		},

		onAfterRendering : function() {
			this._resize();
			
			var dom = this.getView().getDomRef();	
			sap.ui.core.ResizeHandler.register(dom, jQuery.proxy(this._resize, this));
		},
		
		_resize : function() {
			var width = window.innerWidth;
			var height = window.innerHeight;
			
			var settingsButton = document.getElementById("settings");
			settingsButton.style.left = 10 + "px";
			settingsButton.style.top = (height - 70) + "px";
	
			var locationButton = document.getElementById("location");
			locationButton.style.left = ((width - 75) / 2) - 5 + "px";
			locationButton.style.top = (height - 62)  - 10 + "px";
	
			var backButton = document.getElementById("back");
			backButton.style.left = width - 50  + "px";
			backButton.style.top = (height - 70) + "px";
		},
		
		_createFooterButtons : function() {
			var elem = document.getElementsByTagName("body")[0];
			
			var settingsButton = this._createButton("settings", "gogemba.dev.devapp.onSettings()");
			settingsButton.style.display = "none";
			elem.appendChild(settingsButton);

			var locationButton = this._createButton("location", "gogemba.dev.devapp.onLocation()");
			elem.appendChild(locationButton);
	
			var backButton = this._createButton("back", "gogemba.dev.devapp.onNavBack()");
			backButton.style.display = "none";
			elem.appendChild(backButton);
		},
		
		_createButton : function(id, onclick) {
			var rootPath = jQuery.sap.getModulePath("gogemba");
			var elem = document.createElement("input");
			elem.setAttribute("type", "image");
			elem.setAttribute("id", id);
			elem.setAttribute("src", rootPath + "/images/" + id + ".png");
			elem.setAttribute("onclick", onclick);
			elem.style.position="absolute";
			return elem;
		}
	});
	
	return App;
}, /* bExport= */ true);
