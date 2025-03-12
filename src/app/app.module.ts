import { NgModule } from '@angular/core';
import { DatePipe, HashLocationStrategy, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LoginComponent } from './views/login/login.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface,
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
// Import routing module
import { AppRoutingModule } from './app-routing.module';

// Import app component
import { AppComponent } from './app.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
// Import containers
import {
  DefaultFooterComponent,
  DefaultHeaderComponent,
  DefaultLayoutComponent,
} from './containers';

import {
  AvatarModule,
  BadgeModule,
  BreadcrumbModule,
  ButtonGroupModule,
  ButtonModule,
  CardModule,
  DropdownModule,
  FooterModule,
  FormModule,
  GridModule,
  HeaderModule,
  ListGroupModule,
  NavModule,
  ProgressModule,

  SidebarModule,
  TabsModule,
  UtilitiesModule,
} from '@coreui/angular';


import { IconModule, IconSetService } from '@coreui/icons-angular';
import { ToastrModule } from 'ngx-toastr';
import { RouterModule } from '@angular/router';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { BasicAuthInterceptor } from './service/basic-auth.interceptor';
import { HttpErrorInterceptor } from './service/http-error.interceptor';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};
import { VirtualScrollDirective } from './virtualscroll.directive';
import { SharedModule } from './shared/shared.module';
import { NgxUiLoaderHttpModule, NgxUiLoaderModule } from "ngx-ui-loader";
import { ActivateChildGuard } from './activate-child.guard';
import { AuthGuard } from './auth.guard';
import { OrgAuthGuard } from './org-auth.guard';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { CommonModule } from '@angular/common';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { UserGuideModalComponent } from './views/user-guide-modal/user-guide-modal.component';
import {MatDialogModule} from '@angular/material/dialog';
import { UserWelcomeMsgComponent } from './views/user-welcome-msg/user-welcome-msg.component';
import { RazorpayService } from './service/razorpay.service';
import { UseraccessInfoPopupComponent } from './views/useraccess-info-popup/useraccess-info-popup.component';
import { TemplatesComponent } from './views/templates/templates.component';


const APP_CONTAINERS = [
  DefaultFooterComponent,
  DefaultHeaderComponent,
  DefaultLayoutComponent,

];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ...APP_CONTAINERS,
    VirtualScrollDirective,
    UserGuideModalComponent,
    UserWelcomeMsgComponent,
    UseraccessInfoPopupComponent,
    TemplatesComponent,
  ],
  imports: [
    // ChartsModule,
    CommonModule,
    NgbTooltipModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AvatarModule,
    BreadcrumbModule,
    FooterModule,
    DropdownModule,
    GridModule,
    HeaderModule,
    SidebarModule,
    IconModule,
    PerfectScrollbarModule,
    NavModule,
    ButtonModule,
    FormModule,
    UtilitiesModule,
    ButtonGroupModule,
    ReactiveFormsModule,
    FormsModule,
    SidebarModule,
    TabsModule,
    ListGroupModule,
    ProgressModule,
    BadgeModule,
    ListGroupModule,
    CardModule,
    RouterModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    NgMultiSelectDropDownModule,
    SharedModule,
    DragDropModule,
    MatDialogModule,
    CarouselModule.forRoot(),
    ModalModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: "toast-top-right",
      preventDuplicates: true,
      // closeButton: true,

    }),
    NgxDaterangepickerMd.forRoot(),
    // FullCalendarModule
    NgxUiLoaderModule,
    NgxUiLoaderHttpModule.forRoot({
      showForeground: true
    })
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    // {
    //   provide: LocationStrategy,
    //   useClass: HashLocationStrategy,
    // },
    BsModalService,
    RazorpayService,
    ActivateChildGuard,
    AuthGuard,
    OrgAuthGuard,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    
      {
        provide: HTTP_INTERCEPTORS,
        useClass: HttpErrorInterceptor,
        multi: true,
      },
    
    IconSetService,
    Title,
    DatePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
