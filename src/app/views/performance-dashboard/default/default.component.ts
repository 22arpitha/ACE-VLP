import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
  standalone:false
})
export class DefaultComponent implements OnInit {
    periodicityId: number | null = null;
    period: { year: string; month_list: string } | null = null;
    employee: number | null = null;
    manager: number | null = null;
    resetFilter: boolean = false;
    resetEmployeeFilter: boolean = false;
    resetManagerFilter: boolean = false;
    ondefaultSelection: boolean = true;
    modeName: any;
    allPeroidicitylist: any = [];
    resetPeriodOnPeriodicityChange = false;
    resetBtnDisable: boolean = false;
    commonFilterData: any = { 'employee_id': '', 'periodicity': '', 'period': '', 'manager_id': '' };
    userRole: any;
    mutiple: boolean = true;
    constructor(private apiService: ApiserviceService) {
        this.userRole = sessionStorage.getItem('user_role_name');
        this.getAllPeriodicity();
    }

    ngOnInit(): void {
        this.mutiple = this.userRole === 'Admin' ? true : false;
        setTimeout(() => this.applySearch(), 800);
    }

    selectedEmployee(event: any) {
        this.employee = event;
        if (event) {
            this.manager = null;
            this.resetManagerFilter = true;
            setTimeout(() => {
                this.resetManagerFilter = false;
            });
        }
    }
    selectedManager(event: any) {
        this.manager = event;
        console.log(this.employee,'employees');
        if (event) {
            this.employee = null;
            this.resetEmployeeFilter = true;
            setTimeout(() => {
                this.resetEmployeeFilter = false;
            });
        }
    }

    selectedPeriodicity(event: any) {
        if (this.periodicityId === event) {
            return;
        }
        this.periodicityId = event;
        this.modeName = this.allPeroidicitylist.find(
            (peroidicity: any) => peroidicity.id === this.periodicityId
        )?.periodicty_name;
        this.period = null;
        this.resetPeriodOnPeriodicityChange = true;
        setTimeout(() => {
            this.resetPeriodOnPeriodicityChange = false;
        });
    }

    selectedPeriod(event: { year: string; month_list: string }) {
        this.period = event;
    }

    getAllPeriodicity() {
        this.allPeroidicitylist = [];
        this.apiService
            .getData(`${environment.live_url}/${environment.settings_periodicty}/`)
            .subscribe(
                (res: any) => {
                    this.allPeroidicitylist = res;
                },
                (error: any) => {
                    this.apiService.showError(error?.error?.detail);
                }
            );
    }

    resetSearch(): void {
        this.resetBtnDisable = true;
        this.employee = null;
        this.period = null;
        this.manager = null;
        this.commonFilterData = {
            employee_id: '',
            periodicity: '',
            period: '',
            manager_id: ''
        };
        this.resetFilter = true;
        this.ondefaultSelection = false;
        setTimeout(() => {
            this.ondefaultSelection = true;
            this.resetFilter = false;
            this.resetBtnDisable = false;
            setTimeout(() => {
                this.applySearch();
            }, 0);
        }, 100);
    }

    applySearch() {
        this.commonFilterData = { 'employee_id': this.employee, 'periodicity': this.periodicityId, 'period': this.period,'manager_id': this.manager };
        //  console.log(this.commonFilterData,'commonFilterData');
    }
}
