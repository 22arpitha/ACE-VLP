export const tableColumns  = [
  {
    label: 'Sl No',
    key: 'sl',
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
  // {
  //   label: 'Allocated On',
  //   key: 'job_allocation_date',
  //   filterable: true,
  //   filterType: 'date',
  //   type:'date',
  // },
  {
    label: 'Allocated On',
    key: 'job_allocation_date',
    filterable: true,
    paramskeyId: 'timesheet-dates',
    filterType: 'daterange',
    sortable: true,
    type:'date',
  },
  {
   label: 'Status',
    key: 'job_status_name',
    keyId: 'job_status',
    paramskeyId: 'job-status-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'POC (%)',
    key: 'percentage_of_completion',
    sortable: true
  },
  {
    label: 'Status Date',
    key: 'job_status_date',
    filterable: true,
    filterType: 'date',
    type:'date',
  },
  {
    label: 'PRIM EMP',
    key: 'is_primary',
    sortable: true
  }

]
