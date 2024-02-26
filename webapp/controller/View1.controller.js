sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"jquery.sap.global",
	'sap/ui/core/Fragment',
	'sap/ui/model/Filter',
	"sap/m/MessageBox",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/ui/core/syncStyleClass",
	'sap/m/Token',
	"sap/ui/export/Spreadsheet",
	"sap/ui/model/Sorter"
], function (Controller, MessageToast, global, Fragment, Filter, jquery, Button, Dialog, Text, MessageBox, syncStyleClass, Token,
	Spreadsheet, Sorter) {
	"use strict";
	var oView, oViewMaterial, oSAPuser, t, Button, Dialog, oSelectedItem, data, mod;

	return Controller.extend("ardprepstocknissanrasa.controller.View1", {
		onInit: function () {
			this.resetStockMateriales();
			jQuery.sap.require("ardprepstocknissanrasa.js.jszip");
			jQuery.sap.require("ardprepstocknissanrasa.js.xlsx");
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			t = this;
			oView = this.getView();

			this.readMaterialMultibox();

		},

		leerCurrentUser: function () {
            
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'GET',
                dataType:"json",
				url: appModulePath+ "/services/userapi/currentUser",
				success: function (dataR, textStatus, jqXHR) {
					this.leerUsuario(dataR.name);
				}.bind(this),
				error: function (jqXHR, textStatus, errorThrown) {}
			});
		},

		leerUsuario: function (sName) {
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
					var oTable = this.getView().getContent()[0].getPages()[0].getContent()[1].getContent()[0];
					var aColumns = oTable.getColumns();
					var sHeaderTab = this.getHeaderTable(aColumns);
					var sRowsTab = this.getRowsTable(oTable.getBindingInfo("rows").binding.oList, aColumns);
					var sTable = "<table>" + sHeaderTab + sRowsTab + "</table>";
					var sBody = "<table><tr><td class= subhead >Test de tabla</td></tr></table>";
					this.envioMail(sBody + sTable, dataR.emails[0].value);
				}.bind(this),
				error: function (jqXHR, textStatus, errorThrown) {}
			});
		},

		_navToView: function (oEvent) {
			try {
				var sMaterial = oEvent.getParameters().rowBindingContext.getModel().getObject(oEvent.getParameters().rowBindingContext.getPath()).Material;
				//var sMaterial = oEvent.getSource().getBindingContext("flowModel").getProperty("/stock/0/Material");
				if (sMaterial) {
					this.getOwnerComponent().getRouter().navTo("material", {
						material: sMaterial
					});
				}
			} catch (err) {

			}
		},

		onSalirMat: function () {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: "#"
				}
			});
		},

		filterDataSet: function (oEvent) {
			var aFilter = [new Filter("MATERIAL", sap.ui.model.FilterOperator.Contains, oEvent.getParameters().newValue)];
			oEvent.getSource().getBinding("suggestionItems").filter(aFilter, "Application");
			/*var aMatData = this.getView().getModel("material").getData();
			var aMatFilt = aMatData.filter(mat => mat.MATERIAL.search(oEvent.getParameters().newValue) !== -1);
			this.getView().getModel("materialFilt").setData(aMatFilt);*/
		},

		buildMailTable: function () {
			this.leerCurrentUser();
		},

		getHeaderTable: function (aCol) {
			var aColumnsText = [];
			aColumnsText.push("<tr>");
			for (var i = 0; i < aCol.length; i++) {
				aColumnsText.push("<th>" + aCol[i].getLabel().getText() + "</th>");
			}
			aColumnsText.push("</tr>");
			return aColumnsText.toString().replace(/,/g, "");
		},

		getRowsTable: function (oList, aCols) {
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

		excelManagementDet: function (oEvent) {
			var oSettings, aColumns, aCols, oDataSource, aColumnsFilt, oSheet;
			var oTable = this.getView().getContent()[0].getPages()[0].getContent()[1].getContent()[0];

			aCols = this.getColumnsToExcelDet(oTable.getColumns());
console.log(oTable)
			oDataSource = this.getDataSourcetoExcelDet(oTable.getColumns());
			var arr = [];
			for (var i = 0; i < oDataSource.length; i++) {
				arr.push({
					Cantna04: Number(oDataSource[i].Cantna04),
					Cantna05: Number(oDataSource[i].Cantna05),
					Cantna06: Number(oDataSource[i].Cantna06),
					Cantna08: Number(oDataSource[i].Cantna08),
					Cantsust1: Number(oDataSource[i].Cantsust1),
					Cantsust2: Number(oDataSource[i].Cantsust2),
					Cantsust3: Number(oDataSource[i].Cantsust3),
					Demandana06: Number(oDataSource[i].Demandana06),
					Demandasust1: oDataSource[i].Demandasust1,
					Demandasust2: oDataSource[i].Demandasust2,
					Demandasust3: oDataSource[i].Demandasust3,
					Descripcion1: oDataSource[i].Descripcion1,
					Descripcion2: oDataSource[i].Descripcion2,
					Descripcion3: oDataSource[i].Descripcion3,
					Material: oDataSource[i].Material
				});
			}
			oDataSource = arr;

			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: oDataSource, //oEvent.results,
				fileName: 'ReporteStock'
			};

			oSheet = new sap.ui.export.Spreadsheet(oSettings);

			oSheet.build();

		},

		getColumnsToExcelDet: function (aCols) {
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

		getDataSourcetoExcelDet: function (col) {
			var aDataSource = [];
			if (col) {
				var TabLength, aTable;
				var sProp,
					oDataSource;

				TabLength = this.getView().getModel("flowModel").getData().intCount;
				aTable = this.getView().getModel("flowModel").getData().stock;

				for (var a = 0; a < TabLength; a++) {
					oDataSource = {};
					for (var i = 0; i < col.length; i++) {
						sProp = col[i].getProperty("filterProperty");

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

		envioMail: function (e, mail) {
			var t = {
				root: {
					strmailto: mail,
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
					sap.m.MessageBox.show("Se ha enviado email correctamente.", {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Éxito.",
						actions: sap.m.MessageBox.Action.CLOSE
					});
				},
				error: function (e, t, o) {
					sap.m.MessageBox.show("Se ha enviado email correctamente.", {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Éxito.",
						actions: sap.m.MessageBox.Action.CLOSE
					});
				}
			})
		},

		readMaterialMultibox: function () {
			var arrResponse = [];
			var multiInputMaterial;
			var sMaterial;
			var oSelModel;
            var appid =  this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var sUrl = appModulePath + '/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/material?$top=600';
            
          
			$.ajax({
				type: 'GET',
				url: sUrl,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {
					try {
						if (!dataR.d.results.length) {
							arrResponse.push(dataR.d.results);
							sMaterial = new sap.ui.model.json.JSONModel(dataR.d.results);

						} else {
							arrResponse = dataR.d.results;
							sMaterial = new sap.ui.model.json.JSONModel(dataR.d.results);
						}
						var sMaterialFilt = new sap.ui.model.json.JSONModel();
						//var material = new sap.ui.model.json.JSONModel(dataR.d.results);
						oView.setModel(sMaterial, "material");
						oView.setModel(sMaterialFilt, "materialFilt");
						//oSelModel.setProperty("/material", arrResponse);
					} catch (e) {
						//	this.setBusyView(false);
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					var strJson = {
						codigo: "500",
						descripcion: "Error de Comunicacion favor contactar a Soporte"
					};
					arrResponse.push(strJson);
				},
			});
			//			this.setBusyView(false);
		},

		handleSelectionChange: function (oEvent) {
			var changedItem = oEvent.getParameter("changedItem");
			var isSelected = oEvent.getParameter("selected");

			var state = "Selected";
			if (!isSelected) {
				state = "Deselected";
			}

			MessageToast.show("Material : " + state + " '" + changedItem.getText() + "'", {
				width: "auto"
			});
		},

		handleSelectionFinish: function (oEvent) {},

		_setBusy: function (bBool) {
			this.getView().setBusy(bBool);
		},

		resetStockMateriales: function () {
			//			var oSelModel = this.getOwnerComponent().getModel("flowModel");
			//			oSelModel.setProperty("/stock", []);
		},

		pressReadStockMaterial: function () {
			this._setBusy(true);
			this.readStockMateriales(this.getView().byId("multiInput4").getTokens());
		},

		readStockMateriales: function (vMaterial) {
			var arrResponse = [];
			var arrRequest = [];
			var oSelModel = this.getOwnerComponent().getModel("flowModel");

			var sQuery = "";
			if (vMaterial.length <= 10) {
				for (var i = 0; i < vMaterial.length; i++) {
					if (vMaterial[i].getKey) {
						console.log("if");
						arrRequest.push({
							"Material": vMaterial[i].getKey().toString().toUpperCase()
						});
					} else {
						console.log("Else");
						arrRequest.push({
							"Material": vMaterial[i].Material.toString().toUpperCase()
						});
					}
				}
                
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
				$.ajax({
					type: 'POST',
					url: appModulePath+ "/AR_DP_DEST_CPI/http/AR/DealerPortal/Reporte/Stock/MaterialesSustitutos",
					contentType: 'application/json; charset=utf-8',
					dataType: 'json',
					async: true,
					data: JSON.stringify({
						"HeaderSet": {
							"Header": {
								"Material": "",
								"Nav_Header_Materiales": {
									"Materiales": arrRequest
								}
							}
						}
					}),
					success: function (dataR, textStatus, jqXHR) {
						try {
							if (!dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales.length) {
								arrResponse.push(dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales);
							} else {
								arrResponse = dataR.HeaderSet.Header.Nav_Header_Materiales.Materiales;
							}
							oSelModel.setProperty("/intCount", arrResponse.length);
							oSelModel.setProperty("/stock", arrResponse);
							this._setBusy(false);
						} catch (err) {
							this._setBusy(false);
							//this.setBusyView(false);
						}
					}.bind(this),
					error: function (jqXHR, textStatus, errorThrown) {
						this._setBusy(false);
						var strJson = {
							codigo: "500",
							descripcion: "Error de Comunicacion favor contactar a Soporte"
						};
						arrResponse.push(strJson);
					}.bind(this),
				});
			} else {
				sap.m.MessageBox.error("Sólo es posible consultar por el stock de 10 materiales a la vez.", {
					title: "Error", // default
					onClose: null, // default
					styleClass: "", // default
					actions: sap.m.MessageBox.Action.Close, // default
					emphasizedAction: null, // default
					initialFocus: null, // default
					textDirection: sap.ui.core.TextDirection.Inherit // default
				});
				this._setBusy(false);
			}

		},

		formatCantidades: function (vCantidad) {

			var iResultado;
			if (vCantidad === "") {
				iResultado = vCantidad;
			} else {
				iResultado = Number(vCantidad);
			}

			return iResultado;
		},

		pressUploadExcel: function (oEvent) {
			this._setBusy(true);
			var arrRequest = [];
			var oThis = this,
				file = oEvent.getParameter("files") && oEvent.getParameter("files")[0];
			if (file && window.FileReader) {
				var reader = new FileReader(),
					result = {},
					data;
				reader.onload = function (e) {
					data = e.target.result;
					var wb = XLS.read(data, {
						type: "binary",
						cellDates: true,
						cellStyles: true
					});
				
				
					wb.Sheets[wb.SheetNames[0]].A1.h = "Material";
					wb.Sheets[wb.SheetNames[0]].A1.r = "<t>Material</t>";
					wb.Sheets[wb.SheetNames[0]].A1.v = "Material";
					wb.Sheets[wb.SheetNames[0]].A1.w = "Material";
					wb.SheetNames.forEach(function (sheetName) {
						var roa = XLS.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);
						if (roa.length > 0) {
							result[sheetName] = roa;

							arrRequest.push(wb.SheetNames[0]);
							this.readStockMateriales(roa);

						}
					}.bind(this));

				}.bind(this);

				reader.readAsBinaryString(file);
				//				oView.setModel(roa, "material");
			}

			//	this.readStockMateriales(arrRequest);
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

			var json = oView.getModel("flowModel").oData.stock;
			console.log(json);

			//	var solicitante = oUsuariosap;
			var datos = "";
			var titulo =
				"<table><tr><td class= subhead>REPORTE -<b> Stock Nissan </b><p></td></tr><p><tr><td class= h1>  Desde el portal de Dealer Portal," +
				"se Envia el reporte de Stock Nissan <p> ";
			var final = "</tr></table><p>Saludos <p> Dealer Portal Argentina </td> </tr> </table>";
			var cuerpo =
				"<table><tr><th>material</th><th>Trans</th><th>Pend</th><th>Libre</th><th>Bloqueo</th><th>Dmda</th><th>Sust1 </th><th>Cant</th><th>Dmda</th><th>Sust 2</th><th>Cant</th><th>Dmda</th><th>Sust 3</th><th>Cant</th><th>Dmda</th>";
			for (var i = 0; i < json.length; i++) {
				var dato = "<tr><td>" + json[i].Material + json[i].Descripcion + "</td><td>" + Number(json[i].Cantna04) + "</td><td>" + Number(json[i].Cantna05) +
					"</td><td>" + Number(json[i].Cantna06) +
					"</td><td>" + Number(json[i].Cantna08) + "</td><td>" + Number(json[i].Demandana06) + "</td><td>" + json[i].Descripcion1 + "</td><td>" + Number(json[i].Cantsust1) +
					"</td><td>" + Number(json[i].Demandasust1) +
					"</td><td>" + json[i].Descripcion2 + "</td><td>" + Number(json[i].Cantsust2) + "</td><td>" + Number(json[i].Demandasust2) + "</td><td>" + json[i].Descripcion3 +
					"</td><td>" + Number(json[i].Cantsust3) + "</td><td>" + Number(json[i].Demandasust3) + "</td></tr> ";
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