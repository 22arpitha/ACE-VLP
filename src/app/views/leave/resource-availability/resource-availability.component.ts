import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';

@Component({
  selector: 'app-resource-availability',
  templateUrl: './resource-availability.component.html',
  styleUrls: ['./resource-availability.component.scss']
})
export class ResourceAvailabilityComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
 weekDates: Date[] = [
    new Date('2025-05-25'),
    new Date('2025-05-26'),
    new Date('2025-05-27'),
    new Date('2025-05-28'),
    new Date('2025-05-29'),
    new Date('2025-05-30'),
    new Date('2025-05-31')
  ];

  employees = [
    { id: '01', name: 'Vinayak Hegde' },
    { id: '02', name: 'Varija Hegde' },
    { id: '10', name: 'Ramya Hegde' },
    { id: '08', name: 'Rajashree Bhat' },
    { id: '07', name: 'Ganesh Hegde' },
    { id: '05', name: 'Rajendra Bhat' },
    { id: '06', name: 'Niranjan Vishwamitra' },
    { id: '11', name: 'Swathi Poojari' },
    { id: '04', name: 'Shreelakshmi Hegde' },
    { id: '09', name: 'Virendra Goudar' },
    { id: '14', name: 'Shripad Hegde' },
    { id: '15', name: 'Mangalagowri Hegde' },
    { id: '18', name: 'Santhosh Bhat' }
  ];

  leaves = [
    { empId: '06', date: '2025-05-26', type: 'SL', color: 'purple' },
    { empId: '11', date: '2025-05-26', type: 'CL', color: 'blue' }
  ];

  legendItems = [
    { code: 'CL', label: 'Casual Leave', color: 'blue' },
    { code: 'EL', label: 'Earned Leave', color: 'green' },
    { code: 'ML', label: 'Maternity Leave', color: 'orange' },
    { code: 'PL', label: 'Paternity Leave', color: 'pink' },
    { code: 'SL', label: 'Sick Leave', color: 'purple' },
    { code: 'LOP', label: 'Loss Of Pay', color: 'red' },
    { code: 'Co', label: 'Compensatory', color: 'lightgreen' }
  ];

  // Fix: generate string keys for columns
  get displayedColumns(): string[] {
    return ['employee', ...this.weekDates.map(d => this.getDateKey(d))];
  }

  getDateKey(date: Date): string {
    return date.toISOString().split('T')[0]; // e.g. "2025-05-25"
  }

  getLeave(empId: string, date: Date) {
    return this.leaves.find(
      l => l.empId === empId && l.date === this.getDateKey(date)
    );
  }

  getLeaveColor(type: string): string {
  const legend = this.legendItems.find(item => item.code === type);
  return legend ? legend.color : 'black';
}
}
