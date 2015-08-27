import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {AuthService} from 'paulvanbladel/aureliauth';
//import {Youtube} from './youtube';

@inject(HttpClient, AuthService)
export class User {

	constructor(HttpClient, AuthService, youtube){
		console.log('instanciado');
		this.http = HttpClient;
	}

	get(){
		if (localStorage.user_id){
			this.id = localStorage.user_id;
			self = this;

			this.http.createRequest(`/user/${this.id}`)
			.asGet()
			.withHeader('Authorization', 'bearer ' + localStorage.aurelia_token)
			.send()
			.then((data) => {
				console.dir('obteniendo usuario ' + data);
				this.isAuthenticated = true;
				self.setData(data.content);
			})
			.catch((err)=>{
				console.log(err);
				self.isAuthenticated = false;
			});
		}
	}

	setData(data){
		this.id = data.id;
		this.full_name = data.full_name;
		this.email = data.emil;
		this.picture_url = data.picture_url;
		this.google_token = data.google_token;
		this.google_refresh_token = data.google_refresh_token;
		localStorage.setItem('user_id', this.id);
	}
}
