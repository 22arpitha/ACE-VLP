
export const tableColumns = [
  // "day": "Sunday",
  // "date": "2025-04-20",
  // "month": "April",
  // "total_time": "0:00"
    { label: 'Sl No',
      key: 'sl'
    },
    {
      label: 'Day',
      key: 'day',
      filterable: true,
      filterType: 'multi-select',
      sortable: true
    },
    { label: 'Date', key: 'date', sortable: true },
    { label: 'Month',key: 'month',sortable: true },
    { label: 'Total Time', key: 'total_time', sortable: true },
    // { label: 'Thu', key: 'thu', sortable: true },
    // { label: 'Fri', key: 'fri', sortable: true },
    // { label: 'Sat', key: 'sat', sortable: true },
    // { label: 'Sun', key: 'sun', sortable: true },
    // { label: 'Total Time', key: 'total_time', sortable: true },
    // { label: 'Shortfall', key: 'shortfall', filterType: 'multi-select', sortable: false }
  ]

