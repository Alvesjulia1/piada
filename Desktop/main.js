const { app, BrowserWindow } = require('electron');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('index.html');
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// API request to get a joke
function getJoke() {
  return axios.get('https://v2.jokeapi.dev/joke/Any?lang=pt')
    .then(response => {
      if (response.data.joke) {
        return response.data.joke;
      } else if (response.data.setup && response.data.delivery) {
        return `${response.data.setup} ${response.data.delivery}`;
      } else {
        return 'Não foi possível obter uma piada no momento.';
      }
    })
    .catch(error => {
      console.error('Erro ao obter piada:', error);
      return 'Ocorreu um erro ao obter a piada.';
    });
}

// API request to get a cat image
function getCatImage() {
  return axios.get('https://api.thecatapi.com/v1/images/search')
    .then(response => {
      const imageUrl = response.data[0].url;
      return imageUrl;
    })
    .catch(error => {
      console.error('Erro ao obter imagem de gato:', error);
      return null;
    });
}

// Handle IPC messages from the renderer process
const { ipcMain } = require('electron');
ipcMain.on('get-joke', async (event) => {
  const joke = await getJoke();
  event.reply('joke', joke);
});

ipcMain.on('get-cat-image', async (event) => {
  const imageUrl = await getCatImage();
  event.reply('cat-image', imageUrl);
});
