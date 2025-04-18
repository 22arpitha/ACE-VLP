import { DynamicTableConfig } from '../../../../shared/dynamic-table/dynamic-table-config.model';

// Sample data matching tableConfig keys
const summaryData = [
  {
    sl: 1,
    clientName: 'Acme Corp',
    jobName: 'Quarterly Review',
    MRP: '45',
    CRP: '40',
    pointsLost: '5',
    pointsEarned: '40'
  },
  {
    sl: 2,
    clientName: 'Globex Ltd',
    jobName: 'Tax Filing',
    MRP: '50',
    CRP: '48',
    pointsLost: '2',
    pointsEarned: '48'
  },
  {
    sl: 3,
    clientName: 'Initech',
    jobName: 'Payroll Audit',
    MRP: '60',
    CRP: '55',
    pointsLost: '5',
    pointsEarned: '55'
  }
];

// Unique filter options generator
const getUniqueValues = (data: any[], key: string): string[] => {
  return [...new Set(data.map(item => item[key]).filter(Boolean))];
};

export const tableConfig: DynamicTableConfig = {
  columns: [
    { label: 'Sl No', key: 'sl' },
    {
      label: 'Client Name',
      key: 'clientName',
      filterable: true,
      filterType: 'multi-select',
      filterOptions: getUniqueValues(summaryData, 'clientName'),
      sortable: true
    },
    {
      label: 'Job Name',
      key: 'jobName',
      filterable: true,
      filterType: 'multi-select',
      filterOptions: getUniqueValues(summaryData, 'jobName'),
      sortable: true
    },
    {
      label: 'MRP',
      key: 'MRP',
      filterable: true,
      filterType: 'multi-select',
      filterOptions: getUniqueValues(summaryData, 'MRP'),
      sortable: true
    },
    {
      label: 'CRP',
      key: 'CRP',
      filterable: true,
      filterType: 'multi-select',
      filterOptions: getUniqueValues(summaryData, 'CRP'),
      sortable: true
    },
    {
      label: 'Points Lost',
      key: 'pointsLost',
      filterable: true,
      filterType: 'multi-select',
      filterOptions: getUniqueValues(summaryData, 'pointsLost'),
      sortable: true
    },
    {
      label: 'Points Earned',
      key: 'pointsEarned',
      filterable: true,
      filterType: 'multi-select',
      filterOptions: getUniqueValues(summaryData, 'pointsEarned'),
      sortable: true
    }
  ],
  data: summaryData,
  searchTerm: '',
  actions: [],
  accessConfig: [],
  tableSize: 10,
  pagination: true
};
