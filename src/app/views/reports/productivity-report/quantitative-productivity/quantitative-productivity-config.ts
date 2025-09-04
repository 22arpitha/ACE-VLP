export const tableColumns = [
    { label: 'Sl No',
      key: 'sl'
    },
    {
      label: 'Client',
      key: 'client_name',
      sortKey: 'client__client_name',
      sortable: true
    },
    {
      label: 'Job Id',
      key: 'job_number',
      sortKey: 'job_number',
      sortable: true
    },
    {
      label: 'Job',
      key: 'job_name',
      sortKey: 'job_name',
      sortable: true
    },
    {
      label: 'Job Status',
      key: 'job_status_name',
      sortKey: 'job_status__status_name',
      sortable: true
    },
    {
      label: 'Task',
      key: 'task',
      sortKey:'task',
      sortable: true
    },
   { label: 'Est. Hrs', key: 'estimated_time', sortKey: 'estimated_time', sortable: true },
  { label: 'Act. Hrs', key: 'actual_time', sortKey: 'actual_time', sortable: true},
  { label: 'Rem./Ex. Hrs', key: 'remaining_time', sortKey: 'remaining_time', sortable: true },
  {
    label: 'TAT (Days',
    key: 'diff_days',
    sortable: false
  },
  ]
