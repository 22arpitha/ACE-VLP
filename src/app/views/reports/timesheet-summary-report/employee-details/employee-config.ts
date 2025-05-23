
export function getTableColumns(role: string) {
  const tableColumns = [

  { label: 'Sl No', key: 'sl',sortable: false },
  { label: 'Date', key: 'date',sortable: true,type:'date',
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
    key: 'task_name',
    // filterable: true,
    // filterType: 'multi-select',
    sortable: true
  },

  { label: 'Start time', key: 'start_time', sortable: true },
  { label: 'End time', key: 'end_time', sortable: true },
  { label: 'Time spent', key: 'time_spent', sortable: true },
  { label: 'Notes', key: 'notes', sortable: false }

];
if (role !== 'Accountant' ) {
  tableColumns.splice(5, 0, {
    label: 'Employee',
    key: 'employee_name',
    // filterable: true,
    // filterType: 'multi-select',
    sortable: true
  });
}
return tableColumns;
}


