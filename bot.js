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

console.log("API_ID:", process.env.API_ID ? "ADA" : "KOSONG");
console.log("API_HASH:", process.env.API_HASH ? "ADA" : "KOSONG");
console.log("SESSION:", process.env.SESSION ? "ADA" : "KOSONG");
console.log("USER_IDS:", process.env.USER_IDS ? "ADA" : "KOSONG");

const sessionData = process.env.SESSION || "";

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
const runningUsers = {};

async function main() {
    // await client.start({
    //     phoneNumber: async () => await input.text("Nomor: "),
    //     password: async () => await input.text("Password: "),
    //     phoneCode: async () => await input.text("OTP: "),
    // });
    console.log(client.session.save());
    console.log("Session exists:", fs.existsSync("session.txt"));
    console.log("Session length:", sessionData.length);


    await client.connect();
    console.log("Client connected 🚀");
    console.log("Me:", await client.getMe());

    console.log("Login berhasil!");

    client.addEventHandler(async (event) => {
        const sender = event.message.senderId;
        const msg = event.message.message;

        console.log("Sender ID:", sender.toString());
        const USER_IDS = process.env.USER_IDS.split(",");

        if (!USER_IDS.includes(sender.toString())) return;
        
        console.log("Masuk:", msg);

        const userId = sender.toString();

        if (msg === "/stop") {
            delete runningUsers[userId];
            console.log("STOP!");
            return;
        }

        if (runningUsers[userId]) {
            console.log("Loop sudah berjalan untuk user ini");
            return;
        }

        if (!msg.includes("t.me")) return;
        runningUsers[userId] = true;

        try {
            const match = msg.match(/t\.me\/([\w\d_]+)\/(\d+)/);
            if (!match) return;

            const channel = match[1];
            const messageId = parseInt(match[2]);

            console.log("channel:", channel);
            console.log("id:", messageId);

            const channelEntity = await client.getEntity(channel);

            while (runningUsers[userId] === true) {
                console.log("LOOP AKTIF:", userId, new Date().toLocaleTimeString());
                console.log("Masuk while");

                for (const grp of groups) {
                    console.log("Coba grup:", grp);
                    const groupEntity = await client.getEntity(grp);

                    await client.forwardMessages(groupEntity, {
                        messages: [messageId],
                        fromPeer: channelEntity
                    });

                    console.log("Forward ke:", grp);
                    await delay(35000);
                    console.log("tunggu 35 detik...");
            }
            console.log("Loop lagi 7 menit...");
            await delay(420000); // 180000 3 menit +1 menit buffer
            }
            } catch (err) {
                console.log("ERROR USER:", userId);
                console.log(err);
                delete runningUsers[userId];
            }

    }, new NewMessage({ incoming: true, outgoing: true }));

    console.log("Bot siap 🔥 kirim link ke akun ini sendiri");
}

main();