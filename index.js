import TelegramApi from 'node-telegram-bot-api';
import makeRequest from './request.js';
import tellJoke from './joke.js';
import  { BOT_TOKEN} from './config.js';
import { promises as fs } from 'fs';

const token = BOT_TOKEN;

const bot = new TelegramApi(token, {polling:true})

let subscribedUsers = [];

async function loadUsersFromFile() {
  try {
      const data = await fs.readFile('subscribedUsers.json', 'utf8');
      return JSON.parse(data); // Ensure this returns the array
  } catch (err) {
      console.error('Error loading users from file:', err);
      return []; // Return an empty array if there's an error or file doesn't exist
  }
}

// Example of writing to a file
async function saveUsersToFile(users) {
  try {
      await fs.writeFile('subscribedUsers.json', JSON.stringify(users, null, 2));
      console.log('Users saved to file successfully.');
  } catch (err) {
      console.error('Error saving users to file:', err);
  }
}


var curentValue = {
    number: 0.123,
    biggerZero: 
    {
      value: true,
      onChange: (number) => {
        if(number < 0){
          return `🟢 Ниже 0! `
        }
        else if(number == 0){
          return `Ровно 0! `
        }
        else{
          return `🔴 Выше 0! `
        }
      }
    },
  
    biggerFivety: {
      value: false,
      onChange: (number) => {
        if(number < 50){
          return `🟢 Ниже 50! `
        }
        else if(number == 50){
          return `Ровно 50! `
        }
        else{
          return `🔴 Выше 50! `
        }
      }
    },
  
    smallerMinusFivety: {
      value: false,
      onChange: (number) => {
        if(number < -50){
          return `🟢 Меньше -50! `
        }
        else if(number == -50){
          return `Ровно -50! `
        }
        else{
          return `🔴 Больше -50! `
        }
      }
    },
  }
  
  var prevValue= {
    number: 50.1,
    biggerZero: {
      value: true,
    },
    biggerFivety: {
      value: true,
    },
    smallerMinusFivety: {
      value: false,
    },
  };



async function start() {
    
    subscribedUsers = await loadUsersFromFile();
    console.log(subscribedUsers);

    bot.setMyCommands([
        {command:'/start', description: 'Приветствие'},
        {command:'/MW', description: 'Последняя MW'},
        {command:'/joke', description: 'Рассказать шутку'},
    ])
    
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try{
          if (text === '/start'){
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/3de/bab/3debab3b-d6f5-4190-8554-ea1a8a59361e/43.webp');
            await bot.sendMessage(chatId, 'Привет! Я буду помагать тебе заработать Деньжат! $$$');
            const message = await makeRequest();
            await bot.sendMessage(chatId, `Сейчас на бирже MW: ${message}`);
            
            if (!subscribedUsers.includes(chatId)) {
                subscribedUsers.push(chatId);
                await saveUsersToFile(subscribedUsers)
            }
            return;
        }

        if (text === '/price'){
            const message = await makeRequest();
            return bot.sendMessage(chatId, `Сейчас на бирже MW: ${message}`)
        }

        if (text === '/joke'){
          // Define the URL from which you want to scrape the joke
          const jokeURL = 'https://nekdo.ru/random/';
          try {
              const message = await tellJoke(jokeURL);
              return bot.sendMessage(chatId, message);
          } catch (error) {
              console.error(error);
              return bot.sendMessage(chatId, 'Плохо себя чувствую, не могу рассказать шутку');
          }
        }

        return bot.sendMessage(chatId, 'Я тебя не понял!')

        } catch(e){
          return bot.sendMessage(chatId, 'Произошла ошибка свяжитесь с техником')
        }
        
    })

    setInterval(async () => {
        const message = await makeRequest();
        changeObjValues(curentValue, message)
        var [mismatch, found] = compareObjectsAndAct(curentValue, prevValue);
        if(mismatch)
        for (let i = 0; i < subscribedUsers.length; i++) {
            const chatId = subscribedUsers[i];
            try {
                await bot.sendMessage(chatId, `${found} \r\nMW: ${message}`);
            } catch (error) {
                if (error.response && error.response.body && error.response.body.error_code === 403) {
                    subscribedUsers.splice(i, 1);
                    i--;
                }
            }
        }
        changeObjValues(prevValue, message)
    }, 60000);
}

start()

function compareObjectsAndAct(obj1, obj2) {
    const propertiesToCompare = ['biggerFivety', 'biggerZero', 'smallerMinusFivety'];
  
    let mismatchFound = false;
    var message = '';
  
    for (let property of propertiesToCompare) {
      if (typeof obj1[property] === 'object' && obj1[property].value !== obj2[property].value) {
        message += obj1[property].onChange(obj1.number);
        mismatchFound = true; 
      }
    }
  
    return [mismatchFound, message];
  }


function changeObjValues(object, curentValue){
  object.number = curentValue
  object.biggerZero.value = curentValue > 0;
  object.biggerFivety.value = curentValue > 50;
  object.smallerMinusFivety.value = curentValue < -50;
  console.log(subscribedUsers)
}