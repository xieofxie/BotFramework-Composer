// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import glob from 'globby';
import {
  readFile,
  writeFile,
  copy,
  createWriteStream,
  pathExists,
  remove,
  mkdir,
  readJson,
  writeJson,
  existsSync,
  emptyDir,
  readFileSync,
} from 'fs-extra';
import { GraphRbacManagementClient } from '@azure/graph';
import * as msRestNodeAuth from '@azure/ms-rest-nodeauth';
import { ResourceManagementClient } from '@azure/arm-resources';
import { WebSiteManagementClient } from '@azure/arm-appservice-profile-2019-03-01-hybrid';
import {
  ResourceGroup,
  Deployment,
  ResourceGroupsCreateOrUpdateResponse,
  DeploymentsValidateResponse,
  DeploymentsCreateOrUpdateResponse,
} from '@azure/arm-resources/esm/models';
import rp from 'request-promise';
import archiver from 'archiver';

const execAsync = promisify(exec);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const luBuild = require('@microsoft/bf-lu/lib/parser/lubuild/builder.js');

class BotProjectDeploy {
  private subId: string;
  private botFolder: string; // path to get dialogs, lus, lgs, settings
  private runtimeFolder: string;
  private projFolder: string; // save bot and runtime
  private creds: any;

  private readonly tenantId = '72f988bf-86f1-41af-91ab-2d7cd011db47';

  constructor() {
    this.subId = '3e71927d-2914-4c36-bc5d-6369d1f42457';
    this.projFolder = path.resolve(__dirname, '../publishBots');
  }

  private pack(scope: any) {
    return {
      value: scope,
    };
  }

  private getDeploymentTemplateParam(
    appId: string,
    appPwd: string,
    location: string,
    name: string,
    shouldCreateAuthoringResource: boolean
  ) {
    return {
      appId: this.pack(appId),
      appSecret: this.pack(appPwd),
      appServicePlanLocation: this.pack(location),
      botId: this.pack(name),
      shouldCreateAuthoringResource: this.pack(shouldCreateAuthoringResource),
    };
  }

  private async readTemplateFile(templatePath?: string): Promise<any> {
    if (!templatePath) {
      templatePath = path.resolve(__dirname, 'DeploymentTemplates', 'template-with-preexisting-rg.json');
    }

    return new Promise((resolve, reject) => {
      readFile(templatePath, { encoding: 'utf-8' }, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  private async createResourceGroup(
    client: ResourceManagementClient,
    location: string,
    resourceGroupName: string
  ): Promise<ResourceGroupsCreateOrUpdateResponse> {
    console.log(`> Creating resource group ...`);
    const param = {
      location: location,
    } as ResourceGroup;

    return await client.resourceGroups.createOrUpdate(resourceGroupName, param);
  }

  private async validateDeployment(
    client: ResourceManagementClient,
    templatePath: string,
    location: string,
    resourceGroupName: string,
    deployName: string,
    templateParam: any
  ): Promise<DeploymentsValidateResponse> {
    console.log('> Validating Azure deployment ...');
    const templateFile = await this.readTemplateFile(templatePath);
    const deployParam = {
      properties: {
        template: JSON.parse(templateFile),
        parameters: templateParam,
        mode: 'Incremental',
      },
    } as Deployment;
    return await client.deployments.validate(resourceGroupName, deployName, deployParam);
  }

  private async createDeployment(
    client: ResourceManagementClient,
    templatePath: string,
    location: string,
    resourceGroupName: string,
    deployName: string,
    templateParam: any
  ): Promise<DeploymentsCreateOrUpdateResponse> {
    console.log(`> Deploying Azure services (this could take a while)...`);
    const templateFile = await this.readTemplateFile(templatePath);
    const deployParam = {
      properties: {
        template: JSON.parse(templateFile),
        parameters: templateParam,
        mode: 'Incremental',
      },
    } as Deployment;

    return await client.deployments.createOrUpdate(resourceGroupName, deployName, deployParam);
  }

  private async createApp(graphClient: GraphRbacManagementClient, displayName: string, appPassword: string) {
    const createRes = await graphClient.applications.create({
      displayName: displayName,
      passwordCredentials: [
        {
          value: appPassword,
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
        },
      ],
      availableToOtherTenants: true,
      replyUrls: ['https://token.botframework.com/.auth/web/redirect'],
    });
    return createRes;
  }

  private unpackObject(output: any) {
    const unpakced: any = {};
    for (const key in output) {
      const objValue = output[key];
      if (objValue.value) {
        unpakced[key] = objValue.value;
      }
    }
    return unpakced;
  }

  private async updateDeploymentJsonFile(
    settingsPath: string,
    client: ResourceManagementClient,
    resourceGroupName: string,
    deployName: string,
    appId: string,
    appPwd: string
  ): Promise<any> {
    const outputs = await client.deployments.get(resourceGroupName, deployName);
    return new Promise((resolve, reject) => {
      if (outputs.properties.outputs) {
        const outputResult = outputs.properties.outputs;
        const applicatoinResult = {
          MicrosoftAppId: appId,
          MicrosoftAppPassword: appPwd,
        };
        const outputObj = this.unpackObject(outputResult);

        const result = {};
        Object.assign(result, outputObj, applicatoinResult);

        writeFile(settingsPath, JSON.stringify(result, null, 4), err => {
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      } else {
        resolve({});
      }
    });
  }

  private async writeToLog(data: any, logFile: string) {
    return new Promise((resolve, reject) => {
      writeFile(logFile, JSON.stringify(data, null, 4), err => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  private async getFiles(dir: string): Promise<string[]> {
    const files = await glob('**/*', { cwd: dir, dot: true });
    const result = [];
    for (const file of files) {
      result.push(path.join(dir, file));
    }
    return result;
  }

  private async botPrepareDeploy(pathToDeploymentFile: string) {
    return new Promise((resolve, reject) => {
      const data = `[config]\nproject = BotProject.csproj`;
      writeFile(pathToDeploymentFile, data, err => {
        reject(err);
      });
    });
  }

  private async dotnetPublish(publishFolder: string, projFolder: string, botPath?: string) {
    const projectPath = path.join(projFolder, 'BotProject.csproj');
    await execAsync(`dotnet publish ${projectPath} -c release -o ${publishFolder} -v q`);
    return new Promise((resolve, reject) => {
      const remoteBotPath = path.join(publishFolder, 'ComposerDialogs');
      const localBotPath = path.join(projFolder, 'ComposerDialogs');

      if (botPath) {
        console.log(`Publishing dialogs from external bot project: ${botPath}`);
        copy(
          botPath,
          remoteBotPath,
          {
            overwrite: true,
            recursive: true,
          },
          err => {
            reject(err);
          }
        );
      } else {
        copy(
          localBotPath,
          remoteBotPath,
          {
            overwrite: true,
            recursive: true,
          },
          err => {
            reject(err);
          }
        );
      }
      resolve();
    });
  }

  private async zipDirectory(source: string, out: string) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = createWriteStream(out);

    return new Promise((resolve, reject) => {
      archive
        .directory(source, false)
        .on('error', err => reject(err))
        .pipe(stream);

      stream.on('close', () => resolve());
      archive.finalize();
    });
  }

  private notEmptyLuisModel(file: string) {
    return readFileSync(file).length > 0;
  }
  public async deploy(
    name: string,
    environment: string,
    luisAuthoringKey?: string,
    luisAuthoringRegion?: string,
    logFile?: string,
    botPath?: string,
    language?: string
  ) {
    if (!logFile) {
      logFile = 'deploy_log.txt';
    }
    await this.getCreds();
    const resourceClient = new ResourceManagementClient(this.creds, this.subId);
    const webClient = new WebSiteManagementClient(this.creds, this.subId);

    const resourceGroup = `${name}-${environment}`;

    // Check for existing deployment files
    const deployFilePath = path.join(this.projFolder, '.deployment');
    if (!(await pathExists(deployFilePath))) {
      await this.botPrepareDeploy(deployFilePath);
    }

    const zipPath = path.join(this.projFolder, 'code1.zip');
    if (await pathExists(zipPath)) {
      await remove(zipPath);
    }

    // dotnet publish
    const publishFolder = path.resolve(this.projFolder, 'bin/Release/netcoreapp3.1');
    await this.dotnetPublish(publishFolder, this.projFolder, botPath);
    const settingsPath = path.join(this.projFolder, 'appsettings.deployment.json');
    const settings = await readJson(settingsPath);
    const luisSettings = settings.luis;

    let luisEndpointKey: string;

    if (!luisAuthoringKey) {
      luisAuthoringKey = luisSettings.authoringKey;
      luisEndpointKey = luisSettings.endpointKey;
    }

    if (!luisAuthoringRegion) {
      luisAuthoringRegion = luisSettings.region;
    }

    if (!language) {
      language = 'en-us';
    }

    if (luisAuthoringKey && luisAuthoringRegion) {
      // publishing luis
      const remoteBotPath = path.join(publishFolder, 'ComposerDialogs');
      const botFiles = await this.getFiles(remoteBotPath);
      const modelFiles = botFiles.filter(name => {
        return name.endsWith('.lu') && this.notEmptyLuisModel(name);
      });

      const generatedFolder = path.join(remoteBotPath, 'generated');
      if (!(await pathExists(generatedFolder))) {
        await mkdir(generatedFolder);
      }
      const builder = new luBuild.Builder(msg => console.log(msg));

      const loadResult = await builder.loadContents(
        modelFiles,
        language || '',
        environment || '',
        luisAuthoringRegion || ''
      );

      const buildResult = await builder.build(
        loadResult.luContents,
        loadResult.recognizers,
        luisAuthoringKey,
        luisAuthoringRegion,
        name,
        environment,
        language,
        false,
        loadResult.multiRecognizers,
        loadResult.settings
      );
      await builder.writeDialogAssets(buildResult, true, generatedFolder);

      const luisConfigFiles = (await this.getFiles(remoteBotPath)).filter(filename =>
        filename.includes('luis.settings')
      );
      const luisAppIds: any = {};

      for (const luisConfigFile of luisConfigFiles) {
        const luisSettings = await readJson(luisConfigFile);
        Object.assign(luisAppIds, luisSettings.luis);
      }

      const luisEndpoint = `https://${luisAuthoringRegion}.api.cognitive.microsoft.com`;
      const luisConfig: any = {
        endpoint: luisEndpoint,
        endpointKey: luisEndpointKey,
      };

      Object.assign(luisConfig, luisAppIds);

      const deploymentSettingsPath = path.join(publishFolder, 'appsettings.deployment.json');
      const settings: any = await readJson(deploymentSettingsPath);
      settings.luis = luisConfig;

      await writeJson(deploymentSettingsPath, settings);
      const token = await this.creds.getToken();

      const getAccountUri = `${luisEndpoint}/luis/api/v2.0/azureaccounts`;
      const options = {
        headers: { Authorization: `Bearer ${token.accessToken}`, 'Ocp-Apim-Subscription-Key': luisAuthoringKey },
      } as rp.RequestPromiseOptions;
      const response = await rp.get(getAccountUri, options);
      const jsonRes = JSON.parse(response);
      const account = this.getAccount(jsonRes, `${name}-${environment}-luis`);

      for (const k in luisAppIds) {
        const luisAppId = luisAppIds[k];
        console.log(`Assigning to luis app id: ${luisAppIds}`);
        const luisAssignEndpoint = `${luisEndpoint}/luis/api/v2.0/apps/${luisAppId}/azureaccounts`;
        const options = {
          body: account,
          json: true,
          headers: { Authorization: `Bearer ${token.accessToken}`, 'Ocp-Apim-Subscription-Key': luisAuthoringKey },
        } as rp.RequestPromiseOptions;
        const response = await rp.post(luisAssignEndpoint, options);
        console.log(response);
      }
      console.log('Luis Publish Success! ...');
    }
    console.log('Packing up the bot service ...');
    await this.zipDirectory(publishFolder, zipPath);
    console.log('Packing Service Success!');

    console.log('Publishing to Azure ...');
    await this.deployZip(webClient, zipPath, name, environment, this.creds, this.subId);
    console.log('Publish To Azure Success!');
  }

  private getAccount(accounts: any, filter: string) {
    for (const account of accounts) {
      if (account.AccountName === filter) {
        return account;
      }
    }
  }

  private async deployZip(
    webSiteClient: WebSiteManagementClient,
    zipPath: string,
    name: string,
    env: string,
    creds,
    subId: string
  ) {
    console.log('Retrieve publishing details ...');
    const userName = `${name}-${env}`;
    const userPwd = `${name}-${env}-${new Date().getTime().toString()}`;

    const updateRes = await webSiteClient.updatePublishingUser({
      publishingUserName: userName,
      publishingPassword: userPwd,
    });

    const publishEndpoint = `https://${name}-${env}.scm.azurewebsites.net/zipdeploy`;

    const publishCreds = Buffer.from(`${userName}:${userPwd}`).toString('base64');

    const fileContent = await readFile(zipPath);
    const options = {
      body: fileContent,
      encoding: null,
      headers: {
        Authorization: `Basic ${publishCreds}`,
        'Content-Type': 'application/zip',
        'Content-Length': fileContent.length,
      },
    } as rp.RequestPromiseOptions;
    const response = await rp.post(publishEndpoint, options);
    console.log(response);
  }

  public async create(
    name: string,
    location: string,
    environment: string,
    luisAuthoringKey?: string,
    appId?: string,
    appPassword?: string
  ) {
    await this.getCreds();
    const credsForGraph = new msRestNodeAuth.DeviceTokenCredentials(
      this.creds.clientId,
      this.tenantId,
      this.creds.username,
      'graph',
      this.creds.environment,
      this.creds.tokenCache
    );
    const graphClient = new GraphRbacManagementClient(credsForGraph, this.tenantId, {
      baseUri: 'https://graph.windows.net',
    });
    const logFile = path.join(__dirname, '../create_log.txt');

    const deploymentSettingsPath = path.join(this.projFolder, 'appsettings.deployment.json');
    if (!existsSync(deploymentSettingsPath)) {
      console.log(`! Could not find an 'appsettings.deployment.json' file in the current directory.`);
      return;
    }

    const settings = await readJson(deploymentSettingsPath);
    appId = settings.MicrosoftAppId;

    if (!appId) {
      if (!appPassword) {
        console.error(`App password is required`);
        return;
      }
      console.log('> Creating App Registration ...');
      const appCreated = await this.createApp(graphClient, name, appPassword);
      await this.writeToLog(appCreated, logFile);
      appId = appCreated.appId;
      console.log(`> Create App Id Success! ID: ${appId}`);
    }

    let shouldCreateAuthoringResource = true;
    if (luisAuthoringKey) {
      shouldCreateAuthoringResource = false;
    }

    const resourceGroupName = `${name}-${environment}`;

    // timestamp will be used as deployment name
    const timeStamp = new Date().getTime().toString();
    const client = new ResourceManagementClient(this.creds, this.subId);

    const rpres = await this.createResourceGroup(client, location, resourceGroupName);
    await this.writeToLog(rpres, logFile);

    const deploymentTemplateParam = this.getDeploymentTemplateParam(
      appId,
      appPassword,
      location,
      name,
      shouldCreateAuthoringResource
    );
    await this.writeToLog(deploymentTemplateParam, logFile);

    const templatePath = path.resolve(this.projFolder, 'DeploymentTemplates', 'template-with-preexisting-rg.json');

    const validation = await this.validateDeployment(
      client,
      templatePath,
      location,
      resourceGroupName,
      timeStamp,
      deploymentTemplateParam
    );
    await this.writeToLog(validation, logFile);

    if (validation.error) {
      console.error(`! Template is not valid with provided parameters. Review the log for more information.`);
      console.error(`! Error: ${validation.error.message}`);
      console.error(`! Log: ${logFile}`);
      console.error(`+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`);
      return false;
    }

    const deployment = await this.createDeployment(
      client,
      templatePath,
      location,
      resourceGroupName,
      timeStamp,
      deploymentTemplateParam
    );
    await this.writeToLog(deployment, logFile);
    if (deployment._response.status != 200) {
      console.error(`! Template is not valid with provided parameters. Review the log for more information.`);
      console.error(`! Error: ${validation.error.message}`);
      console.error(`! Log: ${logFile}`);
      console.error(`+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`);
      return false;
    }

    console.log('create deployment success');
    console.log('before updatedeployjsonfile');
    const updateResult = await this.updateDeploymentJsonFile(
      deploymentSettingsPath,
      client,
      resourceGroupName,
      timeStamp,
      appId,
      appPassword
    );
    await this.writeToLog(updateResult, logFile);

    if (!updateResult) {
      const operations = await client.deploymentOperations.list(resourceGroupName, timeStamp);
      if (operations) {
        const failedOperations = operations.filter(value => value.properties.statusMessage.error !== null);
        if (failedOperations) {
          failedOperations.forEach(operation => {
            switch (operation.properties.statusMessage.error.code) {
              case 'MissingRegistrationForLocation':
                console.log(
                  `! Deployment failed for resource of type ${operation.properties.targetResource.resourceType}. This resource is not avaliable in the location provided.`
                );
                console.log(
                  `+ Update the .\\Deployment\\Resources\\parameters.template.json file with a valid region for this resource and provide the file path in the -parametersFile parameter.`
                );
                break;
              default:
                console.log(
                  `! Deployment failed for resource of type ${operation.properties.targetResource.resourceType}.`
                );
                console.log(`! Code: ${operation.properties.statusMessage.error.code}.`);
                console.log(`! Message: ${operation.properties.statusMessage.error.message}.`);
                break;
            }
          });
        }
      } else {
        console.log(`! Deployment failed. Please refer to the log file for more information.`);
        console.log(`! Log: ${logFile}`);
      }
    }
    console.log('update log success');
    console.log(`+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`);
  }

  public async createAndDeploy(
    name: string,
    location: string,
    environment: string,
    luisAuthoringKey?: string,
    luisAuthoringRegion?: string,
    appId?: string,
    appPassword?: string
  ) {
    await this.create(name, location, environment, luisAuthoringKey, appId, appPassword);
    await this.deploy(name, environment, luisAuthoringKey, luisAuthoringRegion);
  }

  public async getStatus() {
    return {
      botStatus: 'unConnected',
    };
  }
  private getCreds = async () => {
    if (!this.creds) {
      this.creds = await msRestNodeAuth.interactiveLogin();
    }
    return this.creds;
  };
  history = async config => { };
  rollback = async (config, versionId) => { };
  publish = async (config: PublishConfig, project, user) => {
    try {
      const { settings, templatePath } = config;
      this.botFolder = project.dataDir || '';
      this.runtimeFolder = templatePath;

      await emptyDir(path.resolve(this.projFolder, 'ComposerDialogs'));
      await emptyDir(path.resolve(this.projFolder, 'bin'));
      // copy bot and runtime into projFolder
      await copy(this.botFolder, path.resolve(this.projFolder, 'ComposerDialogs'), {
        recursive: true,
      });
      // await copy(this.runtimeFolder, this.projFolder, { recursive: true });

      this.createAndDeploy(
        name,
        location,
        environment,
        luisAuthoringKey,
        settings.luis.authoringRegion || luisAuthoringRegion,
        appId,
        appPassword
      );
      return {
        status: 200,
        result: {
          jobId: '',
          version: 'default',
          endpoint: `http://${name}-${environment}.azurewebsites.net`,
        },
      };
    } catch (error) {
      console.log(error);
    }
  };
}

interface PublishConfig {
  botId: string;
  version: string;
  subscriptionID: string;
  settings: any;
  templatePath: string;
}

const azurePublish = new BotProjectDeploy();

// set in the config
const name = 'testComposerAzurePublish';
const environment = 'composer';
const location = 'westus';
const luisAuthoringKey = null;
const luisAuthoringRegion = 'westus';
const appId = null;
const appPassword = 'shuibian$TEST123';

export default async (composer: any): Promise<void> => {
  // pass in the custom storage class that will override the default
  await composer.addPublishMethod(azurePublish);
};
