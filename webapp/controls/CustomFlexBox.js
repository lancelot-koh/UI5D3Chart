//"use strict";
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	var CustomFlexBox = sap.m.FlexBox
		.extend("gogemba.controls.CustomFlexBox", {
				metadata : {
					properties : {
						"status":  {type : "string", group : "Misc", defaultValue : null}
					},
				},
				
				onAfterRendering : function() {
					if (this._styleClass) {
						this.removeStyleClass(this._styleClass);
					}
					var styleClass;
					switch (this.getStatus()) {
						case "down" : 
							styleClass = "sapHATCHBoxStatusDown";
							break;
						case "running" : 
							styleClass = "sapHATCHBoxStatusRunning";
							break;
						case "set up" : 
							styleClass = "sapHATCHBoxStatusSetup";
							break;
						case "idle" : 
							styleClass = "sapHATCHBoxStatusIdle"; 
							break;
						default:
							styleClass = "sapHATCHBoxStatusDown";
							break;
					}

					this.addStyleClass(styleClass);
					this._styleClass = styleClass;
				}
			}
		);

	return CustomFlexBox;
}, /* bExport= */ true);
