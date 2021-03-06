import { Router } from 'express';
import log from '../../helpers/bunyan';
import config from '../../helpers/config';
import * as Bcrypt from 'bcrypt';
import { Results } from '../../models/results';

const authRouter = Router();
const jwt = require('jsonwebtoken');

authRouter.route('/authenticate').post((req, res) => {

	let Model = require('../../models/user').default;

	let results: Results = {};

	Model.findOne({email: req.body.email}).exec()
		.then((user) => {
			if (!user || !user.password) {
				throw 'No user found with matching criteria.';
			}
			else {
				return Bcrypt.compare(req.body.password, user.password)
					.then(function(matches) {
						if (matches) {
							// Password matches bcrypt hash
							user = user.toObject ? user.toObject() : user;
							delete user.password; // Remove the password property before it is added to the JWT payload or sent to the client

							// Use our secret to create a JWT token
							jwt.sign(user, config.secret, {expiresIn: config.tokenExpiresIn}, function(err, token) {
								if (err || !token) {
									throw 'Could not get token';
								}
								else {
									// Success!
									results.data = token;
									results.info = 'Found user successfully.';
									results.success = true;

									return res.json(results);
								}
							});
						}
						else {
							throw 'Passwords don\'t match';
						}
					});
			}
		})
		.catch((err) => {
			results.info = 'Invalid username or password.';
			results.success = false;

			return res.json(results);
		});
});

authRouter.route('/register').post((req, res) => {
	let Model = require('../../models/user').default;

	let results: any = {
		errors 	: [],
		info 	: '',
		user 	: {},
		success : false
	};

	// TODO: Make sure the email address is a valid one

	Model.findOne({email: req.body.email}).exec()
		.then((user) => {
			if (user) {
				throw 'Email address already in use.';
			}
			else {
				let newUser = new Model();
				newUser.email = req.body.email;
				newUser.first = req.body.first;
				newUser.last = req.body.last;

				return Bcrypt.hash(req.body.password, config.saltRounds)
					.then((hash) => {
						newUser.password = hash;

						return newUser.save()
							.then((savedUser) => {
								if (!savedUser) {
									throw 'Could not save new user.';
								}
								else {
									savedUser = savedUser.toObject ? savedUser.toObject() : savedUser;
									delete savedUser.password; // Remove the password property before it is added to the JWT payload or sent to the client

									// Use our secret to create a JWT token
									jwt.sign(savedUser, config.secret, {expiresIn: config.tokenExpiresIn}, function(err, token) {
										if (err || !token) {
											throw 'Could not get token';
										}
										else {
											// Success!
											results.data = token;
											results.info = 'User created successfully';
											results.success = true;

											return res.json(results);
										}
									});
								}
							});
					});
			}
		})
		.catch((err) => {
			results.info = 'Could not create new user. ' + err;
			results.success = false;

			return res.json(results);
		});
});


export default authRouter;
