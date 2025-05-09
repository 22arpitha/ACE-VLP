export const tableColumns  = [
  { label: 'Sl No', key: 'sl', sortable: false },
  {
    label: 'Client',
    key: 'client_name',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: [],
    sortable: true
  },
  {
    label: 'Group',
    key: 'group_name',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: [],
    sortable: true
  },
  {
    label: 'Job Id',
    key: 'job_number',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: [],
    sortable: true
  },
  {
    label: 'Job',
    key: 'job_name',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: [],
    sortable: true
  },
  {
    label: 'Alloc. Date',
    key: 'job_allocation_date',
    filterable: true,
    filterType: 'date',
    sortable: false,
  },
  { label: 'Status', key: 'job_status_name', sortable: true },
  {
    label: 'Status Date',
    key: 'job_status_date',
    filterable: true,
    filterType: 'date',
    sortable: false,
  },
  { label: 'Pri Emp', key: 'is_primary', sortable: true },

]
