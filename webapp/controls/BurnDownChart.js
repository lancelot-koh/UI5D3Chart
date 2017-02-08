//"use strict";
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	var BurnDownChartItem = sap.ui.core.Element.extend("gogemba.controls.BurnDownChartItem", { 
			metadata : {
				properties : {
					"Date" : {type : "string", group : "Misc", defaultValue : null},
					"PlannedQty" : {type : "string", group : "Misc", defaultValue : null},
					"YieldQty" : {type : "string", group : "Misc", defaultValue : null},
					"Scrap" : {type : "string", group : "Misc", defaultValue : null}
				}
			}
	});

	return BurnDownChartItem;
}, /* bExport= */ true);


//"use strict";
sap.ui.define(['jquery.sap.global', 'sap/ui/thirdparty/d3'],
	function(jQuery, d31) {
	"use strict";

	var BurnDownChart = sap.ui.core.Control
		.extend("gogemba.controls.BurnDownChart", {
			metadata : {
				properties: {
					"title": {type : "string", group : "Misc", defaultValue : ""},
					"currentDate" : {type : "string", group : "Misc", defaultValue : ""}
				},
				aggregations : {
					"items" : { type: "gogemba.controls.BurnDownChartItem", multiple : true, singularName : "item"}
				},
				defaultAggregation : "items",
				events: {
					"onPress" : {},
					"onChange":{}		
				}			
			},

			init : function() {
				console.log("gogemba.controls.BurnDownChart.init()");
				this.sParentId = "";
				this.dateset = null;
				this.svg = null;
				this.propertiesSet = [];
			},
			
			
			createChart : function() {
				/*
				 * Called from renderer
				 */
				console.log("gogemba.controls.BurnDownChart.createChart()");
				var oChartLayout = new sap.m.VBox({alignItems:sap.m.FlexAlignItems.Center,justifyContent:sap.m.FlexJustifyContent.Center});
				var oChartFlexBox = new sap.m.FlexBox({height:"auto",alignItems:sap.m.FlexAlignItems.Center});
				/* ATTENTION: Important
				 * This is where the magic happens: we need a handle for our SVG to attach to. We can get this using .getIdForLabel()
				 * Check this in the 'Elements' section of the Chrome Devtools: 
				 * By creating the layout and the Flexbox, we create elements specific for this control, and SAPUI5 takes care of 
				 * ID naming. With this ID, we can append an SVG tag inside the FlexBox
				 */
				this.sParentId=oChartFlexBox.getIdForLabel();
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
			
			_updateAggregation: function(sName, oBindingInfo) {
				if (sName === "items") {
					sap.ui.core.Element.prototype.unbindAggregation.call(this, sName); 
					sap.ui.core.Element.prototype.bindAggregation.call(this, sName, oBindingInfo); 
					sap.ui.core.Element.prototype.updateAggregation.call(this, sName); 
					sap.ui.core.Element.prototype.refreshAggregation.call(this, sName); 
				}
			},
			
			updateDataset: function() {
				var cItems = this.getItems();
				var data = [];
				for (var i=0;i<cItems.length;i++){
					var oEntry = {};
					for (var j in cItems[i].mProperties) {
						oEntry[j]=cItems[i].mProperties[j];
					}					
					data.push(oEntry);
				}
				this.dateset = data;
			},
			
			onAfterRendering : function(){
				console.log("gogemba.controls.BurnDownChart.onAfterRendering()");
				console.log(this.sParentId);
				this.updateDataset();
				
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
			
			drawChart :function(redraw) {
				
				var seriesColors = ["#1BB356", "#1175BA", "#f00"];
				var areaColors = ["#D0141A", "#008000"];
				var dotsOutterColors = ["#1BB356", "#1175BA", "#f00"];
				var dotsInnerColors = ["#fff", "#fff", "#fff"];
				var linkUrl = "www.google.com";
				var isFullChart = false;
				var title = this.getTitle() || "";
				var startxTick;
				
				var parseDate = d3.time.format("%Y-%m-%d").parse;
				
				var currentDate = parseDate(this.getCurrentDate());
				var data = this.dateset;
				
				//set properties for svg
				var width = jQuery.sap.byId(this.oParent.sId).width();
				var height = jQuery.sap.byId(this.oParent.sId).height() || 300;
				
				var vis = d3.select("#" + this.sParentId);
				if(true){
					d3.select("#" + this.sParentId+ " svg").remove();
				}
				
				var margin = {top: 10, right: 10, bottom: 10, left: 10},
				width = width - margin.left - margin.right,
				height = height - margin.top - margin.bottom;
				
				var svg = vis.append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.style("background-color","white")
					.style("font", "12px sans-serif")
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				// define scale and axis
				var x = d3.time.scale()
					.range([0, width]);

				var y = d3.scale.linear()
					.range([height, 0]);

				var xAxis = d3.svg.axis()
					.scale(x)
					.tickValues(0)
					.tickFormat(d3.time.format("%e-%b-%Y"))
					.orient("bottom");

				var yAxis = d3.svg.axis()
					.scale(y)
					.tickValues(0)
					.orient("left");

				// define draw objects
				var greenline = d3.svg.area()
					.interpolate("linear")
					.x(function(d) { return x(d._date); })
					.y(function(d) { return y(d["series1"]); });

				var yieldline = d3.svg.area()
					.interpolate("linear")
					.defined(function(d) { return !isNaN(d["series2"]); })
					.x(function(d) { return x(d._date); })
					.y(function(d) { return y(d["series2"]); });
				
				var area = d3.svg.area()
					.interpolate("linear")
					.defined(function(d) { return !isNaN(d["series2"]); })
					.x(function(d) { return x(d._date); })
					.y1(function(d) { return y(d["series1"]); });
				
				var scrapline = d3.svg.line()
					.defined(function(d) { return !isNaN(d.series3); })
					.x(function(d) { return x(d._date); })
					.y(function(d) { return y(d.series3); });

				
				// data processing
				data.forEach(function(d) {
					d._date = parseDate(d.Date);
					d["series1"]= +d["PlannedQty"];
					if(d["YieldQty"] === "") {
						d["series2"] = undefined;
					} else {
						d["series2"] = +d["YieldQty"];
					}
					if(d["Scrap"] === "") {
						d["series3"] = undefined;
					} else {
						d["series3"] = +d["Scrap"];
					}
				});

				x.domain(d3.extent(data, function(d) { return d._date; }));

				y.domain([
					d3.min(data, function(d) { 
							if(d["series2"] !== undefined) {
								return Math.min(d["series1"], d["series2"], d["series3"]);
							} else {
								return Math.min(d["series1"]);
							}
						}),
					d3.max(data, function(d) { 
							if(d["series2"] !== undefined) {
								return Math.max(d["series1"], d["series2"], d["series3"]);
							} else {
								return Math.max(d["series1"]);
							}
						})
				]);

				svg.datum(data);
				

				// plot svg to canvas
				
				//draw title
				svg.append("text") // Title shadow
					.attr("x", (width / 2))
					.attr("y", 10 )
					.attr("text-anchor", "middle")
					.style("font-size", "16px")
					.attr("class", "shadow")
					.text(title);

				svg.append("text") // Title
					.attr("x", (width / 2))
					.attr("y", 10 )
					.attr("text-anchor", "middle")
					.style("font-size", "16px")
					.style("stroke", "none")
					.text(title);
				
				// draw guide line
				svg.selectAll("line.x")
					.data(x.ticks(10))
					.enter().append("line")
					.attr("x1", x)
					.attr("x2", x)
					.attr("y1", 0)
					.attr("y2", height)
					.style("stroke", "#ccc");
				
				// construct below area
				svg.append("clipPath")
					.attr("id", "clip-below-chin")
					.append("path")
					.attr("d", area.y0(height));
				
				// construct above area
				svg.append("clipPath")
					.attr("id", "clip-above-chin")
					.append("path")
					.attr("d", area.y0(0));
				
				svg.append("path")
					.attr("fill", areaColors[0])
					.attr("clip-path", "url(#clip-below-chin)")
					.attr("d", area.y0(function(d) { return y(d["series2"]); }))
					.attr("opacity", "0.5");
				
				svg.append("path")
					.attr("fill", areaColors[1])
					.attr("clip-path", "url(#clip-above-chin)")
					.attr("d", area)
					.attr("opacity", "0.5");
				
				// draw 
				svg.append("path")
					.attr("d", greenline)
					.style("stroke", seriesColors[0])
					.attr("stroke-width", "2px");

				svg.append("path")
					.attr("d", yieldline)
					.style("stroke", seriesColors[1])
					.attr("stroke-width", "2px");
				
				
				svg.append("path")
					.datum(data)
					.style("stroke", "#f00")
					.attr("stroke-width", "2px")
					.attr("fill","none")
					.attr("d", scrapline);

				svg.append("g")
					.attr("transform", "translate(0," + height + ")")
					.attr("fill","none")
					//.attr("stroke","#000")
					//.attr("shape-rendering","crispEdges")
					//.style("font-size","10px")
					.call(xAxis);

				svg.append("g")
					.attr("fill","none")
					//.attr("stroke","#000")
					//.attr("shape-rendering","crispEdges")
					//.style("font-size","10px")
					.call(yAxis);

				// add current date guide line
				svg.append('line')
					.attr({
						x1: x(currentDate),
						y1: height/2,
						x2: x(currentDate),
						y2: height
					})
					.style("stroke", "#F59331")
					.style("stroke-dasharray", ("3, 3"))
					.style("stroke-opacity", 0.9);
				
				// append circle for current data guide line
				svg.append("circle")
					.attr("fill",dotsInnerColors[0])
					.style("stroke", "#F59331")
					.attr("stroke-width", "1px")
					.attr("cx", x(currentDate))
					.attr("cy", height/2)
					.attr("r", 3);
				
				// append circle for line chart
				svg.selectAll(".dot")
					.data(data)
					.enter().append("circle")
					.attr("fill",dotsInnerColors[0])
					.style("stroke", dotsOutterColors[0])
					.attr("stroke-width", "1px")
					.attr("cx", greenline.x())
					.attr("cy", greenline.y())
					.attr("r", 3);
				
				svg.selectAll(".dot")
					.data(data)
					.enter().append("circle")
					.attr("fill",dotsInnerColors[1])
					.style("stroke", dotsOutterColors[1])
					.attr("stroke-width", "1px")
					.attr("cx", yieldline.x())
					.attr("cy", yieldline.y())
					.style("display", function(d) { return d._date > currentDate ? "none" : null; })
					.attr("r", 3);
				
				svg.selectAll(".dot")
					.data(data)
					.enter().append("circle")
					.attr("fill", dotsInnerColors[2])
					.style("stroke", dotsOutterColors[2])
					.attr("stroke-width", "1px")
					.attr("cx", scrapline.x())
					.attr("cy", scrapline.y())
					.style("display", function(d) { return d._date > currentDate ? "none" : null; })
					.attr("r", 3);
				
				// add event listener
				svg.append("a")
					.attr("xlink:href", linkUrl);

				svg.on("mousedown",mouseDown)
					.on("mouseup",mouseUp)
					.on("mousemove",mouseMove)
					.on("touchstart",touchStart)
					.on("touchmove",touchMove)
					.on("touchend",touchEnd);

				svg.on("click", function() {
					var coords = d3.mouse(this);

					// Normally we go from data to pixels, but here we're doing pixels
					// to data
					var newData = {
						x : Math.round(x.invert(coords[0])), // Takes the pixel number to convert to number
						y : Math.round(y.invert(coords[1]))
					};

					//dataset.push(newData); // Push data to our array

					/*svg.selectAll("circle") // For new circle, go through the update process
					.data(dataset).enter().append("circle").attr(circleAttrs) // Get attributes from circleAttrs var
					.on("mouseover", handleMouseOver).on("mouseout", handleMouseOut);*/
				});
				
				
				function mouseDown(d, i) {  // Add interactivity
					console.log("mouse down");
				}
				
				function mouseMove(d, i) {  // Add interactivity
					console.log("mouse move");
				}
				
				function mouseUp(d, i) {  // Add interactivity
					console.log("mouse up");
				}
				
				function touchStart(d, i) {  // Add interactivity
					console.log("touch start");
				}
				
				function touchMove(d, i) {  // Add interactivity
					console.log("touch move");
				}
				
				function touchEnd(d, i) {  // Add interactivity
					console.log("touch end");
				}
			}
		}
		)

	return BurnDownChart;
}, /* bExport= */ true);
