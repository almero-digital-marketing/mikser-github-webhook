'use strict'

var Promise = require('bluebird');
var webhookHandler = require('github-webhook-handler');
var exec = Promise.promisify(require('child_process').exec);
var _ = require('lodash');
var fs = require('fs-extra-promise');

module.exports = function (mikser) {
	mikser.config = _.defaultsDeep(mikser.config, {
		webhook: { url: '/webhook', secret: '', command:'git pull'	}
	});

	mikser.on('mikser.server.listen', (app) => {
		let secret = mikser.config.webhook.secret;
		if (fs.existsSync(secret)) {
			secret = fs.readFileSync(secret, {encoding: 'utf8'});
		}
		var webhook = webhookHandler({ path: mikser.config.webhook.url, secret: secret });
		console.log('Webhook: http://localhost:' + mikser.config.serverPort + mikser.config.webhook.url );
		webhook.on('push', (event) => {
			mikser.watcher.stop().then(() => {
				return exec(mikser.config.webhook.command).then((stdout, stderr) => {
					console.log(stdout);
					if (stderr) {
						console.log(stderr);
					}
				});
			})
			.then(mikser.compilator.compile)
			.then(mikser.manager.copy)
			.then(mikser.manager.glob)
			.then(mikser.scheduler.process)
			.then(mikser.server.refresh)
			.then(mikser.watcher.start);
		});
		webhook.on('error', function (err) {
			mikser.diagnostics.log('error','Webhook error: ' + err.message);
		});
		app.use(webhook);
	});
};