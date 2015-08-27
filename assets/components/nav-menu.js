import {customElement, bindable, inject} from 'aurelia-framework';
import {User} from '../services/user';

@inject(User)
@customElement('nav-menu')
export class NavMenu {

	@bindable login; 

	constructor(user){
		debugger;
		this.user = user;
	}

	showLogin(e){
		this.login.show('Para crear un curso necesitas una cuenta de youtube', 'google');
	}

}