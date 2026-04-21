export const tableColumns  = [
  {
    label: 'No',
    key: 'sl',
    sortable: false
  },
  {
    label: 'Ticket Number',
    key: 'ticket_number',
    sortable: true,
    sortKey: 'ticket_number'
  },
  {
    label: 'Issue',
    key: 'issue',
    sortKey:'issue',
    keyId: 'id',
    filterable: true,
    filterType: 'multi-select',
    paramskeyId: 'issue-ids',
    sortable: true,
  },
  {
    label: 'Employee Name',
    key: 'employee_name',
    sortKey:'employee__user__full_name',
    sortable: true,
    keyId: 'is_primary',
    paramskeyId: 'is-primary-ids',
    filterable: false,
    filterType: 'multi-select',
    leftAlign:true
  },
  {
    label: 'Ticket Raised Date',
    key: 'ticket_raised_date',
    sortKey:'ticket_raised_date',
    filterable: true,
    filterType: 'daterange',
    sortable: true,
    type:'date',
  },
  {
    label: 'Details',
    key: 'details',
    sortKey:'details',
    keyId: 'details',
    sortable: true
  },
  
  {
    label: 'Status',
    key: 'status_display',
    sortKey:'status_display',
    keyId: 'id',
    paramskeyId: 'status-ids',
    filterable: true,
    filterType: 'multi-select',
    sortable: true,
  },
  
  {
      label: 'Status Date',
    key: 'status_date',
    sortKey:'status_date',
    filterable: true,
    filterType: 'daterange',
    type:'date',
    sortable: true
  },
  {
    label: 'Attachment',
    key: 'attachment',
    sortKey:'attachment',
    sortable: false
  },
  {
    label: 'TAT',
    key: 'tat_hours',
    sortKey:'tat_hrs',
    sortable: true
  },
]
