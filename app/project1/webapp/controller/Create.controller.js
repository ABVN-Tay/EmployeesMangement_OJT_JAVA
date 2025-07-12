sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "project1/controller/Base.controller"
], function (Controller, History, MessageBox, MessageToast, JSONModel, BaseController) {
    "use strict";
    return BaseController.extend("project1.controller.Create", {
        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Create").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function () {
            this._initID = crypto.randomUUID()
            //Initial employee Information
            const initEmployee = {
                // ID: this._initID,
                firstName: "",
                lastName: "",
                dateOfBirth: "",
                gender: "Male",
                email: "",
                hireDate: "",
                role_ID: "f50a1b1e-70c9-40b7-b98e-6f4fd92e7c70",       //Developer , 50000
                department_ID: "de8e0a1f-7e9b-45e6-8e41-01d2a6f21c13"  //RDC
            };
            this._oOriginalData = JSON.parse(JSON.stringify(initEmployee));

            // create Model for view
            const empModel = new JSONModel(initEmployee);
            this.getView().setModel(empModel, "initEmployee");

            // this.setEditMode();
            const validGenders = ["Male", "Female", "Other"];

            // Convert array to key-text format for binding
            const genderData = validGenders.map(gender => ({
                key: gender,
                text: gender
            }));

            const genderModel = new JSONModel(genderData);
            this.getView().setModel(genderModel, "genderModel");


            const oModel = this.getOwnerComponent().getModel();
            //Binding Deparments Model to View
            oModel.bindList("/Departments").requestContexts().then(aContexts => {
                const aDepartments = aContexts.map(ctx => ctx.getObject());
                const oDepartJSONModel = new sap.ui.model.json.JSONModel({ Departments: aDepartments });
                console.log(oDepartJSONModel)
                this.getView().setModel(oDepartJSONModel, "departmentsModel");
            });
            //Binding Roles Model to View        
            oModel.bindList("/Roles").requestContexts().then(aContexts => {
                const aRoles = aContexts.map(ctx => ctx.getObject());
                const oRoleJSONModel = new sap.ui.model.json.JSONModel({ Roles: aRoles });
                console.log(oRoleJSONModel)
                this.getView().setModel(oRoleJSONModel, "rolesModel");
            })
        },

        onSavePress: async function () {
            // get data model from view (oModel binding in View)
            const oEmployee = this.getView().getModel("initEmployee").oData;

            // setup employee to create 
            const newEmployee = {
                // ID: this._initID,
                firstName: oEmployee.firstName,
                lastName: oEmployee.lastName,
                dateOfBirth: oEmployee.dateOfBirth,
                gender: oEmployee.gender,
                email: oEmployee.email,
                hireDate: oEmployee.hireDate,
                salary: null,
                department_ID: oEmployee.department_ID,
                role_ID: oEmployee.role_ID
            };
            const errors = this.validateEmployee(newEmployee);
            if (errors.length > 0) {
                if (errors.length > 0) {
                    MessageBox.error(errors[0]);
                }
            }
            else {
                //calculate salary
                const calSalary = await this.getCalSalary(newEmployee.hireDate, newEmployee.role_ID);

                //create Employee
                newEmployee.salary = parseFloat(calSalary)
                this.createEmployee(newEmployee);
            }

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
        createEmployee: function (employee) {
            //send request to create new employee
            fetch("/odata/v4/catalogService/Employees", {
                method: "POST",
                headers: {
                    // 'Authorization': `Bearer ${accessToken}`,
                    'x-csrf-token': 'Fetch',
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(employee)
            })
                .then(response => {
                    if (!response.ok) throw new Error("Network response was not ok");
                    return response.json();
                })
                .then(data => {
                    console.log("Employee created:", data);
                    MessageToast.show("Employee created successfully", {
                        closeOnBrowserNavigation: false
                    })
                    this.setDisplayMode();
                    this.getOwnerComponent().getRouter().navTo("EmployeesDetail", { id: data.ID }, true);
                })
                .catch(err => {
                    console.error("Error creating employee:", err);
                });

        },
        onSamplePress: function () {
            const initEmployee = {
                // ID: "",
                firstName: "John",
                lastName: "Doe",
                dateOfBirth: "1990-05-15",
                gender: "Male",
                email: "john.doe@example.com",
                hireDate: "2023-01-10",
                role_ID: "f50a1b1e-70c9-40b7-b98e-6f4fd92e7c70",       //Developer , 50000
                department_ID: "de8e0a1f-7e9b-45e6-8e41-01d2a6f21c13"  //RDC
            };
            console.log(initEmployee)
            const empModel = new JSONModel(initEmployee);
            this.getView().setModel(empModel, "initEmployee");
            this._oOriginalData = JSON.parse(JSON.stringify(initEmployee));
        },
        onCancelPress: function () {
            const oLocal = this.getView().getModel("local").oData;
            console.log(oLocal.token)

            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            var sCancelMessage = oBundle.getText("cancelMessage");       // Get cancelMessagage
            const localModel = this.getView().getModel("local");
            const detailModel = this.getView().getModel("initEmployee");
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
                                this.setDisplayMode();
                                this.getOwnerComponent().getRouter().navTo("RouteEmployeesList");
                            }
                        }.bind(this)
                    }
                );
            }
            else {
                this.setDisplayMode();
                this.getOwnerComponent().getRouter().navTo("RouteEmployeesList");
            }
        },
        checkchange: function () {
            const detailData = this.getView().getModel("initEmployee").getData();
            console.log(detailData)
            console.log(typeof detailData)
            console.log(this._oOriginalData)
            console.log(typeof this._oOriginalData)
            // Compare stringified versions (simple deep comparison)
            return JSON.stringify(detailData) !== JSON.stringify(this._oOriginalData);

        },
        onNavBack: function () {
            const oLocal = this.getView().getModel("local").oData;
            console.log(oLocal.token)

            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            var sCancelMessage = oBundle.getText("cancelMessage");       // Get cancelMessagage
            const localModel = this.getView().getModel("local");
            const detailModel = this.getView().getModel("initEmployee");
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
                                this.setDisplayMode();
                                this.getOwnerComponent().getRouter().navTo("RouteEmployeesList");
                            }
                        }.bind(this)
                    }
                );
            }
            else {
                this.setDisplayMode();
                this.getOwnerComponent().getRouter().navTo("RouteEmployeesList");
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
        },
    });
})