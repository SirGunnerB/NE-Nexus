const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api',
  {
    invoke: (channel, data) => {
      // List of valid channels that can be called
      const validChannels = [
        'auth:login',
        'auth:register',
        'auth:logout',
        'setup:complete',
        'setup:check',
        'settings:get',
        'settings:update'
      ];
      
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      }
      
      throw new Error(`Channel "${channel}" is not allowed`);
    }
  }
); 