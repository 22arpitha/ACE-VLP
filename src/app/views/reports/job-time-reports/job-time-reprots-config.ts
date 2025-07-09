
// Column Definitions
export const tableColumns  = [
  {
    label: 'Sl No',
    key: 'sl',
    sortable: true
  },
  {
    label: 'Client',
    key: 'client_name',
    keyId: 'client_id',
    paramskeyId: 'client-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Job id',
    key: 'job_number',
    sortable: true
  },
  {
    label: 'Job',
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
   {
    label: 'PRIM EMP',
    key: 'is_primary',
    sortable: true
  },
  { label: 'Est. Hrs', key: 'estimated_time', sortable: true },
  { label: 'Act. Hrs', key: 'actual_time', sortable: true ,navigation:true},
  { label: 'Rem./Ex. Hrs', key: 'remaining_time', sortable: true },

]


