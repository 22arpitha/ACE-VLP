
export function getTableColumns(role: string) {
const tableColumns = [
  { label: 'Sl No', key: 'sl', sortable: true },
  { label: 'Date', key: 'date', sortable: true, filterable: true,paramskeyId: 'timesheet-dates', filterType: 'daterange' },
  {
    label: 'Client',
    key: 'client_name',
    keyId:'client_id',
    paramskeyId: 'client-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Job',
    key: 'job_name',
    keyId:'job_id',
    paramskeyId: 'job-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Task',
    key: 'task_name',
    keyId:'task',
    paramskeyId: 'timesheet-task-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  { label: 'Start Date', key: 'st', sortable: true },
  { label: 'End Date', key: 'end_time', sortable: true },
  { label: 'Time spent', key: 'time_spent', sortable: true },
  { label: 'Notes', key: 'notes', sortable: false }
];
if (role !== 'Accountant' ) {
  tableColumns.splice(5, 0, {
    label: 'Employee',
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
