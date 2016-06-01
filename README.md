## Mikser GitHub webhooks
A [Mikser](https://github.com/almero-digital-marketing/mikser) plugin for integrating web site generation with GitHub webhooks. It will regenerate your web site when you push to a GitHub repository.

## Installation
1. Inside project folder `npm install --save  mikser-github-webhook`
2. Add the plugin configuration inside `mikser.yml`
3. Add the plugin to the list of mikser plugins inside `mikser.yml`

## Plugin configuration
```yaml
plugins: ['github-webhook', …]
webhook:
  url: '/webhook'
  secret: password
  command: git pull
  branch: 'master'
```

* `url`: Url used to expose the webhook. Default: `/webhook`
* `secret`: The key used to hash the payload by GitHub that we verify against, should match what you tell GitHub
* `command`: A system command to execute prior to the generation. The command is executed inside the project folder. Default `git pull`
* `branch`: Filter events only for a given branch. Note that you have to switch manualy to this branch.