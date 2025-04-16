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
}
