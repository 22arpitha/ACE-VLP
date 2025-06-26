function getOrdinalSuffix(n: number): string {
  if (n >= 11 && n <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

export const ACCURAL_DAYS_OPTIONS:any=[
  ...Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    return {
      label: `${day}${getOrdinalSuffix(day)}`,
      value: day,
    };
  }),
  { label: 'Last Date', value: 'last_date' },
  { label: 'Policy Date', value: 'policy_date' },
  { label: 'Joining Date', value: 'joining_date' },
];

export const ACCURAL_MONTH_OPTIONS:any=[
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Policy Month', value: 'policy_month' },
  { label: 'Joining Month', value: 'joining_month' }
];


export const EFFECTIVE_PERIOD_OPTIONS= [
  { label: 'Yearly', value: 'yearly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Days', value: 'day' }
]
export const EFFECTIVE_FROM_OPTIONS = [
  { label: 'Date Of Joning', value: 'date_of_joining'},
  { label: 'Date Of Confirmation', value: 'date_of_confirmation'}
]

export const CARRYFORWARD_FROM_OPTIONS = [
  { label: 'Carry Forward', value: 'carry_forward'},
  // { label: 'Carry Forward With Expiry', value: 'carry_forward_with_expiry'},
  { label: 'Carry Forward With Overlimit', value: 'carry_forward_with_Overlimit'}
]

