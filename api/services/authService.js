var Facebook = require('machinepack-facebook')
var jwToken = require('./jwToken');
var request = require('request');

module.exports = {

	facebook : function (code, res) {
		// Generate a new access token for acting on behalf of a particular Facebook user account.
		Facebook.getAccessToken({
		  appId: '1603620183220498',
		  appSecret: 'b0fdd8ee8a3a99b19f1abdf0469cd214',
		  code: code,
		  callbackUrl: 'http://localhost:1337/',
		}).exec({
		  // An unexpected error occurred.
		  error: function (err){
			console.log(err);
			res.send('ocurrio un error', 500)
		  },
		  // OK.
		  success: function (result){   
		      // Get information about the Facebook user with the specified access token.
		      Facebook.getUserByAccessToken({
		          accessToken: result.token,
		      }).exec({
		      // An unexpected error occurred.
		          error: function (err){
		              console.log(err);
		              res.send('ocurrio un error', 500)
		          },
		      // OK.
		          success: function login(result){
		             
					console.log(result);
					User.find({facebook_id: result.id}, function (err, model) {
						
						if (err){
					  		console.log('ocurrio un error: ' + err);
					  		return res.send(500);
						}
						//si no existe
						if (model.length == 0) {
						  console.log('creando usuario');
						  var Facebookuser = {
						      email: result.email,
						      facebook_id : result.id,
						      full_name: result.name,
						      picture_url: 'http://graph.facebook.com/' + result.id +'/picture?type=large'
						  }

						  User.create(Facebookuser).exec(function (err, model) {
						    console.log('creado');
						    token = jwToken.issue({id : id });
						    return res.json({user: model, token: token});
						  });
						  
						}
						//si existe
						else{

						    token = jwToken.issue({id : model.facebook_id });
						    res.json({user: model, token: token});
						}
					});

		            
		          },
		      });  
		  },
		});
	},
	google: function (req, res) {
	
	debugger;
	var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
	var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
	var params = {
		code: req.param('code'),
		client_id: '188698401713-85riojkr3q7a19nbsgc256e6bpelnhbo.apps.googleusercontent.com',
		client_secret: '2irbelSyE33xWyC5uPPvjBNh',
		redirect_uri: 'http://localhost:1337/auth/google',
		grant_type: 'authorization_code'
	};

  // Step 1. Exchange authorization code for access token.
  request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
    	
    if (err){
    	console.log('error en post');
    	console.dir(err);
    	return res.json(err, 500);
    }

    var accessToken = token.access_token;
    var refreshToken = token.refresh_token;
    var headers = { Authorization: 'Bearer ' + accessToken };

    console.log('post enviado');

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {

    	console.log('trayendo el profile');
    	console.log(profile.error);
    	if (err)
    		return res.json(err, 500);


      // Step 3a. Link user accounts.
      if (req.headers.authorization) {
        User.findOne({ google: profile.sub }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Google account that belongs to you' });
          }
          var token = req.headers.authorization.split(' ')[1];
          jwToken.verify(token, function (err, decodeToken) {
          		if (err)
          			return res.status(500).send(err);
	          User.findById(decodeToken.id, function(err, user) {
	            if (!user) {
	              return res.status(400).send({ message: 'User not found' });
	            }
	            var user = {};
				user.google_id = profile.sub;
				user.picture_url = profile.picture.replace('sz=50', 'sz=200');
				user.full_name = profile.name;
				user.google_token = accessToken;
          		user.google_refresh_token = refreshToken;
				User.create(user, function (err, model) {
					if (err)
            			return res.send('error al crear usuario', 500);
					var token = jwToken.issue(model.id);
					res.send({ token: token, user: model });
				});
	          });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ google_id: profile.sub }, function(err, existingUser) {
          if (existingUser) {
            return res.send({ token: jwToken.issue(existingUser.id), user:existingUser});
          }
          var user = {};
          user.google_id = profile.sub;
          user.picture_url = profile.picture.replace('sz=50', 'sz=200');
          user.full_name = profile.name;
          user.google_token = accessToken;
          user.google_refresh_token = refreshToken;
          User.create(user, function (err, model) {
            if (err)
            	return res.send('error al crear usuario', 500);
            var token = jwToken.issue(model.id);
            res.send({ token: token, user: model });
          	
          });
          
        });
      }
    });
  });


	}

}