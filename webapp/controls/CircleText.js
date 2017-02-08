//"use strict";
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	var CustomHBox = sap.ui.core.Control
		.extend("gogemba.controls.CircleText", {
				metadata : {
					properties : {
						"text" : {type : "string", group : "Misc", defaultValue : null},
						"height":  {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},
						"width" :  {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},
						"status":  {type : "string", group : "Misc", defaultValue : null},
						"selected":  {type : "boolean", group : "Misc", defaultValue : false}
					}
				},
				
				init : function() {
					this._imagesFolder = jQuery.sap.getModulePath("gogemba") + "/images/";
				},
				
				_getStatusStyleClass:function(){
					var styleClass;
					if (this.getSelected()) {
						styleClass = "sapHATCTSeleted";
					}
					else {
						switch (this.getStatus()) {
							case "down" : 
								styleClass = "sapHATCTStatusDown";
								break;
							case "running" : 
								styleClass = "sapHATCTStatusRunning";
								break;
							case "set up" : 
								styleClass = "sapHATCTStatusSetup";
								break;
							case "idle" : 
								styleClass = "sapHATCTStatusIdle"; 
								break;
							default:
								styleClass = "sapHATCTStatusDown";
								break;
						}
					}
					
					return styleClass;
				},
				
				_getLocationImage:function(){
					if (this.getSelected()) {
						return "white_location.png"; 
					}
					else {
						switch(this.getStatus())
						{
							case "down":
								return "brown_location.png"; 
							case "set up":
								return "yellow_location.png"; 
								
							case "running":
								return "green_location.png"; 
							
							case "idle":
								return "blue_location.png"; 
								
						}
					}
				},
				
				renderer : function(oRm, oControl){	
					var styleClass = oControl._getStatusStyleClass();
					oRm.write("<div class=\"sapHATCT "  + styleClass + "\""); 
					oRm.writeControlData(oControl);	// writes the Control ID and enables event handling - important!
					oRm.writeClasses();				// there is no class to write, but this enables 
					
					var height=  oControl.getHeight();
					height = height ? height : "50px";
					oRm.addStyle("height", height);
					
					var width = oControl.getWidth();
					width = width ? width : "50px";
					oRm.addStyle("width", width);
					oRm.writeStyles();
					oRm.write(">");
					
					var imageName = oControl._getLocationImage();
					oRm.write("<image src='"+ oControl._imagesFolder + imageName +  "'\>"); 
					oRm.write("<div class=\"sapHATCTText\" >"); 
					oRm.write(oControl.getText());
					oRm.write("</div>"); 
					oRm.write("</div>"); // end of the complete Control
				}
			}
		);

	return CustomHBox;
}, /* bExport= */ true);
