

  export const tableColumns = [
    { label: 'Sl No', key: 'sl' },
    { label: 'Employee', sortKey: 'employee_name', key: 'employee_name', keyId:'employee_id', sortable: true ,filterable: true, filterType: 'multi-select' },
    { label: 'Sun', sortKey: 'Sunday', key: 'Sunday', keyId:'Sunday_date', sortable: true,navigation:true},
    { label: 'Mon', sortKey: 'Monday', key: 'Monday',keyId:'Monday_date', sortable: true,navigation:true },
    { label: 'Tues', sortKey: 'Tuesday', key: 'Tuesday', keyId:'Tuesday_date', sortable: true,navigation:true },
    { label: 'Wed', sortKey: 'Wednesday', key: 'Wednesday', keyId:'Wednesday_date',sortable: true,navigation:true },
    { label: 'Thu', sortKey: 'Thursday', key: 'Thursday', keyId:'Thursday_date', sortable: true,navigation:true },
    { label: 'Fri', sortKey: 'Friday', key: 'Friday',keyId:'Friday_date', sortable: true,navigation:true },
    { label: 'Sat', sortKey: 'Saturday', key: 'Saturday', keyId:'Saturday_date', sortable: true,navigation:true },
    { label: 'Total Time', sortKey: 'employee_worked_hours', key: 'employee_worked_hours', sortable: true },
    { label: 'Excepted Time', sortKey: 'total_working_hours', key: 'total_working_hours', sortable: true },
    { label: 'Shortfall', sortKey: 'short_fall', key: 'short_fall', sortable: true },
    { label: 'Status', sortKey: 'is_locked', key: 'is_locked', sortable: true }

  ];


