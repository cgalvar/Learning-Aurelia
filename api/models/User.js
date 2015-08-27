/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	email:{
  		type: 'string'
  	},
  	full_name: {
  		type: 'string'
  	},
  	nick: {
  		type: 'string'
  	},
    facebook_id: {
      type: 'string'
    },
    picture_url: {
      type: 'string'
    },
    google_id: {
      type: 'string'
    },
    google_token:{
      type: 'string',
    },
    google_refresh_token: {
      type: 'string'
    }
  }
};

