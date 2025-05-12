

  export const tableColumns = [
    { label: 'Sl No', key: 'sl' },
    { label: 'Employee', key: 'employee_name', keyId:'employee_id', sortable: true ,filterable: true, filterType: 'multi-select' },
    { label: 'Sun', key: 'Sunday', sortable: true,navigation:true},
    { label: 'Mon', key: 'Monday', sortable: true,navigation:true },
    { label: 'Tues', key: 'Tuesday', sortable: true,navigation:true },
    { label: 'Wed', key: 'Wednesday', sortable: true,navigation:true },
    { label: 'Thu', key: 'Thursday', sortable: true,navigation:true },
    { label: 'Fri', key: 'Friday', sortable: true,navigation:true },
    { label: 'Sat', key: 'Saturday', sortable: true,navigation:true },
    { label: 'Total Time', key: 'employee_worked_hours', sortable: true },
    { label: 'Shortfall', key: 'short_fall', sortable: true }
  ];


