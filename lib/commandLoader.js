import fs from 'fs';
import axios from 'axios';
import localCommandsFile from '../.cmdpalette.json' assert { type: 'json' };

let localCommands = localCommandsFile;
let remoteCommands = null;

export async function fetchRemoteCommands(remoteUrl) {
  try {
    const response = await axios.get(remoteUrl);
    remoteCommands = response.data;

    if (remoteCommands.version !== localCommands.version) {
      console.log('⚡ Updating local commands to latest version...');
      fs.writeFileSync('./.cmdpalette.json', JSON.stringify(remoteCommands, null, 2));
      localCommands = remoteCommands;
    }
  } catch (error) {
    console.log('⚠️ Failed to fetch remote commands. Using local cache.');
  }
}

export function getCommands() {
  return localCommands.commands;
}
