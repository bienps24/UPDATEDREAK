
const { Telegraf } = require('telegraf');
const pool = require('./db');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT20_TOKEN);
const ADMIN_IDS = ['5521402866'];
const warnedChannels = new Set();

bot.on('channel_post', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    try {
        const res = await pool.query('SELECT channel_id FROM whitelist WHERE channel_id = $1', [chatId]);

        if (res.rowCount === 0) {
            if (!warnedChannels.has(chatId)) {
                warnedChannels.add(chatId);
                await ctx.telegram.sendMessage(chatId,
                    `⚠️ This bot is not authorized in this channel.\n\nTo activate reactions, please request access via 👉@trishamaeqt`
                );
            }
            return;
        }

        if (warnedChannels.has(chatId)) {
            warnedChannels.delete(chatId);
        }

        const messageId = ctx.channelPost.message_id;
        const emojis = ['🔥', '❤️', '💯', '👏', '😍'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        await new Promise(res => setTimeout(res, Math.random() * 1500));

        try {
            await ctx.telegram.setMessageReaction(chatId, messageId, [
                { type: 'emoji', emoji: randomEmoji }
            ]);
        } catch (err) {
            if (err.response?.error_code === 429) {
                const wait = err.response.parameters.retry_after || 10;
                console.warn(`⏳ Bot 20 rate-limited. Retrying in ${wait}s...`);
                await new Promise(res => setTimeout(res, wait * 1000));
            } else {
                console.error("❌ Bot 20 reaction error:", err);
            }
        }

    } catch (err) {
        console.error("❌ Bot 20 error:", err);
    }
});

bot.command('status', (ctx) => {
    if (!ADMIN_IDS.includes(ctx.from.id.toString())) return;
    ctx.reply("✅ Bot 20 is online with anti-spam + rate-limit handling.");
});

bot.launch();
console.log("✅ Bot 20 is running with anti-spam + rate-limit protection...");
