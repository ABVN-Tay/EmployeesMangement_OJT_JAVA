sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/DateFormat"
], function (Controller,DateFormat) {
    "use strict";

    return Controller.extend("project1.controller.Base", {
        //Check age validation
        validateAgeOver18: function (dob) {
            const dobDate = new Date(dob);
            const today = new Date();
          
            const age = today.getFullYear() - dobDate.getFullYear();
            const m = today.getMonth() - dobDate.getMonth();
          
            if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
              return age - 1 >= 18;
            }
          
            return age >= 18;
        },
        //Check Date format 
        validateDateString: function (input) {
            const oDateFormat = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" }); // adjust pattern if needed
            const parsedDate = oDateFormat.parse(input);
            return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
        },
        //Check email
        validateEmail: function (email) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        },
        //Check gender
        validateGender: function (gender) {
            const validGenders = ["Male", "Female", "Other"];
            return validGenders.includes(gender);
        },
        //Check Hire Date
        validateHireDate: function (hireDate) {
            const today = new Date();
            return new Date(hireDate) <= today;
        },
        //Check DOB
        validateDateOfBirth: function (dob, hireDate) {
            const dobDate = new Date(dob);
            const hire = new Date(hireDate);
            const today = new Date();

            return dobDate < hire && dobDate < today;
        },
        // Validate all information
        validateEmployee: function (employee) {
            const errors = [];
            if (!employee.firstName) {
                errors.push("First Name must not be blank");
            }            
            if (!employee.lastName) {
                errors.push("Last Name must not be blank");
            }
            if (!employee.roles_ID) {
                errors.push("Role must not be blank");
            }  
            if (!employee.dateOfBirth) {
                errors.push("Date Of Birth must not be blank");
            }
            if (!employee.email) {
                errors.push("Email must not be blank");
            }  
            if (!employee.hireDate) {
                errors.push("Hire Date must not be blank");
            }   
            if (!employee.departments_ID) {
                errors.push("Department must not be blank");
            }                        
            if (!this.validateGender(employee.gender)) {
                errors.push("Invalid gender. Must be 'Male', 'Female', or 'Other'.");
            }

            if (!this.validateEmail(employee.email)) {
                errors.push("Invalid email format.");
            }

            if (!this.validateDateString(employee.dateOfBirth)) {
                errors.push("Invalid date format for Date of Birth (expected yyyy-MM-dd).");
            }

            if (!this.validateDateString(employee.hireDate)) {
                errors.push("Invalid date format for Hire Date (expected yyyy-MM-dd).");
            }

            if (this.validateDateString(employee.dateOfBirth) && this.validateDateString(employee.hireDate)) {
                if (!this.validateHireDate(employee.hireDate)) {
                    errors.push("Hire date cannot be in the future.");
                }

                if (!this.validateDateOfBirth(employee.dateOfBirth, employee.hireDate)) {
                    errors.push("Date of birth must be before hire date and in the past.");
                }
                if (!this.validateAgeOver18(employee.dateOfBirth)) {
                    errors.push("Employee must be at least 18 years old.");
                }
            }

            return errors;
        },
        // Function to calculate employment years
        calculateEmploymentYears: function (hireDateStr) {
            const hireDate = new Date(hireDateStr);
            const today = new Date();

            let years = today.getFullYear() - hireDate.getFullYear();

            const isBeforeAnniversary =
                today.getMonth() < hireDate.getMonth() ||
                (today.getMonth() === hireDate.getMonth() && today.getDate() < hireDate.getDate());

            if (isBeforeAnniversary) {
                years -= 1;
            }

            return years;
        }

    });
});