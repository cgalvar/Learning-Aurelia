import {HttpClient} from 'aurelia-http-client';
import {User} from './user';
import {inject} from 'aurelia-framework';


@inject(HttpClient, User)
export class Youtube{

	baseUrl = 'https://www.googleapis.com/youtube/v3';
	


	constructor(http, User){
		console.log('entrando a youtube');
		this.http = http;
		this.user = User;

	}

	getMyVideos(){
		
		var params = {
			part: 'contentDetails',
			mine: true,
		}

		var self = this;

		this.http.createRequest(this.baseUrl + '/channels')
		.asGet()
		.withHeader('Authorization', 'Bearer ' + this.user.google_token)
		.withParams(params).send()
		.then(function (data) {
    		self._getVideos(data.content.items[0].contentDetails.relatedPlaylists.uploads);
    	})
    	.catch(function (data) {
    		console.log('mostrando el content');
    		console.log(data.content);
    		console.log(data);
    	});
	}

	_getVideos (id) {
		var self = this;
		this.http.createRequest(this.baseUrl + '/playlistItems')
		.asGet()
		.withHeader('Authorization', 'Bearer ' + this.user.google_token)
		.withParams({
			part:'snippet',
			playlistId: id,
			key: 'AIzaSyBT1zaeU5_8K1xzcS51JjvL9AVJiVOiU_M'
		}).send()
		.then(function (data) {
			self.videos = [];
			
			data.content.items.forEach(function (item) {
				var video = {};
				video.title =  item.snippet.title;
				video.description =  item.snippet.description;
				video.videoId =  item.snippet.resourceId.videoId;
				video.thumbnailsUrl = item.snippet.thumbnails.default.url;
				self.videos.push(video);
			});
			debugger;
			console.log(self.videos);

		})
		.catch(function (data) {
			console.log(data);
		});
	}

}
