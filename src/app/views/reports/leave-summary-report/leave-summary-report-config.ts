
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
    label: 'Increased',
    key: 'accrued_leaves',
    sortKey:'accrued',
    sortable: true
  },
  {
    label: 'Decreased',
    key: 'total_consumed_leaves',
    sortKey:'total_consumed_leaves',
    sortable: true
  },
  {
    label: 'Closing Balance',
    key: 'closing_balance',
    sortKey:'closing_balance',
    sortable: true
  },
  
]


