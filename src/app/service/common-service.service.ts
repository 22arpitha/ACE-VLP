import { Injectable } from '@angular/core';
import { ApiserviceService } from './apiservice.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonServiceService {
  permission: any = new BehaviorSubject('');
  
  user_id = sessionStorage.getItem('user_id')
  constructor(private api:ApiserviceService) {
    
   }
   private titleSubject = new BehaviorSubject<string>('Dashboard');
   title$ = this.titleSubject.asObservable();
   subsctiptionState$ = new BehaviorSubject(false);
   empolyeeStatus$ = new BehaviorSubject(true);
   jobStatus$ = new BehaviorSubject(false);
   profileSubject = new BehaviorSubject<any>(null);
   profilePhoto$ = this.profileSubject.asObservable()
   private previousPage = new BehaviorSubject<string>('');
   clientGroupCreationstatus$ = new BehaviorSubject(false);
   clientEndClientCreationstatus$ = new BehaviorSubject(false);
   clientActiveTabindex$ = new BehaviorSubject(0);



   subTitle$ = this.previousPage.asObservable()
   setTitle(title: string) {
     this.titleSubject.next(title);
   }
   setSubTitle(subtitle:string){
    this.previousPage.next(subtitle)
   }
   setSubscriptionStatus(status){
    this.subsctiptionState$.next(status)
   }
   setProfilePhoto(data:string){
    this.profileSubject.next(data);
   }

   setEmployeeStatusState(status:boolean){
    this.empolyeeStatus$.next(status);
   }
   setjobStatusState(status:boolean){
    this.jobStatus$.next(status);
   }
   setGroupCreationState(status:boolean){
    this.clientGroupCreationstatus$.next(status);
   }
   setEndClientCreationState(status:boolean){
    this.clientEndClientCreationstatus$.next(status);
   }
    
   setClientActiveTabindex(index:any){
    this.clientActiveTabindex$.next(index)
   }
}
