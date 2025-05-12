export const tableColumns  = [
  {
    label: 'Sl No',
    key: 'sl',
    sortable: false
  },
  {
    label: 'Client',
    key: 'client_name',
    keyId: 'client',
    paramskeyId: 'client-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Group',
    key: 'group_name',
    keyId: 'group',
    paramskeyId: 'group-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Job Id',
    key: 'job_number',
    sortable: true
  },
  {
    label: 'Job',
    key: 'job_name',
    keyId: 'id',
    paramskeyId: 'job-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Alloc. Date',
    key: 'job_allocation_date',
    filterable: true,
    filterType: 'date',
    sortable: false,
  },
  {
    label: 'Status',
    key: 'job_status_name',
    sortable: true
  },
  {
    label: 'Status Date',
    key: 'job_status_date',
    filterable: true,
    filterType: 'date',
    sortable: false,
  },
  {
    label: 'Primary Employee',
    key: 'is_primary',
    sortable: true
  }

]
