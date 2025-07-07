using employees_management.db as my from '../db/schema';

@path: '/catalogService'
@(require: 'authenticated-user')
@(restrict: [
    {
        grant: ['READ'],
        to   : 'Viewer'
    },
    {
        grant: [
            '*'
        ],
        to   : 'Admin'
    },
])
service CatalogService {

    entity Employees   as projection on my.Employees;
    entity Departments as projection on my.Departments;
    entity Roles       as projection on my.Roles;
    function calculateSalary( hireDate: Date, roles_ID: UUID ) returns Decimal ;
    function getCurrentUser() returns {
        id    : String;
        email : String;
        roles : String;
    };
}