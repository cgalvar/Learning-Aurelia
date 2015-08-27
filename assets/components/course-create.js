import {inject, bindable} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {Youtube} from '../services/youtube';
import {User} from '../services/user';
import {Router} from 'aurelia-router';

@inject(Youtube, User, Router)
export class CourseCreate{

	curso = {
		capitulos : [
			{
				index: 0,
				clases:[{index: 0}]
			}
		]
	}
	
	indexChapter = 0;
	indexClass = 0;

	constructor(youtube, User, router){
		this.router = router;
		this.user = User;
		this.login = router.container.viewModel.login;
		if (!this.user.isAuthenticated)
			return this.router.navigate('/');

		if (!this.user.google_token){
			this.login.show();
		}

		this.youtube = youtube;
		this.youtube.getMyVideos();

	}

	close(){
		console.log('close called');
	}

	showCapitulo(index){
		console.log(index + " " + this.indexChapter)
		return index == this.indexChapter;//index == indexChapter;
	}

	showClase(index){
		console.log(index + " " + this.indexClass)
		return index == this.indexClass;
	}

	addClass(i){
		//como va a aumentar 1 asi lo dejamos
		this.indexClass = this.curso.capitulos[i].clases.length;
		this.curso.capitulos[i].clases.push({index: this.indexClass});
	}

	previousChapter(){
		if (this.indexChapter == 0)
			return;
		this.indexChapter--;
	}

	nextChapter(){
		if (this.indexChapter == 0)
			return;
		this.indexChapter++;
	}

	previousClass(){
		if (this.indexClass == 0)
			return;
		this.indexClass--;
	}
	nextClass(){
		console.log('entre');
		if (this.indexClass == this.curso.capitulos[this.indexChapter].clases.length -1)
			return;
		this.indexClass++;
	}

	
	
}