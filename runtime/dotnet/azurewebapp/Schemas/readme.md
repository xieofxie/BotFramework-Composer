
#  How to update the schema file
Once the bot has been setup with Composer and we wish to make changes to the schema, the first step in this process is to eject the runtime through the `Runtime Config` in Composer. The ejected runtime folder will broadly have the following structure

```
bot
  /bot.dialog
  /language-generation
  /language-understanding
  /dialogs
     /customized-dialogs
  /runtime
     /azurewebapp
     /azurefunctions
  /schemas
     sdk.schema
```

### Setup bfdialog tool (Prerequisite)
The bfdialog is part of our suite of botframework tools and helps merge partial schemas into a single consolidated schema

#####  To point npm to nightly builds
```
npm config set registry https://botbuilder.myget.org/F/botframework-cli/npm/
```
#####  To install BF tool:
```
npm i -g @microsoft/botframework-cli
```

#####  To install bf dialog plugin
```
bf plugins:install @microsoft/bf-dialog
```

##  Adding Custom Actions to your Composer bot
**NOTE: These steps assume you are using azurewebapp as your deployment solution. Just replace azurewebapp with azurefunctions if using azurefunctions for deployment
**
- Navigate to the solution file inside the `runtime` (./runtime/azurewebapp) folder for `azurewebapp`

- Add your customAction class to the `CustomizedActions` folder and your partial schema file (.schema) that has your declarative custom action inside the `Schemas` folder

- Register your custom action inside Startup.cs

- Navigate to to the `Schemas` (./runtime/azurewebapp/Schemas) folder inside azurewebapp and run the command `sh update.sh`

- Validate that your partial schema has been appended inside sdk.schema file

- Copy the contents of the entire `Schemas` folder of the `azurewebapp` into the `schemas` folder at the root of the ejected runtime


The above steps should have generated a new sdk.schema file inside `schemas` folder for Composer to use. Reload the bot and you should be able to use your Custom Actions.

We have a sample template included with Composer named `Custom Actions` that performs the above steps to generate a simple MultiplyDialog custom action
