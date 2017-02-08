jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("app.Login", {
	btnClicked: function(){
		var username = this.byId('username').getValue();
		var password = this.byId('password').getValue();
		
		var that = this;
		$.getJSON("../project.json", function(data) {
			if (data && data.hybrid && data.hybrid.plugins.kapsel.logon.selected) {
				var server = data.hybrid.msType === 0 ? data.hybrid.hcpmsServer : data.hybrid.server;
				var port = data.hybrid.msType === 0 ? "443" : data.hybrid.port;
				var appID = data.hybrid.appid;

				var context = {
						"serverHost": server,
						"https": "true",
						"serverPort": port,
						"user": username, 
						"password": password,
						"communicatorId": "REST",
				};
				sap.ui.core.BusyIndicator.show(0);
				sap.Logon.init(jQuery.proxy(that.onLogonInitSuccess, that), jQuery.proxy(that.onLogonError, that), appID, context, that.getCustomLogonView());
		}});
	},

	onLoginInfoChanged: function(evt) {
		var username = this.byId("username").getValue().trim();
		var password = this.byId("password").getValue().trim();
		if (username.length > 0 && password.length> 0) {
			this.byId("login").setEnabled(true);
		}
		else {
			this.byId("login").setEnabled(false);
		}
	},

	getCustomLogonView:function() {
		var logonView = sap.logon.IabUi; // Template for Logon view definitions

		logonView.onShowScreen = this.customShowScreen; // Set data automatically when SAP Logon screen would pop up
		logonView.onShowNotification = this.customShowNotification;  // On error, reject the deferred
		return logonView;
	},

	
	onLogonInitSuccess:function(result) {
		jQuery.sap.delayedCall(3000, this, function(){
			sap.ui.core.BusyIndicator.hide();
			window.history.go(-1);
		});
	},
	
	onLogonError:function(error) {   //this method is called if the user cancels the registration.
		sap.ui.core.BusyIndicator.hide();

		sap.m.MessageBox.show(
				error, {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: this.getView().getModel("i18n").getResourceBundle().getText("LOG_IN"),
				actions: [sap.m.MessageBox.Action.OK],
				onClose: function(oAction) { / * do something * / }
			}
		);
	},

	customShowScreen:function(screenId, screenEvents, currentContext) {
		if (screenId =="SCR_UNLOCK") {
			screenEvents.onsubmit(context);
			return true;
		}
		if (screenId =="SCR_REGISTRATION") {
			screenEvents.onsubmit(currentContext.registrationContext);
			return true;
		}
		// Submit passcode form without passcode
		if (screenId =="SCR_SET_PASSCODE_OPT_OFF") {
			var context = {};
			screenEvents.onsubmit(context);
			return true;
		}
		// Disable passcode
		if (screenId =="SCR_SET_PASSCODE_OPT_ON") {
			screenEvents.ondisable();
			return true;
		}
		return false;  //skip the default value
	 },

	 customShowNotification:function(screenId, notificationKey) {
		 if (screenId == "SCR_SSOPIN_SET" || screenId == "SCR_UNLOCK" || screenId == "SCR_REGISTRATION" || screenId == "SCR_SET_PASSCODE_MANDATORY" || screenId == "SCR_SET_PASSCODE_OPT_ON" || screenId == "SCR_SET_PASSCODE_OPT_OFF" ) {
			sap.ui.core.BusyIndicator.hide();
		
			sap.m.MessageBox.show(
					sap.ui.getCore().getModel("i18n").getResourceBundle().getText(notificationKey), {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: sap.ui.getCore().getModel("i18n").getResourceBundle().getText("LOG_IN"),
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function(oAction) { / * do something * / }
				}
			);
			return true;
		 }
		 return false;
	 }
});