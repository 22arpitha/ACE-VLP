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
import { SharedModule } from './shared/shared.module';
import { NgxUiLoaderHttpModule, NgxUiLoaderModule } from "ngx-ui-loader";
import { AuthGuard } from './auth-guard/auth.guard';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { CommonModule } from '@angular/common';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { UserGuideModalComponent } from './views/user-guide-modal/user-guide-modal.component';
import { MatDialogModule} from '@angular/material/dialog';
import { UserWelcomeMsgComponent } from './views/user-welcome-msg/user-welcome-msg.component';
import { RazorpayService } from './service/razorpay.service';
import { UseraccessInfoPopupComponent } from './views/useraccess-info-popup/useraccess-info-popup.component';
import { TemplatesComponent } from './views/templates/templates.component';
import { CompanyPolicyComponent } from './views/company-policy/company-policy.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { MatButtonModule } from '@angular/material/button';
import { PdfViewComponent } from './views/pdf-view/pdf-view.component';
import { FormErrorScrollUtilityService } from './service/form-error-scroll-utility-service.service';
import { ActivateChildGuard } from './auth-guard/activate-child.guard';
import { GenericTimesheetConfirmationComponent } from './generic-components/generic-timesheet-confirmation/generic-timesheet-confirmation.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CUSTOM_DATE_FORMATS, CustomDateAdapter } from './shared/custom-date-adapter';

const APP_CONTAINERS = [
  DefaultFooterComponent,
  DefaultHeaderComponent,
  DefaultLayoutComponent
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ...APP_CONTAINERS,
    UserGuideModalComponent,
    UserWelcomeMsgComponent,
    UseraccessInfoPopupComponent,
    TemplatesComponent,
    CompanyPolicyComponent,
    PdfViewComponent,
    GenericTimesheetConfirmationComponent,
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
    PdfViewerModule,
    NgxDocViewerModule,
    MatButtonModule,
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
    FormErrorScrollUtilityService,
    ActivateChildGuard,
    AuthGuard,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
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
