'use strict'

var Promise = require('bluebird');
var webhookHandler = require('github-webhook-handler');
var exec = Promise.promisify(require('child_process').exec);
var _ = require('lodash');
var fs = require('fs-extra-promise');
var S = require('string');

module.exports = function (mikser) {
	mikser.config = _.defaultsDeep(mikser.config, {
		webhook: { 
			url: '/webhook', 
			secret: '', 
			command: 'git pull',
			branch: 'master'
		}
	});

	mikser.on('mikser.server.listen', (app) => {
		let secret = mikser.config.webhook.secret;
		if (fs.existsSync(secret)) {
			secret = fs.readFileSync(secret, {encoding: 'utf8'});
			secret = S(secret).trim().s;
		}
		var webhook = webhookHandler({ path: mikser.config.webhook.url, secret: secret });
		console.log('Webhook: http://localhost:' + mikser.config.serverPort + mikser.config.webhook.url );
		webhook.on('push', (event) => {
			if (mikser.config.webhook.branch != event.payload.ref.split('/').pop()) return;
			mikser.watcher.stop().then(() => {
				return exec(mikser.config.webhook.command).then((stdout, stderr) => {
					console.log(stdout);
					if (stderr) {
						console.log(stderr);
					}
				});
			})
			.then(mikser.tools.compile)
			.then(mikser.manager.sync)
			.then(mikser.manager.glob)
			.then(mikser.scheduler.process)
			.then(mikser.watcher.start);
		});
		webhook.on('error', function (err) {
			mikser.diagnostics.log('error','Webhook error: ' + err.message);
		});
		app.use(webhook);
	});
};