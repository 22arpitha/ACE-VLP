
// Column Definitions
export const tableColumns  = [
  { label: 'Sl No', key: 'sl', sortable: true },
  {
    label: 'Client Name',
    key: 'client_name',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: [],
    sortable: true
  },
  {
    label: 'Job Number',
    key: 'job_number',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: [],
    sortable: true
  },
  {
    label: 'Job Name',
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
  { label: 'Estimated Time (hrs)', key: 'estimated_time', sortable: true },
  { label: 'Actual Time (hrs)', key: 'actual_time', sortable: true ,navigation:true},
  { label: 'Remaining/(Excess) Time (hrs)', key: 'remaining_time', sortable: true },

]


