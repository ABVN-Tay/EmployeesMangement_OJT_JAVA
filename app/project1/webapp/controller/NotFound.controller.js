sap.ui.define([
    "sap/ui/core/mvc/Controller"
  ], function (Controller) {
    "use strict";
  
    return Controller.extend("project1.controller.NotFound", {
      onInit: function () {
        
      },
      onNavHome: function () {
        this.getOwnerComponent().getRouter().navTo("RouteEmployeesList", {}, true);
      }
    });
  });