export interface FilterConfig {
  data: any[];
  columns: { key: string; filterOptions?: any[] }[];
  columnFilters: { [key: string]: any[] }; // ✅ Always an array
  searchTerm?: string;
  columnOptionMaps?: { [key: string]: { [id: string]: string } }; // ID ➝ name map
}

export function applyTableFilters(config: FilterConfig) {
  const { data, columns, columnFilters, searchTerm, columnOptionMaps } = config;

  const filteredData = data.filter(row => {
    const matchSearch = !searchTerm || columns?.some(col =>
      row[col.key]?.toString()?.toLowerCase()?.includes(searchTerm.toLowerCase())
    );

    const matchColumns = Object.keys(columnFilters).every(key => {
      const selectedIds = columnFilters[key];
      const cellValue = row[key];

      if (!Array.isArray(selectedIds) || selectedIds.length === 0) return true;
      const map = columnOptionMaps?.[key];
      if (!map) return true;

      const matchedId = Object.entries(map).find(([id, name]) => name === cellValue)?.[0];
      return selectedIds.includes(matchedId);
    });

    return matchSearch && matchColumns;
  });


}

