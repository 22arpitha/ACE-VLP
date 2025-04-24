
export function getTableColumns(role: string) {
const tableColumns = [
  { label: 'Sl No', key: 'sl', sortable: true },
  { label: 'Date', key: 'date', sortable: true, filterable: true, filterType: 'date' },
  {
    label: 'Client Name',
    key: 'client_name',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Job Name',
    key: 'job_name',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Task Name',
    key: 'task_name',
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  {
    label: 'Employee Name',
    key: 'employee_name',
    navigation: false,
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  },
  { label: 'start_time', key: 'start_time', sortable: true },
  { label: 'End time', key: 'end_time', sortable: true },
  { label: 'Time spent', key: 'time_spent', sortable: true },
  { label: 'Notes', key: 'notes', sortable: false }
];
if (role === 'admin') {
  tableColumns.splice(5, 0, {
    label: 'Employee Name',
    key: 'employee_name',
    navigation: false,
    filterable: true,
    filterType: 'multi-select',
    sortable: true
  });
}

return tableColumns;
}
