
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
    label: 'Status',
    key: 'job_status__status_name',
    sortKey:'job_status__status_name',
    keyId: 'job_status',
    paramskeyId: 'job-status-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Task',
    key: 'task',
    sortKey:'task',
    sortable: false
  },
   {
    label: 'PRIM EMP',
    key: 'is_primary',
    sortKey:'primary_employee_name',
    sortable: true,
    keyId: 'is_primary',
    paramskeyId: 'is-primary-ids',
    filterable: true,
    filterType: 'multi-select',
  },
  { label: 'Est. Hrs', key: 'estimated_time', sortKey:'est_time', sortable: false }, // sorting issue
  { label: 'Act. Hrs', key: 'actual_time', sortKey:'act_time', sortable: false ,navigation:true},
  { label: 'Rem./Ex. Hrs', key: 'remaining_time', sortKey:'remaining_time', sortable: false },

]


