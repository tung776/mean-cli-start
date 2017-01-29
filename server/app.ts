import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as path from 'path';
import * as logger from 'morgan';
import * as mongoose from 'mongoose';
import * as Q from 'q';


const app: express.Express = express();

// Load config files and store in Express
const env = app.get('env');
console.log('env = ' + env);


// import * as config from ('./config/config.development').default;

let config = require('./config/config.' + env);
console.log('config:', config);
console.log('config.hello=' + config.hello);
console.log('config.world=' + config.world);
// app.set('config', config);

// View engine setup (This is only ever used for displaying error pages)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// TODO: Uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Create Express routes using all files in the routes directory
console.log('\nCreate express routes...');
const routeModules = require('require-all')({
	dirname: __dirname + '/routes',
	filter: /^([^\.].*)\.(ts|js)$/,
	map: name => '/' + name
});
function resolve(root: string, modules): void {
	for (let name of Object.keys(modules)) {
		if (!name.startsWith('/')) {
			return;
		}
		const module = modules[name];
		if (module.default && module.default.route) {
			console.log(`Add router ${root + name}`);
			const router = module.default as express.Router;
			app.use(root, router);
		} else {
			resolve(root + name, module);
		}
	}
}
resolve('', routeModules);

// Default to main page. Angular route takes over from there.
app.use((req, res) => {
	res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Catch 404 and forward to error handler
app.use((req, res, next) => {
	let err = new Error('Not Found');
	err['status'] = 404;
	next(err);
});

// Error handlers

// Development error handler will print stacktrace
if (env === 'development') {
	app.use((error: any, req, res, next) => {
		res.status(500).send({
			message: error.message,
			error
		});
	});
}

// Production error handler (no stacktraces leaked to user)
app.use((error: any, req, res, next) => {
	res.status(500).send({
		message: error.message,
		error: {}
	});
	return null;
});

export default app;

// Set up mongoose to use promises via the Q library
(<any>mongoose).Promise = Q.Promise;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/luvaas');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('MongoDB connected');
});