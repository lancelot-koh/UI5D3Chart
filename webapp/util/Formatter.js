jQuery.sap.declare("gogemba.util.Formatter");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.require("sap.ui.core.format.DateFormat");

gogemba.util.Formatter = {
	getStatusIcon : function(value) {
		var image = jQuery.sap.getModulePath("gogemba") + "/images/";
		switch (value) {
			case "down" : 
				image += "brown.png";
				break;
			case "running" : 
				image += "green.png";
				break;
			case "set up" : 
				image += "yellow.png";
				break;
			case "idle" : 
				image += "blue.png";
				break;
			default:
				image += "brown.png";
				break;
		}
		return image;
	},

	getAccuracy : function(value) {
		if (value == null || value == -1) {
			return "";
		} else {
			return value + "m";
		}
	},

	getDate : function(value) {
		var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: "yyyy-MM-dd"}); 
		var date =  oDateFormat.parse(value);

		var oDisplayDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: "dd/MM/yyyy"}); 
		return oDisplayDateFormat.format(date)
	},

	getNumber : function(value) {
		var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
		  //maxFractionDigits: 2,
		  groupingEnabled: true,
		  groupingSeparator: ",",
		  decimalSeparator: "."
		}); 
		
		return oNumberFormat.format(value)
	},
	
	getValue:function(value){
		return value;
	}
};
