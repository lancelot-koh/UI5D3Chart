jQuery.sap.declare("gogemba.util.Common");
jQuery.sap.require("gogemba.controls.PieChart");

gogemba.util.Common = {
	createTable : function(data) {
		var columns = []; 
		var cells = [];
		for (var i = 0; i < data.columns.length; i++){
			var column = new sap.m.Column({
				width : "2em",
				header : new sap.m.Label({
					text : data.columns[i].label
				})
			})
			var cell = new sap.m.Text({
				text: {
					path : data.columns[i].dataBinding,
					formatter : data.columns[i].formatter
				}
			})
			columns.push(column);
			cells.push(cell);
		}
		
		var headerToolbar  = new sap.m.Toolbar({content : [new sap.m.ToolbarSpacer({}),
		                                                   new sap.m.Label({text:data.title}), 
		                                                   new sap.m.ToolbarSpacer({})]
												});
		var	oTable = new sap.m.Table(data.id, {headerToolbar:headerToolbar, columns:columns});
		oTable.bindItems(data.dataPath, new sap.m.ColumnListItem({cells:cells}));
		oTable.setModel(data.model);
		return oTable;
	},

	createDonutChart : function(view, oDataset, id, title, dimension, measure, palette) {
		var oBundle =  view.getModel("i18n").getResourceBundle();
		var oModel = view.getModel("json");
		
		var oVizFrame = view.byId(id);
		oVizFrame.setVizType('donut');
		oVizFrame.setUiConfig({
			 "applicationSet": "fiori"
		 });

		oVizFrame.setDataset(oDataset);
		oVizFrame.setModel(oModel);

		var feedSize = new sap.viz.ui5.controls.common.feeds.FeedItem({
			 'uid': "size",
			 'type': "Measure",
			 'values': [measure]
		}),
		feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
			'uid': "color",
			'type': "Dimension",
			'values': [dimension]
		});
		oVizFrame.addFeed(feedSize);
		oVizFrame.addFeed(feedColor);

		oVizFrame.setVizProperties({
			 plotArea: {
				colorPalette : palette ? palette : ["#00B050", "#92D050", "#FFFF00", "#FFC000", "#FF0000"],
			},
			 legend: {
				 title: {
					 visible: false
				 }
			 },
			 title : {
					visible :"true",
					text : oBundle.getText(title)
				}
		});
	},

	createColumnChart : function(view, oDataset, id, title, dimension, measure, showLegend, palette) {
		var oBundle =  view.getModel("i18n").getResourceBundle();
		var oModel = view.getModel("json");
		
		var legendOri = window.innerHeight > window.innerWidth ? "bottom": "right";

		var oVizFrame = view.byId(id);
		oVizFrame.setVizType('column');
		oVizFrame.setUiConfig({
			 "applicationSet": "fiori"
		 });
		
		oVizFrame.setDataset(oDataset);
		oVizFrame.setModel(oModel);

		var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
			'uid': "valueAxis",
			'type': "Measure",
			'values': measure
		}), 
		feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
			'uid': "categoryAxis",
			'type': "Dimension",
			'values': dimension
		});
		oVizFrame.addFeed(feedValueAxis);
		oVizFrame.addFeed(feedCategoryAxis);

		oVizFrame.setVizProperties({
			plotArea:{
				colorPalette : palette ? palette : null,
				isFixedDataPointSize: false,
                window: {
                    start: null,
                    end: null
                }
			},
			legend:{
				visible:showLegend
			},
			legendGroup: {
				layout: {
					position: legendOri
				}
			},  
			title : {
				visible :"true",
				text : oBundle.getText(title)
			}
		});
	},
	
	createLineChart : function(view, oDataset, id, title, dimension, measure, showLegend, palette) {
		var oBundle =  view.getModel("i18n").getResourceBundle();
		var oModel = view.getModel("json");

		var oVizFrame = view.byId(id);
		oVizFrame.setVizType('line');
		oVizFrame.setUiConfig({
			 "applicationSet": "fiori"
		 });

		oVizFrame.setDataset(oDataset);
		oVizFrame.setModel(oModel);
		var legendOri = window.innerHeight > window.innerWidth ? "bottom": "right";
		
		var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
			'uid': "valueAxis",
			'type': "Measure",
			'values': [measure]
		}), 
		feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
			'uid': "categoryAxis",
			'type': "Dimension",
			'values': [dimension]
		});
		oVizFrame.addFeed(feedValueAxis);
		oVizFrame.addFeed(feedCategoryAxis);

		oVizFrame.setVizProperties({
			plotArea:{
				colorPalette : palette ? palette : null,
				isFixedDataPointSize: false,
                window: {
                    start: null,
                    end: null
                }
			},
			
			legend:{
				visible:showLegend
			},
			legendGroup: {
				layout: {
					position: legendOri
				}
			}, 
			title:{
				visible :"true",
				text : oBundle.getText(title)
			}
		});
	},

	createD3DonutChart : function(view, path, id, title, dimension, measure) {
		var oModel = view.getModel("json");
		var oChartHolder = view.byId(id);
		var oChartItem = new gogemba.controls.PieChartItem({category:"{Category}", value:"{Value}"});
		var oChart = new gogemba.controls.PieChart({
			items: {path : path, template : oChartItem}
		});
		
		oChart.setModel(oModel);
		oChartHolder.addItem(oChart);
	},
};
