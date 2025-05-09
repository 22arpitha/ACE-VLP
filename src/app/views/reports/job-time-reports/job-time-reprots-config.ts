
// Column Definitions
export const tableColumns  = [
  { label: 'Sl No', key: 'sl', sortable: true },
  {
    label: 'Client',
    key: 'client_name',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: [],
    sortable: true
  },
  {
    label: 'Job id',
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
    label: 'Status',
    key: 'job_status_name',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: [],
    sortable: true
  },
  {
    label: 'Task',
    key: 'task',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: [],
    sortable: true
  },
  { label: 'Est. Hrs', key: 'estimated_time', sortable: true },
  { label: 'Act. Hrs', key: 'actual_time', sortable: true ,navigation:true},
  { label: 'Rem./Ex. Hrs', key: 'remaining_time', sortable: true },

]


