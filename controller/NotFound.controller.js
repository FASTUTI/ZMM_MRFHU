sap.ui.define([
		"com/baba/ZMM_MRFPAL/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("com.baba.ZMM_MRFPAL.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);