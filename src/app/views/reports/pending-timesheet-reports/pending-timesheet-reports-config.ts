export function getPendingColumns(role: string) {
  return [
    {
      label: 'Employee',
      key: 'full_name',
      keyId: 'employee_id',
      sortKey: 'full_name',
      filterable: role !== 'accountant',
      filterType: 'multi-select',
      paramskeyId: 'is-primary-ids',
      sortable: role !== 'accountant'
    }
  ];
}