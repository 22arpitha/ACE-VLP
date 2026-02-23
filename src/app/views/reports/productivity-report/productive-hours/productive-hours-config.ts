export const tableColumns = [
    { label: 'Sl No',key: 'sl'},
    {
      label: 'Client',
      key: 'client_name',
      sortKey:'client_name',
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
      sortable: false
    },
    { label: 'Est. Hrs', key: 'estimated_hours', sortKey: 'total_estimated_minutes', sortable: true },
    { label: 'POC (%)',key: 'poc', sortKey: 'poc', sortable: true },
    { label: 'Productive Hours', key: 'productive_hours', sortKey: 'productive_minutes', sortable: true },
    { label: 'Act. Hrs', key: 'actual_hours', sortKey: 'total_actual_minutes', sortable: true},
  ]


