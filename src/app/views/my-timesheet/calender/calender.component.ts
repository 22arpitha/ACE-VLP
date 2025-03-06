import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
//import { CalendarOptions } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi, EventInput } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { INITIAL_EVENTS, createEventId } from './event-utils';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.scss']
})
export class CalenderComponent implements OnInit {
 allTimeSheet:any = []
  calendarVisible: boolean;
  calendarOptions:CalendarOptions = {};
  user_id: string;
  orgId: any;
  BreadCrumbsTitle:any='Timesheet calendar';
 constructor(
  private changeDetector: ChangeDetectorRef,
  private api:ApiserviceService,
  private location:Location,
  private common_service:CommonServiceService) {
}
initEvent: EventInput[] = []
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id')
    this.orgId = sessionStorage.getItem('org_id')
    this.getAllTimeSheet()
  }
  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  getAllTimeSheet(){
   this.api.getData(`${environment.live_url}/${environment.timesheetCalender}?user_id=${this.user_id}&organization_id=${this.orgId}`).subscribe(res=>{
    this.allTimeSheet = res['result']['data']
    this.allTimeSheet.forEach(element => {
    
    if(element){
      const TODAY_STR = new Date(element['created_date_time']).toISOString().replace(/T.*$/, '');
      this.initEvent.push({id:createEventId(),title: element['approved_state'],start:TODAY_STR + 'T00:00:00',end:TODAY_STR + 'T00:00:00'
    
      })
    }
    this.calendarVisible = true;
   this.calendarOptions = {
      plugins: [
        //interactionPlugin,
        dayGridPlugin,
        timeGridPlugin,
        listPlugin,
      ],
      // headerToolbar: {
      //   left: 'prev,next today',
      //   center: 'title',
      //   right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      // },
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth'
      },
      initialView: 'dayGridMonth',
      initialEvents: this.initEvent, // alternatively, use the `events` setting to fetch from a feed
      weekends: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
     // select: this.handleDateSelect.bind(this),
      //eventClick: this.handleEventClick.bind(this),
      eventsSet: this.handleEvents.bind(this),
     // eventAdd:this.handleCreatedTimeSheet(this)
      /* you can update a remote database when these fire:
      eventAdd:
      eventChange:
      eventRemove:
      */
    };
    });

   })
  }
  
    // calendarOptions: CalendarOptions = {
    //   initialView: 'dayGridMonth',
    //   headerToolbar: {
    //     left: 'prev,next,today',
    //     center: 'title',
    //     right: 'dayGridMonth,dayGridWeek,dayGridDay'
    //   },
    //   dayMaxEvents: true, // allow "more" link when too many events
    //   events: [
    //     { title: 'event 1', date: '2021-08-12'},
    //     { title: 'event 1', date: '2021-08-12'},
    //     { title: 'event 1', date: '2021-08-12'},
    //     { title: 'event 1', date: '2021-08-12'},
    //     { title: 'event 1', date: '2021-08-12'},
    //     { title: 'event 1', date: '2021-08-12'},
    //     { title: 'event 1', date: '2021-08-12'},
    //     { title: 'event 1', date: '2021-08-12'},
    //     { title: 'event 1', date: '2021-08-12'},
    //     { title: 'event 2', date: '2021-08-11'},
    //   ]
    // };
  
    // calendarVisible = true;
    // calendarOptions: CalendarOptions = {
    //   plugins: [
    //     interactionPlugin,
    //     dayGridPlugin,
    //     timeGridPlugin,
    //     // listPlugin,
    //   ],
    //   headerToolbar: {
    //     left: 'prev,next today',
    //     center: 'title',
    //     right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    //   },
    //   initialView: 'dayGridMonth',
    //   initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
    //   weekends: true,
    //   editable: true,
    //   selectable: true,
    //   selectMirror: true,
    //   dayMaxEvents: true,
    //  // select: this.handleDateSelect.bind(this),
    //    eventClick: this.handleEventClick.bind(this),
    //   //eventsSet: this.handleEvents.bind(this),
    //   /* you can update a remote database when these fire:
    //   eventAdd:
    //   eventChange:
    //   eventRemove:
    //   */
    // };
   // currentEvents: EventApi[] = [];
  
   
  
    handleCalendarToggle() {
      this.calendarVisible = !this.calendarVisible;
    }
  
    handleWeekendsToggle() {
      const { calendarOptions } = this;
      calendarOptions.weekends = !calendarOptions.weekends;
    }
  
    // handleDateSelect(selectInfo: DateSelectArg) {
    //   //console.log(selectInfo,"SELECTINFO---")
    //   const title = prompt('Please enter a new title for your event');
    //   const calendarApi = selectInfo.view.calendar;
  
    //   calendarApi.unselect(); // clear date selection
  
    //   if (title) {
    //     calendarApi.addEvent({
    //       id: createEventId(),
    //       title,
    //       start: selectInfo.startStr,
    //       end: selectInfo.endStr,
    //       allDay: selectInfo.allDay
    //     });
    //   }
    // }
  
    // handleEventClick(clickInfo: EventClickArg) {
    //   if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
    //     clickInfo.event.remove();
    //   }
    // }
  
    handleEvents(events: EventApi[]) {
      //console.log(events,"EVENTS")
      this.initEvent = events;
      this.changeDetector.detectChanges();
    }
}
