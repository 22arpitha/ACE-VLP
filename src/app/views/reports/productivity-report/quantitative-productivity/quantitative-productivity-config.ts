import { DynamicTableConfig } from '../../../../shared/dynamic-table/dynamic-table-config.model';

// Sample raw data
const summaryData = [
  {
    sl: 1,
    clientName: 'Acme Corp',
    jobNumber: 'JOB-001',
    jobName: 'Quarterly Report',
    task: 'Data Collection',
    estimatedTime: '4.00',
    actualTime: '3.50',
    remainingTime: '0.50'
  },
  {
    sl: 2,
    clientName: 'Globex Ltd',
    jobNumber: 'JOB-002',
    jobName: 'Annual Audit',
    task: 'Reconciliation',
    estimatedTime: '6.00',
    actualTime: '7.00',
    remainingTime: '(1.00)' // Excess time
  },
  {
    sl: 3,
    clientName: 'Soylent Inc',
    jobNumber: 'JOB-003',
    jobName: 'Budget Forecast',
    task: 'Analysis',
    estimatedTime: '5.00',
    actualTime: '5.00',
    remainingTime: '0.00'
  }
];


export const tableConfig: DynamicTableConfig = {
  columns: [
    { label: 'Sl No',
      key: 'sl'
    },
    {
      label: 'Client Name',
      key: 'clientName',
      sortable: true
    },
    {
      label: 'Client Name',
      key: 'clientName',
      sortable: true
    },
    {
      label: 'Job Number',
      key: 'jobNumber',
      sortable: true
    },
    {
      label: 'Job Name',
      key: 'jobName',
      sortable: true
    },
    {
      label: 'Task',
      key: 'task',
      sortable: true
    },
    {
      label: 'Estimated Time (hrs)',
      key: 'estimatedTime',
      sortable: true
    },
    {
      label: 'Actual Time (hrs)',
      key: 'actualTime',
      sortable: true
    },
    {
      label: 'Remaining Time / (Excess) (hrs)',
      key: 'remainingTime',
      sortable: true
    }
  ],
  data: summaryData,
  searchTerm: '',
  searchable:false,
  actions: [],
  accessConfig: [],
  tableSize: 10,
  pagination: true,
};
