import {inject, bindable} from 'aurelia-framework';

export class CardSelect {

	@bindable title;
	@bindable img;
	@bindable description; 
	//@bindable selected;

	constructor(){
		this.selected = false;
	}

	clic(){
		console.log(this);
	}

}