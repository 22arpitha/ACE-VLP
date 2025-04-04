import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-components/generic-delete/generic-delete.component';
import { GenericRemoveComponent } from 'src/app/generic-components/generic-remove/generic-remove.component';

@Component({
  selector: 'app-update-project',
  templateUrl: './update-project.component.html',
  styleUrls: ['./update-project.component.scss']
})
export class UpdateProjectComponent implements OnInit {
  BreadCrumbsTitle: any = 'Update project';
  id: any;
  isShown: boolean = false; // hidden by default
  peopleId: any = [];
  page: string;
  tableSize: string;
  params = {
    pagination: 'FALSE'
  }
  selectedTeamId: any = [];
  user_id: any
  taskCategories: any = [];
  updateForm: FormGroup;
  invalidDate: boolean = false;
  url: any;
  assigneePeoples: any = [];
  task_name: any = [];
  org_id: any;
  tasks = []
  status = [];
  toggleShow() {
    this.isShown = !this.isShown;
  }
  isGroupShown: boolean = false;
  isListShown: boolean = true;
  toggleGroupShow() {
    this.isGroupShown = !this.isGroupShown;
    this.isListShown = !this.isListShown;
  }

  allClientList: any = [];
  client: any;

  allPeopleGroup: any = [];
  peopleGroup: any;

  allManager: any = [];
  reporting_manager: any;
  approver_manager: any;
  peopleListSetting = {};
  peopleGroupSetting = {};
  subTaskSetting: any = {};
  taskForm: FormGroup;
  selectedTeams: any = []
  constructor(
    private builder: FormBuilder,
    private api: ApiserviceService,
    private route: ActivatedRoute,
    private datepipe: DatePipe,
    private router: Router,
    private location: Location,
    private common_service: CommonServiceService,
    private modalService: NgbModal
  ) {
    this.id = this.route.snapshot.paramMap.get('id')

  }
  onChange(event: any) {
    this.updateForm.patchValue({
      end_date: ''
    })
  }
  goBack(event) {
    event.preventDefault(); // Prevent default back button behavior
    this.location.back();

  }
  initForm() {
    this.updateForm = this.builder.group({
      organization: this.org_id,
      user_id: this.user_id,
      client_id: ['', [Validators.required]],
      project_name: ['', [Validators.required, Validators.maxLength(50)]],
      start_date: ['', [Validators.required]],
      end_date: ['', [Validators.required]],
      team: [''],
      project_manager_id: ['', [Validators.required]],
      // estimated_hour: ['', [Validators.required]],
      // estimated_billing: ['', [Validators.required]],
      status_id: ['', [Validators.required]],
      project_task: this.builder.array([]),
      project_category: [''],

    });
  }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.org_id = sessionStorage.getItem('organization_id');
    this.user_id = sessionStorage.getItem('user_id');
    this.getCategory();
    this.getClient();
    this.getProjectStatus();
    this.getReportingManager();
    // this.getDesignations();
    this.getPeopleGroup();
    this.initForm()
    setTimeout(() => {
      this.edit();
    }, 1000);
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

  get f() {
    return this.updateForm.controls;
  }
  startDate: any
  endDate: any
  changeYearStartDate(event: any) {
    this.startDate = event.target.value
  }
  changeYearEndDate(event: any) {
    this.endDate = event.target.value
  }
  edit() {
    this.api.getCurrentProjectDetails(this.id).subscribe((data: any) => {
      console.log('Get by id Project Details', data)
      this.startDate = this.datepipe.transform(data.start_date * 1000, 'yyyy-MM-dd')
      this.endDate = this.datepipe.transform(data.end_date * 1000, 'yyyy-MM-dd')
      let array1: any = [];
      this.selectedTeamId = data?.teams.map((teams: any) => teams.employee)
      this.teamFunction(this.selectedTeamId);
      this.updateForm.patchValue({
        client_id: data.client,
        project_name: data.project_name,
        // start_date: this.datepipe.transform(data.start_date * 1000, 'yyyy-MM-dd'),
        // end_date: this.datepipe.transform(data.end_date * 1000, 'yyyy-MM-dd'),
        start_date: data.start_date,
        end_date: data.end_date,
        status_id: data.status,
        // estimated_hour: data.estimated_hour,
        // estimated_billing: data.estimated_billing,
        project_manager_id: data.project_manager,
        team: this.selectedTeamId,
        project_category: data.project_category,
        // project_task: data.project_task
      })
      const taskList = data.project_task;
      taskList.forEach(task => {
        this.subTasks.push(this.builder.group({
          task_name: [task.task_name, [Validators.required, Validators.maxLength(150)]],
          status: [Number(task.status), Validators.required],
          assignee: [task.assignee],
          id: [task.id],
          is_saved: true,
          edit_icon: true,
          is_cancelled: false,
          is_template: true
        }));
      });

      // console.log('this.updateForm.value', this.updateForm.value)
    })


  }

  getClient() {
    this.api.getClientListFromUserId(`?${'organization_id'}=${this.org_id}`).subscribe(
      (res: any) => {
        this.allClientList = res;
      },
      (error) => {
        this.api.showError(error.error.error.message)
      }
    )
  }

  getDesignations() {
    this.api.getDesignationList(`?${'organization_id'}=${this.org_id}`).subscribe((data: any) => {
      if (data) {
        // console.log('designations',data)
        const managerRoleId = data.filter(temp => temp.designation_name === 'Project Manager');
        // console.log(this.managerRoleId,'managerRoleId')
        // this.getReportingManager(managerRoleId[0].id);
        // console.log(this.allDesignation,'designation')
      }

    }, (error: any) => {
      this.api.showError(error.error.error.message)
    }
    )
  }

  getReportingManager() {
    this.api.getEmployeeList(`?${'organization_id'}=${this.org_id}&${'designation'}=${'manager'}`).subscribe((data: any) => {
      if (data) {
        // console.log('manager list', data)
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
    this.api.getProfileDetails(`?role_id=${2}&organization_id=${this.org_id}`).subscribe(
      (res: any) => {
        // console.log('admin',res);
        let data = [];
        // data.push({ 'first_name': res.first_name, 'last_name': res?.last_name || '', 'id': res.id });
        res.forEach((element:any) => {
          data.push({ 'first_name': element.first_name, 'last_name': element?.last_name || '', 'id': element.id }); 
        });
        this.allManager = data;
      },
      (error: any) => {
        console.log('admin data error', error)
      }
    )
  }


  filteredPeopleGroup = [];
  filterOptions(event: any) {
    let eventw = event.target.value.toLowerCase();
    this.filteredPeopleGroup = this.allPeopleGroup.filter(item =>
      item.first_name.toLowerCase().includes(eventw)
    );
  }

  matTeamSelect() {
    console.log(this.selectedTeamId, 'this.selectedTeamId');
    this.teamFunction(this.selectedTeamId);
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
    // console.log('from teM FUN', id);
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


    // console.log('assigneePeoples', this.assigneePeoples);
  }

  teamDeselectedFromCard(id: any) {
    this.selectedTeamId = this.selectedTeamId.filter(item => item !== id);
    // console.log('this.selectedTeamId', this.selectedTeamId);
    this.teamFunction(this.selectedTeamId);
  }
  async openRemoveConfirmation(text: any, id) {
    try {
      const modalRef = await this.modalService.open(GenericRemoveComponent, {
        size: 'sm',
        backdrop: 'static',
        centered: true
      });

      modalRef.componentInstance.status.subscribe(resp => {
        if (resp === 'ok') {
          if (text === 'group') {
            this.clearAll();
          } else {
            this.teamDeselectedFromCard(id)
          }
          modalRef.dismiss();
        } else {
          modalRef.dismiss();
        }
      });
    } catch (error) {
      console.error('Error opening modal:', error);
    }

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
    this.updateForm.patchValue({ team: '' })
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }
  getPeopleGroup() {
    this.api.getEmployeeList(`?${'organization_id'}=${this.org_id}`).subscribe((data: any) => {
      if (data) {
        let filteredRole = [];
        // console.log(' ressss', data)
        data.forEach((element: any) => {
          filteredRole.push(element.user)
        })
        this.allPeopleGroup = filteredRole;
        this.filteredPeopleGroup = this.allPeopleGroup;
      }
      else {
        //console.log('Error');
      }

    }

    )
  }
  getManager() {
    this.api.getManagerDetails(this.params, this.org_id).subscribe((data: any) => {
      this.allManager = data.result.data;
    }

    )
  }
  getCategory() {
    this.api.getProjCategory(`${'organization_id'}=${this.org_id}`).subscribe(data => {
      // console.log(data, "category template")
      this.taskCategories = data;
    })
  }

  get subTasks(): FormArray {
    return this.updateForm.get('project_task') as FormArray;
  }


  createSubTask(): FormGroup {
    return this.builder.group({
      task_name: ['', [Validators.required, Validators.maxLength(150)]],
      status: ['', Validators.required],
      assignee: null,
      id: [''],
      is_saved: false,
      is_cancelled: false,
      edit_icon: false,
      is_template: false
    });
  }

  // adding new task
  addTask(): void {
    // console.log('this.updateForm.value.task_list', this.updateForm.value.project_task)
    const taskList = this.updateForm.value.project_task;
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
  async openDeleteConfirmation(index, id: any) {
    try {
      const modalRef = await this.modalService.open(GenericDeleteComponent, {
        size: 'sm',
        backdrop: 'static',
        centered: true
      });

      modalRef.componentInstance.status.subscribe(resp => {
        if (resp === 'ok') {
          if (id) {
            this.deleteTaskFromBackend(id);
          } else {
            this.deleteTaskRow(index);
          }
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
    this.api.showSuccess('Task removed')
    // this.updateForm.patchValue({ project_task: this.subTasks });
  }

  // delete task from backend
  deleteTaskFromBackend(id: any) {
    this.api.deleteTaskInProjectData(id).subscribe(
      (res: any) => {
        console.log(res);
        this.api.showSuccess('Task deleted successfully.')
        this.subTasks.clear();
        this.edit();
      },
      (error: any) => {
        console.log('error while deleting task inside the projects', error)
      }
    )
  }

  // save task
  save(index1: any) {
    const taskList = this.subTasks.at(index1) as FormGroup;
    if (taskList.invalid) {
      taskList.markAllAsTouched();
    }
    else {
      // taskList.patchValue({
      //   is_saved: true,
      //   edit_icon: true,
      //   is_cancelled: false
      // });
      console.log(taskList.value,'taskList')
      let data = {
        "project_id":this.id,
        "task_name": taskList.value.task_name,
        "assignee": taskList.value.assignee,
        "status": taskList.value.status,
      }
      if (taskList.value.id) {
        data['updated_by'] = this.user_id; 
        this.updateProjectTask(data,taskList.value.id,index1)
      } else {
        data['created_by'] = this.user_id; 
        this.addProjectTask(data,index1);
      }
    }
    // console.log(this.updateForm.value, 'clicked on save button')
  }
  addProjectTask(data:any,index1){
    // console.log(data);
    const taskList = this.subTasks.at(index1) as FormGroup;
    this.api.postProjectTask(data).subscribe(
      (res:any)=>{
        // console.log(res)
        this.api.showSuccess(res.message);
        taskList.patchValue({
          is_saved: true,
          edit_icon: true,
          is_cancelled: false
        });
        this.subTasks.clear();
        this.edit();
      },
      (error:any)=>{
        // console.log(error)
        this.api.showError(error.error.error);
      }
    )
  }
   updateProjectTask(data:any,id,index1){
    // console.log(data)
    const taskList = this.subTasks.at(index1) as FormGroup;
    this.api.putProjectTask(id,data).subscribe(
      (res:any)=>{
        // console.log(res)
        this.api.showSuccess(res.message);
        taskList.patchValue({
          is_saved: true,
          edit_icon: true,
          is_cancelled: false
        });
      },
      (error:any)=>{
        // console.log(error);
        this.api.showError(error.error.error);
      }
    )
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
    console.log(this.updateForm.value, 'clicked on edit button')
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

  yearEndDateValidator(): any {
    this.endDate = this.updateForm.get('end_date').value
    const StartDate = new Date(this.updateForm.get('start_date').value).getTime() / (1000 * 60);

    const EndDate = new Date(this.updateForm.get('end_date').value).getTime() / (1000 * 60);
    if (StartDate > EndDate) {
      this.invalidDate = true;
      //console.log(StartDate > EndDate,'true')
    }
    else {
      this.invalidDate = false;
    }
  }
  restrictInput(event) {
    const allowedKeys = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.',
      'Backspace', 'Tab', 'Enter', 'Escape', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ];

    if (allowedKeys.includes(event.key) || (event.ctrlKey && (event.key === 'v' || event.key === 'c' || event.key === 'a'))) {
      return true;
    }

    if (event.key === 'e' || event.key === '-' || event.keyCode === 69 || event.keyCode === 189) {
      return false;
    }

    return false;
  }

  // selecting project templates
  getSubTask(event: any) {
    // console.log(event.value);
    // this.subTasks.clear();
    this.api.getProjCategoryById(event.value).subscribe(
      (resp) => {
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
            assignee: null,
            id: [''],
            is_saved: false,
            is_cancelled: false,
            edit_icon: false,
            is_template: true
          }));
        });
      },
      (error) => {
        console.log(error);

      }
    )

  }
  selectedTask = []
  update() {
    const startDate = this.updateForm.value.start_date;
    const EndDate = this.updateForm.value.end_date;
    console.log(this.updateForm.value);
    if (this.updateForm.invalid) {
      this.api.showError('Please fill mandatory fields');
      console.log(this.updateForm.controls);
      this.updateForm.markAllAsTouched()
    }
    else {
      const taskList = this.updateForm.value.project_task;
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
        tempList = this.updateForm.value['project_task'].map(({ task_name, status, assignee }) => ({
          task_name,
          status,
          assignee
        }));
        let data = {
          organization: this.updateForm.value.organization,
          updated_by: this.updateForm.value.user_id,
          client: this.updateForm.value.client_id,
          project_name: this.updateForm.value.project_name,
          start_date: this.datepipe.transform(startDate, 'yyyy-MM-dd'),
          end_date: this.datepipe.transform(EndDate, 'yyyy-MM-dd'),
          team: tempTeamIds,
          project_manager: this.updateForm.value.project_manager_id,
          // estimated_hour: this.updateForm.value.estimated_hour,
          // estimated_billing: this.updateForm.value.estimated_billing,
          status: this.updateForm.value.status_id,
          // project_task: tempList,
          project_category: this.updateForm.value.project_category,

        }
        console.log(data, 'dataaaa')
        this.api.updateProject(this.id, data).subscribe(res => {
          if (res) {
            this.api.showSuccess(res['message']);
            this.updateForm.markAsPristine();
            this.updateForm.markAsUntouched();
            this.updateForm.updateValueAndValidity();
            this.resetValues();
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

  resetValues() {
    // this.subTasks.reset();
    this.subTasks.clear();
    this.getCategory();
    this.getClient();
    this.getProjectStatus();
    this.getDesignations();
    this.getPeopleGroup();
    // this.initForm()
    setTimeout(() => {
      this.edit();
    }, 1000);

  }

}
