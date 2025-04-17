import { DynamicTableConfig } from '../../../shared/dynamic-table/dynamic-table-config.model';

// Sample raw data
const summaryData = [
  {
    sl: 1,
    employee: 'John',
    mon: '09:05',
    tues: '09:05',
    wed: '09:05',
    thu: '09:05',
    fri: '09:05',
    sat: '09:05',
    sun: '09:05',
    total_time: '06:35',
    shortfall: 'Low hours'
  },
  {
    sl: 2,
    employee: 'Steve',
    mon: '09:05',
    tues: '09:05',
    wed: '09:05',
    thu: '09:05',
    fri: '09:05',
    sat: '09:05',
    sun: '09:05',
    total_time: '06:25',
    shortfall: 'Low hours'
  }
];

// Unique filter options for employee and shortfall
const getUniqueValues = (data: any[], key: string): string[] => {
  return [...new Set(data.map(item => item[key]).filter(Boolean))];
};

export const tableConfig: DynamicTableConfig = {
  columns: [
    { label: 'Sl No',
      key: 'sl'
    },
    {
      label: 'Employee',
      key: 'employee',
      navigation:true,
      filterable: true,
      filterType: 'multi-select',
      filterOptions: getUniqueValues(summaryData, 'employee'),
      sortable: true
    },
    { label: 'Mon', key: 'mon', sortable: true },
    { label: 'Tues',key: 'tues',sortable: true },
    { label: 'Wed', key: 'wed', sortable: true },
    { label: 'Thu', key: 'thu', sortable: true },
    { label: 'Fri', key: 'fri', sortable: true },
    { label: 'Sat', key: 'sat', sortable: true },
    { label: 'Sun', key: 'sun', sortable: true },
    { label: 'Total Time', key: 'total_time', sortable: true },
    {
      label: 'Shortfall',
      key: 'shortfall',
      // filterable: true,
      filterType: 'multi-select',
      // filterOptions: getUniqueValues(summaryData, 'shortfall'),
      sortable: false
    }
  ],
  data: summaryData,
  searchTerm: '',
  actions: [],
  accessConfig: [],
  tableSize: 10,
  pagination: true,
  dateRangeFilter:true
};
