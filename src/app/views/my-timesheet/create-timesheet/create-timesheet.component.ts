import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { environment } from 'src/environments/environment';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { GenericDeleteComponent } from 'src/app/generic-components/generic-delete/generic-delete.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubModuleService } from 'src/app/service/sub-module.service';

@Component({
  selector: 'app-create-timesheet',
  templateUrl: './create-timesheet.component.html',
  styleUrls: ['./create-timesheet.component.scss']
})
export class CreateTimesheetComponent implements OnInit {
  BreadCrumbsTitle: any = 'Create Timesheet';
  isExpanded: boolean = false;
 
  timeSheetForm!: FormGroup;
  createdProject!: FormArray;
  taskForm!: FormGroup; 
  userId:any;
  manager_id:any;
  orgId:any;
  hours_to_complete: any = [];
  timeList: any[] = [];
  project_id: any;
  allClient: any[] = [];
  client: any;
  allProject: any[] = [];
  project: any;
  allTask: any[] = [];
  currentIndex: any = 0;
  client_id: any;
  projectList: any[] = [];
  taskList: any[] = [];
  params = {
    pagination: "FALSE"
  };
  @ViewChildren(MatExpansionPanel) panels: QueryList<MatExpansionPanel>;
  //isTaskForm: boolean = false;
  originalTaskData: any = [];
  isSaved: boolean = false;
  //showSave: boolean = false;
  panelExpand:boolean = false;
  isTaskSubmitted: boolean = false;
  remainingHours: number;
  projectListArray: FormArray<any>;
  duplicateDate: string;
  totalHoursForDate: number;
  taskDetailsList:string[]=[];
  currentDate: Date;
  projectDetailsSet: any;
  userRole: string;
  duplicateCreatedDate: boolean = false;
  timesheetDate: string;
  selectedProjectId: any;
  createdTaskList = [];
  updatedTasks: any[];
  accessPermissions: any=[];
  totalHoursWorked: any;
  minutes_to_complete: any = [];
  minutesList: any[] = [];

  constructor(
    private builder: FormBuilder,
    private api: ApiserviceService,
    private datepipe: DatePipe,
    private common_service: CommonServiceService,
    private modalService:NgbModal,
    private accessControlService:SubModuleService
  ) {}
  panelOpenState = false
 
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.orgId = sessionStorage.getItem('organization_id')
    this.userId = sessionStorage.getItem('user_id')
    this.userRole = sessionStorage.getItem('user_role_name')?.toLowerCase() 
  
    this.currentDate = new Date()
    this.initializeForm();
    this.taskInitForm()
    this.addProjectDetails(); 
    this.getClient(this.currentIndex);
    this.getModuleAccess();
  }
  // Initialize panel state tracking
  panelStates = new Array<boolean>();

  // Track when a panel is opened
  onPanelOpen(index: number): void {
    this.panelStates[index] = true;
  }

  // Track when a panel is closed
  onPanelClose(index: number): void {
    this.panelStates[index] = false;
  }

  // Check if panel is open
  isPanelOpen(index: number): boolean {
    return this.panelStates[index] || false;
  }

  getRemainingHours(i: number): number {
    const totalHours = 8;
    const taskArray = this.getTaskArray(i);
    const spentHours = taskArray.controls.reduce((sum, task) => {
      const timeSpent = task.get('hours_to_complete')?.value;
      return sum + (timeSpent ? parseFloat(timeSpent) : 0);
    }, 0);
    const remainingHours = totalHours - spentHours;
    this.remainingHours = remainingHours;
    // return remainingHours > 0 ? remainingHours : 0;
    //return this.totalHoursForDate > 0 ? totalHours - this.totalHoursForDate : remainingHours;
    
    return this.totalHoursForDate > 0 ? totalHours - this.totalHoursForDate : +remainingHours;
  }


  calculateTotalHoursForDate(selectedDate: string): number {
    let totalHours = 8;

    const selectedArr = this.timeSheetForm.getRawValue().response
  
    selectedArr?.forEach((projects:any)=>{
      projects?.task_list?.forEach((tasks:any)=>{
        const taskDate = tasks?.created_date
        const timeSpent = tasks['hours_to_complete']
        if (taskDate === this.datepipe.transform(selectedDate,'dd/MM/yyyy') && timeSpent) {
          
            totalHours -= parseFloat(timeSpent);
         }
      })
      
    })
    
    return totalHours;
}
async open(index) {
  
  try {
    const modalRef = await this.modalService.open(GenericDeleteComponent, {
      size: 'sm',
      backdrop: 'static',
      centered: true
    });
    
    modalRef.componentInstance.status.subscribe(resp => {
      if (resp === 'ok') {
        this.deleteProject(index);
        modalRef.dismiss();
      } else {
        modalRef.dismiss();
      }
    });
  } catch (error) {
    console.error('Error opening modal:', error);
  }
  
  }

  initializeForm(): void {
    this.timeSheetForm = this.builder.group({
      response: this.builder.array([])
    });

  }
  // Access the FormArray
get responseArray() {
  return this.timeSheetForm.get('response') as FormArray;
}
getValue(i,j,value,type?){
//   const projectGroup = this.getProjectControl(i);
//  const taskArray = this.getTaskArray(j)
 
//   projectGroup.patchValue({
//       task_list: taskArray.value,  // This patches the task details array
//     });
 

}

  onDateChange(date: string,projectIndex:number) {
    const maxHours = 8; // Max allowed hours for each date
    const selectedDate = this.datepipe.transform(date, 'dd/MM/yyyy');
    this.timesheetDate = date
    // Filter the responseArray by matching dates
    const matchedDates = this.responseArray.getRawValue().filter((group: any) => 
      this.datepipe.transform(group.created_date, 'dd/MM/yyyy') === selectedDate
    );
    this.clearTaskList(projectIndex)
    if (matchedDates?.length > 0) {
      // Sum up the hours for the matching dates
      this.totalHoursForDate = 0;
      
      
      matchedDates?.forEach((group: any) => {
        group.task_list?.forEach((task: any) => {
          // Extract hours from hours_to_complete, converting the numeric part to a number
          const hours = parseFloat(task?.hours_to_complete);
          if (!isNaN(hours)) {
            this.totalHoursForDate += hours;
          }
        });
      });
      
      // Check if total hours exceed the max hours
      if (this.totalHoursForDate >= maxHours) {
        this.duplicateDate = selectedDate
        this.api.showWarning(`No slots are available in this date.`);
      }else{
        this.duplicateDate = "";
      }
      // else {
      //   const availableHours = maxHours - totalHoursForDate;
      //   this.api.showWarning(`You can assign up to ${availableHours} more hours for this date (${selectedDate}).`);
      // }
    }
  }

  taskInitForm(){
    this.taskForm = this.builder.group({
      task_id: ['', [Validators.required]],
      hours_to_complete: ['0', [Validators.required]],
      minutes_to_complete: ['15', [Validators.required]],
      hours_left:[''],
      isEditing: [false],
      created_date:['']
    });
  }
  
  enableAction(i){
    const projectGroup = this.getProjectControl(i);
    projectGroup.get('showSave')?.setValue(false);
  }
  openTaskForm(i) {
    const projectGroup = this.getProjectControl(i);
    projectGroup.get('isTaskForm')?.setValue(true);
    
  }

  addProjectDetails(): void {
    this.createdProject = this.timeSheetForm.get('response') as FormArray;
    const projectGroup = this.createProjectDetails();
    this.createdProject.push(projectGroup)
    this.isSaved = false;
    projectGroup.get('isSaved')?.setValue(false);
    
  }
  

  reverseFormArray(formArray: FormArray,index?): void {
    const reversedArray = formArray.controls.slice().reverse();
    formArray.clear();
    reversedArray.forEach(control => formArray.push(control));
  }
  getTaskLength(project: AbstractControl): number {
    const tasks = project.get('task_list') as FormArray;
    return tasks ? tasks.length : 0;
  }
  getProjectNameById(projectId: number,projectIndex:number): string {
    const projectGroup = this.getProjectControl(projectIndex);
    const project = projectGroup.get('projectList')?.getRawValue()?.find(p => p.id === projectId);
    return project ? project.project_name : 'NA';
  }
  
  getClientNameById(clientId: number): string {
    const client = this.allClient.find(c => c.id === clientId);
    return client ? client.clint_name : 'NA';
  }
  
  getProjectLength(): number {
    return (this.timeSheetForm.get('response') as FormArray).length;
  }

  
  getTaskArray(projectIndex: number): FormArray {
  return this.createdProject.at(projectIndex).get('task_list') as FormArray;
  }

 
  editTask(projectIndex: number, taskIndex: number): void {
    const taskArray = this.getTaskArray(projectIndex);
   
    const taskFormGroup = taskArray?.at(taskIndex) as FormGroup;
    const enteredTaskId = taskFormGroup.get('task_id')?.value;
  
    const remainingHours = this.calculateTotalHoursForDate(this.timesheetDate);
    const enteredTime = this.taskForm.get('hours_to_complete')?.value;
    
    // this.isTaskSubmitted = true;
    const taskIdSet = new Set<string | number>(); // To store unique task IDs
  
    // Check for duplicates using a Set to store unique task_ids
    let isDuplicateTask = false;
    
    taskArray.controls.forEach((task, idx) => {
      const taskId = task.get('task_id')?.value;
      
      if (taskId && (idx !== taskIndex || taskId === enteredTaskId)) {
        // Try adding task_id to the Set, if it exists in the Set, it's a duplicate
        if (taskIdSet.has(taskId)) {
          isDuplicateTask = true;
        } else {
          taskIdSet.add(taskId);
        }
      }
    });
  
    if (isDuplicateTask) {
      this.api.showWarning(`Duplicate task names are not allowed.`);
      return; // Exit if duplicate task_id is found
    }
    if (enteredTime  > remainingHours) {
      this.api.showWarning(`You have exceeded ${Math.abs(remainingHours)} hours for this date.`);
      return
    }
   
    else {
        
          this.originalTaskData[projectIndex][taskIndex] = taskFormGroup?.value;
          // this.isTaskSubmitted = false;
          this.timeSheetForm.markAsTouched();
          taskFormGroup?.get('isEditing')?.setValue(false);
          this.disableTaskDetailsBasedOnEditing(projectIndex, taskIndex,false);
        }
        
  
  }
  
  
  getProjectControl(index: number): FormGroup {
    return this.createdProject.at(index) as FormGroup;
  }
 

saveTask(projectIndex: number): void {
  const projectGroup = this.getProjectControl(projectIndex);
  const taskArray = this.getTaskArray(projectIndex);
  
  if (this.taskForm.invalid || this.duplicateDate) {
    this.taskForm.markAllAsTouched();
    
    return; // Exit early if there are validation errors
  }
  const selectedDate = projectGroup.get('created_date')?.value

  // Calculate values
  // const remainingHours = this.getRemainingHours(projectIndex);
  const remainingHours = this.calculateTotalHoursForDate(selectedDate);
  const enteredTime = this.taskForm.get('hours_to_complete')?.value;
  const totalHoursForDate = this.totalHoursForDate || 0; // Default to 0 if undefined

  
 
  const enteredTaskId = this.taskForm.get('task_id')?.value;
  
  if (enteredTaskId) {
    const isDuplicateTask = taskArray.controls.some((task: FormGroup) => 
      task.get('task_id')?.value === enteredTaskId
    );
    if (isDuplicateTask ) {
      this.api.showWarning(`Duplicate task names are not allowed.`);
      return; // Exit early if duplicate is found
    }
  }
  if (enteredTime  > remainingHours ) {
    this.api.showWarning(`You have only ${remainingHours } hours left for this date.`);
    projectGroup.get('isTaskForm')?.setValue(true);
  } 
// If everything is okay, save the task
  else {

  this.taskForm.patchValue({
    created_date:this.datepipe.transform(projectGroup.get('created_date')?.value,'dd/MM/yyyy'),
  })
  taskArray.push(this.builder.group(this.taskForm.value));
  this.createdTaskList.push(this.taskForm.value)
  
  const taskIndex = taskArray?.length ? taskArray?.length - 1 : 0
  const task = taskArray.at(taskIndex) as FormGroup;
  task?.get('task_id')?.disable();
  task?.get('hours_to_complete')?.disable();
  task?.get('minutes_to_complete')?.disable();
  // this.disableTaskDetailsBasedOnEditing(projectIndex,taskIndex,false)
    projectGroup.get('isTaskForm')?.setValue(false);
    this.taskForm.reset();
  }
}


disableTaskDetailsBasedOnEditing(projectIndex: number, taskIndex: number,isEditing:boolean): void {
  const taskArray = this.getTaskArray(projectIndex); // Get the FormArray containing tasks
  const task = taskArray.at(taskIndex) as FormGroup; // Access the specific task form group
  if (isEditing) {
    // If isEditing is true, enable the fields
    task?.get('task_id')?.enable();
    task?.get('hours_to_complete')?.enable();
    task?.get('minutes_to_complete')?.enable();
  } else {
    // If isEditing is false, disable the fields
    task?.get('task_id')?.disable();
    task?.get('hours_to_complete')?.disable();
    task?.get('minutes_to_complete')?.disable();
  }
 
}

deleteProject(projectIndex: number): void {
  const projectGroup = this.getProjectControl(projectIndex);
  const projectsArray = this.timeSheetForm.get('response') as FormArray;

  // Confirm if the user really wants to delete the project
  if (projectsArray) {
    // Remove the project at the specified index
    projectsArray.removeAt(projectIndex);
    projectGroup.get('isSaved')?.setValue(false);
    // Optional: If you need to update any other state or UI after deletion, do it here
    this.api.showWarning('Timesheet deleted successfully!'); // Example of showing a success message
    this.isSaved = true;
    this.isTaskSubmitted = true
    // Optional: Reset or update any form states as needed
    this.taskForm.reset();
    
  }
}

getModuleAccess(){
  this.accessControlService.getAccessForActiveUrl(this.userId).subscribe((access) => {
    if (access) {
      this.accessPermissions = access[0].operations;
      console.log('Access Permissions:',this.accessPermissions);
    } else {
      console.log('No matching access found.');
    }
  });
}
isPointerDisabled(): boolean {
  // note while setting the user role asma is user lowercase
  if (this.userRole === 'admin') {
    return true; // Enable for Admin (pointer-events: all)
  }
  if (this.userRole === 'employee' && this.accessPermissions[0]?.create==true) {
    return true; // Enable for Employee with create access (pointer-events: all)
  }
  return false; // Disable otherwise (pointer-events: none)
}
  
  saveTimesheet(i: number): void {
    const projectGroup = this.getProjectControl(i);
    
   // Check if the specific project's form controls and task form are valid
   const isProjectGroupInvalid = projectGroup.invalid;
   const isTaskFormInvalid = projectGroup.get('isTaskForm')?.value ? this.taskForm.invalid : false;
  
   const tasksArray = projectGroup.get('task_list') as FormArray;
   let isEditing = false;

   // Loop through the FormArray
   tasksArray?.controls.forEach((taskGroup: FormGroup, index: number) => {
     const taskIsEditing = taskGroup.get('isEditing')?.value;
    // console.log(`Task ${index + 1}: isEditing =`, taskIsEditing);
 
     // Update isEditing if any task is being edited
     if (taskIsEditing === true) {
       isEditing = true;
     }
   });
   const uniqueEntries = new Set<string>();
    let hasDuplicate = false;
    let date:any;
    let projectId:any;
      
    this.responseArray.getRawValue().forEach((group: any) => {
    date = this.datepipe.transform(group.created_date, 'dd/MM/yyyy');
    projectId = group.project_id;
      
    // Create a unique identifier by combining date and project_id
    const uniqueIdentifier = `${date}-${projectId}`;

    // Check if this identifier already exists in the Set
    if (uniqueEntries.has(uniqueIdentifier)) {
      hasDuplicate = true;
    } else {
      uniqueEntries.add(uniqueIdentifier); // Add unique entry to the Set
    }
  });

   if (isProjectGroupInvalid || isTaskFormInvalid) {
     // Mark all controls as touched for the specific index
     projectGroup.markAllAsTouched();
     if (projectGroup.get('isTaskForm')?.value) {
       this.taskForm.markAllAsTouched();
     }
     
     this.api.showWarning('Please select the mandatory fields');
     projectGroup.get('isSaved')?.setValue(false);
     this.isSaved = false;
     this.isTaskSubmitted = true;
      }else if(hasDuplicate){
        this.api.showWarning(`Timesheet already present for this project`);
      }
      else {
     if (isEditing || (projectGroup.get('isTaskForm')?.value && this.taskForm.invalid) || (projectGroup.get('isTaskForm')?.value && this.taskForm.valid )) {
       this.api.showWarning('Please add task details before save');
       this.isTaskSubmitted = true;
     } else {
       this.isTaskSubmitted = false;
       projectGroup.get('showSave')?.setValue(true);
       projectGroup.get('isSaved')?.setValue(true);
       this.panels.toArray()[i].close();
       this.isSaved = true;
     }
     
   }
  
  }



  
  
  deleteTask(projectIndex: number, taskIndex: number): void {
    const taskArray = this.getTaskArray(projectIndex);
    taskArray.removeAt(taskIndex);
  }

  
  toggleTaskEditingState(i: number, j: number, isEditing: boolean): void {
    const taskArray = this.getTaskArray(i);
    const task = taskArray?.at(j) as FormGroup;
    // Check if we're enabling or disabling editing mode
    if (isEditing) {
      // Store the initial task data before editing
      if (!this.originalTaskData[i]) {
        this.originalTaskData[i] = {};
      }
      this.originalTaskData[i][j] = { ...task.value };
      task?.get('isEditing')?.setValue(true);
      this.isTaskSubmitted = true;
        
    this.disableTaskDetailsBasedOnEditing(i, j,isEditing);
    } else {
      // Revert to the original task data when cancelling
      const originalData = this.originalTaskData[i]?.[j];
      
      if (originalData && originalData.task_id && originalData.hours_to_complete) {
        task?.patchValue(originalData); // Use patchValue to avoid errors
      } else {
       // alert("Missing data for task_id or hours_to_complete");
      }
  
      // Disable editing mode for this task
      task?.get('isEditing')?.setValue(false);
      this.isTaskSubmitted = false;
        
    this.disableTaskDetailsBasedOnEditing(i, j,isEditing);
    }
  
  }
  
 
      // Update clearTaskList to properly handle validation
clearTaskList(projectIndex: number): void {
  const taskArray = this.getTaskArray(projectIndex);
  taskArray.clear();
  const projectGroup = this.getProjectControl(projectIndex);
  projectGroup.get('isTaskForm')?.setValue(true);
  
  // Reset task form with validation
  this.taskForm.reset();
  this.taskForm.get('task_id')?.setValidators([Validators.required]);
  this.taskForm.get('hours_to_complete')?.setValidators([Validators.required]);
  this.taskForm.get('minutes_to_complete')?.setValidators([Validators.required]);
  this.taskForm.updateValueAndValidity();
  
  // Mark as touched to show validation messages
  this.taskForm.get('task_id')?.markAsTouched();
  this.taskForm.get('hours_to_complete')?.markAsTouched();
  this.taskForm.get('minutes_to_complete')?.markAsTouched();
}

  resetTaskForm(i): void {
    this.taskForm.reset();
    const projectGroup = this.getProjectControl(i);
    projectGroup.get('isTaskForm')?.setValue(false);
  }

  createProjectDetails(): FormGroup {
    return this.builder.group({
      client_id: ['',Validators.required],
      project_id: ['',Validators.required],
      description: ['',[Validators.pattern(/^\S.*$/),Validators.maxLength(200)]],
      created_date: ['',Validators.required],
      clientList: [[]],
      projectList: [[]],
      taskList: [[]],
      time: [[]],
      minutes:[[]],
      task_list: this.builder.array([]),
      showSave: [true],  // Add variable to control save button visibility
      isTaskForm: [true], // Add variable to control task form visibility
      isSaved:[false]
    });
  }

  addTimeSheet(): void {
    if (this.timeSheetForm.invalid) {
      this.timeSheetForm.markAllAsTouched();
      this.api.showWarning('Please enter the mandatory fields');
      return;
    }

    const selectedArr = this.timeSheetForm.getRawValue().response.map(project => {
      
      const { client_id, project_id, description, created_date, task_list } = project;
      return {
        client_id,
        project_id,
        description,
        created_date : this.datepipe.transform(created_date,'dd-MM-YYYY') ,
        task_list: task_list.map(task => ({
          task_id: task['task_id'],
          hours_to_complete: task['hours_to_complete'],
          minutes_to_complete: task['minutes_to_complete'],
          hours_left:task['hours_left']
        }))
       
      };
    });

    const data = {
      reporting_manager_id: this.userId, 
      created_by: this.userId,
      data: selectedArr,
      organization_id: this.orgId,
    };

  
    this.api.postData(`${environment.live_url}/${environment.time_sheets}/`,data).subscribe(
      (response) => {
        this.api.showSuccess(selectedArr.length > 1 ? 'Timesheets added successfully!' : 'Timesheet added successfully!');
        this.ngOnInit()
      },
      (error) => {
        this.api.showError(error?.error?.message);
      }
    );
  }

  getClient(i){
    this.currentIndex = i;
    let query = `?organization_id=${this.orgId}`
    if(this.userRole !== 'admin'){
      query = `?organization_id=${this.orgId}&employee_id=${this.userId}`
    }
    this.api.getData(`${environment.live_url}/${environment.client}/${query}`).subscribe((data:any)=>{
      if(data){
        this.allClient = data;
         
        const allClient = [...this.allClient]
      
        const projectControl = this.createdProject.at(i);
  
        // Update only the relevant index's project list
        projectControl.patchValue({ 
          clientList: allClient
          });
       
      }
     
    }
    )
  }
  
    
  
  getProject(event, index){
    this.currentIndex = index
    this.client_id = event
    let query:any;
    query = this.userRole === 'admin' ? `?organization=${this.orgId}&client=${event}`:`?organization=${this.orgId}&client=${event}&employee_id=${this.userId}`
     // Get the specific FormGroup from FormArray
  // Get the specific FormGroup from FormArray
  const projectForm = this.createdProject.at(index);
    
  // Reset fields while keeping the client_id
  projectForm.patchValue({
    project_id: '',  // This is the actual form control that needs validation
    description: '',
    created_date: '',
    taskList: [],
    projectList: []
  });

   // Reset and mark the task form if it exists
   if (this.taskForm) {
    this.taskForm.reset();
    this.taskForm.get('task_id')?.markAsTouched();
    this.taskForm.get('hours_to_complete')?.markAsTouched();
    this.taskForm.get('minutes_to_complete')?.markAsTouched();
  }

  
  // Only mark fields as touched if client has been changed
  
    projectForm.get('project_id')?.markAsTouched();
    projectForm.get('created_date')?.markAsTouched();
    projectForm.get('taskList')?.markAsTouched();
    projectForm.get('projectList')?.markAsTouched();

    this.api.getData(`${environment.live_url}/${environment.project}/${query}`).subscribe((res:any)=>{
      if(res){
        this.allProject = res
        this.projectList = [...this.allProject]
        this.createdProject?.at(index)?.patchValue({projectList: this.projectList})

        this.clearTaskList(index)
        if (this.taskForm) {
          Object.keys(this.taskForm.controls).forEach(key => {
            const control = this.taskForm.get(key);
            if (control) {
              control.updateValueAndValidity();
            }
          });
        }
        // ----------------
      }
     
    },(error =>{
      this.api.showError(error?.error?.message)
    }))
  }
  getTask(event,index){
    this.project_id = event
    let query:any;
    query = this.userRole === 'admin' ? `?project=${event}`:`?project=${event}&employee_id=${this.userId}`
    const projectForm = this.createdProject.at(index);
    
    // Reset fields while keeping the client_id
    projectForm.patchValue({
      description: '',
      created_date: '',
      taskList: [],
    });
  
     // Reset and mark the task form if it exists
     if (this.taskForm) {
      this.taskForm.reset();
      this.taskForm.get('task_id')?.markAsTouched();
      this.taskForm.get('hours_to_complete')?.markAsTouched();
      this.taskForm.get('minutes_to_complete')?.markAsTouched();
    }
    this.api.getData(`${environment.live_url}/${environment.project_task}/${query}`).subscribe((res:any)=>{
      if(res){
       this.allTask = res 
       this.taskList = [...this.allTask]
        // console.log(res.data[0].project_related_task_list,"RESPONSETASK n/----------------")
        this.createdProject.at(index)?.patchValue({taskList: this.taskList})
       
       this.clearTaskList(index)
        if (this.taskForm) {
          Object.keys(this.taskForm.controls).forEach(key => {
            const control = this.taskForm.get(key);
            if (control) {
              control.updateValueAndValidity();
            }
         });
        }
      }
      
    },(error =>{
      this.api.showError(error?.error?.message)
    })) 
  }
  getTimeSpent(event,index){
    //console.log(event)
    this.api.getData(`${environment.live_url}/${environment.task_hours}/`).subscribe((res:any)=>{
      if(res){
       this.hours_to_complete = res
       this.minutes_to_complete = ['00','15','30','45'];
       this.timeList = [...this.hours_to_complete]
       this.minutesList = [...this.minutes_to_complete]
        //console.log(res,"TIMESPENT n/----------------")
        this.createdProject?.at(index)?.patchValue({time: this.timeList})
        this.createdProject?.at(index)?.patchValue({minutes: this.minutesList})
       
        this.taskForm.patchValue({
          task_id:event,
          hours_to_complete:'0',
          minutes_to_complete: '15',
        });
      }
      
    },(error =>{
      this.api.showError(error?.error?.message)
    })) 
  }
  closePanel(){}
}
