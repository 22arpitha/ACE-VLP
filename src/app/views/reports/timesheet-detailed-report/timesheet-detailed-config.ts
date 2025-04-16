import { DynamicTableConfig } from '../../../shared/dynamic-table/dynamic-table-config.model';

// Sample timesheet data
const reportData = [
  {
    sl: 1,
    date: '24/03/2025',
    client: 'Vedalakshmi',
    job: 'Vedalakshmi',
    task: 'Processing',
    employee: 'John',
    start: '09:05',
    end: '09:35',
    spent: '00:25',
    notes: 'Lorem ipsum'
  },
  {
    sl: 2,
    date: '24/03/2025',
    client: 'Vedalakshmi',
    job: 'Vedalakshmi',
    task: 'Processing',
    employee: 'Steve',
    start: '09:05',
    end: '09:45',
    spent: '00:25',
    notes: 'Lorem ipsum'
  }
];

// Utility to get unique values for filters
const getUniqueValues = (data: any[], key: string): string[] => {
  return [...new Set(data.map(item => item[key]).filter(Boolean))];
};

// Column Definitions
export const tableConfig: DynamicTableConfig  = {
  columns:[
  { label: 'Sl No', key: 'sl', sortable: true },
  { label: 'Date', key: 'date', sortable: true, filterable: true, filterType: 'date' },
  {
    label: 'Client',
    key: 'client',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: getUniqueValues(reportData, 'client'),
    sortable: true
  },
  {
    label: 'Job Name',
    key: 'job',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: getUniqueValues(reportData, 'job'),
    sortable: true
  },
  {
    label: 'Task',
    key: 'task',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: getUniqueValues(reportData, 'task'),
    sortable: true
  },
  {
    label: 'Employee',
    key: 'employee',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: getUniqueValues(reportData, 'employee'),
    sortable: true
  },
  { label: 'Start Time', key: 'start', sortable: true },
  { label: 'End Time', key: 'end', sortable: true },
  { label: 'Time Spent', key: 'spent', sortable: true },
  { label: 'Notes', key: 'notes', sortable: false },

],
data: reportData,
searchTerm: '',
actions: [],
accessConfig: [],
tableSize: 10,
pagination: true
}


