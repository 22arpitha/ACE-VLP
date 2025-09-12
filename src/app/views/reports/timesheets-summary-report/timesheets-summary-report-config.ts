
// Column Definitions
export const tableColumns  = [
  {
    label: 'Sl No',
    key: 'sl',
    sortable: false
  },
  {
    label: 'Client',
    key: 'client_name',
    sortKey:'client__client_name',
    keyId: 'client_id',
    paramskeyId: 'client-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Job id',
    key: 'job_number',
    sortKey:'job_number',
    sortable: true
  },
  {
    label: 'Job',
    key: 'job_name',
    sortKey:'job_name',
    keyId: 'id',
    paramskeyId: 'job-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
   {
    label: 'Employee',
    key: 'is_primary',
    keyId:'employee_id',
    sortKey:'not_done',
    sortable: false,
    paramskeyId: 'timesheet-employee-ids',
    filterType: 'multi-select',
    filterable: true,
  },
  {
    label: 'Task',
    key: 'task',
    sortKey:'task',
    sortable: true
  },
  { label: 'Act. Hrs', key: 'actual_time', sortKey:'actual_time', sortable: true ,navigation:true},

]


