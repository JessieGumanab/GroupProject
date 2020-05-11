import { Component, OnInit } from '@angular/core';
import { Contact } from './contact.model';
import { Http } from '@angular/http';
import { LocalStorageService } from '../localStorageService';
import { ActivatedRoute } from '@angular/router';
import { IUser } from '../login/login.component';
import { Router } from '@angular/router';
import { ToastService } from '../toast/toast.service';
import { ngfactoryFilePath } from '@angular/compiler/src/aot/util';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  contacts: Array<Contact> = [];
  contactParams = '';
  toastTypes: Array<string> = [];
  ranAlpha: Array<string> = [];
  ranSym: Array<string> = [];
  localStorageService: LocalStorageService<Contact>;
  currentUser: IUser;
  constructor(
    private http: Http,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {
    this.localStorageService = new LocalStorageService('contacts');
    this.toastTypes = ['success', 'info', 'warning', 'danger'];
    this.ranAlpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'p', 'q',
      'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    this.ranSym = ['!', '#', '$', '%', '&'];
  }

  // success, info, warning, danger
  showToast() {

    const rand = Math.floor(Math.random() * 4);
    const randA = Math.floor(Math.random() * 25);
    const randB = Math.floor(Math.random() * 25);
    const randC = Math.floor(Math.random() * 25);
    const randS = Math.floor(Math.random() * 5);
    const ranN = Math.floor(Math.random() * 9);
    const randD = Math.floor(Math.random() * 25);
    const ranM = Math.floor(Math.random() * 9);
    const randE = Math.floor(Math.random() * 25);
    const ranO = Math.floor(Math.random() * 9);
    const toastType = this.toastTypes[rand];
    const toastMessage = 'Generated Password is: ' + this.ranAlpha[randA] + this.ranAlpha[randB] +
      this.ranAlpha[randC] + ranN + this.ranAlpha[randD] + ranM + this.ranAlpha[randE] + ranO + this.ranSym[randS];
    const duration = 30000;
    this.toastService.showToast(toastType, duration, toastMessage);
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
