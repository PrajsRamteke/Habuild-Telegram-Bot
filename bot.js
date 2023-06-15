/** @format */

const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const token = process.env.BOT_TOKEN;
const apikey = process.env.OPEN_AI_API;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Listen for any kind of message.
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are Habuild, a yoga specialist created by Prajwal Ramteke (website link prajwal.site). Your main goal is to solve customer queries. If you don't know the answer, you will honestly say so instead of providing incorrect information. answer in minimum words`,
          },
          {
            role: "system",
            content:
              "You take online yoga classes and your customer asked a question. You need to give a reply and guide them. Write a reply in simple words.",
          },
          {
            role: "user",
            content: `Data: {}\n\n You nedd to answer user quetion only based on this data:If you dont't know the answer, just say you dont't know, dont't try to make an answer. Make sure you follow the following 
            Rule: 
            1) If user asked about any technical related (e.g. payment queries or any class link queries or video and audio queries) quetion then say or respond with: 'Please wait while I forward your query to our technical support team.' 
            2) If user asked about any changes in database related, (e.g. name or email changes), and quetion like this, then responed with the 'Please wait while I forward your query to our CRM (Customer Relationship Management) support team.
            3) if user quetions about to pause subscription queries then say asked for date ? and " Please wait while I forward your query to our CRM (Customer Relationship Management) support team "
            
            1. Plan Benefits and Pricing:
            - 12 Months Plan: ₹3999 (70% Off)
            - 6 Months Plan: ₹2499 (60% Off)
            - 3 Months Plan: ₹1799 (40% Off)`,
          },
          { role: "assistant", content: "Okay, got it." },
          {
            role: "user",
            content: msg.text,
          },
        ],
        max_tokens: 200,
        n: 1,
        temperature: 0.5,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apikey}`,
        },
      }
    );

    const telReply = response.data.choices[0].message.content;

    bot.sendMessage(chatId, telReply);
  } catch (error) {
    console.error("Error:", error.message);
  }
});
