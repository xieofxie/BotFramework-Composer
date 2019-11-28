// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ChildProcess, spawn } from 'child_process';

import { Path } from '../../utility/path';
import { DialogSetting } from '../bot/interface';

interface BotsList {
  [key: string]: ChildProcess;
}

class DefaultBotConnectorManager {
  bots: BotsList = {};
  constructor() {
    process.on('SIGINT', () => {
      console.log('[SIGINT] start graceful shutdown');
      this.gracefulShutdown();
      process.exit(1);
    });
    process.on('SIGTERM', () => {
      console.log('[SIGTERM] start graceful shutdown');
      this.gracefulShutdown();
      process.exit(1);
    });
    process.on('SIGQUIT', () => {
      console.log('[SIGQUIT] start graceful shutdown');
      this.gracefulShutdown();
      process.exit(1);
    });
  }

  private buildProcess = async (dir: string): Promise<number | null> => {
    return new Promise((resolve, reject) => {
      const startScript = Path.resolve(__dirname, './build_runtime.ps1');
      console.log(startScript);
      const build = spawn(`pwsh ${startScript}`, {
        cwd: dir,
        detached: true,
        shell: true,
        stdio: ['ignore', 'ignore', 'inherit'],
      });
      console.log(`build pid : ${build.pid}`);

      build.stderr &&
        build.stderr.on('data', function(err) {
          reject(err.toString());
        });

      build.on('exit', function(code) {
        resolve(code);
      });
    });
  };

  private getConnectorConfig = (config: DialogSetting) => {
    const configList: string[] = [];
    if (config.MicrosoftAppPassword) {
      configList.push('--MicrosoftAppPassword');
      configList.push(config.MicrosoftAppPassword);
    }
    if (config.luis) {
      if (config.luis.authoringKey) {
        configList.push('--luis:endpointKey');
        configList.push(config.luis.authoringKey);
      }
      if (config.luis.authoringRegion) {
        configList.push('--luis:endpoint');
        configList.push(`https://${config.luis.authoringRegion}.api.cognitive.microsoft.com`);
      }
    }

    return configList;
  };

  private addListeners = (child: ChildProcess, handler: Function) => {
    if (child.stdout !== null) {
      child.stdout.on('data', (data: any) => {
        console.log(`stdout: ${data}`);
      });
    }

    if (child.stderr !== null) {
      child.stderr.on('data', (data: any) => {
        console.log(`stderr: ${data}`);
      });
    }

    child.on('close', code => {
      console.log(`close ${code}`);
      handler();
    });

    child.on('error', (err: any) => {
      console.log(`stderr: ${err}`);
    });

    child.on('exit', code => {
      console.log(`exit: ${code}`);
      handler();
    });

    child.on('message', msg => {
      console.log(msg);
    });

    child.on('disconnect', code => {
      console.log(`disconnect: ${code}`);
      handler();
    });
  };

  start = async (dir: string, config: DialogSetting) => {
    await this.buildProcess(dir);
    const child = spawn(
      'dotnet',
      ['bin/Debug/netcoreapp2.1/BotProject.dll', `--urls`, `http://localhost:3979`, ...this.getConnectorConfig(config)],
      {
        detached: true,
        cwd: dir,
        stdio: ['ignore', 'ignore', 'inherit'],
      }
    );
    this.addListeners(child, () => this.stop(dir));
    if (!this.bots[dir]) {
      this.bots[dir] = child;
      console.log(`Starting child process ${child.pid}`);
    } else {
      console.log('this bot has already connect');
    }
  };

  // stop a bot running
  stop = (dir: string) => {
    if (this.bots[dir]) {
      console.log(`kill this bot with process PID: ${this.bots[dir].pid}`);
      this.bots[dir].kill('SIGKILL');
      delete this.bots[dir];
    }
  };

  stopAll = () => {
    for (const key in this.bots) {
      this.stop(key);
    }
  };

  status = (dir: string) => {
    return this.bots[dir] ? true : false;
  };

  gracefulShutdown = () => {
    for (const key in this.bots) {
      this.stop(key);
    }
  };
}
export const defaultBotManager = new DefaultBotConnectorManager();
