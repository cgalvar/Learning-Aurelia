import {customElement, inject} from 'aurelia-framework';
import {AuthService} from 'paulvanbladel/aureliauth';
import {User} from '../services/user';
import {Youtube} from '../services/youtube';

@inject(AuthService, User, Youtube)
@customElement('login')
export class Login{
	
	mensaje = 'Login with';

	constructor(auth, User, youtube){
		this.auth = auth;
		this.showView = false;
		this.user = User;
		this.youtube = youtube;
	}

	authenticate(name){
		console.log('enviado auth a :' + name);
        return this.auth.authenticate(name, false, null)
        .then((response)=>{
        	this.user.setData(response.content.user);

        	this.youtube.getMyVideos()
        	.then(function (data) {
        		console.log(data);
        	})
        	.catch(function (data) {
        		console.log(data);
        	});

        }).catch((err)=>{
        	console.log(err);
        });
    }

	show(mensaje, icon){
		if (mensaje)
			this.mensaje = mensaje;
		//if (icon)

		this.showView = true;
	}

	close(e){
		//e.stopPropagation();
		this.showView = false;
	}

}