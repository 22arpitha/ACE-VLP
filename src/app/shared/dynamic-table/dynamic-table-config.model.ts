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
  empNavigation?:boolean;
  inputField?:boolean;
  fileInputField?:boolean;
  sortKey?:string;
  leftAlign?:boolean;
  width?:boolean;
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
  startAndEndDateFilter?:boolean
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
  showCsv?:boolean;
  showPdf?:boolean;
  disableDownload?:boolean
  averageProductivity?:boolean;
  average_productive_hour?:boolean;
  total_hours?:boolean,
  searchPlaceholder?:string;
  reset?:boolean;
  leaveTypes?:boolean;
  employeeDropdown?:boolean,
  reportType?:string;
  showSubmit?:boolean
}
