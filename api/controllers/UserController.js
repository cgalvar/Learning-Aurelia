/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Facebook = require('machinepack-facebook');

module.exports = {
	
	authGoogle: function (req, res) {
		if (!req.body)
			return res.send(200);
		console.log('mostrando los params google controller');
		console.log(req.params.all());
		console.log('\n');
		var code = req.params.all().code;
		authService.google(req, res);
	},
	authFacebook: function (req, res) {
		var code = req.params.all().code;
		authService.facebook(code, res);
	}
	

};

