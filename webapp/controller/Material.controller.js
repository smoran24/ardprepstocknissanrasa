sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	'sap/ui/model/Filter',
	"sap/m/MessageBox",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/ui/model/json/JSONModel",
	"sap/ui/export/Spreadsheet"
], function (Controller, MessageToast, Filter, MessageBox, Button, Dialog, JSONModel, Spreadsheet) {
	"use strict";
	var t, oView;
	return Controller.extend("ardprepstocknissanrasa.controller.Material", {
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("material").attachPatternMatched(this._onObjectMatched, this);
			t = this;
			oView = this.getView();
		},

		_onObjectMatched: function (oEvent) {
			this._setBusy(true);
			var sMaterial = oEvent.getParameters().arguments.material;
			this.leerMaterial(sMaterial);
		},

		_setBusy: function (bBool) {
			this.getView().setBusy(bBool);
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("TargetView1", {}, true);
		},

		leerCurrentUserMat: function () {
            
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'GET',
                dataType:"json",
				url: appModulePath+ "/services/userapi/currentUser",
				success: function (dataR, textStatus, jqXHR) {
					this._setBusy(true);
					this.leerUsuarioMat(dataR.name);
				}.bind(this),
				error: function (jqXHR, textStatus, errorThrown) {
					//	debugger;
				}
			});
		},

		leerUsuarioMat: function (sName) {
            
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var url = appModulePath+ '/destinations/IDP_Nissan/service/scim/Users/' + sName;
			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: false,
				success: function (dataR, textStatus, jqXHR) {
					//		debugger;
					var oTable = this.getView().getContent()[0].getContent()[1];
					var aColumns = oTable.getColumns();
					var sHeaderTab = this.getHeaderTableDet(aColumns);
					var sRowsTab = this.getRowsTableDet(oTable.getBindingInfo("rows").binding.oList, aColumns);
					var sTable = "<table>" + sHeaderTab + sRowsTab + "</table>";
					var sBody = "<table><tr><td class= subhead >Test de tabla</td></tr></table>";
					this.envioMailDet(sBody + sTable, dataR.emails[0].value);
				}.bind(this),
				error: function (jqXHR, textStatus, errorThrown) {
					//	debugger;
				}
			});
		},

		buildMailTableDet: function () {
			this.leerCurrentUserMat();
		},

		envioMailDet: function (e) {
			var t = {
				root: {
					strmailto: "juantorresvill@gmail.com",
					strmailcc: "",
					strsubject: "Solicitud de Material",
					strbody: e
				}
			};
			var o = JSON.stringify(t);
            
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: "POST",
				url: appModulePath+ "/destinations/AR_DP_DEST_CPI/http/AR/DealerPortal/Mail",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				async: true,
				data: o,
				success: function (e, t, o) {
					this._setBusy(false);
					sap.m.MessageBox.show("Se ha enviado email correctamente.", {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Éxito.",
						actions: sap.m.MessageBox.Action.CLOSE
					});
				},
				error: function (e, t, o) {
					this._setBusy(false);
					sap.m.MessageBox.show("Se ha enviado email correctamente.", {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Éxito.",
						actions: sap.m.MessageBox.Action.CLOSE
					});
				}
			})
		},

		getHeaderTableDet: function (aCol) {
			var aColumnsText = [];
			aColumnsText.push("<tr>");
			for (var i = 0; i < aCol.length; i++) {
				aColumnsText.push("<th>" + aCol[i].getLabel().getText() + "</th>");
			}
			aColumnsText.push("</tr>");
			return aColumnsText.toString().replace(/,/g, "");
		},

		onSalirDet: function () {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: "#"
				}
			});
		},

		getRowsTableDet: function (oList, aCols) {
			var aRowsText = [];
			for (var a = 0; a < oList.length; a++) {
				aRowsText.push("<tr>");
				for (var i = 0; i < aCols.length; i++) {
					aRowsText.push("<td class= subhead >" + oList[a][aCols[i].getProperty("sortProperty")] + "</td>");
				}
				aRowsText.push("</tr>");
			}
			return aRowsText.toString().replace(/,/g, "");
		},

		excelManagement: function (oEvent) {
			// flowModelMat
			var oSettings, aColumns, aCols, oDataSource, aColumnsFilt, oSheet;
			var oReader = new FileReader();

			aCols = this.getColumnsToExcel(this.getView().getContent()[0].getContent()[1].getColumns());
			console.log(aCols);
			//	oDataSource = this.getDataSourcetoExcel(this.getView().getContent()[0].getContent()[1].getColumns());
			oDataSource = this.getView().getModel("flowModelMat").oData;
			for (var i = 0; i < oDataSource.length; i++) {
				var dia = oDataSource[i].Fechaembarque.substring(6, 8);
				var mes = oDataSource[i].Fechaembarque.substring(4, 6);
				var year = oDataSource[i].Fechaembarque.substring(0, 4);
				var fecha = dia + "/" + mes + "/" + year;
				oDataSource[i].Fechaembarque = fecha;

				var dia1 = oDataSource[i].Fechanac.substring(6, 8);
				var mes1 = oDataSource[i].Fechanac.substring(4, 6);
				var year1 = oDataSource[i].Fechanac.substring(0, 4);
				var fecha1 = dia1 + "/" + mes1 + "/" + year1;
				oDataSource[i].Fechanac = fecha1;

				var dia2 = oDataSource[i].Fechapedido.substring(6, 8);
				var mes2 = oDataSource[i].Fechapedido.substring(4, 6);
				var year2 = oDataSource[i].Fechapedido.substring(0, 4);
				var fecha2 = dia2 + "/" + mes2 + "/" + year2;
				oDataSource[i].Fechapedido = fecha2;

				var dia3 = oDataSource[i].Fechaprevarribo.substring(6, 8);
				var mes3 = oDataSource[i].Fechaprevarribo.substring(4, 6);
				var year3 = oDataSource[i].Fechaprevarribo.substring(0, 4);
				var fecha3 = dia3 + "/" + mes3 + "/" + year3;
				oDataSource[i].Fechaprevarribo = fecha3;

			}

			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: oDataSource, //oEvent.results,
				fileName: 'NomFile'
			};

			oSheet = new Spreadsheet(oSettings);

			oSheet.build();

		},

		getColumnsToExcel: function (aCols) {
			var aArray = [],
				sBind, sLenght;

			aCols.forEach(function (col) {

				aArray.push({
					label: col.getAggregation("label").getText(),
					property: col.getProperty("filterProperty"),
					width: "25"
				});

			});

			return aArray;
		},

		getDataSourcetoExcel: function (col) {
			var aDataSource = [];
			if (col) {
				var TabLength, aTable;
				var sProp,
					oDataSource;

				TabLength = this.getOwnerComponent().getModel("flowModelMat").getData().length;
				aTable = this.getOwnerComponent().getModel("flowModelMat").getData();

				for (var a = 0; a < TabLength; a++) {
					oDataSource = {};
					for (var i = 0; i < col.length; i++) {
						sProp = col[i].getAggregation("label").getText();

						if (aTable[a][sProp]) {
							oDataSource[sProp] = aTable[a][sProp];
						} else {
							oDataSource[sProp] = "";
						}
					}

					aDataSource.push(oDataSource);
				}
			}
			return aDataSource;
		},

		formatCantidades: function (vCantidad) {
			var iResultado;

			if (vCantidad == '') {
				iResultado = vCantidad;
			} else {
				jQuery.sap.require("sap.ui.core.format.NumberFormat");
				var oNumberFormat = sap.ui.core.format.NumberFormat.getIntegerInstance({
					maxFractionDigits: 0,
					groupingEnabled: false
				});
				iResultado = oNumberFormat.format(vCantidad);
			}

			return iResultado;
		},

		formatFechas: function (vFecha) {

		},

		leerMaterial: function (sMaterial) {
            
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'POST',
				url: appModulePath+ "/AR_DP_DEST_CPI/http/AR/DealerPortal/Reporte/Stock/ComprasMateriales",
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				data: JSON.stringify({
					"HeaderSet": {
						"Header": {
							"Material": "",
							"Nav_Header_Materiales": {
								"Materiales": [{
									"Material": sMaterial
								}]
							}
						}
					}
				}),
				success: function (dataR, textStatus, jqXHR) {
					try {
						var aMat = [];

						this._setBusy(false);

						if (dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales && dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales.length >
							0) {
							// aMat = dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales;
							console.log("entro");
							for(var i=0; i < dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales.length; i++){
							aMat.push({
								Cantidadembarcada:dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales[i].Cantidadembarcada,
								Etiqueta3pl: dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales[i].Etiqueta3pl,
								Factura: dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales[i].Factura,
								Fechaembarque: dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales[i].Fechaembarque,
								Fechaingdep: dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales[i].Fechaingdep,
								Fechanac: dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales[i].Fechanac,
								Fechapedido: dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales[i].Fechapedido,
								Fechaprevarribo: dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales[i].Fechaprevarribo,
								Material: dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales[i].Material,
								Mediotransporte: dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales[i].Mediotransporte,
								Nombre: dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales[i].Nombre,
								Nrodespacho: dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales[i].Nrodespacho,
								Proveedorfijo: dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales[i].Proveedorfijo,
								fechaem:"",
								fechanacionalizacion:"",
								fechaarribo:"",
								fechaingreso:""
								
							});
							console.log(aMat);
							}
						} else {
							sap.m.MessageBox.show("No existen datos para este material.", {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: "Atención.",
								actions: sap.m.MessageBox.Action.CLOSE
							});
							aMat = [];
						}
						this.getView().getModel("flowModelMat").setData(aMat);
					} catch (err) {

					}
				}.bind(this),
				error: function (jqXHR, textStatus, errorThrown) {
					this._setBusy(false);

				}.bind(this)
			});
		},
		//////*****************************correo********

		EnvioCorreo: function (evt) {

			var oDialog = oView.byId("EnvioCorreo");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "ardprepstocknissanrasa.view.Correo", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();

		},
		cerrarEnvioCorreo: function () {
			//	t.limpiezacorreo();
			oView.byId("EnvioCorreo").close();
		},

		estructura: function () {




			var oDataSource = this.getView().getModel("flowModelMat").oData;
			console.log(oDataSource);
			for (var j = 0; j < oDataSource.length; j++) {
				oDataSource[j].Cantidadembarcada = Number(oDataSource[j].Cantidadembarcada);
				var dia = oDataSource[j].Fechaembarque.substring(6, 8);
				var mes = oDataSource[j].Fechaembarque.substring(4, 6);
				var year = oDataSource[j].Fechaembarque.substring(0, 4);
			oDataSource[j].fechaem = dia + "/" + mes + "/" + year;
				//	oDataSource[j].Fechaembarque = fecha;

				var dia1 = oDataSource[j].Fechanac.substring(6, 8);
				var mes1 = oDataSource[j].Fechanac.substring(4, 6);
				var year1 = oDataSource[j].Fechanac.substring(0, 4);
				oDataSource[j].fechanacionalizacion = dia1 + "/" + mes1 + "/" + year1;
				//	oDataSource[j ].Fechanac = fecha1;

				var dia2 = oDataSource[j].Fechapedido.substring(6, 8);
				var mes2 = oDataSource[j].Fechapedido.substring(4, 6);
				var year2 = oDataSource[j].Fechapedido.substring(0, 4);
				oDataSource[j].fechaingreso = dia2 + "/" + mes2 + "/" + year2;
				//oDataSource[j].Fechapedido = fecha2;

				var dia3 = oDataSource[j].Fechaprevarribo.substring(6, 8);
				var mes3 = oDataSource[j].Fechaprevarribo.substring(4, 6);
				var year3 = oDataSource[j].Fechaprevarribo.substring(0, 4);
			oDataSource[j].fechaarribo = dia3 + "/" + mes3 + "/" + year3;
				//	oDataSource[j].Fechaprevarribo = fecha3;

			}

			console.log(oDataSource);
			var datos = "";
			var titulo =
				"<table><tr><td class= subhead>REPORTE -<b> Stock Nissan </b><p></td></tr><p><tr><td class= h1>  Desde el portal de Dealer Portal," +
				"se Envia el reporte de Stock Nissan <p> ";
			var final = "</tr></table><p>Saludos <p> Dealer Portal Argentina </td> </tr> </table>";
			var cuerpo =
				"<table><tr><th>material</th><th>Cantidad Embarcada </th><th>Nombre</th><th>Factura</th><th>Fecha Pedido</th><th>Fecha Embarque</th><th>Medio Transporte </th><th>Fecha Prev Arribo</th><th>Número Despacho</th><th>Fecha Nacionalización </th>";
			for (var i = 0; i < oDataSource.length; i++) {
				var dato = "<tr><td>" + oDataSource[i].Material + "</td><td>" + oDataSource[i].Cantidadembarcada + "</td><td>" + oDataSource[i].Nombre +
					"</td><td>" + oDataSource[i].Factura + "</td><td>" +	oDataSource[i].fechaingreso + "</td><td>" + oDataSource[i].fechaem + "</td><td>" + oDataSource[i].Mediotransporte +
					"</td><td>" + oDataSource[i].fechaarribo + "</td><td>" + oDataSource[i].Nrodespacho + "</td><td>" + oDataSource[i].fechanacionalizacion + "</td></tr> ";
				datos = datos + dato;
			}
			//	var datos = datos + dato
			var contexto = titulo + cuerpo + datos + final;
			//	console.log(contexto);
			t.envio(contexto);
		},
		envio: function (contexto) {
			t.popCarga();
			var arr = [];
			var json = {
				"root": {
					"strmailto": oView.byId("mail").getValue(),
					"strmailcc": "",
					"strsubject": oView.byId("descrpcion").getValue(),
					"strbody": contexto
				}
			};
			var arrjson = JSON.stringify(json);
            
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'POST',
				url: appModulePath+ '/destinations/AR_DP_DEST_CPI/http/AR/DealerPortal/Mail',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				data: arrjson,
				success: function (dataR, textStatus, jqXHR) {

				},
				error: function (jqXHR, textStatus, errorThrown) {

					t.cerrarPopCarga2();

					var obj2 = {
						codigo: "200",
						descripcion: "Correo enviado exitosamente"
					};
					var arr2 = [];
					arr2.push(obj2);
					t.popSuccesCorreo(arr2, "Correo");
					oView.byId("mail").setValue();
					oView.byId("descrpcion").setValue();
				}
			});
			//	codigoeliminar = "";
		},

		popSuccesCorreo: function (obj, titulo) {
			var oDialog = oView.byId("SuccesCorreo");
			var log = new sap.ui.model.json.JSONModel(obj);
			oView.setModel(log, "Succes");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "ardprepstocknissanrasa.view.SuccesCorreo", this); //aqui se debe cambiar ar_dp_rep
				oView.addDependent(oDialog);
			}
			oView.byId("SuccesCorreo").addStyleClass(this.getOwnerComponent().getContentDensityClass());
			oDialog.open();
			oView.byId("SuccesCorreo").setTitle("" + titulo);
			//	oView.byId("dialogSucces").setState("Succes");
		},
		cerrarPopSuccesCorreo: function () {
			oView.byId("SuccesCorreo").close();

			t.cerrarEnvioCorreo();
		},
		popCarga: function () {
			var oDialog = oView.byId("indicadorCarga");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "ardprepstocknissanrasa.view.PopUp", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
			//	oView.byId("textCarga").setText(titulo);
		},
		cerrarPopCarga2: function () {
			oView.byId("indicadorCarga").close();
		}

		//***********************fin correo

	});
});