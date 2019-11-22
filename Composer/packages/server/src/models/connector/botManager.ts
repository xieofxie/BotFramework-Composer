// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ChildProcess, spawn } from 'child_process';
interface BotsList {
  [key: string]: ChildProcess;
}
class BotManager {
  bots: BotsList = {};
  // startPort = 4000;
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
      const build = spawn('dotnet', ['build'], { cwd: dir, stdio: ['ignore', 'ignore', 'inherit'] });
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
  start = async (dir: string) => {
    // if dir exists
    // const port = this.startPort + Object.keys(this.bots).length;
    // console.log(`process listening port: ${port}`);
    await this.buildProcess(dir);

    // add this two args can start bot runtime in different port `--urls`, `http://localhost:${port}`
    const child = spawn('dotnet', ['bin/Debug/netcoreapp2.1/BotProject.dll', `--urls`, `http://localhost:3979`], {
      detached: true,
      cwd: dir,
      stdio: ['ignore', 'ignore', 'inherit'],
    });

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
      this.stop(dir);
    });

    child.on('error', (err: any) => {
      console.log(`stderr: ${err}`);
    });

    child.on('exit', code => {
      console.log(`exit: ${code}`);
      this.stop(dir);
    });

    child.on('message', msg => {
      console.log(msg);
    });

    child.on('disconnect', code => {
      console.log(`disconnect: ${code}`);
      this.stop(dir);
    });

    if (!this.bots[dir]) {
      this.bots[dir] = child;
      console.log(`Starting child process ${child.pid}`);
    } else {
      console.log('this bot has already connect');
    }
  };

  // stop a bot from running
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
export const botManager = new BotManager();
