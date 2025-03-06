import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Validators, FormBuilder, FormGroup, ValidatorFn, AbstractControl, FormArray, FormControl } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';

@Component({
  selector: 'app-create-new-project',
  templateUrl: './create-new-project.component.html',
  styleUrls: ['./create-new-project.component.scss']
})
export class CreateNewProjectComponent implements OnInit {
  BreadCrumbsTitle: any = 'Create project';
  isShown: boolean = false; // hidden by default
  taskCategories: any = [];
  invalidDate: boolean = false;
  task_name: any = [];
  orgId: any;
  user_id: any;
  value;
  tasks = []
  status = [];
  selectedTeamId = [];
  toggleShow() {

    this.isShown = !this.isShown;

  }
  isGroupShown: boolean = false;
  isListShown: boolean = true;


  toggleGroupShow() {

    this.isGroupShown = !this.isGroupShown;
    this.isListShown = !this.isListShown;

  }

  projectForm: FormGroup

  allProject: any = [];
  project: any;

  allClientList: any = [];
  client: any;

  allPeopleGroup: any = [];
  peopleGroup: any;
  peopleListSetting = {};
  peopleGroupSetting = {};
  peopleId: any = []
  assigneePeoples: any = [];
  taskList = {}
  allManager: any = [];
  reporting_manager: any;
  approver_manager: any;
  params = {
    pagination: "FALSE"
  }

  constructor(private builder: FormBuilder,
    private api: ApiserviceService,
    private datepipe: DatePipe,
    private location: Location,
    private common_service: CommonServiceService,
    private modalService: NgbModal
  ) { }


  goBack(event) {
    event.preventDefault(); // Prevent default back button behavior
    this.location.back();

  }
  onChange(event: any) {
    console.log('fff', event)
    this.projectForm.patchValue({
      end_date: ''
    })
  }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.orgId = sessionStorage.getItem('organization_id');
    this.user_id = sessionStorage.getItem('user_id');
    this.assigneePeoples = [];
    this.getProjectStatus();
    this.getClient();
    this.getReportingManager();
    // this.getDesignations();
    this.getPeopleGroup();
    this.initForm();
    this.getCategory();
    // this.taskForm = this.builder.group({
    //   subTasks: this.builder.array([])
    // });
    // Optionally, you can add an initial empty task
    // this.addTask();
  }

  getProjectStatus() {
    this.api.getProjectStatus().subscribe(
      (res: any) => {
        this.status = res;
      },
      (error: any) => {
        console.log('project status error', error)
      }
    )
  }
  initForm() {
    this.projectForm = this.builder.group({
      organization: this.orgId,
      user_id: this.user_id,
      client_id: ['', [Validators.required]],
      project_name: ['', [Validators.required, Validators.maxLength(50)]],
      start_date: ['', [Validators.required]],
      end_date: ['', [Validators.required]],
      team: [''],
      project_manager_id: ['', [Validators.required]],
      estimated_hour: [''],
      estimated_billing: [''],
      status_id: ['', [Validators.required]],
      project_task: this.builder.array([]),
      project_category: [''],
    })
    // this.addTask();
  }
  // Client list
  getClient() {
    this.api.getClientListFromUserId(`?${'organization_id'}=${this.orgId}`).subscribe(
      (res: any) => {
        this.allClientList = res;
      },
      (error) => {
        this.api.showError(error.error.error.message)
      }
    )
  }
  // designation list
  getDesignations() {
    this.api.getDesignationList(`?${'organization_id'}=${this.orgId}`).subscribe((data: any) => {
      if (data) {
        // console.log('designations',data)
        const managerRoleId = data.filter(temp => temp.designation_name === 'Project Manager');
        // console.log(this.managerRoleId,'managerRoleId')
        this.getReportingManager();
        // console.log(this.allDesignation,'designation')
      }

    }, (error: any) => {
      this.api.showError(error.error.error.message)
    }
    )
  }

  getReportingManager() {
    this.api.getEmployeeList(`?${'organization_id'}=${this.orgId}&${'designation'}=${'manager'}`).subscribe((data: any) => {
      if (data) {
        console.log('manager list', data)
        if (data.length == 0) {
          this.adminData();
        }
        else {
          let temp: any[];
          temp = data.map((element: any) => element.user)
          this.allManager = temp;
        }
      }

    }, (error: any) => {
      this.api.showError(error.error.error.message)
      console.log(error, "ERROR")
    }

    )
  }
  adminData() {
    this.api.getProfileDetails(`?role_id=${2}&organization_id=${this.orgId}`).subscribe(
      (res: any) => {
        console.log('admin',res);
        
        let data = [];
        res.forEach((element:any) => {
          data.push({ 'first_name': element.first_name, 'last_name': element?.last_name || '', 'id': element.id });
        });
        // console.log(data,'ttttttttttttttt')
        this.allManager = data;
      },
      (error: any) => {
        console.log('admin data error', error)
      }
    )
  }

  // employees
  getPeopleGroup() {
    this.peopleListSetting = {
      singleSelection: false,
      idField: 'id',
      textField: 'first_name',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    // this.peopleGroupSetting = {
    //   singleSelection: true,
    //   idField: 'id',
    //   textField: 'first_name',
    //   itemsShowLimit: 3,
    //   allowSearchFilter: true
    // };
    this.api.getEmployeeList(`?${'organization_id'}=${this.orgId}`).subscribe((data: any) => {
      if (data) {
        let filteredRole = [];
        data.forEach((element: any) => {
          filteredRole.push(element.user)
        })
        // console.log(' this.filteredRole', filteredRole)
        this.allPeopleGroup = filteredRole;
        this.filteredPeopleGroup = this.allPeopleGroup;
        // console.log(' this.allPeopleGroup', this.allPeopleGroup)
      }
      else {
        //console.log('Error');
      }

    }

    )
  }


  matTeamSelect() {
    this.teamFunction(this.selectedTeamId);
    // this.peopleId = event.value;
    // let tempId: any = []
    // this.allPeopleGroup.forEach(element => {
    //   this.peopleId.forEach(element1 => {
    //     if (element1 == element.id) {
    //       tempId.push(element)
    //     }
    //   })
    // });
    // this.assigneePeoples = tempId;
    // this.subTasks.controls.forEach((taskControl: FormGroup, index: number) => {
    //   const task = taskControl.value;

    //   if (task.assignee && !this.assigneePeoples.some(person => person.id === task.assignee)) {
    //     taskControl.removeControl('original_task_assignee');
    //     taskControl.patchValue({
    //       assignee: '',
    //       is_saved: false,
    //       edit_icon: false,
    //       is_cancelled: false
    //     });
    //   }
    // });
    // console.log('assigneePeoples', this.assigneePeoples)
    // console.log('this.subTasks.value', this.subTasks.value)
  }
  teamFunction(id: any) {
    let tempId: any = []
    this.allPeopleGroup.forEach(element => {
      id.forEach(element1 => {
        if (element1 == element.id) {
          tempId.push(element)
        }
      })
    });
    this.assigneePeoples = tempId;
    this.subTasks.controls.forEach((taskControl: FormGroup, index: number) => {
      const task = taskControl.value;

      if (task.assignee && !this.assigneePeoples.some(person => person.id === task.assignee)) {
        taskControl.removeControl('original_task_assignee');
        taskControl.patchValue({
          assignee: null,
          is_saved: false,
          edit_icon: false,
          is_cancelled: false
        });
      }
    });

    console.log('assigneePeoples', this.assigneePeoples);
  }

  teamDeselectedFromCard(id: any) {
    this.selectedTeamId = this.selectedTeamId.filter(item => item !== id);
    console.log('this.selectedTeamId', this.selectedTeamId);
    this.teamFunction(this.selectedTeamId);
  }

  isCollapsed: boolean = true;

  // Clear all team items
  clearAll(): void {
    this.selectedTeamId = [];
    this.assigneePeoples = [];
    this.subTasks.controls.forEach((taskControl: FormGroup) => {
      const task = taskControl.value;
      if (task.assignee && !this.assigneePeoples.some(person => person.id === task.assignee)) {
        taskControl.removeControl('original_task_assignee');
        taskControl.patchValue({
          assignee: null,
          is_saved: false,
          edit_icon: false,
          is_cancelled: false
        });
      }
    });
    this.projectForm.patchValue({ team: '' })
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  // Managers
  getManager() {
    this.api.getManagerDetails(this.params, this.orgId).subscribe((data: any) => {
      if (data) {
        this.allManager = data.result.data;
      }
    }
    )
  }

  // Templates
  getCategory() {
    this.api.getProjCategory(`${'organization_id'}=${this.orgId}`).subscribe(data => {
      console.log(data, "category template")
      this.taskCategories = data;
    })
  }

  get f() {
    return this.projectForm.controls;
  }
  get subTasks(): FormArray {
    return this.projectForm.get('project_task') as FormArray;
  }


  createSubTask(): FormGroup {
    return this.builder.group({
      task_name: ['', [Validators.required, Validators.maxLength(150)]],
      status: ['', Validators.required],
      created_by:this.user_id,
      assignee: null,
      is_saved: false,
      is_cancelled: false,
      edit_icon: false,
      is_template: false
    });
  }

  // adding new task
  addTask(): void {
    console.log('this.projectForm.value.task_list', this.projectForm.value.project_task)
    const taskList = this.projectForm.value.project_task;
    let allTasksValid = true;

    taskList.forEach((element: any) => {
      if (element.is_saved === false && element.task_name.trim() === '' || element.status === '' || element.assignee === '') {
        this.api.showWarning('Task cannot be empty.');
        allTasksValid = false;
      }
      else if (element.task_name.trim() !== '') {
        if (element.is_saved === false) {
          this.api.showWarning('Please click on the ✅ to save your task.');
          allTasksValid = false;
        }
      }
    });
    if (allTasksValid) {
      this.subTasks?.push(this.createSubTask());
    }
  }

  // delete confirmation popup
  async openDeleteConfirmation(index) {
    try {
      const modalRef = await this.modalService.open(GenericDeleteComponent, {
        size: 'sm',
        backdrop: 'static',
        centered: true
      });

      modalRef.componentInstance.status.subscribe(resp => {
        if (resp === 'ok') {
          this.deleteTaskRow(index);
          modalRef.dismiss();
        } else {
          modalRef.dismiss();
        }
      });
    } catch (error) {
      console.error('Error opening modal:', error);
    }

  }

  // delete task
  deleteTaskRow(index: any) {
    this.subTasks.removeAt(index);
    // console.log(this.subTasks);
    // console.log(this.projectForm.value.project_task)
    this.api.showSuccess('Task removed')
    // this.projectForm.patchValue({ project_task: this.subTasks });
  }

  // save task
  save(index1: any) {
    const taskList = this.subTasks.at(index1) as FormGroup;
    if (taskList.invalid) {
      taskList.markAllAsTouched();
    }
    else {
      taskList.patchValue({
        is_saved: true,
        edit_icon: true,
        is_cancelled: false
      });
      this.api.showSuccess('Task saved.');
    }
    console.log(this.projectForm.value, 'clicked on save button')
  }

  editTask(index1: any) {
    const taskList = this.subTasks.at(index1) as FormGroup;
    taskList.patchValue({
      is_saved: false,
      edit_icon: false,
      is_cancelled: true
    });
    const currentTaskName = taskList.get('task_name')?.value;
    const currentTaskStatus = taskList.get('status')?.value;
    const currentTaskAssignee = taskList.get('assignee')?.value;
    taskList.addControl('original_task_name', new FormControl(currentTaskName));
    taskList.addControl('original_task_status', new FormControl(currentTaskStatus));
    taskList.addControl('original_task_assignee', new FormControl(currentTaskAssignee));
    console.log(this.projectForm.value, 'clicked on edit button')
  }
  cancelEdit(index1: any) {
    const taskList = this.subTasks.at(index1) as FormGroup;
    const originalTaskName = taskList.get('original_task_name')?.value;
    const originalTaskStatus = taskList.get('original_task_status')?.value;
    const originalTaskAssignee = taskList.get('original_task_assignee')?.value;
    if (originalTaskName !== undefined) {
      taskList.patchValue({ task_name: originalTaskName });
      taskList.patchValue({ status: originalTaskStatus });
      taskList.patchValue({ assignee: originalTaskAssignee });
    }
    taskList.removeControl('original_task_name');
    taskList.removeControl('original_task_status');
    taskList.removeControl('original_task_assignee');
    taskList.patchValue({
      is_saved: true,
      is_cancelled: false,
      edit_icon: true,
    });
  }




  onPeopleGroupSelect(event: any) {
    this.peopleId.push(event.id)
    console.log(this.peopleId)
  }
  onSingleSelect(event) {
    this.task_name.push(event.task_name)
  }
  onSelectAll(event) {
    event.forEach((element: any) => {
      this.task_name.push(element.task_name)
    });
  }
  onPeopleGroupSelectAll(event: any) {
    event.forEach((element: any) => {
      this.peopleId.push(element.id)
    });

  }




  // selecting project templates
  getSubTask(event) {
    console.log(event.value);
    // this.subTasks.clear();
    this.api.getProjCategoryById(event.value).subscribe(
      (resp) => {
        // task.get('is_template')?.value === true &&
        for (let i = this.subTasks.length - 1; i >= 0; i--) {
          const task = this.subTasks.at(i);
          if (task.get('is_saved')?.value === false && task.get('is_cancelled')?.value === false) {
            this.subTasks.removeAt(i);
          }
        }
        console.log('resp', resp)
        const taskList = resp['projectcategory_task'];
        taskList.forEach(task => {
          this.subTasks.push(this.builder.group({
            task_name: [task.task_name, [Validators.required, Validators.maxLength(150)]],
            status: ['', Validators.required],
            created_by:this.user_id,
            assignee: null,
            is_saved: false,
            is_cancelled: false,
            edit_icon: false,
            is_template: true
          }));
        });
        console.log(this.projectForm.value)
      },
      (error) => {
        console.log(error);

      }
    )

  }

  yearEndDateValidator(): any {
    const StartDate = new Date(this.projectForm.get('start_date').value).getTime() / (1000 * 60);

    const EndDate = new Date(this.projectForm.get('end_date').value).getTime() / (1000 * 60);
    if (StartDate > EndDate) {
      this.invalidDate = true;
      //console.log(StartDate > EndDate,'true')
    }
    else {
      this.invalidDate = false;
    }
  }

  // Add project
  selectedTask = []
  addProject() {
    const startDate = this.projectForm.value.start_date;
    const EndDate = this.projectForm.value.end_date;
    console.log(this.projectForm.value);
    if (this.projectForm.invalid) {
      this.api.showError('Please fill mandatory fields');
      console.log(this.projectForm.controls);
      this.projectForm.markAllAsTouched()
    }
    else {
      const taskList = this.projectForm.value.project_task;
      let allTasksValid = true;
      taskList.forEach((element: any) => {
        if (taskList.invalid) {
          taskList.markAllAsTouched();
          allTasksValid = false;
        }
        else if (element.task_name.trim() !== '') {
          if (element.is_saved === false) {
            this.api.showWarning('Please click on the ✅ to save your task.');
            allTasksValid = false;
          }
        }
      })

      if (allTasksValid == true && this.invalidDate == false) {
        let tempTeamIds = this.selectedTeamId?.length? this.selectedTeamId.map((element: any) => ({ employee: element }))  : [];
        let tempList: any;
        tempList = this.projectForm.value['project_task'].map(({ task_name, status, assignee ,created_by}) => ({
          task_name,
          status,
          assignee,
          created_by
        }));
        let data = {
          organization: this.projectForm.value.organization,
          created_by: this.projectForm.value.user_id,
          client: this.projectForm.value.client_id,
          project_name: this.projectForm.value.project_name,
          start_date: this.datepipe.transform(startDate, 'yyyy-MM-dd'),
          end_date: this.datepipe.transform(EndDate, 'yyyy-MM-dd'),
          team: tempTeamIds,
          project_manager: this.projectForm.value.project_manager_id,
          // estimated_hour: this.projectForm.value.estimated_hour,
          // estimated_billing: this.projectForm.value.estimated_billing,
          status: this.projectForm.value.status_id,
          project_task: tempList,
          project_category: this.projectForm.value.project_category,

        }
        console.log(data, 'dataaaa')
        this.api.addProjectDetails(data).subscribe(res => {
          if (res) {
            this.api.showSuccess(res['message']);
            this.ngOnInit();
          }
          else {
            this.api.showError('Error')

          }

        }, (error => {
          this.api.showError(error.error.error.message)
          console.log('project creation error', error)
        })
        )
      }
    }
  }

  filteredPeopleGroup = [];
  filterOptions(event: any) {
    console.log('evenettt', event.target.value)
    let eventw = event.target.value.toLowerCase();
    this.filteredPeopleGroup = this.allPeopleGroup.filter(item =>
      item.first_name.toLowerCase().includes(eventw)
    );
    console.log(this.filteredPeopleGroup,'this.filteredPeopleGroup')
  }

}
