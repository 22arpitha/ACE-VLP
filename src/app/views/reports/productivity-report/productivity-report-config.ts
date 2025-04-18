import { DynamicTableConfig } from '../../../shared/dynamic-table/dynamic-table-config.model';
// Sample data
// Sample data updated to match tableConfig
const employeeData = [
  {
    sl: 1,
    quantitativeProductivity: 'High',
    qualitativeProductivity: 'Excellent',
    workCultureandWorkEthics: 'Good',
    overallProductivity: '90%',
  },
  {
    sl: 2,
    quantitativeProductivity: 'Medium',
    qualitativeProductivity: 'Good',
    workCultureandWorkEthics: 'Average',
    overallProductivity: '75%',
  }
];




// Column Definitions
export const tableConfig: DynamicTableConfig  = {
  columns:[
  { label: 'Sl No',
    key: 'sl',
    sortable: true
  },
  { label: 'Quantitative Productivity',
    key: 'quantitativeProductivity',
    sortable: true
  },
  {
    label: 'Qualitative Productivity',
    key: 'qualitativeProductivity',
    sortable: true
  },
  {
    label: 'Work Culture and Work Ethics',
    key: 'workCultureandWorkEthics',
    sortable: true
  },
  {
    label: 'Overall Productivity',
    key: 'overallProductivity',
    sortable: true
  }
],
data: employeeData,
searchTerm: '',
actions: [],
accessConfig: [],
tableSize: 10,
pagination: true
}


