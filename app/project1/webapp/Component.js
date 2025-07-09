sap.ui.define([
    "sap/ui/core/UIComponent",
    "project1/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("project1.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);
            
            const oDataModel = new sap.ui.model.odata.v4.ODataModel({
                serviceUrl: "/catalogService/",
                synchronizationMode: "None",
                autoExpandSelect: true
              });
            
            this.setModel(oDataModel); // default model
            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
        }
    });
});