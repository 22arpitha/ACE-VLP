export function getTableColumns(role: string) {
  const tableColumns: any[] = [
    { label: 'Sl No', key: 'sl', sortable: false }
  ];

  if (role !== 'accountant') {
    tableColumns.push({
      label: 'Employee',
      key: 'full_name',
      sortKey: 'full_name',
      keyId: 'employee_id',
      paramskeyId: 'timesheet-employee-ids',
      filterable: true,
      filterType: 'multi-select',
      sortable: true,
      leftAlign: true
    });
  }

  tableColumns.push(
    {
      label: 'Date',
      key: 'timesheet_date',
      sortKey: 'timesheet_date',
      type: 'date',
      sortable: true,
      filterable: true,
      paramskeyId: 'timesheet-dates',
      filterType: 'daterange'
    },
    {
      label: 'Missed Count',
      key: 'missed_type',
      sortKey: 'missed_type',
      type: 'number',
      sortable: true
    }
  );

  return tableColumns;
}