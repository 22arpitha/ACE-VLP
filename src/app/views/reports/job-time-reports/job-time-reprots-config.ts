
// Column Definitions
export const tableColumns  = [
  {
    label: 'Sl No',
    key: 'sl',
    sortable: true
  },
  {
    label: 'Client Name',
    key: 'client_name',
    keyId: 'client_id',
    paramskeyId: 'client-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Job Number',
    key: 'job_number',
    sortable: true
  },
  {
    label: 'Job Name',
    key: 'job_name',
    keyId: 'id',
    paramskeyId: 'job-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
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
    label: 'Task',
    key: 'task',
    sortable: true
  },
  { label: 'Estimated Time (hrs)', key: 'estimated_time', sortable: true },
  { label: 'Actual Time (hrs)', key: 'actual_time', sortable: true ,navigation:true},
  { label: 'Remaining/(Excess) Time (hrs)', key: 'remaining_time', sortable: true },

]


