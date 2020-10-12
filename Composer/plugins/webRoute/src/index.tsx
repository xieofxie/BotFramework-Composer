// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';
import { execSync } from 'child_process';

import path = require('path');
import globby = require('globby');
import format = require('string-format')

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

      let testRuntime = projectInfo.data.settings.testRuntime;
      if(!!!testRuntime){
        throw {message: 'Set a testRuntime in your settings! It should contain {0} for project folder, {1} for test folder and {2} for test file/folder.'};
      }
      testRuntime = path.normalize(testRuntime);

      const result = {location, testFolder, testRuntime};
      console.log(result)
      return result;
    };

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
        // TODO: temporary solution
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

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
        const cmd = format(info.testRuntime, `"${info.location}"`, `"${info.testFolder}"`, `"${req.body.testFile}"`);
        console.log(cmd);

        let result = '';
        try {
          result = execSync(cmd, { encoding: 'utf8' });
        } catch (error) {
          result = error.toString();
        }
        res.send({result});
      }
      catch(error){
        res.send({error: error.message});
      }
    });
  },
};
