import { Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormGroupDirective, FormGroup, FormBuilder, FormArray, AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, map, Observable, of } from 'rxjs';
import { CanComponentDeactivate } from 'src/app/auth-guard/can-deactivate.guard';
import { GenericRedirectionConfirmationComponent } from 'src/app/generic-components/generic-redirection-confirmation/generic-redirection-confirmation.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { FormErrorScrollUtilityService } from 'src/app/service/form-error-scroll-utility-service.service';
import { urlToFile, fileToBase64 } from 'src/app/shared/fileUtils.utils';
import { environment } from 'src/environments/environment';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';

@Component({
  selector: 'app-updated-job-kpi',
  templateUrl: './updated-job-kpi.component.html',
  styleUrls: ['./updated-job-kpi.component.scss']
})
export class UpdatedJobKpiComponent implements CanComponentDeactivate, OnInit, OnDestroy {
  @ViewChildren('fileInput') fileInputs: QueryList<ElementRef>;
  @ViewChildren('crpfileInput') crpfileInputs: QueryList<ElementRef>;;
  @ViewChildren('mrpfileInput') mrpfileInputs: QueryList<ElementRef>;
  // BreadCrumbsTitle: any = 'KPI';
  job_id: any;
  isEditItem: boolean = false;
  allEmployeeList: any = [];
  accessPermissions: any = [];
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  jobKPIFormGroup: FormGroup;
  pageSize = 10;
  currentPage = 1;
  user_role_name: any;
  budgetFile: any = [];
  mrpFile: any[][] = [];
  crpFile: any[][] = [];
  budgetFileLink: any = [];
  mrpFileLink: any[][] = [];
  crpFileLink: any[][] = [];
  selectedBudgetFile: (File | null)[] = [];
  selectedMrpFile: (File | null)[][] = [];
  selectedCrpFile: (File | null)[][] = [];
  editingRows: { [key: string]: boolean } = {};
  originalRowValues: { [key: string]: any } = {};

  defaultReviewingTime: any = '000:00';
  formData: any;
  initialFormValue: any;
  constructor(private fb: FormBuilder, private activeRoute: ActivatedRoute,
    private common_service: CommonServiceService, private modalService: NgbModal,
    private apiService: ApiserviceService, private router: Router,
    private formErrorScrollService: FormErrorScrollUtilityService) {
    this.user_role_name = sessionStorage.getItem('user_role_name');
    if (this.activeRoute.snapshot.paramMap.get('id')) {
      // this.common_service.setTitle('Update ' + 'KPI')
      this.job_id = this.activeRoute.snapshot.paramMap.get('id')
      this.getAllEmployeeList();
      this.getModuleAccess();
      this.getJobAndKPIDetails();
    }
  }

  ngOnInit(): void {
    this.intialForm();

    this.jobKPIFormGroup?.valueChanges?.subscribe(() => {
      const currentFormValue = this.jobKPIFormGroup?.getRawValue();
      const isInvalid = this.jobKPIFormGroup?.touched && this.jobKPIFormGroup?.invalid;
      const isFormChanged: boolean = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
      let unSavedChanges = isFormChanged || isInvalid;
      this.formErrorScrollService.setUnsavedChanges(unSavedChanges);
    });
  }
  public intialForm() {
    this.jobKPIFormGroup = this.fb.group({
      job: Number(this.job_id),
      data: this.fb.array([this.createEmployeeControl()]),
    });
    this.initialFormValue = this.jobKPIFormGroup?.getRawValue();
  }

  ngOnDestroy(): void {
    this.formErrorScrollService.resetHasUnsavedValue();
  }
  public createEmployeeControl(): FormGroup {
    return this.fb.group({
      employee: [''],
      processing_time: [this.defaultReviewingTime],
      review_time: [this.defaultReviewingTime],
      budget_file: [null],
      budget_file_name: [null],
      details: this.fb.array([this.createMrpCrpGroup()]),
    });
  }

  public get f() {
    return this.jobKPIFormGroup.controls;
  }

  get employeeFormArray() {
    return this.jobKPIFormGroup.get('data') as FormArray;
  }

  mrpDetails(rowIndex: number): FormArray {
    return this.employeeFormArray.at(rowIndex).get('details') as FormArray;
  }


  private createMrpCrpGroup(): FormGroup {
    const group = this.fb.group({
      mrp: [0],
      mrpFile: [null],
      mrp_file_name: [null],
      crp: [0],
      crpFile: [null],
      crp_file_name: [null],
      'unique-id': [null],
    });
    return group;
  }

  public getModuleAccess() {
    this.apiService.getData(`${environment.live_url}/${environment.user_access}/${sessionStorage.getItem('user_id')}/`).subscribe(
      (res: any) => {
        // console.log(res)
        res.access_list.forEach((access: any) => {
          access.access.forEach((access_name: any) => {
            if (access_name.name === sessionStorage.getItem('access-name')) {
              // console.log(access_name)
              this.accessPermissions = access_name.operations;
              // console.log('this.accessPermissions', this.accessPermissions);
            }
          })
        })
      }
    )
  }

  public getAllEmployeeList() {
    let queryparams: any = `?is_active=True&employee=True`;
    this.allEmployeeList = [];
    this.apiService.getData(`${environment.live_url}/${environment.employee}/${queryparams}`).subscribe((respData: any) => {
      this.allEmployeeList = respData;
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }

  public getJobAndKPIDetails() {
    forkJoin([
      this.apiService.getData(`${environment.live_url}/${environment.jobs}/${this.job_id}/`),  // First API call for employee list
      this.apiService.getData(`${environment.live_url}/${environment.jobs_kpi}/?job-id=${this.job_id}`)  // Second API call for employee details
    ]).pipe(
      map(([jobDetailsResponse, kpiJobDetailsResponse]) => {
        jobDetailsResponse['employees'].forEach((emp: any) => {
          if (kpiJobDetailsResponse['data'] && kpiJobDetailsResponse['data'].length >= 1) {
            kpiJobDetailsResponse['data']?.forEach((kpiEmp: any) => {
              // console.log('kpiEmp',kpiEmp);
              if (emp?.employee == kpiEmp.employee) {
                emp['kpi'] = kpiEmp;
              }
            });
          }
        });
        return jobDetailsResponse;
      })
    ).subscribe((combinedResult: any) => {
      console.log('combinedResult',combinedResult);
      let hours: string = '000';
      let minutes: string = '00';
      if (combinedResult.budget_time) {
        [hours, minutes] = combinedResult.budget_time.split(":");
      }
      // const [hours, minutes] = combinedResult.budget_time?.split(":");
      const formattedbudget_time = `${hours}:${minutes}`;
      if (combinedResult['employees'] && Array.isArray(combinedResult['employees']) && combinedResult['employees']?.length >= 1) {
        const employeesDetailsArray = this.jobKPIFormGroup.get('data') as FormArray;
        employeesDetailsArray?.clear();
        combinedResult['employees']?.forEach((emp, index) => {
          const detailsArray = this.fb.array([this.createMrpCrpGroup()]);
          const employeeForm = this.fb.group({
            employee: [{ value: emp?.employee, disabled: true }],
            processing_time: [{ value: emp?.kpi ? emp?.kpi?.processing_time : '000:00'.toString(), disabled: true }],
            review_time: [{ value: emp?.kpi ? emp?.kpi?.review_time : '000:00', disabled: true }],
            budget_file: [{ value: null, disabled: true }],
            budget_file_name: [null],
            details: detailsArray,
          });
          employeesDetailsArray.push(employeeForm);
          // Step 3: Set budget file values
          if (emp?.kpi) {
            const currentGroup = employeesDetailsArray.at(index);
            currentGroup?.get('budget_file')?.setErrors(null);
            currentGroup?.patchValue({ budget_file_name: null });
            if (emp.kpi.budget_file) {
              urlToFile(emp.kpi.budget_file, this.getFileName(emp.kpi.budget_file))
                .then((file) => {
                  if (file) {
                    this.budgetFile[index] = file;
                    this.selectedBudgetFile[index] = file;
                    this.budgetFileLink[index] =
                      //  `${environment.media_url}${emp.kpi.budget_file}`;
                      `${emp.kpi.budget_file}`;
                  } else {
                    this.budgetFile[index] = null;
                    this.selectedBudgetFile[index] = null;
                    this.budgetFileLink[index] = null;
                    currentGroup?.patchValue({
                      budget_file: null,
                      budget_file_name: null,
                    });
                  }
                })
                .catch((error) => console.error('Error:', error));
            } else {
              currentGroup?.patchValue({
                budget_file: null,
                budget_file_name: null,
              });
            }

            // Step 4: Add details items if they exist
            if (emp.kpi.details && emp.kpi.details.length >= 1) {
              (currentGroup.get('details') as FormArray).clear();
              emp.kpi.details.forEach((detail, detailIndex) => {
                const detailGroup = this.createMrpCrpGroup();
                detailGroup.patchValue({
                  mrp: detail?.mrp ?? 0,
                  crp: detail?.crp ?? 0,
                  mrp_file_name: detail?.mrp_file_name ?? null,
                  crp_file_name: detail?.crp_file_name ?? null,
                  'unique-id': detail?.id ?? null,
                });
                detailGroup.get('mrp')?.disable();
                detailGroup.get('crp')?.disable();
                // Ensure the nested arrays are initialized
                [this.mrpFile, this.crpFile, this.mrpFileLink, this.crpFileLink, this.selectedMrpFile, this.selectedCrpFile]
                  .forEach(arr => {
                    if (!arr[index]) arr[index] = [];
                  });
                // MRP File
                if (detail && detail?.mrpFile) {
                  detailGroup?.get('mrpFile')?.setErrors(null);
                  urlToFile(detail.mrpFile, this.getFileName(detail.mrpFile))
                    .then((file) => {
                      const fileToSet = file ?? null;
                      if (fileToSet) {
                        detailGroup.get('mrpFile')?.disable();
                        this.mrpFile[index][detailIndex] = fileToSet;
                        this.selectedMrpFile[index][detailIndex] = fileToSet;
                        this.mrpFileLink[index][detailIndex] = file
                          ? `${detail.mrpFile}`
                          : null;
                      } else {
                        detailGroup?.patchValue({
                          mrpFile: null,
                          mrp_file_name: null,
                        });
                        detailGroup.get('mrpFile')?.disable();
                      }
                    })
                    .catch((err) => console.error('MRP File load error:', err));
                } else {
                  detailGroup?.patchValue({
                    mrpFile: null,
                    mrp_file_name: null,
                  });
                  detailGroup.get('mrpFile')?.disable();
                }

                // CRP File
                if (detail && detail?.crpFile) {
                  detailGroup?.get('mrpFile')?.setErrors(null);
                  urlToFile(detail.crpFile, this.getFileName(detail.crpFile))
                    .then((file) => {
                      const fileToSet = file ?? null;
                      if (fileToSet) {
                        detailGroup.get('crpFile')?.disable();
                        this.crpFile[index][detailIndex] = fileToSet;
                        this.selectedCrpFile[index][detailIndex] = fileToSet;
                        this.crpFileLink[index][detailIndex] = file
                          ? `${detail.crpFile}`
                          : null;
                      } else {
                        detailGroup?.patchValue({
                          crpFile: null,
                          crp_file_name: null,
                        });
                        detailGroup.get('crpFile')?.disable();
                      }

                    })
                    .catch((err) => console.error('CRP File load error:', err));
                } else {
                  detailGroup?.patchValue({
                    crpFile: null,
                    crp_file_name: null,
                  });
                  detailGroup.get('crpFile')?.disable();
                }
                (currentGroup.get('details') as FormArray).push(detailGroup);
              });
            }

          }
        });
      }
    });
  }
  public editJobKPIDetails() {
    this.isEditItem = !this.isEditItem;
    const employeesDetailsArray = this.jobKPIFormGroup.get('data') as FormArray;
    employeesDetailsArray.controls?.forEach((controls, index) => {
      controls.get('processing_time')?.disable();
      controls.get('review_time')?.disable();
      controls.get('budget_file')?.disable();
      const detailGroup = employeesDetailsArray.at(index).get('details') as FormArray;
      detailGroup.controls?.forEach((controlss) => {
        controlss.get('mrp')?.disable();
        controlss.get('mrpFile')?.disable();
        controlss.get('crp')?.disable();
        controlss.get('crpFile')?.disable();
      })
    })
    this.editingRows = {};
  }
  public backBtnFunc(): void {
    if (this.isEditItem && this.hasUnsavedChanges()) {
      this.showConfirmationPopup().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.cleanupAndNavigate();
        }
      });
    } else {
      this.cleanupAndNavigate();
    }
  }
  public hasUnsavedChanges(): boolean {
    const currentFormValue = this.jobKPIFormGroup.getRawValue();
    const isFormChanged = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    return isFormChanged || this.jobKPIFormGroup.dirty;
  }

  private cleanupAndNavigate(): void {
    this.common_service.setJobActiveTabindex(0);
  }
  private showConfirmationPopup(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      const modalRef = this.modalService.open(GenericRedirectionConfirmationComponent, {
        size: 'sm' as any,
        backdrop: true,
        centered: true,
      });

      modalRef.componentInstance.status.subscribe((resp: any) => {
        observer.next(resp === 'ok');
        observer.complete();
        modalRef.close();
      });
    });
  }
  // Save JOB KPI
  public async saveJobKPIDetails() {
    console.log('controls',this.jobKPIFormGroup.controls);
    if (this.jobKPIFormGroup.invalid) {
      this.jobKPIFormGroup.markAllAsTouched();
      this.formErrorScrollService.setUnsavedChanges(true);
      this.formErrorScrollService.scrollToFirstError(this.jobKPIFormGroup);
    } else {
      let reqPayload: any = {};
      reqPayload['job'] = this.jobKPIFormGroup?.get('job')?.value;
      let empData: any = this.jobKPIFormGroup?.get('data')?.getRawValue();
      await this.UpdateFileFieldData(empData).then((updatedData) => {
        reqPayload['data'] = updatedData;
      }).catch((error) => {
        reqPayload['data'] = [];
      });
      // console.log('reqPayload',reqPayload,typeof reqPayload);
      this.apiService.postData(`${environment.live_url}/${environment.jobs_kpi}/`, reqPayload).subscribe((respData: any) => {
        if (respData) {
          this.apiService.showSuccess(respData['message']);
          this.formGroupDirective.resetForm();
          this.formErrorScrollService.resetHasUnsavedValue();
          this.initialFormValue = this.jobKPIFormGroup?.getRawValue();
          this.common_service.setJobActiveTabindex(null);
          setTimeout(() => {
            this.common_service.setJobActiveTabindex(1);
          }, 100);

        }
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      });
    }
  }
  public async UpdateFileFieldData(empData: any) {
    if (empData && empData.length >= 1) {
      for (let index = 0; index < empData.length; index++) {
        // Budget file processing
        if (this.budgetFile && this.budgetFile[index]) {
          empData[index].budget_file = await this.convertFileToBase64(this.budgetFile[index]);
          empData[index].budget_file_name = this.selectedBudgetFile?.[index]?.name || null;
        }
        // Details
        const details = empData[index].details;
        if (details && details.length >= 1) {
          for (let j = 0; j < details.length; j++) {
            // MRP file
            if (this.mrpFile?.[index]?.[j]) {
              details[j].mrpFile = await this.convertFileToBase64(this.mrpFile[index][j]);
              details[j].mrp_file_name = this.selectedMrpFile?.[index]?.[j]?.name || null;
            }
            // CRP file
            if (this.crpFile?.[index]?.[j]) {
              details[j].crpFile = await this.convertFileToBase64(this.crpFile[index][j]);
              details[j].crp_file_name = this.selectedCrpFile?.[index]?.[j]?.name || null;
            }
          }
        }

      }
    }
    return empData;
  }

  private async convertFileToBase64(file: File): Promise<string | null> {
    try {
      const base64 = await fileToBase64(file);
      return base64;
    } catch (error) {
      console.error('Error converting file to base64', error);
      return null;
    }
  }

  get currentPageRows() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.employeeFormArray.controls.slice(startIndex, endIndex);
  }
  public getFileName(url: any) {
    return url?.split('/')?.pop();
  }

  public onPageChanged(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
  }

  public getContinuousIndex(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  // removeImage(i: number) {
  //   const index = (this.currentPage - 1) * this.pageSize + i;
  //   this.selectedBudgetFile[index] = null;
  //   this.budgetFile[index] = null;
  //   const row = (this.jobKPIFormGroup.get('data') as FormArray).at(index);
  //   if (row) {
  //     row.get('budget_file')?.setValue(null);
  //     row.get('budget_file_name')?.setValue(null);
  //   }
  //   if (this.isDragActive['budget'][index]) {
  //     Object.keys(this.isDragActive['budget'][index]).forEach(key => {
  //       this.isDragActive['budget'][index][key] = false;
  //     });
  //   }
  //   const input: HTMLInputElement = document.querySelector(
  //     `input[formcontrolname='budget_file'][data-row="${index}"]`
  //   ) as HTMLInputElement;

  //   if (input) input.value = '';
  // }

  removeFile(type: 'budget' | 'mrp' | 'crp', row: number, col: number = 0) {
    const index = row;
    if (type === 'budget') {
      this.selectedBudgetFile[index] = null;
      this.budgetFile[index] = null;
      this.budgetFileLink[index] = null;
    }
    else if (type === 'mrp') {
      this.selectedMrpFile[index][col] = null;
      this.mrpFile[index][col] = null;
      this.mrpFileLink[index][col] = null;
    }
    else if (type === 'crp') {
      this.selectedCrpFile[index][col] = null;
      this.crpFile[index][col] = null;
      this.crpFileLink[index][col] = null;
    }
    const formRow = (this.jobKPIFormGroup.get('data') as FormArray).at(index);
    if (type === 'budget') {
      formRow.get('budget_file')?.setValue(null);
      formRow.get('budget_file_name')?.setValue(null);
    }
    else {
      const details = formRow.get('details') as FormArray;
      const item = details.at(col);

      if (type === 'mrp') {
        item.get('mrpFile')?.setValue(null);
        item.get('mrp_file_name')?.setValue(null);
        item.get('mrpFile')?.updateValueAndValidity();
      }
      
      if (type === 'crp') {
        item.get('crpFile')?.setValue(null);
        item.get('crp_file_name')?.setValue(null);
        item.get('crpFile')?.updateValueAndValidity();
      }
    }
    if (this.isDragActive[type][index]) {
      if (this.isDragActive[type][index][col] !== undefined) {
        this.isDragActive[type][index][col] = false;
      }
    }

    // --- 4. Reset input element ---
    let selector = '';

    if (type === 'budget') {
      selector = `input[formcontrolname='budget_file'][data-row="${index}"]`;
    }
    else if (type === 'mrp') {
      selector = `input[data-row="${index}"][data-mrp="${col}"]`;
    }
    else if (type === 'crp') {
      selector = `input[data-row="${index}"][data-crp="${col}"]`;
    }

    const input: HTMLInputElement = document.querySelector(selector) as HTMLInputElement;
    if (input) input.value = '';

    // console.log(`Removed ${type.toUpperCase()} file for row ${index}, col ${col}`);
  }



  public onBudgetFileSelected(event: Event, index: any): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];

      // Validate file type
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.type === "application/msword" ||
        selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        selectedFile.type === "application/pdf"
      ) {
        this.budgetFile[index] = selectedFile;
        this.selectedBudgetFile[index] = this.budgetFile[index];
        this.budgetFileLink[index] = null;
        // Reset input value after a slight delay to allow re-selection
        setTimeout(() => {
          input.value = "";
        }, 100); // Small delay to ensure the selection is registered
      } else {
        this.apiService.showError("Invalid file type. Only xlsx, xls, doc, docx, pdf files are allowed.");
        this.selectedBudgetFile[index] = null;
      }
    }
  }

  isDragActive: any = {
    budget: {},
    mrp: {},
    crp: {}
  };
  onDragOver(event: DragEvent) {
    if (!this.isEditItem) return;
    event.preventDefault();

    const zone = (event.target as HTMLElement).closest('.drop-zone');
    if (!zone) return;

    const type = zone.getAttribute("data-type");   // "budget" | "mrp" | "crp"
    const row = Number(zone.getAttribute("data-row"));
    // const col = Number(zone.getAttribute("data-col") ?? -1);
    let col = Number(zone.getAttribute("data-col") ?? 0);
    // Budget does not have multiple columns → FORCE col = 0
    if (type === 'budget') col = 0;

    if (!this.isDragActive[type][row]) this.isDragActive[type][row] = {};

    this.isDragActive[type][row][col] = true;
  }

  onDragLeave(event: DragEvent) {
    const zone = (event.target as HTMLElement).closest('.drop-zone');
    if (!zone) return;

    const type = zone.getAttribute("data-type");
    const row = Number(zone.getAttribute("data-row"));
    // const col = Number(zone.getAttribute("data-col") ?? -1);
    let col = Number(zone.getAttribute("data-col") ?? 0);
    if (type === 'budget') col = 0;

    if (this.isDragActive[type][row])
      this.isDragActive[type][row][col] = false;
  }


  onFileDropped(event: DragEvent) {
    if (!this.isEditItem) return;

    event.preventDefault();

    const zone = (event.target as HTMLElement).closest('.drop-zone');
    if (!zone) return;

    const type = zone.getAttribute("data-type");  // budget / mrp / crp
    const row = Number(zone.getAttribute("data-row"));
    // const col = Number(zone.getAttribute("data-col") ?? -1);
    let col = Number(zone.getAttribute("data-col") ?? 0);
    if (type === 'budget') col = 0;

    // Stop highlight
    this.isDragActive[type][row][col] = false;

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    // Convert drop event to input event
    const fakeEvent: any = { target: { files } };

    // 🔥 Route to correct function
    if (type === 'budget') {
      this.onBudgetFileSelected(fakeEvent, row);
    }
    else if (type === 'mrp') {
      this.onMrpFileSelected(fakeEvent, row, col);
    }
    else if (type === 'crp') {
      this.onCrpFileSelected(fakeEvent, row, col);
    }
  }






  public onMrpFileSelected(event: Event, rowIndex: number, mrpIndex: number): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];
      const detailsArray = this.employeeFormArray.at(rowIndex).get('details') as FormArray;

      // Validate file type
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.type === "application/msword" ||
        selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        selectedFile.type === "application/pdf"
      ) {
        // the first time you’re uploading then replace it with empty array to avoid undefined
        this.mrpFile[rowIndex] = this.mrpFile[rowIndex] || [];
        this.selectedMrpFile[rowIndex] = this.selectedMrpFile[rowIndex] || [];
        this.mrpFileLink[rowIndex] = this.mrpFileLink[rowIndex] || [];

        this.mrpFile[rowIndex][mrpIndex] = selectedFile;
        this.selectedMrpFile[rowIndex][mrpIndex] = this.mrpFile[rowIndex][mrpIndex];
        this.mrpFileLink[rowIndex][mrpIndex] = null;
        detailsArray.at(mrpIndex).get('mrpFile')?.setValue(selectedFile);
        detailsArray.at(mrpIndex).get('mrpFile')?.updateValueAndValidity();
        // Reset input value after a slight delay to allow re-selection
        setTimeout(() => {
          input.value = "";
        }, 100); // Small delay to ensure the selection is registered
      } else {
        this.apiService.showError("Invalid file type. Only xlsx, xls, doc, docx, pdf files are allowed.");
        // this.selectedMrpFile[rowIndex][mrpIndex] = null;
        // this.mrpFileLink[rowIndex][mrpIndex] = null;
        detailsArray.at(mrpIndex).get('mrpFile')?.setValue(null);
        detailsArray.at(mrpIndex).get('mrpFile')?.updateValueAndValidity();
      }
    }
  }
  public onCrpFileSelected(event: Event, rowIndex: number, crpIndex: number): void {
    const input = event.target as HTMLInputElement;
    const detailsArray = this.employeeFormArray.at(rowIndex).get('details') as FormArray;

    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];

      // Validate file type
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.type === "application/msword" ||
        selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        selectedFile.type === "application/pdf"
      ) {
        // the first time you’re uploading then replace it with empty array to avoid undefined 
        this.crpFile[rowIndex] = this.crpFile[rowIndex] || [];
        this.selectedCrpFile[rowIndex] = this.selectedCrpFile[rowIndex] || [];
        this.crpFileLink[rowIndex] = this.crpFileLink[rowIndex] || [];

        this.crpFile[rowIndex][crpIndex] = selectedFile;
        this.selectedCrpFile[rowIndex][crpIndex] = this.crpFile[rowIndex][crpIndex];
        this.crpFileLink[rowIndex][crpIndex] = null;
        this.crpFile[rowIndex][crpIndex] = selectedFile;
        this.selectedCrpFile[rowIndex][crpIndex] = this.crpFile[rowIndex][crpIndex];
        this.crpFileLink[rowIndex][crpIndex] = null;
        detailsArray.at(crpIndex).get('crpFile')?.setValue(selectedFile);
        detailsArray.at(crpIndex).get('crpFile')?.updateValueAndValidity();
        // Reset input value after a slight delay to allow re-selection
        setTimeout(() => {
          input.value = "";
        }, 100); // Small delay to ensure the selection is registered
      } else {
        this.apiService.showError("Invalid file type. Only xlsx, xls, doc, docx, pdf files are allowed.");
        // this.selectedCrpFile[rowIndex][crpIndex] = null;
        // this.crpFileLink[rowIndex][crpIndex] = null;
        detailsArray.at(crpIndex).get('crpFile')?.setValue(null);
        detailsArray.at(crpIndex).get('crpFile')?.updateValueAndValidity();

      }
    }
  }
  public triggerFileInput(index: any) {
    // console.log('fileInputs',this.fileInputs);
    const fileInput = this.fileInputs?.toArray()[index];
    // console.log('fileInput',fileInput);

    if (fileInput) {
      fileInput?.nativeElement?.click();
    }
  }
  public triggerMrpFileInput(rowIndex: number, mrpIndex: number): void {
    const input = this.mrpfileInputs.find((elementRef: ElementRef) => {
      const nativeEl = elementRef.nativeElement;
      return +nativeEl.getAttribute('data-row') === rowIndex &&
        +nativeEl.getAttribute('data-mrp') === mrpIndex;
    });

    if (input) {
      input.nativeElement.click();
    } else {
      console.warn(`MRP File input not found for row ${rowIndex} and index ${mrpIndex}`);
    }
  }
  public triggerCrpFileInput(rowIndex: number, mrpIndex: number): void {
    const input = this.crpfileInputs.find((elementRef: ElementRef) => {
      const nativeEl = elementRef.nativeElement;
      return +nativeEl.getAttribute('data-row') === rowIndex &&
        +nativeEl.getAttribute('data-mrp') === mrpIndex;
    });

    if (input) {
      input.nativeElement.click();
    } else {
      console.warn(`CRP File input not found for row ${rowIndex} and index ${mrpIndex}`);
    }
  }
  public openFileInNewTab(source: any, index: any, typeindex?: any) {
    if (source === 'mrp') {
      if (this.mrpFileLink[index][typeindex]) {
        window.open(this.mrpFileLink[index][typeindex], '_blank');
      }
    } else if (source === 'crp') {
      if (this.crpFileLink[index][typeindex]) {
        window.open(this.crpFileLink[index][typeindex], '_blank');
      }
    } else {
      if (this.budgetFileLink[index]) {
        window.open(this.budgetFileLink[index], '_blank');
      }
    }
  }
  public defaultProcessingTime(event: any, index: any): void {
    let rawValue = event.target.value;
    if (!rawValue) {
      const employeesDetailsArray = this.jobKPIFormGroup?.get('data') as FormArray;
      rawValue = '000:00';
      employeesDetailsArray?.at(index)?.patchValue({ 'processing_time': rawValue }); // Default value (can adjust as needed)
    }
  }
  public formatProcessingTime(event: any, index: any): void {
    let rawValue = event.target.value?.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    const employeesDetailsArray = this.jobKPIFormGroup?.get('data') as FormArray;
    // Insert the colon if the length of the value exceeds 3 digits
    if (rawValue.length > 3 && rawValue?.indexOf(':') === -1) {
      rawValue = rawValue?.slice(0, 3) + ':' + rawValue?.slice(3);
    }

    if (rawValue?.includes(':')) {
      const parts = rawValue?.split(':');

      if (parts[1].length > 0) {
        const secondPart = parseInt(parts[1][0], 10);  // Get the first character after the colon

        // Check if the second part's first character is greater than 5
        if (secondPart > 5) {
          // Replace it immediately with '5' + the rest of the characters
          parts[1] = '5' + parts[1]?.slice(1);
          rawValue = parts?.join(':');  // Join the parts back together
          event.target.value = rawValue; // Update the input field value
        }
      }
    }
    // Update the processing_time field in the form without emitting an event
    employeesDetailsArray?.at(index)?.get('processing_time')?.setValue(rawValue, { emitEvent: false });
  }
  public formatReviewingTime(event: any, index: any): void {
    let rawValue = event.target.value?.replace(/[^0-9]/g, '');
    const employeesDetailsArray = this.jobKPIFormGroup?.get('data') as FormArray;

    if (rawValue.length > 3 && rawValue?.indexOf(':') === -1) {
      rawValue = rawValue?.slice(0, 3) + ':' + rawValue?.slice(3);
    }
    if (rawValue?.includes(':')) {
      const parts = rawValue?.split(':');

      if (parts[1].length > 0) {
        const secondPart = parseInt(parts[1][0], 10);  // Get the first character after the colon

        // Check if the second part's first character is greater than 5
        if (secondPart > 5) {
          // Replace it immediately with '5' + the rest of the characters
          parts[1] = '5' + parts[1]?.slice(1);
          rawValue = parts?.join(':');  // Join the parts back together
          event.target.value = rawValue; // Update the input field value
        }
      }
    }
    employeesDetailsArray?.at(index)?.get('review_time')?.setValue(rawValue, { emitEvent: false });
  }
  public defaultReviewTime(event: any, index: any): void {
    let rawValue = event.target.value.replace(/[^0-9]/g, '');
    if (!rawValue) {
      const employeesDetailsArray = this.jobKPIFormGroup.get('data') as FormArray;
      rawValue = '000:00';
      employeesDetailsArray?.at(index)?.patchValue({ 'review_time': rawValue });
    }
  }
  setDefaultValueIfEmpty(
    event: any,
    rowIndex: number,
    mrpIndex: number,
    fieldName: 'mrp' | 'crp'
  ): void {
    const rawValue = event?.target?.value;

    if (!rawValue) {
      const employeesDetailsArray = this.jobKPIFormGroup?.get('data') as FormArray;

      if (employeesDetailsArray?.at(rowIndex)) {
        const detailFormGroup = employeesDetailsArray.at(rowIndex) as FormGroup;
        const detailsArray = detailFormGroup.get('details') as FormArray;

        if (detailsArray?.at(mrpIndex)) {
          detailsArray.at(mrpIndex).patchValue({ [fieldName]: 0 });
        }
      }
    }
  }
  public validateKeyPress(event: KeyboardEvent) {
    const keyCode = event.which || event.keyCode;
    if (
      (keyCode >= 48 && keyCode <= 57) || keyCode === 8 || keyCode === 37 || keyCode === 39 || keyCode === 189 || keyCode === 109
    ) {
      return;
    } else {
      event.preventDefault();
    }
  }
  canDeactivate(): Observable<boolean> {
    const currentFormValue = this.jobKPIFormGroup?.getRawValue();
    const isFormChanged: boolean = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    return this.isEditItem ? this.formErrorScrollService.isFormDirtyOrInvalidCheck(isFormChanged, this.jobKPIFormGroup) : of(true);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent): void {
    const currentFormValue = this.jobKPIFormGroup.getRawValue();
    const isFormChanged: boolean = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    if (isFormChanged || this.jobKPIFormGroup.dirty) {
      $event.preventDefault();
    }
  }

  // Dynamically adding CRP & MRP 
  // public addMrpCrpItem(rowIndex: number) {
  //   const dataArray = this.jobKPIFormGroup.get('data') as FormArray;
  //   const rowGroup = dataArray.at(rowIndex) as FormGroup;
  //   const mrpCrpList = rowGroup.get('details') as FormArray;
  //   mrpCrpList.push(this.createMrpCrpGroup());
  // }

  public addMrpCrpItem(rowIndex: number) {
    const dataArray = this.jobKPIFormGroup.get('data') as FormArray;
    const rowGroup = dataArray.at(rowIndex) as FormGroup;
    const mrpCrpList = rowGroup.get('details') as FormArray;

    const newIndex = mrpCrpList.length;
    const newGroup = this.createMrpCrpGroup();

    newGroup.get('mrp')?.enable();
    newGroup.get('mrpFile')?.enable();
    newGroup.get('crp')?.enable();
    newGroup.get('crpFile')?.enable();

    rowGroup.get('processing_time')?.enable();
    rowGroup.get('review_time')?.enable();
    rowGroup.get('budget_file')?.enable();

    const key = rowIndex + '-' + newIndex;
    this.editingRows[key] = true;
    this.editingRows['budget-' + rowIndex] = true;
    this.selectedMrpFile[rowIndex] ||= [];
    this.selectedCrpFile[rowIndex] ||= [];
    this.mrpFile[rowIndex] ||= [];
    this.crpFile[rowIndex] ||= [];
    this.mrpFileLink[rowIndex] ||= [];
    this.crpFileLink[rowIndex] ||= [];

    mrpCrpList.push(newGroup);
  }


  public deleteMrpCrpItem(rowIndex: number, index: number) {
    const dataArray = this.jobKPIFormGroup.get('data') as FormArray;
    const employeeGroup = dataArray.at(rowIndex) as FormGroup;
    const detailsArray = employeeGroup.get('details') as FormArray;
    const detailGroup = detailsArray.at(index) as FormGroup;
    const detailValue = detailGroup.getRawValue();
    console.log(detailsArray)
    const data = {
      employee_id: employeeGroup.get('employee')?.value,
      'unique-id': detailValue['unique-id'] ?? null,
      row_index: rowIndex,
      index: index
    }
    if (data['unique-id']) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });
      modelRef.componentInstance.status.subscribe((resp: any) => {
        if (resp == "ok") {
          this.removeLineItem(data);
          modelRef.close();
        }
        else {
          modelRef.close();
        }
      })
    } else if (detailsArray.length > 1) {
      detailsArray.removeAt(index);
      this.removeFileDataForIndex(rowIndex, index);
    }
  }

   removeFileDataForIndex(rowIndex: number, index: number) {
    const arrays = [
      this.mrpFile,
      this.selectedMrpFile,
      this.mrpFileLink,
      this.crpFile,
      this.selectedCrpFile,
      this.crpFileLink
    ];

    arrays.forEach(arr => {
      if (arr[rowIndex]) {
        arr[rowIndex].splice(index, 1);
      }
    });
}

  removeLineItem(data: any) {
    this.apiService.delete(`${environment.live_url}/${environment.kpi_submission}/?kpi-id=${data['unique-id']}`).subscribe((respData: any) => {
      if (respData) {
        this.apiService.showSuccess(respData['message']);
        this.getJobAndKPIDetails();
        // this.refreshUpdatedLineById(data.employee_id, data['unique-id']);
      }
    },
      (error: any) => {
        console.error('Error deleting KPI item:', error);
      });
  }

  public editMrpCrpItem(rowIndex: number, index: number) {
    const key = rowIndex + '-' + index;
    this.editingRows[key] = true;
    this.editingRows['budget-' + rowIndex] = true;
    const dataArray = this.jobKPIFormGroup.get('data') as FormArray;
    const rowGroup = dataArray.at(rowIndex) as FormGroup;
    // Enable row level fields
    rowGroup.get('processing_time')?.enable();
    rowGroup.get('review_time')?.enable();
    rowGroup.get('budget_file')?.enable();
    const detailGroup = dataArray?.at(rowIndex).get('details')?.get([index]) as FormGroup;
    if (detailGroup) {
      this.originalRowValues[key] = {
      mrp: Number(detailGroup.get('mrp')?.value || 0),
      crp: Number(detailGroup.get('crp')?.value || 0),
      mrpFileName:
        this.selectedMrpFile?.[rowIndex]?.[index]?.name || '',
      crpFileName:
        this.selectedCrpFile?.[rowIndex]?.[index]?.name || ''
    };

      detailGroup.get('mrp')?.enable();
      detailGroup.get('mrpFile')?.enable();
      detailGroup.get('crp')?.enable();
      detailGroup.get('crpFile')?.enable();
    }
  }



  async saveMrpCrpItem(rowIndex: number, index: number) {
    const key = rowIndex + '-' + index;
    const dataArray = this.jobKPIFormGroup.get('data') as FormArray;
    // const detailGroup = dataArray?.at(rowIndex).get('details')?.get([index]) as FormGroup;
    const employeeGroup = dataArray.at(rowIndex) as FormGroup;
    const detailsArray = employeeGroup.get('details') as FormArray;
    const detailGroup = detailsArray.at(index) as FormGroup;
    
    if (detailGroup) {
      // Trigger validation for each field
      
      const detailValue = detailGroup.getRawValue();
      let mrpBase64 = null;
      let crpBase64 = null;
      let budgetBase64 = null;

      if (this.mrpFile?.[rowIndex]?.[index]) {
        mrpBase64 = await this.convertFileToBase64(
          this.mrpFile[rowIndex][index]
        );
      }

      if (this.crpFile?.[rowIndex]?.[index]) {
        crpBase64 = await this.convertFileToBase64(
          this.crpFile[rowIndex][index]
        );
      }

      if (this.budgetFile?.[rowIndex]) {
        budgetBase64 = await this.convertFileToBase64(
          this.budgetFile[rowIndex]
        );
      }
      console.log(this.jobKPIFormGroup.value)
      detailGroup.markAllAsTouched();
    // ---- Proper hybrid file validation ----
      const mrpValue = Number(detailGroup.get('mrp')?.value || 0);
      const crpValue = Number(detailGroup.get('crp')?.value || 0);

      // consider BOTH new files and already saved files
      const hasMrpFile =
        !!this.selectedMrpFile?.[rowIndex]?.[index] ||
        !!this.mrpFileLink?.[rowIndex]?.[index];

      const hasCrpFile =
        !!this.selectedCrpFile?.[rowIndex]?.[index] ||
        !!this.crpFileLink?.[rowIndex]?.[index];
        detailGroup.get('mrpFile')?.setErrors(null);
        detailGroup.get('mrpFile')?.updateValueAndValidity({ emitEvent: false });

        detailGroup.get('crpFile')?.setErrors(null);
        detailGroup.get('crpFile')?.updateValueAndValidity({ emitEvent: false });


      // MRP file mandatory check
      if (mrpValue > 0 && !hasMrpFile) {
        detailGroup.get('mrpFile')?.setErrors({ required: true });
        detailGroup.get('mrpFile')?.markAsTouched();
        return;
      }

      // CRP file mandatory check
      if (crpValue > 0 && !hasCrpFile) {
        detailGroup.get('crpFile')?.setErrors({ required: true });
        detailGroup.get('crpFile')?.markAsTouched();
        return;
      }

      // Now check final validity
      if (detailGroup.invalid) {
        return;
      }
      Object.keys(detailGroup.controls).forEach(key => {
        const control = detailGroup.get(key);
        control?.markAsTouched();
        control?.updateValueAndValidity();
      });

      // If group is valid, disable fields
      employeeGroup.get('processing_time')?.disable();
      employeeGroup.get('review_time')?.disable();
      employeeGroup.get('budget_file')?.disable();
      if (detailGroup.valid) {
        detailGroup.get('mrp')?.disable();
        detailGroup.get('mrpFile')?.disable();
        detailGroup.get('crp')?.disable();
        detailGroup.get('crpFile')?.disable();
        detailGroup.get('mrpFile')?.setErrors(null);
        detailGroup.get('crpFile')?.setErrors(null);
        detailGroup.get('mrpFile')?.updateValueAndValidity();
        detailGroup.get('crpFile')?.updateValueAndValidity();
                this.editingRows[key] = false;
        delete this.originalRowValues[key];
      }

      //  API-ready payload
      const payload = {
        employee_id: employeeGroup.get('employee')?.value,
        job_id: this.jobKPIFormGroup.get('job')?.value,
        mrp: detailValue.mrp,
        crp: detailValue.crp,
        mrpFile: mrpBase64,
        mrp_file_name: this.selectedMrpFile?.[rowIndex]?.[index]?.name || null,
        crpFile: crpBase64,
        crp_file_name: this.selectedCrpFile?.[rowIndex]?.[index]?.name || null,
        processing_time: employeeGroup.get('processing_time')?.value,
        review_time: employeeGroup.get('review_time')?.value,
        budget_file: budgetBase64,
        budget_file_name: this.selectedBudgetFile?.[rowIndex]?.name || null,
        "unique-id": detailValue['unique-id'] ?? null
      };
      this.submitLineItem(payload, rowIndex, index);
    }
  }

  submitLineItem(payLoad: any, rowIndex: number, index: number) {
    this.apiService.postData(`${environment.live_url}/${environment.kpi_submission}/`, payLoad).subscribe((respData: any) => {
      if (respData) {
        this.apiService.showSuccess(respData['message']);
        // this.getJobAndKPIDetails();
        this.refreshUpdatedLineById(payLoad.employee_id, payLoad['unique-id']);
      }
    });
  }


  public refreshUpdatedLineById(employeeId: number, detailId: number) {
    this.apiService.getData(`${environment.live_url}/${environment.jobs_kpi}/?job-id=${this.job_id}`)
      .subscribe((resp: any) => {
        if (!resp?.data?.length) return;
        // Find employee KPI block
        const empKpi = resp.data.find((e: any) => e.employee === employeeId);
        if (!empKpi || !empKpi.details?.length) return;
        // Find updated detail by ID
        const updatedDetail = empKpi.details.find((d: any) => d.id === detailId);
        if (!updatedDetail) return;
        // Find FORM employee row
        const dataArray = this.jobKPIFormGroup.get('data') as FormArray;
        const rowIndex = dataArray.controls.findIndex(
          row => row.get('employee')?.value === employeeId
        );
        if (rowIndex === -1) return;

        // Find FORM detail row
        const detailsArray =
          dataArray.at(rowIndex).get('details') as FormArray;

        const detailIndex = detailsArray.controls.findIndex(
          d => d.get('unique-id')?.value === detailId
        );
        if (detailIndex === -1) return;

        const detailGroup = detailsArray.at(detailIndex) as FormGroup;

        // Patch values
        detailGroup.patchValue({
          mrp: updatedDetail.mrp ?? 0,
          crp: updatedDetail.crp ?? 0,
          mrp_file_name: updatedDetail.mrp_file_name ?? null,
          crp_file_name: updatedDetail.crp_file_name ?? null
        });

        detailGroup.disable();

        // Patch MRP file
        if (updatedDetail.mrpFile) {
          urlToFile(updatedDetail.mrpFile, this.getFileName(updatedDetail.mrpFile))
            .then(file => {
              this.mrpFile[rowIndex] ||= [];
              this.selectedMrpFile[rowIndex] ||= [];
              this.mrpFileLink[rowIndex] ||= [];

              this.mrpFile[rowIndex][detailIndex] = file;
              this.selectedMrpFile[rowIndex][detailIndex] = file;
              this.mrpFileLink[rowIndex][detailIndex] = updatedDetail.mrpFile;
            });
        }

        // Patch CRP file
        if (updatedDetail.crpFile) {
          urlToFile(updatedDetail.crpFile, this.getFileName(updatedDetail.crpFile))
            .then(file => {
              this.crpFile[rowIndex] ||= [];
              this.selectedCrpFile[rowIndex] ||= [];
              this.crpFileLink[rowIndex] ||= [];

              this.crpFile[rowIndex][detailIndex] = file;
              this.selectedCrpFile[rowIndex][detailIndex] = file;
              this.crpFileLink[rowIndex][detailIndex] = updatedDetail.crpFile;
            });
        }
      });
  }

isRowModified(rowIndex: number, index: number): boolean {

  const key = rowIndex + '-' + index;

  const original = this.originalRowValues[key];
  if (!original) return false;

  const dataArray = this.jobKPIFormGroup.get('data') as FormArray;
  const detailGroup = dataArray.at(rowIndex).get('details')?.get([index]) as FormGroup;

  if (!detailGroup) return false;

  // THIS IS THE MAIN FIX
  const current = detailGroup.getRawValue();

  const currentMrp = Number(current.mrp || 0);
  const currentCrp = Number(current.crp || 0);

  const originalMrp = Number(original.mrp || 0);
  const originalCrp = Number(original.crp || 0);

  const currentMrpFileName =
    this.selectedMrpFile?.[rowIndex]?.[index]?.name || '';

  const currentCrpFileName =
    this.selectedCrpFile?.[rowIndex]?.[index]?.name || '';

  const mrpChanged = currentMrp !== originalMrp;
  const crpChanged = currentCrp !== originalCrp;

  const mrpFileChanged = currentMrpFileName !== (original.mrpFileName || '');
  const crpFileChanged = currentCrpFileName !== (original.crpFileName || '');

  return mrpChanged || crpChanged || mrpFileChanged || crpFileChanged;
}


  public getEmployeeName(employeeId: string | null): string {
    if (!employeeId) return 'Selected Employee';
    const emp = this.allEmployeeList.find(e => e.user_id === employeeId);
    return emp ? emp.user__full_name : 'Selected Employee';
  }

  public getTotalMrpValue(index) {
    let totalMrp: any = 0;
    const dataArray = this.jobKPIFormGroup.get('data') as FormArray;
    const rowGroup = dataArray.at(index) as FormGroup;
    const mrpCrpList = rowGroup.get('details') as FormArray;
    mrpCrpList.controls.forEach((control) => {
      totalMrp += Number(control?.get('mrp')?.value);
    })
    return totalMrp ?? 0;
  }
  public getTotalCrpValue(index) {
    let totalCrp: any = 0;
    const dataArray = this.jobKPIFormGroup.get('data') as FormArray;
    const rowGroup = dataArray.at(index) as FormGroup;
    const mrpCrpList = rowGroup.get('details') as FormArray;
    mrpCrpList.controls.forEach((control) => {
      totalCrp += Number(control?.get('crp')?.value);
    })
    return totalCrp ?? 0;
  }

}
