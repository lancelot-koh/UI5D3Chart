//"use strict";
sap.ui.define(['jquery.sap.global', 'sap/m/FlexBoxRenderer'],
	function(jQuery, FlexRenderer) {
	"use strict";

	var CustomFlexRenderer = sap.ui.core.Renderer
		.extend("gogemba.controls.CustomFlexBoxRenderer", {
				render : function(oRm, oControl) {
					FlexRenderer.render.call(this, oRm, oControl);
				}
			}
		);

	return CustomFlexRenderer;
}, /* bExport= */ true);
