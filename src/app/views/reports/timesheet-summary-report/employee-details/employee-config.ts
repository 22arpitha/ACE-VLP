
export function getTableColumns(role: string) {
  const tableColumns = [

  { label: 'Sl No', key: 'sl',sortable: false },
  { label: 'Date', sortKey: 'date', key: 'date',sortable: true,type:'date',
  },
  {
    label: 'Client',
    key: 'client_name',sortable: false
  },
  {
    label: 'Job',
    key: 'job_name',sortable: false
  },
  {
    label: 'Task',
    sortKey: 'task_name',
    key: 'task_name',
    // filterable: true,
    // filterType: 'multi-select',
    sortable: true
  },

  { label: 'Start time', sortKey: 'start_time', key: 'start_time', sortable: true },
  { label: 'End time', sortKey: 'end_time', key: 'end_time', sortable: true },
  { label: 'Time spent', sortKey: 'time_spent', key: 'time_spent', sortable: true },
  { label: 'Notes', key: 'notes', sortable: false }

];
if (role !== 'Accountant' ) {
  tableColumns.splice(5, 0, {
    label: 'Employee',
    key: 'employee_name',
    sortKey: 'employee_name',
    // filterable: true,
    // filterType: 'multi-select',
    sortable: true
  });
}
return tableColumns;
}


