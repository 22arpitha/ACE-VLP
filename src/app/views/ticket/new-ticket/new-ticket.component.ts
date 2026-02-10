import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TicketService } from 'src/app/service/ticket.service';


@Component({
  selector: 'app-new-ticket',
  templateUrl: './new-ticket.component.html',
  styleUrls: ['./new-ticket.component.scss']
})
export class NewTicketComponent implements OnInit, OnDestroy {
  ticketForm!: FormGroup;
  submitting = false;
  uploadingFile = false;
  selectedFile?: File;
  selectedFileName?: string;
  private destroy$ = new Subject<void>();

  // Current user info (should come from auth service)
  currentUserId = 'user123';
  currentUserName = 'John Doe';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm(): void {
    this.ticketForm = this.fb.group({
      employeeName: [{ value: this.currentUserName, disabled: true }, Validators.required],
      issue: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      details: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      attachment: [null]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        input.value = '';
        return;
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Allowed types: images, PDF, Word documents, and text files');
        input.value = '';
        return;
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.ticketForm.patchValue({ attachment: file });
    }
  }

  removeFile(): void {
    this.selectedFile = undefined;
    this.selectedFileName = undefined;
    this.ticketForm.patchValue({ attachment: null });
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async onSubmit(): Promise<void> {
    if (this.ticketForm.invalid || this.submitting) {
      this.markFormGroupTouched(this.ticketForm);
      return;
    }

    this.submitting = true;

    try {
      let attachmentUrl: string | undefined;

      // Upload attachment if present
      if (this.selectedFile) {
        this.uploadingFile = true;
        try {
          attachmentUrl = await this.ticketService.uploadAttachment(this.selectedFile).toPromise();
        } catch (error) {
          console.error('Error uploading attachment:', error);
          alert('Failed to upload attachment. Please try again.');
          this.submitting = false;
          this.uploadingFile = false;
          return;
        }
        this.uploadingFile = false;
      }

      // Create ticket
      const ticketData = {
        employeeId: this.currentUserId,
        employeeName: this.currentUserName,
        issue: this.ticketForm.get('issue')?.value,
        details: this.ticketForm.get('details')?.value,
        attachmentUrl: attachmentUrl
      };

      this.ticketService.raiseTicket(ticketData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (ticket) => {
            this.submitting = false;
            alert('Ticket raised successfully!');
            this.router.navigate(['/tickets', ticket.id]);
          },
          error: (error) => {
            console.error('Error creating ticket:', error);
            this.submitting = false;
            alert('Failed to create ticket. Please try again.');
          }
        });
    } catch (error) {
      console.error('Error in ticket submission:', error);
      this.submitting = false;
      alert('An unexpected error occurred. Please try again.');
    }
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
      this.router.navigate(['/tickets']);
    }
  }

  // Helper method to mark all fields as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getter methods for form controls
  get issue() { return this.ticketForm.get('issue'); }
  get details() { return this.ticketForm.get('details'); }

  // Helper method to check if field has error
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.ticketForm.get(fieldName);
    return !!(field && field.hasError(errorType) && field.touched);
  }

  // Get character count
  getCharacterCount(fieldName: string): number {
    const value = this.ticketForm.get(fieldName)?.value || '';
    return value.length;
  }

  // Get max length for a field
  getMaxLength(fieldName: string): number {
    const validators = this.ticketForm.get(fieldName)?.validator;
    if (validators) {
      const validationResult = validators({} as any);
      if (validationResult && validationResult['maxlength']) {
        return validationResult['maxlength'].requiredLength;
      }
    }
    return fieldName === 'issue' ? 200 : 2000;
  }
}