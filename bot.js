require("dotenv").config();
const express = require('express');
const app = express();

// Menghindari error saat UptimeRobot memanggil URL Anda
app.get('/', (req, res) => {
  res.send('Bot is active!');
});

// Port otomatis dari Render atau default 10000
const PORT = process.env.PORT || process.env.PORT;
app.listen(PORT, () => {
  console.log(`Keep-alive server is running on port ${PORT}`);
});

const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const input = require("input");
const fs = require("fs");

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH;

let sessionData = "";
if (fs.existsSync("session.txt")) {
    sessionData = fs.readFileSync("session.txt", "utf8");
}

const client = new TelegramClient(
    new StringSession(sessionData),
    apiId,
    apiHash,
    { connectionRetries: 5 }
);

const groups = [
    "adoptmeindooooo",
    "adoptmeindosuper"
];

const delay = (ms) => new Promise(res => setTimeout(res, ms));
let isRunning = false;

async function main() {

    await client.connect();
    console.log("Client connected 🚀");

    console.log("Login berhasil!");

    fs.writeFileSync("session.txt", client.session.save());

    client.addEventHandler(async (event) => {
        const sender = event.message.senderId;
        const msg = event.message.message;

        console.log("Sender ID:", sender.toString());
        const MY_ID = process.env.MY_ID

        if (sender.toString() !== MY_ID) return;
        

        console.log("Masuk:", msg);

        if (msg === "/stop") {
            isRunning = false;
            console.log("STOP!");
            return;
        }

        if (!msg.includes("t.me")) return;
        isRunning = true;

        try {
            const match = msg.match(/t\.me\/([\w\d_]+)\/(\d+)/);
            if (!match) return;

            const channel = match[1];
            const messageId = parseInt(match[2]);

            console.log("channel:", channel);
            console.log("id:", messageId);

            const channelEntity = await client.getEntity(channel);

            while (isRunning) {

                for (const grp of groups) {

                const groupEntity = await client.getEntity(grp);

                const messages = await client.getMessages(channelEntity, {
                    ids: messageId
                });

                await client.sendMessage(groupEntity, {
                    message: messages[0].message,
                });

                console.log("Kirim ke:", grp);
                await delay(25000);
            }
            console.log("Loop lagi 15 detik...");
            await delay(15000);
        }

        } catch (err) {
            console.log("ERROR FULL:", err);
        }

    }, new NewMessage({ incoming: true, outgoing: true }));

    console.log("Bot siap 🔥 kirim link ke akun ini sendiri");
}

main();