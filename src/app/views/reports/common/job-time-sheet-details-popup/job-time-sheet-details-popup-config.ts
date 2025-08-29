
export function getTableColumns(role: string) {
    const tableColumns = [
      { label: 'Date', key: 'date', sortKey: 'date', sortable: true },
      {
        label: 'Client',
        key: 'client_name',
        sortKey: 'client_name',
        sortable: true
      },
      {
        label: 'Job',
        key: 'job_name',
        sortKey: 'job_name',
        sortable: true
      },
      {
        label: 'Task',
        key: 'task_name',
        sortKey: 'task_name',
        sortable: true
      },
      { label: 'start_time', key: 'start_time', sortKey: 'start_time', sortable: true },
      { label: 'End time', key: 'end_time', sortKey: 'end_time', sortable: true },
      { label: 'Time spent', key: 'time_spent', sortKey: 'time_spent', sortable: true },
      { label: 'Notes', key: 'notes', sortable: false }
    ];
    if (role !== 'Accountant' ) {
      tableColumns.splice(4, 0, {
        label: 'Employee',
        key: 'employee_name',
        sortKey: 'employee_name',
        sortable: true
      });
    }

    return tableColumns;
    }
