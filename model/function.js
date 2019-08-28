sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"com/baba/ZMM_MRFPAL/model/function"
], function (JSONModel, Device, functions) {
	"use strict";

	return {

		blank: function (soModel) {
			//************************set blank values to table*******************************************//
			var data;
			var noData = soModel.getProperty("/data");
			soModel.setData({
				modelData: noData
			});
			soModel.setData({
				modelData: data
			});
			//************************set blank values to table*******************************************//
			// return parseFloat(sValue).toFixed(2);
		}

	};
});