/*global location history */
sap.ui.define([
	"com/baba/ZMM_MRFPAL/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/baba/ZMM_MRFPAL/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/baba/ZMM_MRFPAL/model/function"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, functions) {
	"use strict";

	return BaseController.extend("com.baba.ZMM_MRFPAL.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {

			var oModel = new JSONModel();
			this.getView().byId("tab").setModel(oModel);

			var oMode2 = new JSONModel();
			this.getView().byId("oSelect1").setModel(oMode2); //added
		},

		onBusyS: function (oBusy) {
			oBusy.open();
			oBusy.setBusyIndicatorDelay(40000);
		},

		onBusyE: function (oBusy) {
			oBusy.close();
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser historz
		 * @public
		 */
		onNavBack: function () {
			history.go(-1);
		},

		onCal: function (oControlEvent) {
			var oRow = oControlEvent.getSource().getParent();
			var NUM_DECIMAL_PLACES = 3;
			var aCells = oRow.getCells();
			if (aCells.length > 0) {
				//var colnwt;
				var colswt = aCells[3]._lastValue;
				if (colswt === "") {
					colswt = "0.000";
				}
				colswt = Number(colswt).toFixed(NUM_DECIMAL_PLACES);
				if (colswt !== "0.000") {
					aCells[3].setValue(colswt);
				}
			}

		},
		onPri: function (oControlEvent) {
			var that = this;

			var oTable = that.getView().byId("tab");
			var PLFilters = [];

			var l_printern = that.getView().byId("oSelect1").getValue();
			if (l_printern === "" || l_printern === undefined) {
				sap.m.MessageToast.show("Printer Name can not be blank");
			} else {

				// Get the table Model
				// // Get Items of the Table
				// get selected rows
				var aContexts = oTable.getSelectedContexts();

				if (aContexts.length > 0) {
					var oBusy = new sap.m.BusyDialog();
					that.onBusyS(oBusy);

					// for (var iRowIndex = 0; iRowIndex < aContexts.length; iRowIndex++) {
					// var l_pallet = aContexts[iRowIndex].getObject().Pallet;
					var l_pallet = this.getView().byId("PALLET").getText();

					PLFilters.push(new sap.ui.model.Filter({
						path: "PALLET",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: l_pallet
					}));

					var printern = l_printern;

					PLFilters.push(new sap.ui.model.Filter({
						path: "PRINTERN",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: printern
					}));

					var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZMMO_MRFHU_SRV/", true);
					oModel1.read("/PRINTSet", {
						filters: PLFilters,
						success: function (oData, oResponse) {
							sap.m.MessageToast.show("Print Successful");
							that.onBusyE(oBusy);
						},
						error: function (oResponse) {
							var oMsg = JSON.parse(oResponse.responseText);
							jQuery.sap.require("sap.m.MessageBox");
							sap.m.MessageToast.show(oMsg.error.message.value);
							that.onBusyE(oBusy);
						}
					});
				} else {
					sap.m.MessageToast.show("No Pallet marked to be print");
				}
			}

		},

		onblank: function (that) {
			//************************set blank values to table*******************************************//
			var oModel = that.getView().byId("tab").getModel();
			var oTable = that.getView().byId("tab");
			var data;
			// var noData = oModel.getProperty("/data");
			// oModel.setData({
			// 	modelData: noData
			// });
			oModel.setData({
				modelData: data
			});
			oModel.refresh(true);
			oTable.removeSelections(true);

			this.getView().byId("VBELN").setText();
			this.getView().byId("POSNR").setText();
			this.getView().byId("MATNR").setText();
			this.getView().byId("BATCH").setText();
			this.getView().byId("PALLET").setText();
			this.getView().byId("oSelect1").setValue();
			this.getView().byId("oSelect1").setEditable(true);
		},

		onGet: function (oControlEvent) {
			var that = this;

			var oBagV = this.getView().byId("PALLETV").getValue();
			if (oBagV === "") {
				sap.m.MessageToast.show("Please provide Pallet");
			} else {

				// //************************set blank values to table*******************************************//
				var oModel = that.getView().byId("tab").getModel();
				that.onblank(that);
				// //************************get values from backend based on filter Date*******************************************//
				var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZMMO_MRFHU_SRV/", true);
				// that.getView().setModel(oModel1);
				var itemData = oModel.getProperty("/data");

				// //************************filter Date*******************************************//
				// var PLFilters = [];
				// PLFilters.push(new sap.ui.model.Filter({
				// 	path: "VBELN",
				// 	operator: sap.ui.model.FilterOperator.EQ,
				// 	value1: oBagV
				// }));

				var oBusy = new sap.m.BusyDialog();
				that.onBusyS(oBusy);
				oModel1.read("/MRFHUSet(Pallet='" + oBagV + "')", {
					// filters: PLFilters,
					success: function (oData, oResponse) {
						var res = {};
						res = oData;
						if (res !== "") {
							var itemRow = {
								// Pallet: res.Pallet,
								Fweight: res.Fweight,
								Sweight: res.Sweight,
								Bagwt: res.Bagwt,
								Pweight: res.Pweight,
								Nobag: res.Nobag,
								Charg: res.Charg
							};
							var val = res.MATNR + "-" + res.MAKTX;
							that.getView().byId("VBELN").setText(res.VBELN);
							that.getView().byId("POSNR").setText(res.POSNR);
							that.getView().byId("MATNR").setText(val);
							that.getView().byId("BATCH").setText(res.BATCH);
							that.getView().byId("PALLET").setText(res.Pallet);

							if (typeof itemData !== "undefined" && itemData.length > 0) {
								itemData.push(itemRow);
							} else {
								itemData = [];
								itemData.push(itemRow);
							}
							// // Set Model
							oModel.setData({
								data: itemData
							});
							oModel.refresh(true);

							if (res.Charg === "Y") {
								that.byId("tab").getColumns()[3].setVisible(false);
								that.byId("button1").setVisible(false);

							} else if (res.Charg === "X") {
								that.byId("tab").getColumns()[3].setVisible(true);
								that.byId("button1").setVisible(true);
							}

						}

						//************************get values from backend based on filter Date*******************************************//
						// that.onBusyE(oBusy);

						//************************filter printer*******************************************//
						var oModel3 = that.getView().byId("oSelect1").getModel();
						functions.blank(oModel3);
						var itemData3 = oModel3.getProperty("/data");

						var vbelnv = that.getView().byId("VBELN").getText();
						var posnrv = that.getView().byId("POSNR").getText();

						var PLFilters1 = [];
						PLFilters1.push(new sap.ui.model.Filter({
							path: "VBELN",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: vbelnv
						}));

						PLFilters1.push(new sap.ui.model.Filter({
							path: "POSNR",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: posnrv
						}));

						oModel1.read("/PRINTERSet", {
							filters: PLFilters1,
							success: function (oData1, oResponse1) {
								var res1 = [];
								res1 = oData1.results;
								var cnt = 0;
								if (res1.length > 0) {
									for (var iRowIndex = 0; iRowIndex < res1.length; iRowIndex++) {

										cnt = Number(cnt) + 1;

										var itemRow1 = {
											PRINTERN: res1[iRowIndex].PRINTERN,
											DEF: res1[iRowIndex].DEF
										};

										if (iRowIndex === 0) {
											that.getView().byId("oSelect1").setValue(res1[iRowIndex].PRINTERN);
										}

										if (typeof itemData3 !== "undefined" && itemData3.length > 0) {
											itemData3.push(itemRow1);
										} else {
											itemData3 = [];
											itemData3.push(itemRow1);
										}
									}
									if (cnt === 1) {
										that.getView().byId("oSelect1").setEditable(false);
									}

									// // Set Model
									oModel3.setData({
										data: itemData3
									});
									oModel3.refresh(true);
								}
								that.onBusyE(oBusy);
							},
							error: function (oResponse1) {
								//sap.ui.core.BusyIndicator.hide();
								that.onBusyE(oBusy);
							}
						});

						//************************filter printer*******************************************//								

					},
					error: function (oResponse) {
						that.onBusyE(oBusy);
						var oMsg = JSON.parse(oResponse.responseText);
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageToast.show(oMsg.error.message.value);
					}
				});

			}
		},

		onSave: function (oEvent) {
			var that = this;
			var flg = "";

			var oTable = that.getView().byId("tab");
			var oModel = oTable.getModel();
			// Get Items of the Table
			var aItems = oTable.getItems(); //All rows  
			if (aItems.length > 0) {
				var itemData = [];
				for (var iRowIndex = 0; iRowIndex < aItems.length; iRowIndex++) {
					// var l_Pallet = oModel.getProperty("Pallet", aItems[iRowIndex].getBindingContext());
					var l_Pallet = this.getView().byId("PALLET").getText();
					// var l_Fwt = oModel.getProperty("Fweight", aItems[iRowIndex].getBindingContext());
					var l_Swt = oModel.getProperty("Sweight", aItems[iRowIndex].getBindingContext());
					// var l_bwt = oModel.getProperty("Bagwt", aItems[iRowIndex].getBindingContext());
					// var l_char = oModel.getProperty("Charg", aItems[iRowIndex].getBindingContext());

					var nval = Number(l_Swt);

					if (nval < 0) {
						sap.m.MessageToast.show("2nd Weight can not be less than 0 for pallet " + l_Pallet);
						flg = "X";
					}

					itemData.push({
						Pallet: l_Pallet,
						// Fweight: l_Fwt,
						Sweight: l_Swt
							// BagWt: l_bwt,
							// Charg: l_char

					});
				}

				if (flg === "") {
					// Create one emtpy Object
					var oEntry1 = {};
					oEntry1.Pallet = l_Pallet;
					oEntry1.HEADITEMNAV = itemData;

					var oBusy = new sap.m.BusyDialog();
					that.onBusyS(oBusy);
					var oModel2 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZMMO_MRFHU_SRV/", true);

					oModel2.create("/HEADERSet", oEntry1, {
						success: function (oData, oResponse) {
							sap.m.MessageToast.show("Saved Successfully");
							that.onBusyE(oBusy);
						},
						error: function (oResponse) {
							that.onBusyE(oBusy);
							var oMsg = JSON.parse(oResponse.responseText);
							jQuery.sap.require("sap.m.MessageBox");
							sap.m.MessageToast.show(oMsg.error.message.value);
						}
					});
				}

			} else {
				sap.m.MessageToast.show("No Data for Posting");
			}
		},

		onSearch: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("Pallet", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("Pallet")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function (aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

	});
});