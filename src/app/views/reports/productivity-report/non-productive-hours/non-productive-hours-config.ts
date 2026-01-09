export const tableColumns = [
    { label: 'Sl No',key: 'sl' },
    { label: 'Employee',key: 'employee_name', sortKey:'employee_name', sortable: true},
    { label: 'Client',key: 'client_name', sortKey:'client__client_name', sortable: true},
    { label: 'Job Id', key: 'job_number', sortKey:'job_number', sortable: true },
    { label: 'Job',key: 'job_name', sortKey:'job_name', sortable: true },
    // { label: 'Task', key: 'task_name', sortKey:'task_name', sortable: true },
    { label: 'Actual Time', key: 'total_time', sortKey:'total_time', sortable: false,navigation:true }
]
