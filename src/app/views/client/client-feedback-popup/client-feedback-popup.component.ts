import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-client-feedback-popup',
  templateUrl: './client-feedback-popup.component.html',
  styleUrls: ['./client-feedback-popup.component.scss'],
  standalone: false,
})
export class ClientFeedbackPopupComponent implements OnInit {
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50, 75, 100];
  currentIndex: any;
  allClients: any[] = [];

  constructor(private api: ApiserviceService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getClientFeedbackList();
  }

  getClientFeedbackList() {
    let queryParams = `?page=${this.page}&page_size=${this.tableSize}`;
    this.api.getData(`${environment.live_url}/${environment.client_feedback}/${queryParams}`).subscribe(
      (response: any) => {
        this.allClients = response?.results || [];
        this.count = response?.total_no_of_record;
        this.page = response?.current_page;
        console.log(this.count, this.page, this.tableSize);
        console.log(response.total_no_of_record, response.current_page, response);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  sendRequest() {
    const payload: any[] = [];

    this.allClients.forEach((client) => {
      const selectedContacts = client.client_contacts?.filter(
        (c: any) => c.rowSelected
      );
      if (selectedContacts?.length) {
        payload.push({
          client_id: client.client_id,
          emails: selectedContacts.filter((c: any) => c.is_sending_feedback_form_enabled).map((c: any) => c.client_email),
        });
      }
    });
    this.api.postData(`${environment.live_url}/${environment.send_feedback_form}/`, payload).subscribe(
      (response: any) => {
        this.api.showSuccess(response?.message);
        setTimeout(() => {
          this.dialog.closeAll();
        }, 2000);
      },
      (error) => {
        console.error('Error sending feedback form', error);
      }
    );
  }

  selectAllRows(checked: boolean) {
    this.allClients.forEach((client) => {
      client.client_contacts?.forEach((contact: any) => {
        contact.rowSelected = checked;
        contact.is_sending_feedback_form_enabled = checked;
      });
    });
  }

  isAllRowsSelected(): boolean {
    const allContacts = this.getAllContacts();
    return allContacts.length > 0 && allContacts.every((c) => c.rowSelected);
  }

  isRowsIndeterminate(): boolean {
    const allContacts = this.getAllContacts();
    const selectedCount = allContacts.filter((c) => c.rowSelected).length;
    return selectedCount > 0 && selectedCount < allContacts.length;
  }

  toggleClient(clientId: number, checked: boolean) {
    const client = this.allClients.find((c) => c.client_id === clientId);
    client?.client_contacts?.forEach((contact: any) => {
      contact.rowSelected = checked;
      contact.is_sending_feedback_form_enabled = checked;
    });
  }

  isClientSelected(clientId: number): boolean {
    const client = this.allClients.find((c) => c.client_id === clientId);
    const contacts = client?.client_contacts || [];
    return contacts.length > 0 && contacts.every((c: any) => c.rowSelected);
  }

  isClientIndeterminate(clientId: number): boolean {
    const client = this.allClients.find((c) => c.client_id === clientId);
    const contacts = client?.client_contacts || [];
    const selectedCount = contacts.filter((c: any) => c.rowSelected).length;
    return selectedCount > 0 && selectedCount < contacts.length;
  }

  hasSelectedRows(): boolean {
    return this.getAllContacts().some((c) => c.rowSelected);
  }

  onFeedbackChange(clientId: number, contact: any, checked: boolean) {
    contact.is_sending_feedback_form_enabled = checked;
    const client = this.allClients.find((c) => c.client_id === clientId);
    const anySelected = client?.client_contacts?.some(
      (c: any) => c.is_sending_feedback_form_enabled
    );
    client?.client_contacts?.forEach((c: any) => {
      c.rowSelected = anySelected;
    });
  }

  onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      this.getClientFeedbackList();
    }
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.getClientFeedbackList();
  }

  private getAllContacts(): any[] {
    const contacts: any[] = [];
    this.allClients.forEach((client) => {
      client.client_contacts?.forEach((c: any) => contacts.push(c));
    });
    return contacts;
  }
}
