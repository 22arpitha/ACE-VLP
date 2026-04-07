
export function getTableColumns(role: string, reportType?: string) {
    if (reportType === 'job-time-emp-report') {
      const tableColumns = [
        { label: 'Sl No', key: 'sl', sortable: false },
        { label: 'Job Number', key: 'job_number', sortKey: 'job_number', sortable: true },
        {
          label: 'Client',
          key: 'client_name',
          sortKey: 'client_name',
          sortable: true,
          leftAlign: true
        },
        {
          label: 'Job',
          key: 'job_name',
          sortKey: 'job_name',
          sortable: true,
          leftAlign: true
        },
        {
          label: 'Task',
          key: 'task',
          sortKey: 'task',
          sortable: true,
          leftAlign: true
        },
        { label: 'Job Status', key: 'job_status_name', sortKey: 'job_status_name', sortable: true },
        { label: 'Estimated Hours', key: 'estimated_hours', sortKey: 'estimated_hours', sortable: true },
        { label: 'Actual Hours', key: 'actual_hours', sortKey: 'actual_hours', sortable: true },
        {
          label: 'Employee',
          key: 'employee_name',
          sortKey: 'employee_name',
          sortable: true,
          leftAlign: true
        }
      ];
      // if (role !== 'Accountant') {
      //   tableColumns.splice(3, 0, {
      //     label: 'Employee',
      //     key: 'employee_name',
      //     sortKey: 'employee_name',
      //     sortable: true,
      //     leftAlign: true
      //   });
      // }
      return tableColumns;
    }

    const tableColumns = [
       {
        label: 'Sl No',
        key: 'sl',
        sortable: false
      },
      { label: 'Date', key: 'date', sortKey: 'date', sortable: false },
      {
        label: 'Client',
        key: 'client_name',
        sortKey: 'client_name',
        sortable: true,
        leftAlign:true
      },
      {
        label: 'Job',
        key: 'job_name',
        sortKey: 'job_name',
        sortable: true,
        leftAlign:true,
      },
      {
        label: 'Task',
        key: 'task_name',
        sortKey: 'task_name',
        sortable: true,
        leftAlign:true
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
        sortable: true,
        leftAlign:true
      });
    }

    return tableColumns;
    }
