import { INavData } from '@coreui/angular';

export const navItems1: any = [
  {
    name: 'Dashboard',
    url: '/dashboards',
    icon: 'bi bi-speedometer',
  },
  {
    name: 'Project',
    icon: 'bi bi-stack',
    children: [
      {
        name: 'Projects',
        url: '/project/list'
      },
      {
        name: 'Project Category ',
        url: '/task/list'
      },
      {
        name: 'Clients',
        url: '/client/list'
      },
    ]
  },
  {
    name: 'My Time Sheet',
    icon: 'bi bi-calendar4-week',
    children: [
      {
        name: 'Timesheets',
        url: '/myTimesheet/timesheet'
      },
      {
        name: 'Timesheet Calender',
        url: '/myTimesheet/calender'
      },
      {
        name: 'Approval Configuration',
        url: '/approvalTimesheet/approvalConfiguration'
      },
      {
        name: 'Create new Timesheet',
        url: '/myTimesheet/create'
      }
    ]
  },
  {
    name: 'Approval TimeSheets',
    icon: 'bi bi-calendar-event',
    children: [
      {
        name: 'Todays Approvals',
        url: '/approvalTimesheet/todayApproval'
      },
      {
        name: 'Deadline Crossed',
        url: '/approvalTimesheet/deadlineCrossed'
      },
      {
        name: 'Month Timesheet',
        url: '/approvalTimesheet/monthTimesheet'
      }
    ]
  },
  {
    name: 'Approvals',
    url: '/review',
    icon: 'bi bi-yelp',
  },
  {
    name: 'Employee',
    icon: 'bi bi-file-person',
    children: [
      {
        name: 'Employees',
        url: '/people/people-list'
      }
    ]
  },
  {
    name: 'Accounts',
    icon: 'bi bi-wallet',
    children: [
      {
        name: 'Subscription',
        url: '/accounts/subscription',

      }
    ]
  },
  {
    name: 'Leave/Holiday List',
    icon: 'bi bi-file-text',
    children: [
      {
        name: 'My Leaves',
        url: '/leave/myLeaves'
      },
      {
        name: 'Leave Application',
        url: '/leave/leaveApplication'
      },
      {
        name: 'Applied Approved Leaves',
        url: '/leave/appliedApprovedLeaves'
      },
      {
        name: 'Leave Master',
        url: '/leave/leaveMaster'
      },
      {
        name: 'Office Working Day',
        url: '/leave/officeWorkingDays'
      }
    ]
  },
  {
    name: 'Company',
    icon: 'bi bi-amd',
    children: [
      {
        name: 'Industry/Sector List',
        url: '/industry/list'
      },
      {
        name: 'Department List',
        url: '/department/list'
      },
      {
        name: 'Role List',
        url: '/role/list'
      },
      {
        name: 'Centers',
        url: '/people/centers-list'
      },
    ]
  },

];
