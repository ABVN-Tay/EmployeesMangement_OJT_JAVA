sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (BaseController) => {
  "use strict";

  return BaseController.extend("project1.controller.App", {
      onInit() {
        const oModel = this.getOwnerComponent().getModel();

        oModel.bindContext("/getCurrentUser()")
          .requestObject()
          .then((oData) => {
            console.log(oData)
            const oLocalData = {
              id: oData.id,
              email: oData.email || "Not available",
              roles: oData.roles,
              isEdit: false
            }
            const oLocal = new sap.ui.model.json.JSONModel(oLocalData);
            this.getView().setModel(oLocal, "local");
          })
          .catch(console.error);      
      }
  });
});