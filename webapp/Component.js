jQuery.sap.declare("gogemba.Component");
jQuery.sap.require("gogemba.dev.devapp");
jQuery.sap.require("gogemba.MyRouter");

sap.ui.core.UIComponent.extend("gogemba.Component", {
	metadata: {
		manifest: "json"
	},

	/**
	 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
	 * In this method, the resource and application models are set and the router is initialized.
	 */
	init: function() {
		var oModel, appContext, sServiceUrl, sConfirmationServiceUrl;
		//create odata model for kapsel application
		var param = {
			"json": true,
			loadMetadataAsync: true
		};

		if (window.cordova && !window.sap_webide_FacadePreview && !window.sap_webide_companion) {
			if (gogemba.dev.devapp.devLogon) {
				appContext = gogemba.dev.devapp.devLogon.appContext;
			}
			sServiceUrl = appContext.applicationEndpointURL + "/";
			var oHeader = {
				"X-SMP-APPCID": appContext.applicationConnectionId
			};
			if (appContext.registrationContext.user) {
				oHeader.Authorization = "Basic " + btoa(appContext.registrationContext.user + ":" + appContext.registrationContext.password);
			}
			param.headers = oHeader;
		} else {
			var appMeta = this.getMetadata().getManifestEntry("sap.app");
			sServiceUrl = appMeta.dataSources.mainService.uri;
			sConfirmationServiceUrl = appMeta.dataSources.comfirmationService.uri;
		}
		
		/*var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, param);
		oModel.setDefaultBindingMode("TwoWay");
		this.setModel(oModel);
		
		var oConfirmationModel = new sap.ui.model.odata.ODataModel(sConfirmationServiceUrl, param);
		oModel.setDefaultBindingMode("TwoWay");
		this.setModel(oConfirmationModel, "confirmation");*/

		var oJSONModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("gogemba") + "/model/gogemba.json");
		this.setModel(oJSONModel, "json");

		var oDetailModel = new sap.ui.model.json.JSONModel();
		this.setModel(oDetailModel, "detail");

		// set device model
		var oDeviceModel = new sap.ui.model.json.JSONModel({
			isTouch: sap.ui.Device.support.touch,
			isNoTouch: !sap.ui.Device.support.touch,
			isPhone: sap.ui.Device.system.phone,
			isNoPhone: !sap.ui.Device.system.phone,
			listMode: sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
			listItemType: sap.ui.Device.system.phone ? "Active" : "Inactive",
			isOffline: !gogemba.dev.devapp.isOnline
		});
		oDeviceModel.setDefaultBindingMode("OneWay");
		this.setModel(oDeviceModel, "device");

		if (window.cordova) {
			gogemba.dev.devapp.deviceModel = oDeviceModel;
		}

		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		this.getRouter().initialize();
		gogemba.dev.devapp.router = this.getRouter();
		
		jQuery.sap.includeStyleSheet(jQuery.sap.getModulePath("gogemba.css.style",".css"));
	}
});