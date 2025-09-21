
// Column Definitions
export const tableColumns  = [
  {
    label: 'Sl No',
    key: 'sl',
    sortable: false
  },
//   {
//     label: 'Employee',
//     key: 'employee_name',
//     keyId:'employee_id',
//     sortKey:'not_done',
//     sortable: false,
//     paramskeyId: 'timesheet-employee-ids',
//     filterType: 'multi-select',
//     filterable: true,
//   },
   {
    label: 'Description',
    key: 'description',
    sortKey:'description',
    sortable: true
  },
  {
    label: 'Opening Balance',
    key: 'open_balance',
    sortKey:'open_balance',
    sortable: true
  },
  {
    label: 'Accrued Balance',
    key: 'accrued',
    sortKey:'accrued',
    sortable: true
  },
  {
    label: 'Utilized',
    key: 'utilized',
    sortKey:'utilized',
    sortable: true
  },
  {
    label: 'Balance',
    key: 'balance',
    sortKey:'balance',
    sortable: true
  },
  
]


