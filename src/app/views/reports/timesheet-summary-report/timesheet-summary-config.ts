

  export const tableColumns = [
    { label: 'Sl No', key: 'sl' },
    { label: 'Employee', key: 'employee_name', keyId:'employee_id', sortable: true ,filterable: true, filterType: 'multi-select' },
    { label: 'Sun', key: 'Sunday', keyId:'Sunday_date', sortable: true,navigation:true},
    { label: 'Mon', key: 'Monday',keyId:'Monday_date', sortable: true,navigation:true },
    { label: 'Tues', key: 'Tuesday', keyId:'Tuesday_date', sortable: true,navigation:true },
    { label: 'Wed', key: 'Wednesday', keyId:'Wednesday_date',sortable: true,navigation:true },
    { label: 'Thu', key: 'Thursday', keyId:'Thursday_date', sortable: true,navigation:true },
    { label: 'Fri', key: 'Friday',keyId:'Friday_date', sortable: true,navigation:true },
    { label: 'Sat', key: 'Saturday', keyId:'Saturday_date', sortable: true,navigation:true },
    { label: 'Total Time', key: 'employee_worked_hours', sortable: true },
    { label: 'Excepted Time', key: 'total_working_hours', sortable: true },
    { label: 'Shortfall', key: 'short_fall', sortable: true },
    { label: 'Status', key: 'is_locked', sortable: true }

  ];


