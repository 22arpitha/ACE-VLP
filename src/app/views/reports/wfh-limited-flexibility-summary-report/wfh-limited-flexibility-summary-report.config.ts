
// Column Definitions
export const tableColumns  = [
  {
    label: 'Sl No',
    key: 'sl',
    sortable: false
  },
  {
    label: 'Employee',
    key: 'employee_name',
    keyId:'employee_id',
    sortKey:'not_done',
    sortable: false,
    paramskeyId: 'timesheet-employee-ids',
    filterType: 'multi-select',
    filterable: true,
  },
   
  {
    label: 'Opening Balance',
    key: 'opening_balance',
    sortKey:'opening_balance',
    sortable: false
  },
  {
    label: 'Accrued',
    key: 'accrued',
    sortKey:'accrued_wfh',
    sortable: false
  },
  {
    label: 'Utilized',
    key: 'consumed_wfh',
    sortKey:'consumed_wfh',
    sortable: false
  },
  {
    label: 'Closing Balance',
    key: 'closing_balance',
    sortKey:'closing_balance',
    sortable: false
  },
  
]


