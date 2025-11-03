
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
    label: 'Accrued Balance',
    key: 'accrued_leaves',
    sortKey:'accrued_leaves',
    sortable: false
  },
  {
    label: 'Utilized',
    key: 'daily_consumed_leaves',
    sortKey:'daily_consumed_leaves',
    sortable: false
  },
  {
    label: 'Closing Balance',
    key: 'closing_balance_leaves',
    sortKey:'closing_balance_leaves',
    sortable: false
  },
  
]


