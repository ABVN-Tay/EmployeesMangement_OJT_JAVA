sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "project1/controller/Base.controller",
    "sap/ui/core/format/DateFormat"
  ], function (Controller, History, MessageBox, MessageToast, JSONModel, BaseController, DateFormat) {
    "use strict";
    let sId = '';
    return BaseController.extend("project1.controller.Detail", {
      onInit: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.getRoute("EmployeesDetail").attachPatternMatched(this._onObjectMatched, this);
  
      },
  
      _onObjectMatched: function (oEvent) {
        sId = oEvent.getParameter("arguments").id;
        const oModel = this.getView().getModel();

        const sPath = `/Employees(${sId})`;
        //Binding Employee Model to View
        const validGenders = ["Male", "Female", "Other"];
        oModel.bindContext(sPath, null, {
          $expand: 'department($select=ID,name),role($select=ID,name,baseSalary)'
        })
          .requestObject().then((oEmployee) => {
            const oEmpJSONModel = new JSONModel(oEmployee);
            this.getView().setModel(oEmpJSONModel, "detailModel");
            console.log("detail model", oEmpJSONModel);
            this._oOriginalData = JSON.parse(JSON.stringify(oEmployee));
          });
  
        // Convert array to key-text format for binding
        const genderData = validGenders.map(gender => ({
          key: gender,
          text: gender
        }));
  
        const genderModel = new JSONModel(genderData);
        this.getView().setModel(genderModel, "genderModel");
  
        //Binding Deparments Model to View
        oModel.bindList("/Departments").requestContexts().then(aContexts => {
          const aDepartments = aContexts.map(ctx => ctx.getObject());
          const oDepartJSONModel = new JSONModel({ Departments: aDepartments });
          console.log("Departments",oDepartJSONModel)
          this.getView().setModel(oDepartJSONModel, "departmentsModel");
        });
  
        //Binding Roles Model to View        
        oModel.bindList("/Roles").requestContexts().then(aContexts => {
          const aRoles = aContexts.map(ctx => ctx.getObject());
          const oRoleJSONModel = new JSONModel({ Roles: aRoles });
          console.log("Roles",oRoleJSONModel)
          this.getView().setModel(oRoleJSONModel, "rolesModel");
        });
  
      },
      onAddPress: function () {
        console.log("Add button pressed");
  
      },
      onCaculatePress: function () {
        // get data model from view (oModel binding in View)
        const oEmployeeModel = this.getView().getModel("detailModel");
        const oEmployee = oEmployeeModel.getData();
        console.log("Employee detail ", oEmployee.firstName)
  
        let hireDate = oEmployee.hireDate;
        let baseSalary = oEmployee.roles.baseSalary;
        let employmentYears = this.calculateEmploymentYears(hireDate);
        let addiSalary = employmentYears * 1000;
        let calSalary = parseFloat(baseSalary) + parseFloat(addiSalary)
        oEmployeeModel.setProperty("/salary", calSalary.toString())
        console.log(oEmployee)
  
      },
      getCalSalary: async function (hireDate, role_ID) {
        //send request to calculate salary
        return fetch(`/odata/v4/catalogService/calculateSalary(hireDate=${hireDate},roles_ID=${role_ID})`, {
            method: "GET",
            headers: {
                'x-csrf-token': 'Fetch',
                "Accept": "application/json"
            }
        })
            .then(response => {
  
                if (!response.ok) throw new Error("Network response was not ok");
                return response.json();
                
            })
            .then(data => {
  
                console.log(data)
                return data.value
            })
            .catch(err => {
                console.error("Error creating employee:", err);
            });
      },
      onCancelPress: function () {
        var oBundle = this.getView().getModel("i18n").getResourceBundle();
        var sCancelMessage = oBundle.getText("cancelMessage");       // Get cancelMessagage
        const localModel = this.getView().getModel("local");
        const detailModel = this.getView().getModel("detailModel");
        const localData = localModel.getData();
        const isChange = this.checkchange();
        if (localData.isEdit && isChange) {
          MessageBox.confirm(
            sCancelMessage,
            {
              title: "Unsaved Changes",
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.NO,
              onClose: function (oAction) {
                if (oAction === MessageBox.Action.YES) {
                  //set the original data to detail model
                  detailModel.setData(this._oOriginalData);
                  this.setDisplayMode();
                }
              }.bind(this)
            }
          );
        }
        else {
          this.setDisplayMode();
        }
      },
      saveEmployeeData: async function () {
        // get data model from view (oModel binding in View)
        const oEmployeeModel = this.getView().getModel("detailModel");
        const oEmployee = oEmployeeModel.getData();
        //Get calculate Salary
        const calSalary = await this.getCalSalary(oEmployee.hireDate, oEmployee.role_ID)
        //overwrite to Employee salary
        oEmployeeModel.setProperty("/salary",Number(calSalary).toFixed(2))
  
        const newEmployee = {
          ID: oEmployee.ID,
          firstName: oEmployee.firstName,
          lastName: oEmployee.lastName,
          dateOfBirth: oEmployee.dateOfBirth,
          gender: oEmployee.gender,
          email: oEmployee.email,
          hireDate: oEmployee.hireDate,
          department_ID: oEmployee.department_ID,
          role_ID: oEmployee.role_ID,
          salary: parseFloat(oEmployee.salary)
        };
  
        fetch(`/odata/v4/catalogService/Employees(${oEmployee.ID})`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': 'Fetch'
          },
          body: JSON.stringify(newEmployee)
        })
          .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response;
          })
          .then(data => {
            console.log("Employee update:", data);
            MessageToast.show("Update successfully")
            this.setDisplayMode();
          })
          .catch(err => {
            console.error("Error updating employee:", err);
          });
      },
  
      onSavePress: async function () {
        var oBundle = this.getView().getModel("i18n").getResourceBundle();
        var saveMessage = oBundle.getText("saveMessage");       // Get cancelMessagage   
        var noChangeMessage = oBundle.getText("noChange");       // Get cancelMessagage      
        const oEmployee = this.getView().getModel("detailModel").getData();
        const isChange = this.checkchange();
        if (isChange) {
          // Show confirmation dialog before saving
          MessageBox.confirm(
            saveMessage,
            {
              title: "Confirm Save",
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.YES,
              onClose: function (oAction) {
                if (oAction === MessageBox.Action.YES) {
                  const errors = this.validateEmployee(oEmployee);
                  if (errors.length > 0) {
                    if (errors.length > 0) {
                      MessageBox.error(errors[0]);
                    }
                  }else {
                    this.saveEmployeeData();
  
                  }
                }
              }.bind(this)
            }
          );
        } else {
          MessageToast.show(noChangeMessage);
        }
      },
  
      onEditPress: function () {
        const detailOrignData = this.getView().getModel("detailModel").getData()
        const detailOrignModel = new JSONModel(detailOrignData);
        this.getView().setModel(detailOrignModel, "originModel");
        console.log("origin data", detailOrignData)
        this.setEditMode();
      },
      checkchange: function () {
        const detailModel = this.getView().getModel("detailModel");
        const detailData = detailModel.getData();
  
        console.log("New",JSON.stringify(detailData))
        console.log("Origin",JSON.stringify(this._oOriginalData))
        // Compare stringified versions
        return JSON.stringify(detailData) !== JSON.stringify(this._oOriginalData);
  
      },
      onNavBack: function () {
        var oBundle = this.getView().getModel("i18n").getResourceBundle();
        var cancelMessage = oBundle.getText("cancelMessage");       // Get cancelMessagage
        const localModel = this.getView().getModel("local");
        const detailModel = this.getView().getModel("detailModel");
        const localData = localModel.getData();
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();
        const isChange = this.checkchange();
  
        if (localData.isEdit && isChange) {
          MessageBox.confirm(
            cancelMessage,
            {
              title: "Unsaved Changes",
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.NO,
              onClose: function (oAction) {
                if (oAction === MessageBox.Action.YES) {
                  //set the original data to detail model
                  detailModel.setData(this._oOriginalData);
                  this.setDisplayMode();
                  if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                  } else {
                    this.setDisplayMode();
                    this.getOwnerComponent().getRouter().navTo("RouteEmployeesList", {}, true);
                  }
                }
              }.bind(this)
            }
          );
        }
        else {
          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            this.setDisplayMode();
            this.getOwnerComponent().getRouter().navTo("RouteEmployeesList", {}, true);
          }
        }
      },
      isVisibleForAdminNotEditing: function (role, isEdit) {
        return role === 'Admin' && isEdit === false;
      },
      isVisibleForAdminEditing: function (role, isEdit) {
        return role === 'Admin' && isEdit === true;
      },
  
      setDisplayMode: function () {
        const oLocalModel = this.getView().getModel("local");
        oLocalModel.setProperty("/isEdit", false);
  
        //Status after change
        const isEditAfter = oLocalModel.getProperty("/isEdit");
        console.log("Edit Mode:", isEditAfter);
      },
      setEditMode: function () {
        const oLocalModel = this.getView().getModel("local");
        oLocalModel.setProperty("/isEdit", true);
        //Status after change
        const isEditAfter = oLocalModel.getProperty("/isEdit");
        console.log("Edit Mode:", isEditAfter);
  
      },
      onRoleChange: async function (oEvent) {
        // Get the selected item
        var selectedItem = oEvent.getParameter("selectedItem").getKey();
        const rolesModel = this.getView().getModel("rolesModel");
        const detailModel = this.getView().getModel("detailModel");
        const rolesData = rolesModel.getData();
  
        // Convert object to array
        var aRoles = Object.values(rolesData);
  
        // Get matching item
        var matchRole = aRoles[0].find(item => item.ID === selectedItem);
  
        // console.log("Roles",rolesData);
        console.log("selected Item", selectedItem);
        console.log("Selected Role", matchRole);
  
        detailModel.setProperty("/roles", matchRole);
  
      },
      onDeletePress: function () {
        var oBundle = this.getView().getModel("i18n").getResourceBundle();
        var deleteMessage = oBundle.getText("deleteMessage");       // Get cancelMessagage
        MessageBox.confirm(
          deleteMessage,
          {
            title: "Confirm Delete",
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            emphasizedAction: MessageBox.Action.NO,
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.YES) {
                this.deleteEmployee()
              }
            }.bind(this)
          }
        );
  
      },
      deleteEmployee: function () {
        // get data model from view (oModel binding in View)
        const oEmployee = this.getView().getModel("detailModel").getData();
  
        fetch(`/odata/v4/catalogService/Employees(${oEmployee.ID})`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': 'Fetch',
          }
        })
          .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response;
          })
          .then(data => {
            MessageToast.show("Delete successfully",{
              closeOnBrowserNavigation: false 
          })
            this.getOwnerComponent().getRouter().navTo("RouteEmployeesList", {}, true);
            this.setDisplayMode();
          })
          .catch(err => {
            console.error("Error deleting employee:", err);
          });
      }
    });
  });