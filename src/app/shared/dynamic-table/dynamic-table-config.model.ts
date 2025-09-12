export interface TableColumn {
  label: string;
  key: string;
  type?: 'text' | 'date' | 'number';
  sortable?: boolean;
  sortWithApi?:boolean;
  filterable?: boolean;
  filterType?: 'text' | 'date' | 'multi-select';
  filterOptions?: string[];
  navigation?: boolean;
  inputField?:boolean;
  fileInputField?:boolean;
  sortKey?:string;
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
  formContent?:boolean;
  dateRangeFilter?:boolean;
  searchable?:boolean;
  currentPage?:number,
  totalRecords?:number,
  headerTabs?:boolean;
  showIncludeAllJobs?:boolean;
  includeAllJobsValue?:boolean;
  includeAllJobsEnable?:boolean;
  selectedClientId?:number;
  sendEmail?:boolean;
  sendWorkCulture?:boolean;
  estimationDetails?:boolean;
  tableFooterContent?:any;
  hideDownload?:boolean;
  showDownload?:boolean;
  averageProductivity?:boolean;
  average_productive_hour?:boolean;
  searchPlaceholder?:string;
  reset?:boolean;
}
