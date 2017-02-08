jQuery.sap.declare("gogemba.dev.devapp");
jQuery.sap.require("gogemba.dev.devlogon");
jQuery.sap.require("sap.ui.core.routing.Router");

gogemba.dev.devapp = {
	smpInfo: {},
	isLoaded: false,
	isOnline: false,
	definedStore: {},

	beaconRegions : null,
	detectedBeacons : [],

	//Application Constructor
	initialize: function() {
		this.bindEvents();
	},

	//========================================================================
	// Bind Event Listeners
	//========================================================================
	bindEvents: function() {
		//add an event listener for the Cordova deviceReady event.
		document.addEventListener("deviceready", jQuery.proxy(this.onDeviceReady, this), false);
		document.addEventListener("online", jQuery.proxy(this.deviceOnline, this), false);
		document.addEventListener("offline", jQuery.proxy(this.deviceOffline, this), false);
	},

	//========================================================================
	//Cordova Device Ready
	//========================================================================
	onDeviceReady: function() {
		console.log("onDeviceReady");
		var that = this;

		if (window.sap_webide_FacadePreview) {
			startApp();
		} else {
			//get offline definingRequests
			$.getJSON("manifest.json", function(desData) {
				var def = desData["sap.mobile"]["definingRequests"];
				for (var o in def) {
					if (def[o]["dataSource"] === "mainService") {
						that.definedStore[o] = def[o]["path"];
					}
				}

				$.getJSON("dev/service.json", function(data) {
					if (data) {
						if (data.logon) {
							that.smpInfo.server = data.host;
							that.smpInfo.port = data.port;
							that.smpInfo.appID = data.appID;
						}
						//check cordova plugin 
						if (data.device && data.network) {
							that.offline = true;
							if (navigator.connection.type != Connection.NONE) {
								that.isOnline = true;
							}
						} else {
							that.offline = false;
							//pop up message box to show the fatal error
							alert("Cordova device or network plugin is not selected. \n Offline function is disabled.")
						}
					}

					if (that.smpInfo.server && that.smpInfo.server.length > 0) {
						var context = {
							"serverHost": that.smpInfo.server,
							"https": data.https,
							"serverPort": that.smpInfo.port
						};
						that.devLogon = new gogemba.dev.devlogon();
						// For Fiori Mobile build - Disable Logon and start App
						// startApp();
						that.devLogon.doLogonInit(context, that.smpInfo.appID);
					} else {
						startApp();
					}
				});
			});
		}

		/*if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				that.getBeaconList(position.coords.latitude, position.coords.longitude);
			}, function(error) {
				that.getBeaconList();
			}, {maximumAge:600000, timeout:5000, enableHighAccuracy: true});
		}
		else*/ {
			this.getBeaconList();
		}
	},

	//========================================================================
	//Cordova deviceOnline event handler
	//========================================================================
	deviceOnline: function() {
		console.log("deviceOnline");
		//sap.m.MessageToast.show("Device is Online", { duration: 1000});
		if (this.isLoaded && this.deviceModel) {
			this.deviceModel.setProperty("/isOffline", false);
		}
		this.isOnline = true;
	},

	//========================================================================
	//Cordova deviceOffline event handler
	//========================================================================
	deviceOffline: function() {
		console.log("deviceOffline");
		//sap.m.MessageToast.show("Device is Offline", { duration: 1000});
		if (this.isLoaded && this.deviceModel) {
			this.deviceModel.setProperty("/isOffline", true);
		}
		this.isOnline = false;
	},
	
	onNavBack:function(){
		this.router.myNavBack();

		var settingsButton = document.getElementById("settings");
		//settingsButton.style.display = "none";

		var backButton = document.getElementById("back");
		//backButton.style.display = "none";
	},
	
	onSettings:function(){
		
	},
	
	onLocation:function(){
		var oHistory = sap.ui.core.routing.History.getInstance();
		var view = oHistory.iHistoryPosition == 0 ? this.router.getView("gogemba.view.Overview") : this.router.getView("gogemba.view.Detail");

		var oModel = view.getModel("json");
		var machineData = oModel.oData.Machine;

		var oDetailModel = view.getModel("detail");
		oDetailModel.oData = [machineData[0]];
		
		if (oHistory.iHistoryPosition == 0) {
			this.router.navTo("detail", null, false);
		}
		else if (oHistory.iHistoryPosition == 1) {
			view.getController().onBeforeShow({"direction" : "to" })
		}
	},
	
	//========================================================================
	// Beacon Plugin
	//========================================================================

	getBeaconList : function(latitude, longitude) {
		var that = this;
		// For Fiori Mobile build - Need to create a destination and use the virtual path - /destinations/bmp/regions/search
		// For Mobile Build - Need to create an application connection in HCPms and use the virtual path - ../com.sap.gogemba.bmp/regions/search
		var url = "https://bmpp1941708244trial.hanatrial.ondemand.com/bmp/regions/search";
		if (latitude !== undefined && longitude !== undefined) {
			url += ("?latitude=" + latitude + "&longitude=" + longitude);
		}
		// get beacon info from Beacon Management Service
		jQuery.ajax({
			url : url,
			async : true,
			cache: false,
			success : function(data, textStatus, xhr) {
				// Support offline
				if (typeof(Storage) !== "undefined") {
					localStorage.setItem("BeaconRegions", JSON.stringify(data));
				}

				that.parseBeaconList(data);
				that.startMonitoringAndRanging();
			},
			error : function(xhr, textStatus, e) {
				jQuery.sap.log.warning(e.message);
			
				if (typeof(Storage) !== "undefined") {
					var data = JSON.parse(localStorage.getItem("BeaconRegions"));

					that.parseBeaconList(data);
					that.startMonitoringAndRanging();
				}
			}
		});
	},
	
	parseBeaconList : function(data) {
		this.beaconRegions = [];
		var region, beacon;
		for (var i in data) {
			for (var j in data[i].assignedBeacons) {
				region = {};
				beacon = data[i].assignedBeacons[j];
				region.id = beacon.beaconId;
				region.name = beacon.name;
				region.uuid = beacon.guid;
				region.major = beacon.major;
				region.minor = beacon.minor;
				region.xPosition = beacon.xPosition;
				region.yPosition = beacon.yPosition;
				this.beaconRegions[this.getBeaconId(region)] = region;
			}
		}
	},
	
	startMonitoringAndRanging : function() {
		if (!cordova.plugins.locationManager) {
			return;
		}
		
		function onDidDetermineStateForRegion(result) {
			if (result.state === "CLRegionStateOutside") {
				var beaconRegion = gogemba.dev.devapp.beaconRegions[gogemba.dev.devapp.getBeaconId(result.region)];
				beaconRegion.accuracy = -1;
				beaconRegion.proximity = "Unknown";
			}
		}

		function onDidRangeBeaconsInRegion(result) {
			gogemba.dev.devapp.updateNearestBeacon(result.beacons);
		}

		function onError(errorMessage) {
			jQuery.sap.log.error('Monitoring beacons did fail: ' + errorMessage);
		}

		// Request permission from user to access location info.
		cordova.plugins.locationManager.requestAlwaysAuthorization();

		// Create delegate object that holds beacon callback functions.
		var delegate = new cordova.plugins.locationManager.Delegate();
		cordova.plugins.locationManager.setDelegate(delegate);

		// Set delegate functions.
		delegate.didDetermineStateForRegion = onDidDetermineStateForRegion;
		delegate.didRangeBeaconsInRegion = onDidRangeBeaconsInRegion;

		// Start monitoring and ranging beacons.
		this.startMonitoringAndRangingRegions(this.beaconRegions, this.onError);
	},

	startMonitoringAndRangingRegions : function(regions, errorCallback) {
		// Start monitoring and ranging regions.
		for (var i in regions) {
			this.startMonitoringAndRangingRegion(regions[i], errorCallback);
		}
	},

	startMonitoringAndRangingRegion : function(region, errorCallback) {
		// Create a region object.
		var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
			region.id,
			region.uuid,
			region.major,
			region.minor);

		// Start ranging.
		cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
			.fail(errorCallback)
			.done();

		// Start monitoring.
		cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
			.fail(errorCallback)
			.done();
	},

	stopMonitoringAndRanging : function() {
		// Start monitoring and ranging beacons.
		this.stopMonitoringAndRangingRegions(this.beaconRegions, this.onError);
	},
	
	stopMonitoringAndRangingRegions : function(regions, errorCallback) {
		// Start monitoring and ranging regions.
		for (var i in regions) {
			this.stopMonitoringAndRangingRegion(regions[i], errorCallback);
		}
	},

	stopMonitoringAndRangingRegion : function(region, errorCallback) {
		// Create a region object.
		var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
			region.id,
			region.uuid,
			region.major,
			region.minor);

		// Start ranging.
		cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
			.fail(errorCallback)
			.done();

		// Start monitoring.
		cordova.plugins.locationManager.stopMonitoringForRegion(beaconRegion)
			.fail(errorCallback)
			.done();
	},

	getBeaconId : function(beacon) {
		return beacon.uuid.toUpperCase() + ':' + beacon.major + ':' + beacon.minor;
	},

	isSameBeacon : function(beacon1, beacon2) {
		return this.getBeaconId(beacon1).toUpperCase() === this.getBeaconId(beacon2).toUpperCase();
	},

	isNearerThan : function(beacon1, beacon2) {
		return beacon1.accuracy > 0
			&& beacon2.accuracy > 0
			&& beacon1.accuracy < beacon2.accuracy;
	},

	updateNearestBeacon : function(beacons) {
		for (var i in beacons) {
			var beacon = beacons[i];
			var beaconRegion = this.beaconRegions[this.getBeaconId(beacon)];

			// Round up to 1 decimal place
			beaconRegion.accuracy = Math.round(beacon.accuracy * 10) /10;
			beaconRegion.proximity = beacon.proximity;
			this.detectedBeacons[beaconRegion.name] = beaconRegion;
		}
	},
	
	getTrilateration : function(position1, position2, position3) {
		var xa = position1.x;
		var ya = position1.y;
		var xb = position2.x;
		var yb = position2.y;
		var xc = position3.x;
		var yc = position3.y;
		var ra = position1.distance;
		var rb = position2.distance;
		var rc = position3.distance;

		var S = (Math.pow(xc, 2.) - Math.pow(xb, 2.) + Math.pow(yc, 2.) - Math.pow(yb, 2.) + Math.pow(rb, 2.) - Math.pow(rc, 2.)) / 2.0;
		var T = (Math.pow(xa, 2.) - Math.pow(xb, 2.) + Math.pow(ya, 2.) - Math.pow(yb, 2.) + Math.pow(rb, 2.) - Math.pow(ra, 2.)) / 2.0;
		var y = ((T * (xb - xc)) - (S * (xb - xa))) / (((ya - yb) * (xb - xc)) - ((yc - yb) * (xb - xa)));
		var x = ((y * (ya - yb)) - T) / (xb - xa);

		return {
			x: x,
			y: y
		};
	},

	getDirection : function(p1, p2) {
		var delta = {x:p2.x - p1.x, y:p2.y - p1.y};	

		// angle in degrees
		var angleDeg = Math.atan2(-delta.x, delta.y) * 180 / Math.PI;
		angleDeg *= -1;
		
		if (angleDeg < 0) {
			angleDeg += 360;
		}
		
		return Math.round(angleDeg);
	},

	getPosition : function(data) {
		var count = Object.keys(this.detectedBeacons).length;
		
		if (count > 2) {
			var xTotal = data[0].XPosition + data[1].XPosition + data[2].XPosition;
			var yTotal = data[0].YPosition + data[1].YPosition + data[2].YPosition;

			if (xTotal + yTotal > 0 && data[2].Accuracy !== -1 && data[1].Accuracy !== -1 && data[0].Accuracy !== -1) {
				var position1 = {x:data[0].XPosition, y:data[0].YPosition, distance:data[0].Accuracy};
				var position2;
				var position3;
				if (data[1].XPosition != data[0].XPosition) {
					position2 = {x:data[1].XPosition, y:data[1].YPosition, distance:data[1].Accuracy};
					position3 = {x:data[2].XPosition, y:data[2].YPosition, distance:data[2].Accuracy};
				}
				else {
					position3 = {x:data[1].XPosition, y:data[1].YPosition, distance:data[1].Accuracy};
					position2 = {x:data[2].XPosition, y:data[2].YPosition, distance:data[2].Accuracy};
				}
	
				return this.getTrilateration(position1, position2, position3);
			}
			else {
				return null;
			}
		}
		else if (count === 2) {
			return null;
		}
		else {
			return null;
		}
	}

};