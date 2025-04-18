import { DynamicTableConfig } from '../../../shared/dynamic-table/dynamic-table-config.model';

// Column Definitions
export const tableConfig: DynamicTableConfig  = {
  columns:[
  { label: 'Sl No', key: 'sl', sortable: false },
  {
    label: 'Client',
    key: 'client_name',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: [],
    sortable: true
  },
  {
    label: 'Group',
    key: 'group_name',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: [],
    sortable: true
  },
  {
    label: 'Job Number',
    key: 'job_number',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: [],
    sortable: true
  },
  {
    label: 'Job Name',
    key: 'job_name',
    filterable: true,
    filterType: 'multi-select',
    filterOptions: [],
    sortable: true
  },
  {
    label: 'Job Allocation Date',
    key: 'job_allocation_date',
    filterable: true,
    filterType: 'date',
    sortable: false,
  },
  { label: 'Status', key: 'job_status_name', sortable: true },
  {
    label: 'Status Date',
    key: 'job_status_date',
    filterable: true,
    filterType: 'date',
    sortable: false,
  },
  { label: 'Primary Employee', key: 'is_primary', sortable: true },

],
data: [],
searchTerm: '',
actions: [],
accessConfig: [],
tableSize: 10,
pagination: true,
headerTabs:true,
includeAllJobs:true,
sendEmail:true,
}
