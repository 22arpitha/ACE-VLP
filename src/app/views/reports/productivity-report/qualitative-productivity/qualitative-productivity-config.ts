

export const tableColumns = [
  { label: 'Sl No',
    key: 'sl'
  },
  {
    label: 'Client',
    key: 'client_name',
    sortKey: 'client__client_name',
    sortable: true
  },
  {
    label: 'Group',
    key: 'group_name',
    sortKey: 'group_name',
    sortable: true
  },
  {
    label: 'Job Id',
    key: 'job_number',
    sortKey: 'job_number',
    sortable: true
  },
  {
    label: 'Job',
    key: 'job_name',
    sortKey: 'job_name',
    sortable: true
  },
  {
    label: 'Total Points',
    key: 'total_points',
    sortKey: 'total_points',
    sortable: false
  },
  {
    label: 'MRP',
    key: 'total_mrp',
    sortKey: 'total_mrp',
    sortable: true
  },
  {
    label: 'CRP',
    key: 'total_crp',
    sortKey: 'total_crp',
    sortable: true
  },
  {
    label: 'Points Lost',
    key: 'points_lost',
    sortKey: 'points_lost',
    sortable: true
  },
  {
    label: 'Points earned',
    key: 'points_earned',
    sortKey: 'points_earned',
    sortable: true
  }
]
