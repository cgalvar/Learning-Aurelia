import {User} from './services/user';
import {inject} from 'aurelia-framework';

@inject(User)
export class App {
	
	constructor(user){
		user.get();
	}

	configureRouter(config, router){
		this.router = router;

		config.title = 'Aurelia';
		config.map([
			{ route: ['', 'home'],       name: 'home',       moduleId: './home/index' },
			{ route: 'curso/create', name: 'users', moduleId: './components/course-create', nav: true }
		]);
	}

}