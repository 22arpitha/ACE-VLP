export function getTableColumns(role: string) {
const tableColumns = [
  { label: 'Sl No', key: 'sl', sortable: false },
  {
    label: 'Client',
    key: 'client_name',
    sortKey:'client_name', 
    keyId:'client_id',
    paramskeyId: 'client-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true,
    leftAlign:true
  },
  {
    label: 'Group',
    key: 'group_name',
    sortKey:'group__group_name',
    keyId: 'group',
    paramskeyId: 'group-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Job',
    key: 'job_name',
    sortKey:'job_name',
    keyId:'job_id',
    paramskeyId: 'job-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true,
    leftAlign:true
  },
  {
   label: 'Status',
    key: 'status_name',
    sortKey:'status_name',
    keyId: 'job_status',
    paramskeyId: 'job-status-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
];
return tableColumns;
}
