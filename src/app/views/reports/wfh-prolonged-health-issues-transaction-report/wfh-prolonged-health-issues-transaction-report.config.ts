// // Column Definitions
// export const tableColumns = [
//   {
//     label: 'Sl No',
//     key: 'sl',
//     sortable: false,
//   },
//   {
//     label: 'Date',
//     key: 'date',
//     sortKey: 'date',
//     sortable: false,
//   },
//     {
//       label: 'Employee',
//       key: 'employee',
//       keyId:'employee',
//       sortKey:'employee',
//       sortable: false,
//       paramskeyId: 'timesheet-employee-ids',
//       filterType: 'multi-select',
//       filterable: true,
//     },
//   {
//     label: 'Description',
//     key: 'description',
//     sortKey: 'description',
//     sortable: false,
//   },

//   {
//     label: 'Accrued Balance',
//     key: 'accrued',
//     sortKey: 'accrued',
//     sortable: false,
//   },
//   {
//     label: 'Utilized',
//     key: 'utilized',
//     sortKey: 'utilized',
//     sortable: false,
//   },
//   {
//     label: 'Balance',
//     key: 'balance',
//     sortKey: 'balance',
//     sortable: false,
//   },
// ];



export const tableColumns = [
  {
    label: 'Sl No',
    key: 'sl',
    sortable: true,
  },
  {
    label: 'Employee',
    key: 'employee',
    keyId: 'employee',
    sortKey: 'employee',
    sortable: true,
    paramskeyId: 'employee_id',
    filterType: 'multi-select',
    filterable: false,
  },
  {
    label: 'From Date',
    key: 'from_date',
    sortKey: 'from_date',
    sortable: true,
  },
  {
    label: 'To Date',
    key: 'to_date',
    sortKey: 'to_date',
    sortable: true,
  },
  // {
  //   label: 'WFH Category',
  //   key: 'wfh_category',
  //   sortKey: 'wfh_category',
  //   sortable: true,
  // },
  {
    label: 'Description',
    key: 'description',
    sortKey: 'description',
    sortable: true,
  },
  {
    label: 'Days Applied',
    key: 'days_applied',
    sortKey: 'days_applied',
    sortable: true,
  },
  {
    label: 'Approved By',
    key: 'approved_by',
    sortKey: 'approved_by',
    sortable: true,
  },
  {
    label: 'Approved On',
    key: 'approved_on',
    sortKey: 'approved_on',
    sortable: true,
  },
  {
    label: 'Created On',
    key: 'created_on',
    sortKey: 'created_on',
    sortable: true,
  },
];