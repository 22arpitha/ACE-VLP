// Column Definitions
export const tableColumns = [
  {
    label: 'Sl No',
    key: 'sl',
    sortable: false,
  },
  {
    label: 'Date',
    key: 'date',
    sortKey: 'date',
    sortable: false,
  },
    {
      label: 'Employee',
      key: 'employee_name',
      // keyId:'employee_id',
      sortKey:'employee_name',
      sortable: false,
      paramskeyId: 'timesheet-employee-ids',
      filterType: 'multi-select',
      filterable: false,
    },
  {
    label: 'Description',
    key: 'description',
    sortKey: 'description',
    sortable: false,
  },

  {
    label: 'Accrued',
    key: 'accrued',
    sortKey: 'accrued',
    sortable: false,
  },
  {
    label: 'Utilized',
    key: 'utilized',
    sortKey: 'utilized',
    sortable: false,
  },
  {
    label: 'Balance',
    key: 'balance',
    sortKey: 'balance',
    sortable: false,
  },
];
