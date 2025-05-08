
export function getTableColumns(role: string) {
    const tableColumns = [
      { label: 'Date', key: 'date', sortable: true },
      {
        label: 'Client Name',
        key: 'client_name',
        sortable: true
      },
      {
        label: 'Job Name',
        key: 'job_name',
        sortable: true
      },
      {
        label: 'Task Name',
        key: 'task_name',
        sortable: true
      },
      { label: 'start_time', key: 'start_time', sortable: true },
      { label: 'End time', key: 'end_time', sortable: true },
      { label: 'Time spent', key: 'time_spent', sortable: true },
      { label: 'Notes', key: 'notes', sortable: false }
    ];
    if (role !== 'Accountant' ) {
      tableColumns.splice(5, 0, {
        label: 'Employee Name',
        key: 'employee_name',
        sortable: true
      });
    }

    return tableColumns;
    }
