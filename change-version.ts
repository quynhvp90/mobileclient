declare var require: any;

// import { CONFIG } from './src/app/config';
const fs = require('fs');
const pkg = require('./package.json');
const CONFIG = require('./src/assets/data/config.json');

const oldVersion = CONFIG.version;
const newVersion = pkg.version;
console.log('updating from = ' + oldVersion + ', to = ' + newVersion);

CONFIG.version = newVersion;

fs.writeFileSync('./src/assets/data/config.json', JSON.stringify(CONFIG, null, 4), { encoding: 'utf-8' });
console.log('updating ./src/assets/data/config.json');

// const filesToReplace = [
//   './src/app/app.module.ts',
//   './config.xml',
// ];

// filesToReplace.forEach((filePath) => {
//   console.log('updating ' + filePath);
//   let content = fs.readFileSync(filePath, { encoding: 'utf-8' });
//   content = content.replace(oldVersion, newVersion);
//   fs.writeFileSync(filePath, content, { encoding: 'utf-8' });
// });

// if (pkg.version !== CONFIG.version) {

  // const settings = {
  //   version: pkg.version,
  //   environment: 'development',
  // };
  // fs.writeFileSync('./src/data/settings.json', JSON.stringify(settings, null, 4), { encoding: 'utf-8' });
// }
