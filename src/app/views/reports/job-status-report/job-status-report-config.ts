export const tableColumns  = [
  {
    label: 'No',
    key: 'sl',
    sortable: false
  },
  {
    label: 'Client',
    key: 'client_name',
    sortKey:'client__client_name',
    keyId: 'client',
    paramskeyId: 'client-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Group',
    key: 'group_name',
    sortKey:'group__group_name',
    keyId: 'group',
    paramskeyId: 'group-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Job Id',
    key: 'job_number',
    sortKey:'job_number',
    sortable: true
  },
  {
    label: 'Job',
    key: 'job_name',
    sortKey:'job_name',
    keyId: 'id',
    paramskeyId: 'job-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Job Type',
    key: 'job_type_name',
    filterable: false,
    sortable:'true',
    sortKey:'job_type__job_type_name'
  },
  {
    label: 'Alloc On',
    key: 'job_allocation_date',
    sortKey:'job_allocation_date',
    filterable: true,
    paramskeyId: 'timesheet-dates',
    filterType: 'daterange',
    sortable: true,
    type:'date',
  },
  {
   label: 'Status',
    key: 'job_status_name',
    sortKey:'job_status_name',
    keyId: 'job_status',
    paramskeyId: 'job-status-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'POC',
    key: 'percentage_of_completion',
    sortKey:'percentage_of_completion',
    sortable: true
  },
  {
    label: 'Stat Date',
    key: 'job_status_date',
    sortKey:'job_status_date',
    filterable: true,
    filterType: 'date',
    type:'date',
  },
  {
    label: 'TAT',
    key: 'diff_days',
    sortable: false
  },
  {
    label: 'PRIM EMP',
    key: 'primary_employee',
    sortKey:'primary_employee',
    sortable: true,
    keyId: 'is_primary',
    paramskeyId: 'is-primary-ids',
    filterable: true,
    filterType: 'multi-select',
  }

]
