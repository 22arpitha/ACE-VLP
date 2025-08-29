export const tableColumns = [
    { label: 'Sl No',key: 'sl'},
    {
      label: 'Client',
      key: 'client_name',
      sortKey:'client__client_name',
      sortable: true
    },
    {
      label: 'Group',
      key: 'group_name',
      sortKey:'group_name',
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
      label: 'Task',
      key: 'task',
      sortKey: 'task',
      sortable: true
    },
    { label: 'Est. Hrs', key: 'estimated_time', sortKey: 'estimated_time', sortable: true },
    { label: 'POC (%)',key: 'current_month_percentage_of_completion', sortKey: 'current_month_percentage_of_completion', sortable: true },
    { label: 'Productive Hours', key: 'productive_hours', sortKey: 'productive_hours', sortable: true },
    { label: 'Act. Hrs', key: 'actual_time', sortKey: 'actual_time', sortable: true},
  ]


