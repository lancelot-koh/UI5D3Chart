//"use strict";
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	var PieChartItem = sap.ui.core.Element.extend("gogemba.controls.PieChartItem", { 
			metadata : {
				properties : {
					"category" : {type : "string", group : "Misc", defaultValue : null},
					"value" : {type : "integer", group : "Misc", defaultValue : 0}
				}
			}
	});

	return PieChartItem;
}, /* bExport= */ true);

//"use strict";
sap.ui.define(['jquery.sap.global', 'sap/ui/thirdparty/d3'],
	function(jQuery, d31) {
	"use strict";

	var PieChart = sap.ui.core.Control
		.extend("gogemba.controls.PieChart", {
				metadata : {
					properties: {
						"title": {type : "string", group : "Misc", defaultValue : "Chart Title"}
					},
					aggregations : {
						"items" : { type: "gogemba.controls.PieChartItem", multiple : true, singularName : "item"}
					},
					defaultAggregation : "items"
				},
				
				init : function() {
					this.sParentId = "";
					this.dateset = null;
				},

				createChart : function() {
					/*
					 * Called from renderer
					 */
					console.log("gogemba.controls.PieChart.createChart()");
					var oChartLayout = new sap.m.VBox({alignItems:sap.m.FlexAlignItems.Center,justifyContent:sap.m.FlexJustifyContent.Center});
					var oChartFlexBox = new sap.m.FlexBox({height:"auto",alignItems:sap.m.FlexAlignItems.Center});
					/* ATTENTION: Important
					 * This is where the magic happens: we need a handle for our SVG to attach to. We can get this using .getIdForLabel()
					 * Check this in the 'Elements' section of the Chrome Devtools: 
					 * By creating the layout and the Flexbox, we create elements specific for this control, and SAPUI5 takes care of 
					 * ID naming. With this ID, we can append an SVG tag inside the FlexBox
					 */
					this.sParentId = oChartFlexBox.getIdForLabel();
					oChartLayout.addItem(oChartFlexBox);
					
					return oChartLayout;
				},
				
				/**
				 * The renderer render calls all the functions which are necessary to create the control,
				 * then it call the renderer of the vertical layout 
				 * @param oRm {RenderManager}
				 * @param oControl {Control}
				 */
				renderer : function(oRm, oControl) {
					var layout = oControl.createChart();

					oRm.write("<div");
					oRm.writeControlData(layout); // writes the Control ID and enables event handling - important!
					oRm.writeClasses(); // there is no class to write, but this enables 
					// support for ColorBoxContainer.addStyleClass(...)
					
					oRm.write(">");
					oRm.renderControl(layout);
					oRm.addClass('verticalAlignment');

					oRm.write("</div>");
				},
				
				onAfterRendering: function(){
					var cItems = this.getItems();
					var data = [];
					for (var i = 0; i < cItems.length; i++){
						var oEntry = {};
						for (var j in cItems[i].mProperties) {
							oEntry[j] = cItems[i].mProperties[j];
						}					
						data.push(oEntry);
					}
					this.dateset = data;
					
					/*
					 * ATTENTION: See .createChart()
					 * Here we're picking up a handle to the "parent" FlexBox with the ID we got in .createChart()
					 * Now simply .append SVG elements as desired
					 * EVERYTHING BELOW THIS IS PURE D3.js
					 */
					
					this.drawChart(false);
					var dom = jQuery.sap.domById(this.oParent.sId);	
					sap.ui.core.ResizeHandler.register(dom, jQuery.proxy(this.onResize, this));
				},
				
				onResize : function() {
					this.drawChart(true);
				},

				drawChart : function(redraw) {
					var width = jQuery.sap.byId(this.oParent.sId).width();
					var height = jQuery.sap.byId(this.oParent.sId).height();

					var margin = {top: 20, right: 20, bottom: 20, left: 20};
					width = width - margin.left - margin.right;
					height = height - margin.top - margin.bottom;

					var vis = d3.select("#" + this.sParentId);
					if (redraw){
						d3.select("#" + this.sParentId+ " svg").remove();
					}

					var data = this.dateset;

					var radius = Math.min(width, height) / 2;
					var color = d3.scale.ordinal()
						.range(["#00B050", "#92D050", "#FFFF00", "#FFC000", "#FF0000"]);
					var arc = d3.svg.arc()
						.outerRadius(radius - 10)
						.innerRadius(radius - radius / 2);
					var pie = d3.layout.pie()
						.sort(null)
						.value(function(d) { return d.value; });
					
					var svg = vis.append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.style("background-color","white")
					.append("g")
					.attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");

					data.forEach(function(d) {
						d.percent += d.Value;

						//if (error) throw error;
						var g = svg.selectAll(".arc")
							.data(pie(data))
							.enter().append("g")
							.style("font","15px sans-serif")
							.style("text-anchor","middle");
						g.append("path")
							.attr("d", arc)
							.style("stroke","#fff")
							.style("fill", function(d) { return color(d.data.category); });
						g.append("text")
							.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
							.attr("dy", ".35em")
							.text(function(d) { return d.data.category; });
					});
				}
			}
		);

	return PieChart;
}, /* bExport= */ true);
