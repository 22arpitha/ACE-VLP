import { DynamicTableConfig } from '../../../shared/dynamic-table/dynamic-table-config.model';

// Sample timesheet data
const reportData = [
  // {
  //   sl: 1,
  //   job_number: 'Vedalakshmi',
  //   job: 'Vedalakshmi',
  //   task: 'Processing',
  //   employee: 'John',
  //   start: '09:05',
  //   end: '09:35',
  //   spent: '00:25',
  //   notes: 'Lorem ipsum'
  // },
 
];

// Utility to get unique values for filters
const getUniqueValues = (data: any[], key: string): string[] => {
  return [...new Set(data.map(item => item[key]).filter(Boolean))];
};

// Column Definitions
export const tableConfig: DynamicTableConfig  = {
  columns:[
  { label: 'Sl No', key: 'sl', sortable: true },
  {
    label: 'Job Number',
    key: 'job_number',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: getUniqueValues(reportData, 'job_number'),
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
    label: 'Status',
    key: 'status',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: getUniqueValues(reportData, 'status'),
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
  { label: 'Estimated Time (hrs)', key: 'estimated_time', sortable: true },
  { label: 'Actual Time (hrs)', key: 'actual_time', sortable: true },
  { label: 'Remaining/(Excess) Time (hrs)', key: 'excess_time', sortable: true },
  
],
data: reportData,
searchTerm: '',
actions: [],
accessConfig: [],
tableSize: 10,
pagination: true,
headerTabs:true,
showIncludeAllJobs:true,
includeAllJobsEnable:true,
includeAllJobsValue:false,
sendEmail:true,
}


