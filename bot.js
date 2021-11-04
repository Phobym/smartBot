require('dotenv').config()
const axios = require('axios');
const moment = require('moment');
const {MenuTemplate, MenuMiddleware} = require('telegraf-inline-menu')
const { Telegraf } = require('telegraf')


const menuTemplate = new MenuTemplate(ctx => `Привет ${ctx.from.first_name}!`)

menuTemplate.interact('Шо там в космосе', 'a', {
	do: async ctx => {
        function getRandomArbitrary(min, max) {
            return Math.random() * (max - min) + min;
        }
        const date = moment().set({'year' : getRandomArbitrary(1996,2021), 'month': getRandomArbitrary(0,11), 'day': getRandomArbitrary(1,28)}).format('YYYY-MM-D')
        const dataFromNasa = await axios.get(`https://api.nasa.gov/planetary/apod?${process.env.NASA_API_KEY}&date=${date}&thumbs=false`)
        const textDataEng = dataFromNasa.data.explanation
        const imageUrl = dataFromNasa.data.url 
        const config = {
            headers: { Authorization: `Bearer ${process.env.YA_IAM_TOKEN}` }
        };
        const bodyParameters = {
            folderId: `${process.env.YA_FOLDER}`,
            texts: `[${textDataEng}]`,
            targetLanguageCode: "ru"
        };
        const responseToYa = await axios.post('https://translate.api.cloud.yandex.net/translate/v2/translate', bodyParameters, config)
        const rusText = responseToYa.data.translations[0].text;
        if (rusText.length < 1024)
            ctx.replyWithPhoto({url:imageUrl},{caption: rusText.slice(1,-1)})
        else {
            ctx.reply(imageUrl)
            ctx.reply(rusText.slice(1,-1))
        }
		return false
	}
})

menuTemplate.interact('Шо с криптой', 'b', {
	do: async ctx => {
        const config = {
            headers: { Authorization: `Apikey ${process.env.CRYPTOCOMPARE_API_KEY}` }
        };
        
        const responseToCrypto = await axios.get(`${process.env.CRYPTOCOMPARE_URL}`, { params : {fsyms: 'BTC,ETH,ADA', tsyms: 'USD'}})
        ctx.reply(`Биткоин: ${responseToCrypto.data.BTC.USD}$\nЭфириум: ${responseToCrypto.data.ETH.USD}$\nАДА: ${responseToCrypto.data.ADA.USD}$`)
		return false
	}
})

const bot = new Telegraf(process.env.BOT_TOKEN)
const menuMiddleware = new MenuMiddleware('/', menuTemplate) 
bot.use(menuMiddleware)
bot.command('start', ctx => menuMiddleware.replyToContext(ctx))

bot.start((ctx) => ctx.reply('Welcome')) //ответ бота на команду /start

bot.help((ctx) => ctx.reply('Send me a sticker')) //ответ бота на команду /help

bot.on('sticker', (ctx) => ctx.reply('')) //bot.on это обработчик введенного юзером сообщения, в данном случае он отслеживает стикер, можно использовать обработчик текста или голосового сообщения


// bot.hears это обработчик конкретного текста, данном случае это - "hi"
bot.launch() // 


