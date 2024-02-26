sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"ardprepstocknissanrasa/model/models",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, Device, models, JSONModel) {
	"use strict";

	return UIComponent.extend("ardprepstocknissanrasa.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function

			UIComponent.prototype.init.apply(this, arguments);

			var oFlowModel = new JSONModel({
				visHeader: true,
				displayName: '',
				idUser: '',
				usuarioActual: '',
				busyView: false,
				grupoActual: '',
				unidadesAsig: '',
				unidadesAsigOrig: '',
				solicitList: '',
				dataProc: '',
				dataProcTo: [],
				filtroFrom: null,
				filtroTo: null
			});
			this.setModel(oFlowModel, "flowModel");
			
			// enable routing
			var oRouter = this.getRouter();
			if (oRouter) {
				oRouter.initialize();
			}
			
			var oFacetItems = new JSONModel({
				list: [{name: "Materiales", id: "01"}]
			});
			this.setModel(oFacetItems, "facetItems");
			
			var oFlowModelMat = new JSONModel();
			this.setModel(oFlowModelMat, "flowModelMat");
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		},
		getContentDensityClass : function() {
			if (!this._sContentDensityClass) {
				if (!sap.ui.Device.support.touch) {
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});

});