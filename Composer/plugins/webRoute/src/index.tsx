// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';
import { execSync } from 'child_process';

import path = require('path');
import globby = require('globby');

module.exports = {
  initialize: composer => {

    const httpClient = axios.create({
      baseURL: "http://localhost:5000/api",
    });

    console.log('Register web route middleware');

    composer.addWebMiddleware((req, res, next) => {
      // console.log('> ', req.url);
      next();
    });

    const getInfoAsync = async (projectId) => {
      const projectInfo = await httpClient.get(`/projects/${projectId}`);
      if(!!!projectInfo.data){
        throw {message: 'Project does not exist!'};
      }
      const location = path.normalize(projectInfo.data.location);

      let testFolder = projectInfo.data.settings.testFolder;
      if(!!!testFolder){
        throw {message: 'Set a testFolder in your settings!'};
      }
      testFolder = path.normalize(testFolder);

      let runtime = projectInfo.data.settings.runtime?.path;
      if(!!!runtime){
        throw {message: 'Use special custom runtime for testing!'};
      }
      runtime = path.normalize(runtime);

      return {location, testFolder, runtime};
    };

    // Output:
    // location: string
    // testFolder: string -> settings.testFolder
    // runtime: string -> settings.runtime.path
    composer.addWebRoute('get', '/testplugin/:projectId/info', async (req, res) => {
      try{
        res.send(await getInfoAsync(req.params.projectId));
      }
      catch(error){
        res.send({error: error.message});
      }
    });

    // Output:
    // error: string
    // testFolder: string -> settings.testFolder
    // testFiles: string list
    composer.addWebRoute('get', '/testplugin/:projectId/files', async (req, res) => {
      try{
        const info = await getInfoAsync(req.params.projectId);
        let testFiles = [];
        const paths = await globby(['**/*.dialog'], {cwd: info.testFolder});
        for (const filePath of paths) {
          const realFilePath: string = path.join(info.testFolder, filePath);
          testFiles.push(realFilePath);
        }
        res.send({testFolder: info.testFolder, testFiles})
      }
      catch(error){
        res.send({error: error.message});
      }
    });

    // Input:
    // testFile: string
    // Output:
    // result: string
    composer.addWebRoute('post', '/testplugin/:projectId/test', async (req, res) => {
      try{
        const info = await getInfoAsync(req.params.projectId);
        // TODO some workaround
        const Tester = path.join(info.runtime, 'declarative_ut/bin/Debug/netcoreapp3.1/DeclarativeUT.exe');

        let cmd = `${Tester} --autoDetect true --botFolder ${info.location} --testFolder ${info.testFolder} --testSubFolder ${req.body.testFile}`;
        console.log(cmd);

        try {
          const output = execSync(cmd, { encoding: 'utf8' });
          cmd = output;
        } catch (error) {
          cmd = error.toString();
        }
        res.send({result: cmd});
      }
      catch(error){
        res.send({error: error.message});
      }
    });
  },
};
