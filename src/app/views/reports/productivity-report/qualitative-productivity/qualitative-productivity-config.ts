
// client_name
// group_name
// job_number
// job_name
// estimated_time
// percentage_of_completion
// productive_hours
// actual_time
// Sample data matching tableConfig keys

export const tableColumns = [
  { label: 'Sl No',key: 'sl' },
  { label: 'Client Name',key: 'client_name',sortable: true},
  { label: 'Group Name', key: 'group_name', sortable: true },
  { label: 'Job Number',key: 'job_number',sortable: true },
  { label: 'Job Name',key: 'job_name',sortable: true },
  { label: 'Estimated Time', key: 'estimated_time', sortable: true },
  { label: 'Percentage of Completion', key: 'percentage_of_completion', sortable: true },
  { label: 'Productive Hours', key: 'productive_hours', sortable: true },
  { label: 'Actual Time', key: 'actual_time', sortable: true }
]
