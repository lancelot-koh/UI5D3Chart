//"use strict";
sap.ui.define(['jquery.sap.global', 'gogemba/util/Controller', 'gogemba/util/Formatter', 'gogemba/controls/BurnDownChart'],
	function(jQuery, Controller, Formatter, BurnDownChart) {

	var Overview = Controller.extend("gogemba.controller.Overview", {
		onInit : function() {
			this.getView().addEventDelegate({
				onBeforeFirstShow: jQuery.proxy(function (evt) {
					this.onBeforeFirstShow(evt);
				}, this),

				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this),
				
				onAfterHide: jQuery.proxy(function (evt) {
					this.onAfterHide(evt);
				}, this)
			});
		},
		
		_createCharts : function() {
			var oBurnDownChartHolder = this.byId("chartContainer");
			var oBurnDownChartItem = new gogemba.controls.BurnDownChartItem({Date:"{MfgOrderConfirmationEntryDate}", PlannedQty:"{MfgOrderPlannedQty}", YieldQty : "{ConfirmationYieldQuantity}", Scrap : "{ConfirmationScrapQuantity}"});
			var oBurnDownChart = new BurnDownChart({
				items: {path : "/", template : oBurnDownChartItem}
			});
			oBurnDownChart.setCurrentDate("2016-03-09");
			var oModel = this.getView().getModel("json");
			oBurnDownChart.setModel(oModel);
			oBurnDownChartHolder.addItem(oBurnDownChart);
		},
		
		onAfterRendering : function() {
			this._createCharts();
		},
		
		onBeforeFirstShow: function() {
			/*var view = this.getView();
			var oDataURL = "ZTCSI_PRODORDOPERS?$filter=(ProductionOrder eq '1002886')&$select=to_MfgOrder/MfgOrderPlannedTotalQty,to_MfgOrder/MfgOrderPlannedStartDate,to_MfgOrder/MfgOrderPlannedEndDate,to_MfgOrder/MfgOrderConfirmedYieldQty,to_MfgOrder/MfgOrderConfirmedScrapQty,WorkCenter,WorkCenterText&$expand=to_MfgOrder";
			var oModel = view.getModel();
			oModel.read(oDataURL, null, null, null, function(data, response){
				var oJSONModel = view.getModel("json");
				var machineData = oJSONModel.oData.Machine;

				if (data.results.length > 0) {
					machineData[0].WorkCenter = data.results[0].WorkCenter;
					machineData[0].WorkCenterText = data.results[0].WorkCenterText;
					machineData[0].MfgOrderPlannedTotalQty = data.results[0].to_MfgOrder.MfgOrderPlannedTotalQty;
					machineData[0].MfgOrderConfirmedYieldQty = data.results[0].to_MfgOrder.MfgOrderConfirmedYieldQty;
					machineData[0].MfgOrderConfirmedScrapQty = data.results[0].to_MfgOrder.MfgOrderConfirmedScrapQty;
					machineData[0].MfgOrderPlannedEndDate = data.results[0].to_MfgOrder.MfgOrderPlannedEndDate;
				}
				oJSONModel.refresh(true);
			}, function(e) {
				alert(e.message);
			});

			oDataURL = "Ztcs_C_Prod_Confirmation?$filter=ManufacturingOrder eq '1002886'&$select=ConfirmationYieldQuantity,ConfirmationScrapQuantity,MfgOrderConfirmationEntryDate,PostingDate";
			oModel = view.getModel("confirmation");
			oModel.read(oDataURL, null, null, null, function(data, response){
				alert(data.results.length);
			}, function(e) {
				alert(e.message);
			});	*/
		},
		
		onBeforeShow: function() {
			if (!sap.ui.Device.system.desktop) {
				this._displayTimer = setInterval(jQuery.proxy(function (evt) {
					this.refreshList();
				}, this), 1000);
			}
		},
		
		onAfterHide: function() {
			if (this._displayTimer) {
				clearInterval(this._displayTimer);
				this._displayTimer = null;
			}

			var settingsButton = document.getElementById("settings");
			//settingsButton.style.display = "";
	
			var backButton = document.getElementById("back");
			//backButton.style.display = "";
		},
	
		_updateFirstItem : function(item, selected) {
			var content = item.getContent()[0];
			var leftPanel = content.getItems()[0];
			var rightPanel = content.getItems()[1];
			var circleText = leftPanel.getItems()[0];
			var chartContainer = rightPanel.getItems()[1];

			if (selected) {
				leftPanel.removeStyleClass("overviewPageLeftPanel");
				leftPanel.setHeight("255px");
				rightPanel.setHeight("255px");
				
				chartContainer.setHeight("150px");
			}
			else {
				leftPanel.addStyleClass("overviewPageLeftPanel");
				leftPanel.setHeight("105px");
				rightPanel.setHeight("105px");
			}

			circleText.setSelected(selected);
			chartContainer.setVisible(selected);
		},
		
		_updateSecondItem : function(item, selected) {
			var content = item.getContent()[0];
			var leftPanel = content.getItems()[0];
			var rightPanel = content.getItems()[1];
			var chartContainer = rightPanel.getItems()[1];

			if (selected) {
				leftPanel.setHeight("180px");
				rightPanel.setHeight("180px");

				chartContainer.setHeight("75px");
			}
			else {
				leftPanel.setHeight("105px");
				rightPanel.setHeight("105px");
			}
			
			chartContainer.setVisible(selected);
		},

		_bindChartItem : function(item) {
			var content = item.getContent()[0];
			var rightPanel = content.getItems()[1];
			
			var bindingContextPath = item.getBindingContextPath();
			
			var chartContainer = rightPanel.getItems()[1];
			var chart = chartContainer.getItems()[0];
			var oBurnDownChartItem = new gogemba.controls.BurnDownChartItem({Date:"{MfgOrderConfirmationEntryDate}", PlannedQty:"{MfgOrderPlannedQty}", YieldQty : "{ConfirmationYieldQuantity}", Scrap : "{ConfirmationScrapQuantity}"});
			var oBindingInfo = {
					path: bindingContextPath + "/BurnDown",
					template: oBurnDownChartItem
			};
			chart._updateAggregation("items", oBindingInfo);
		},

		onUpdateFinished : function() {
			var list = this.getView().byId("list");
			var items = list.getItems();
	
			if (items.length > 0) {
				this._updateFirstItem(items[0], true);
				this._bindChartItem(items[0]);
				
				if (items.length > 1) {
					this._updateSecondItem(items[1], true);
					this._bindChartItem(items[1]);
				}
			}
		},
	
		onSelectionChange : function() {
			var list = this.getView().byId("list");
			var item = list.getSelectedItem();
			
			var workCenter = item.data("workCenter");
		
			list.removeSelections(true);
	
			var oModel = this.getView().getModel("json");
			var machineData = oModel.oData.Machine;
	
			var oDetailModel = this.getView().getModel("detail");
			for (var i in machineData) {
				if (machineData[i].WorkCenter === workCenter) {
					oDetailModel.setData([machineData[i]]);
					break;	
				}
			}

			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("detail", null, false);
		},
		
		refreshList : function() {
			var oModel = this.getView().getModel("json");
			for (var i = 0 ; i < oModel.oData.Machine.length; i++) {
				var row = oModel.oData.Machine[i];
				if (!sap.ui.Device.system.desktop) {
					if (gogemba.dev.devapp.detectedBeacons[row.WorkCenter]) {
						row.Accuracy = gogemba.dev.devapp.detectedBeacons[row.WorkCenter].accuracy;
					}
				}
			}
			
			var data = oModel.oData.Machine;
			var originalData = data.slice(0);
	
			data.sort(function(a, b){
				 if (a.Accuracy === -1 && b.Accuracy === -1) {
					 return 0;
				 }
				 else if (a.Accuracy === -1) {
					 return 100 - b.Accuracy;
				 }
				 else if (b.Accuracy === -1) {
					 return a.Accuracy - 100;
				 }
				 else {
					 return a.Accuracy - b.Accuracy;
				 }
			});
			
			var length = originalData.length;
			var diffSequence = false;
			for (i = 0; i < length; i++) {
				if ((originalData[0].Accuracy !== 1) && (originalData[0].WorkCenter !== data[0].WorkCenter)) {
					diffSequence = true;
					break;
				}
			}
	
			var list = this.getView().byId("list");
			var items = list.getItems();
	
			if (diffSequence) {
				if (items.length > 0) {
					this._updateFirstItem(items[0], false);
					if (items.length > 1) {
						this._updateSecondItem(items[1], false);
					}
				}
				oModel.refresh(true);
			}	
			else {
				this.refreshItems();
			}
		},
	
		refreshItems : function() {
			var oModel = this.getView().getModel("json");
			var data = oModel.oData.Machine;
	
			var list = this.getView().byId("list");
			var items = list.getItems();
			for (var i = 0; i < items.length; i++) {
				var content = items[i].getContent()[0];
				var leftPanel = content.getItems()[0];
				var accuracy = leftPanel.getItems()[0];
				accuracy.setText(Formatter.getAccuracy(data[i].Accuracy));
			}
		}
	});
	
	return Overview;
}, /* bExport= */ true);
