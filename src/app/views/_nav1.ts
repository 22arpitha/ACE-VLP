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
    // url: '/approvalTimesheet',
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
      },
      // {
      //   name:'Approval Configuration',
      //   url:'/approvalTimesheet/approvalConfiguration'
      // }
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
      },
      // {
      //   name:'Create People',
      //   url:'/people/create-people'
      // },

      // {
      //   name: 'Prefix/Suffix List',
      //   url: '/people/prefix-suffix-list'
      // },

      // {
      //   name:'Create Prefix/Suffix',
      //   url:'/people/create-prefix-suffix'
      // },
      // {
      //   name:'Add Centers',
      //   url:'/people/add-centers'
      // },

      // {
      //   name: 'Tag List',
      //   url: '/people/tag-list'
      // },

      // {
      //   name:'Add New Tag',
      //   url:'/people/add-tag-list'
      // }
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

  // {
  //   name:'Roles',
  //   url:'/role',
  //   icon:'bi bi-puzzle',
  //   children:[
  //     {
  //       name:'Role List',
  //       url:'/role/list'
  //     },
  //     {
  //       name:'Create Role',
  //       url:'/role/create'
  //     }
  //   ]
  // },
  // {
  //   name:'Departments',
  //   url:'/department',
  //   icon:'bi bi-amd',
  //   children:[
  //     {
  //       name:'Department List',
  //       url:'/department/list'
  //     },
  //     {
  //       name:'Create Department',
  //       url:'/department/create'
  //     }
  //   ]
  // },



  {
    name: 'Leave/Holiday List',
    // url: '/leave',
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
      // {
      //   name:'Add On Leaves Request',
      //   url:'/leave/addOnLeaveRequest'
      // },
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


  // {
  //   name:'Industry/Sector',
  //   url:'/industry',
  //   icon:'bi bi-buildings',
  //   children:[

  //     {
  //       name:'Create Industry/Sector',
  //       url:'/industry/create'
  //     }
  //   ]
  // },
  // {
  //   name:'Clients',
  //   url:'/client',
  //   icon:'bi bi-person-lines',
  //   children:[
  //     {
  //       name:'Clients',
  //       url:'/client/list'
  //     },
  //     {
  //       name:'Create Client',
  //       url:'/client/create'
  //     }
  //   ]
  // },
  // {
  //   name:'Project Status',
  //   url:'/status',
  //   icon:'bi bi-circle-square',
  //   children:[
  //     {
  //       name:'Main Project Category ',
  //       url:'/status/mainlist'
  //     },
  //     {
  //       name:'Sub Project Category ',
  //       url:'/status/sublist'
  //     },

  //   ]
  // },
  // {
  //   name:'Project Task Category',
  //   url:'/task',
  //   icon:'bi bi-exclude',
  //   children:[
  //     {
  //       name:'Project Category ',
  //       url:'/task/list'
  //     },
  //   ]
  // },
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
