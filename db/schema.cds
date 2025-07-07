namespace employees_management.db;

using {cuid} from '@sap/cds/common';


entity Departments : cuid {
  name : String;
}

entity Roles : cuid {
  name       : String;
  baseSalary : Decimal(15, 2);
}

entity Employees : cuid {
  firstName   : String;
  lastName    : String;
  dateOfBirth : Date;
  gender      : String;
  email       : String;
  hireDate    : Date;
  salary      : Decimal(15, 2);
  department  : Association to Departments;
  role        : Association to Roles;
}
