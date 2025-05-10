
export function getTableColumns(role: string) {
const tableColumns = [
  { label: 'Sl No', key: 'sl', sortable: true },
  { label: 'Date', key: 'date', sortable: true, filterable: true, filterType: 'date' },
  {
    label: 'Client Name',
    key: 'client_name',
    keyId:'client_id',
    paramskeyId: 'client-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Job Name',
    key: 'job_name',
    keyId:'job_id',
    paramskeyId: 'job-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Task Name',
    key: 'task_name',
    keyId:'id',
    paramskeyId: 'timesheet-task-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  { label: 'Start time', key: 'start_time', sortable: true },
  { label: 'End time', key: 'end_time', sortable: true },
  { label: 'Time spent', key: 'time_spent', sortable: true },
  { label: 'Notes', key: 'notes', sortable: false }
];
if (role !== 'Accountant' ) {
  tableColumns.splice(5, 0, {
    label: 'Employee Name',
    key: 'employee_name',
    keyId:'employee_id',
    paramskeyId: 'timesheet-employee-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  });
}

return tableColumns;
}
