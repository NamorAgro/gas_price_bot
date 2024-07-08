import TelegramApi from 'node-telegram-bot-api';
import makeRequest from './request.js';
import tellJoke from './joke.js';
import { BOT_TOKEN } from './config.js';
import { promises as fs } from 'fs';

const token = BOT_TOKEN;

const bot = new TelegramApi(token, { polling: true });

let subscribedUsers = [];

async function loadUsersFromFile() {
  try {
    const data = await fs.readFile('subscribedUsers.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading users from file:', err);
    return [];
  }
}

async function saveUsersToFile(users) {
  try {
    await fs.writeFile('subscribedUsers.json', JSON.stringify(users, null, 2));
    console.log('Users saved to file successfully.');
  } catch (err) {
    console.error('Error saving users to file:', err);
  }
}

var scenarioObject = {
  zero: {
    count: 0,
    neededValue: 0,
    checkValue: function (x) {
      if (x > this.neededValue) {
        this.count += 1;
        console.log(`value = ${x} and count = ${this.count}`);
      } else {
        this.count = 0;
      }
    },
    checkCount: async function () {
      if (this.count >= 10) {
        this.count = 0;
        scenarioToUse = scenarioObject.fifty;
        for (let i = 0; i < subscribedUsers.length; i++) {
          const chatId = subscribedUsers[i];
          try {
            await bot.sendMessage(chatId, `Цена перешла отметку 0 и стала выше.`);
          } catch (error) {
            if (error.response && error.response.body && error.response.body.error_code === 403) {
              subscribedUsers.splice(i, 1);
              i--;
            }
          }
        }
      }
    }
  },
  fifty: {
    count: 0,
    neededValue: -50,
    checkValue: function (x) {
      if (x < this.neededValue) {
        this.count += 1;
        console.log(`value = ${x} and count = ${this.count}`);
      } else {
        this.count = 0;
      }
    },
    checkCount: async function () {
      if (this.count >= 10) {
        this.count = 0;
        scenarioToUse = scenarioObject.zero;
        for (let i = 0; i < subscribedUsers.length; i++) {
          const chatId = subscribedUsers[i];
          try {
            await bot.sendMessage(chatId, `Цена перешла отметку в -50 и стала ниже.`);
          } catch (error) {
            if (error.response && error.response.body && error.response.body.error_code === 403) {
              subscribedUsers.splice(i, 1);
              i--;
            }
          }
        }
      }
    }
  }
};

var scenarioToUse = scenarioObject.fifty;

async function start() {
  subscribedUsers = await loadUsersFromFile();
  console.log(subscribedUsers);

  bot.setMyCommands([
    { command: '/start', description: 'Приветствие' },
    { command: '/mw', description: 'Последняя MW' },
    { command: '/joke', description: 'Рассказать шутку' }
  ]);

  bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;

    try {
      if (text === '/start') {
        await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/3de/bab/3debab3b-d6f5-4190-8554-ea1a8a59361e/43.webp');
        await bot.sendMessage(chatId, 'Привет! Я буду помагать тебе заработать Деньжат! $$$');
        const message = await makeRequest();
        await bot.sendMessage(chatId, `Сейчас на бирже MW: ${message}`);

        if (!subscribedUsers.includes(chatId)) {
          subscribedUsers.push(chatId);
          await saveUsersToFile(subscribedUsers);
        }
        return;
      }

      if (text === '/mw') {
        const message = await makeRequest();
        return bot.sendMessage(chatId, `Сейчас на бирже MW: ${message}`);
      }

      if (text === '/joke') {
        const jokeURL = 'https://nekdo.ru/random/';
        try {
          const message = await tellJoke(jokeURL);
          return bot.sendMessage(chatId, message);
        } catch (error) {
          console.error(error);
          return bot.sendMessage(chatId, 'Плохо себя чувствую, не могу рассказать шутку');
        }
      }

      return bot.sendMessage(chatId, 'Я тебя не понял!');
    } catch (e) {
      return bot.sendMessage(chatId, 'Произошла ошибка свяжитесь с техником');
    }
  });

  setInterval(async () => {
    const message = await makeRequest();
    if (message === null) {
      console.log('Message is null, skipping this interval.');
      return;
    }

    scenarioToUse.checkValue(message);
    await scenarioToUse.checkCount();
  }, 60000);
}

start();