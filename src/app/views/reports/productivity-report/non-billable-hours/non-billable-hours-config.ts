export const tableColumns = [
  { label: 'Sl No',key: 'sl' },
  { label: 'Client',key: 'client_name', sortKey:'client__client_name', sortable: true},
  { label: 'Job Id', key: 'job_number', sortKey:'job_number', sortable: true },
  { label: 'Job',key: 'job_name', sortKey:'job_name', sortable: true },
  { label: 'Task', key: 'task', sortKey:'task', sortable: false },
  { label: 'Act. Hrs', key: 'actual_time', sortKey:'actual_time_val', sortable: false},
]
