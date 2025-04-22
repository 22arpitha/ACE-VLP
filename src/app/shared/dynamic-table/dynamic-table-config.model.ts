export interface TableColumn {
  label: string;
  key: string;
  type?: 'text' | 'date' | 'number';
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'date' | 'multi-select';
  filterOptions?: string[];
  navigation?: boolean;
}

export interface DynamicTableConfig {
  columns: TableColumn[];
  data: any[];
  searchTerm?: string;
  actions?: string[];
  accessConfig?: string[];
  tableSize?: number;
  pagination?: boolean;
  navigation?: boolean;
  dateRangeFilter?:boolean;
  searchable?:boolean;
  currentPage?:number,
  totalRecords?:number,
  headerTabs?:boolean;
  showIncludeAllJobs?:boolean;
  includeAllJobsValue?:boolean;
  includeAllJobsEnable?:boolean;
  sendEmail?:boolean;
  estimationDetails?:boolean;
  hideDownload?:boolean;
  averageProductivity?:boolean;
}
