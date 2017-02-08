//"use strict";
sap.ui.define(['jquery.sap.global', 'gogemba/util/Controller', 'gogemba/util/Formatter',  'gogemba/util/Common', 'gogemba/controls/BurnDownChart'],
	function(jQuery, Controller, Formatter, Common, BurnDownChart) {

	var Detail = Controller.extend("gogemba.controller.Detail", {
		onInit : function() {
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});
			
			this._scrapCharts = {};
			this._resizeCharts = false;
		},
		
		onExit : function() {
			sap.ui.core.ResizeHandler.deregister(this._resizeHandler);
		},
		
		selectTab: function(){
			if (this._resizeCharts){
				this.onResize();
				this._resizeCharts = false;
			}
		},
	
		onBeforeShow : function(evt) {
			if (evt.direction === "to") {
				var oDetailModel = this.getView().getModel("detail");
				oDetailModel.refresh(true);
	
				var oOpenQty = this.getView().byId(this.getView().getId() + "--" + "openQty" + "-" + this.getView().getId() + "--" + "currentList" + "-0");
				oOpenQty.setText(Formatter.getNumber(oOpenQty.getText()));
				
				var headerBar = this.getView().byId("headerBar");
				var data = oDetailModel.oData[0];
				headerBar.setStatus(data.WorkCenterStatus);
	
				var iconTabBar = this.getView().byId("iconTabBar");
				// Workaround for Android Phone issue
				if (!sap.ui.Device.system.desktop && !this._show) {
					this._show = true;
					jQuery.sap.delayedCall(100, this, function(){
						iconTabBar.setSelectedKey("currentTab");
					});
				}
	
				var header = iconTabBar.mAggregations._header;
				
				if (this._headerStyleClass) {
					header.removeStyleClass(this._headerStyleClass);
				}
				var styleClass;
				switch (data.WorkCenterStatus) {
					case "down" : 
						styleClass = "sapHATITBStatusDown";
						break;
					case "running" : 
						styleClass = "sapHATITBStatusRunning";
						break;
					case "set up" : 
						styleClass = "sapHATITBStatusSetup";
						break;
					case "idle" : 
						styleClass = "sapHATITBStatusIdle"; 
						break;
					default:
						styleClass = "sapHATITBStatusDown";
						break;
				}
	
				header.addStyleClass(styleClass);
				this._headerStyleClass = styleClass;
				this._createBurnDownChart();
			}
		},
	
		onAfterRendering : function() {
			var page = this.getView().byId("page");
			page.setBackgroundDesign(sap.m.PageBackgroundDesign.Solid);
	
			this._createOEECharts();
			this._createScrapCharts();
	
			this.onResize();
			this._resizeHandler = sap.ui.core.ResizeHandler.register(this.getView().getDomRef(), jQuery.proxy(this.onResize, this));
		},
		
		onResize : function() {
			var $page = jQuery("#" + this.getView().getId() + "--" + "page");
			var height = $page.height();
			var $iconTabBar = jQuery("#" + this.getView().getId() + "--" + "iconTabBar");
			var width = $iconTabBar.width();
	
			if (height > 96) {
				var burnDownChartWidth = sap.ui.Device.system.desktop ? width - 48 : width - 16;
				this._resizeChart("burnDownChartContainer", burnDownChartWidth, height, 465, 260);
				var chartWidth = sap.ui.Device.system.desktop ? width - 32 : width;
				this._resizeChart("workCenterStatusChart", chartWidth, height, 225, 500);
				this._resizeChart("downtimeReasonsChart", chartWidth, height, 225, 500);
				this._resizeChart("scrapReasonsChart", chartWidth, height, 225, 500);
				this._resizeChart("scrapLineChart", chartWidth, height, 270, 455);
				this._resizeChart("scrapColumnChart", chartWidth, height, 270, 455);
				this._resizeChart("scrapLineChartTable", chartWidth, height, 270, 455);
				this._resizeChart("productivityColumnChart", chartWidth, height, 270, 455);
			}
			
			this._orientScrapChart("scrapLineChart");
			this._orientScrapChart("scrapColumnChart");
		},
		
		_resizeChart : function(id, width, height, top, defaultHeight) {
			var chartContainer = this.getView().byId(id);
			if (!chartContainer){
				return;
			}
			var chartHeight = (height - top) > 200 ? (height - top) + "px" : defaultHeight + "px";
			chartContainer.setHeight(chartHeight);
			chartContainer.setWidth(width + "px");
		},
		
		_createBurnDownChart : function() {
			var oDetailModel = this.getView().getModel("detail");
			var oBurnDownChartHolder = this.byId("burnDownChartContainer");
			var oBurnDownChartItem = new gogemba.controls.BurnDownChartItem({Date:"{MfgOrderConfirmationEntryDate}", PlannedQty:"{MfgOrderPlannedQty}", YieldQty : "{ConfirmationYieldQuantity}", Scrap : "{ConfirmationScrapQuantity}"});
			var oBurnDownChart = new BurnDownChart({
				items: {path : "/0/BurnDown", template : oBurnDownChartItem}
			});
			oBurnDownChart.setCurrentDate("2016-03-09");
			oBurnDownChart.setModel(oDetailModel);
			if (oBurnDownChartHolder.getItems().length > 0) {
				oBurnDownChartHolder.removeItem(0);
			}
			oBurnDownChartHolder.addItem(oBurnDownChart);
		},
		
		_createOEECharts : function() {
			this._createOEEWorkCenterStatusChart();
			this._createOEEDowntimeReasonsChart();
			this._createOEEProductivityColumnChart();
		},
	
		_createOEEWorkCenterStatusChart : function() {
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				 dimensions: [{
					 name: "Category",
					 value: "{Category}"
				 }],
				 measures: [{
					 name: 'Value',
					 value: '{Value}'
				 }],
				 data: {
					 path: "/WorkCenterStatus"
				 }
			});
			Common.createDonutChart(this.getView(), oDataset, "workCenterStatusChart", "WORK_CENTER_STATUS", "Category", "Value");
			//Common.createD3DonutChart(this.getView(), "/WorkCenterStatus", "workCenterStatusChart", "WORK_CENTER_STATUS", "Category", "Value");
		},
	
		_createOEEDowntimeReasonsChart : function() {
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				 dimensions: [{
					 name: "Category",
					 value: "{Category}"
				 }],
				 measures: [{
					 name: 'Value',
					 value: '{Value}'
				 }],
				 data: {
					 path: "/DowntimeReasons"
				 }
			});
			Common.createDonutChart(this.getView(), oDataset, "downtimeReasonsChart", "DOWNTIME_REASONS", "Category", "Value");
		},

		_createOEEProductivityColumnChart:function(){ 
			var oBundle =  this.getView().getModel("i18n").getResourceBundle();
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions : [{
					name : oBundle.getText("YEAR"),
					value : "{Category}"}],
				measures : [{
					name : oBundle.getText("RUNNING"),
					value : '{Running}'},{
					name : oBundle.getText("STANDBY"),
					value : '{StandBy}'},{
					name : oBundle.getText("DOWN"),
					value : '{Down}'}
					],
				data : {
					path : "/Productivity"
				}
			});
			Common.createColumnChart(this.getView(), oDataset, "productivityColumnChart", "PRODUCTIVITY", ["Year"], ["Running", "StandBy", "Down"], true, ["#00B050", "#92D050", "#FF0000"]);
		},
	
		_createScrapCharts : function(){
			 this._createScrapReasonsChart();
			 this._createScrapLineChart();
			 this._createScrapColumnChart();
		},
			 
		_createScrapReasonsChart : function() {
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				 dimensions: [{
					 name: "Category",
					 value: "{Category}"
				 }],
				 measures: [{
					 name: 'Value',
					 value: '{Value}'
				 }],
				 data: {
					 path: "/ScrapReasons"
				 }
			});
			Common.createDonutChart(this.getView(), oDataset, "scrapReasonsChart", "SCRAP_REASONS", "Category", "Value", d3.scale.category20().range());
		},

		_createScrapLineChart:function(){ 
			var oBundle =  this.getView().getModel("i18n").getResourceBundle();
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions : [{
					name : oBundle.getText("DATE"),
					value : "{Category}"}],
				measures : [{
					name : oBundle.getText("SCRAP"),
					value : '{Value}'} ],
				data : {
					path : "/ScarpInLast30Days"
				}
			});
			Common.createLineChart(this.getView(), oDataset, "scrapLineChart", "SCRAP_30_DAYS", "Date", "Scrap", false, d3.scale.category20().range());
		},
			
		scrapLineChartTablePress : function(oEvent){	
			var oBundle =  this.getView().getModel("i18n").getResourceBundle();
			var chartContainer = this.byId("scrapLineChartContainer");
			var oControl = chartContainer.getContent()[0].getContent();
			
			if (!this._scrapCharts.hasOwnProperty('scrapLine')){
				var data = {'id':"scrapLineChartTable",
						'title':oBundle.getText("SCRAP_30_DAYS"),
						'model':this.getView().getModel("json"),
						'dataPath':"/ScarpInLast30Days",
						'columns':[{'label':oBundle.getText("DATE"), 'dataBinding':"Category", 'formatter':"gogemba.util.Formatter.getDate"},
						           {'label':oBundle.getText("SCRAP"),'dataBinding':"Value", 'formatter':""}
						 		  ]
						};
				var oTable = Common.createTable(data); 
				this._scrapCharts.scrapLine = {"chart" : oControl, "table" : oTable};
			}	
			if (oControl && oControl.getId() === this.getView().getId() + "--" + "scrapLineChart"){
				chartContainer.getContent()[0].setContent(this._scrapCharts.scrapLine.table);
				this._resizeCharts = true;
			} else{
				chartContainer.getContent()[0].setContent(this._scrapCharts.scrapLine.chart);
				this._resizeCharts = false;
			}
			chartContainer.invalidate();
		},
		
		_createScrapColumnChart:function(){ 
			var oBundle =  this.getView().getModel("i18n").getResourceBundle();
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions : [{
					name : oBundle.getText("DATE"),
					value : "{Category}"}],
				measures : [{
					name : oBundle.getText("SCRAP"),
					value : '{Value}'} ],
				data : {
					path : "/ScarpInLastDays"
				}
			});
			Common.createColumnChart(this.getView(), oDataset, "scrapColumnChart", "SCRAP_7_DAYS", "Date", "Scrap", false, d3.scale.category20().range());
		},
	
		scrapColumnChartTablePress : function(oEvent){
			var oBundle =  this.getView().getModel("i18n").getResourceBundle();
			var chartContainer = this.byId("scrapColumnChartContainer");
			var oControl = chartContainer.getContent()[0].getContent();
			
			if (!this._scrapCharts.hasOwnProperty('scrapColumn')){
				var data = {'id':"scrapColumnChartTable",
					'title' : oBundle.getText("SCRAP_7_DAYS"),
					'model' : this.getView().getModel("json"),
					'dataPath' : "/ScarpInLastDays",
					'columns' : [{'label':oBundle.getText("DATE"), 'dataBinding':"Category", 'formatter':"gogemba.util.Formatter.getDate"},
					             {'label':oBundle.getText("SCRAP"),'dataBinding':"Value", 'formatter':""}
					]
				};
				var oTable = Common.createTable(data); 
				this._scrapCharts.scrapColumn = {"chart" : oControl, "table" : oTable};
			}	
			
			if (oControl && oControl.getId() === this.getView().getId() + "--" + "scrapColumnChart") {
				chartContainer.getContent()[0].setContent(this._scrapCharts.scrapColumn.table);
				this._resizeCharts = true;
			} else{
				chartContainer.getContent()[0].setContent(this._scrapCharts.scrapColumn.chart);
				this._resizeCharts = false;
			}
			chartContainer.invalidate();
		},
		
		_orientScrapChart : function(id) {
			var legendOri = window.innerHeight > window.innerWidth ? "bottom": "right";

			var scrapChart = this.getView().byId(id);
			if (scrapChart.hasOwnProperty("legendGroup")){
				scrapChart.legendGroup.layout.position = legendOri;
			}
		},
	
		onNavBack : function(oEvent) {
			gogemba.dev.devapp.onNavBack();
		}
	});
	
	return Detail;
}, /* bExport= */ true);
