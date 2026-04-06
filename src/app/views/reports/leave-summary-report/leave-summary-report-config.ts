
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
    sortKey:'full_name_sort',
    sortable: true,
    paramskeyId: 'timesheet-employee-ids',
    filterType: 'multi-select',
    filterable: true,
  },
  {
    label: 'Opening Balance',
    key: 'opening_balance',
    sortKey:'opening_balance',
    sortable: true
  },
  {
    label: 'Accrued Balance',
    key: 'accrued_leaves',
    sortKey:'accrued',
    sortable: true
  },
  {
    label: 'Utilized',
    key: 'daily_consumed_leaves',
    sortKey:'consumed',
    sortable: true
  },
  {
    label: 'Closing Balance',
    key: 'closing_balance_leaves',
    sortKey:'closing_balance_leaves',
    sortable: true
  },
  
]


