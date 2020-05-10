import { Component, OnInit } from '@angular/core';
import { Contact } from './contact.model';
import { Http } from '@angular/http';
import { LocalStorageService } from '../localStorageService';
import { ActivatedRoute } from '@angular/router';
import { IUser } from '../login/login.component';
import { Router } from '@angular/router';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  contacts: Array<Contact> = [];
  contactParams = '';
  localStorageService: LocalStorageService<Contact>;
  currentUser: IUser;
  constructor(
    private http: Http,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {
    this.localStorageService = new LocalStorageService('contacts');
  }

  async ngOnInit() {
    const currentUser = this.localStorageService.getItemsFromLocalStorage('user');
    if (currentUser == null) {
      this.router.navigate(['login']);

    }

    this.loadContacts();
    this.activatedRoute.params.subscribe((data: IUser) => {
      console.log('data passed from login component this component', data);
      this.currentUser = data;
    });
  }
  async loadContacts() {
    const savedContacts = this.getItemsFromLocalStorage('contacts');
    if (savedContacts && savedContacts.length > 0) {
      this.contacts = savedContacts;
    } else {
      this.contacts = await this.loadItemsFromFile();
    }
    this.sortByID(this.contacts);

  }

  async loadItemsFromFile() {
    const data = await this.http.get('assets/contact.json').toPromise();

    return data.json();
  }

  addContact() {
    this.contacts.unshift(new Contact({
      id: null,
      firstName: null,
      lastName: null,
      phone: null,
      email: null
    }));

  }

  deleteContact(index: number) {

    this.contacts.splice(index, 1);
    this.saveItemsToLocalStorage(this.contacts);
  }

  saveContact(contact: any) {
    let hasError = false;
    Object.keys(contact).forEach((key: any) => {
      if (contact[key] == null) {
        hasError = true;
        this.toastService.showToast('danger', 5000, `Password not saved! Fill all fields.`);
      }
    });
    if (!hasError) {
      contact.editing = false;
      this.saveItemsToLocalStorage(this.contacts);
    }
  }

  saveItemsToLocalStorage(contacts: Array<Contact>) {
    contacts = this.sortByID(contacts);
    return this.localStorageService.saveItemsToLocalStorage(contacts);
    // const savedContacts = localStorage.setItem('contacts', JSON.stringify(contacts));
    // return savedContacts;
  }

  getItemsFromLocalStorage(key: string) {
    // const savedContacts = JSON.parse(localStorage.getItem(key));
    return this.localStorageService.getItemsFromLocalStorage();
    // return savedContacts;
  }
  searchContact(params: string) {

    this.contacts = this.contacts.filter((item: Contact) => {
      const fullName = item.firstName + ' ' + item.lastName;


      if (params === fullName || params === item.firstName || params === item.lastName) {
        return true;
      } else {
        return false;
      }
    });
  }
  sortByID(contacts: Array<Contact>) {
    contacts.sort((prevContact: Contact, presContact: Contact) => {

      return prevContact.id > presContact.id ? 1 : -1;
    });

    return contacts;
  }
  logout() {
    // clear localStorage
    this.localStorageService.clearItemFromLocalStorage('user');
    // navigate to login page
    this.router.navigate(['']);
  }
}
