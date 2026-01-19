
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
    sortKey:'client_name',
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
    key: 'job_status_name',
    sortKey:'job_status_name',
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
    key: 'primary_employee',
    sortKey:'primary_employee',
    sortable: true,
    keyId: 'is_primary',
    paramskeyId: 'is-primary-ids',
    filterable: true,
    filterType: 'multi-select',
  },
  { label: 'Est. Hrs', key: 'estimated_hours', sortKey:'total_estimated_minutes', sortable: true },
  { label: 'Act. Hrs', key: 'actual_hours', sortKey:'total_actual_minutes', sortable: true ,navigation:true},
  { label: 'Rem./Ex. Hrs', key: 'remaining_hours', sortKey:'remaining_minutes', sortable: true },

]


