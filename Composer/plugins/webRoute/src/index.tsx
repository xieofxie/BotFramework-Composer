// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';
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

    // error: string
    // testFolder: string -> settings.testFolder
    // testFiles: string list
    composer.addWebRoute('get', '/testplugin/:projectId/files', async (req, res) => {
      const projectInfo = await httpClient.get(`/projects/${req.params.projectId}`);
      if(!!!projectInfo.data){
        res.send({error:'Project does not exist!'});
        return;
      }

      let testFolder = projectInfo.data.settings.testFolder;
      if(!!!testFolder){
        res.send({error:'Set a testFolder in your settings!'});
        return;
      }

      testFolder = path.normalize(testFolder);
      let testFiles = [];
      const paths = await globby(['**/*.dialog'], {cwd: testFolder});
      for (const filePath of paths) {
        const realFilePath: string = path.join(testFolder, filePath);
        testFiles.push(realFilePath);
      }
      res.send({testFolder, testFiles})
    });
  },
};
