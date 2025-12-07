import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

// ユーザーのボイスチャンネルセッションを追跡
const voiceSessions = new Map();

// Discordクライアントの初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

/**
 * 時間をフォーマット（時:分:秒）
 */
function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const sec = seconds % 60;
  const min = minutes % 60;

  if (hours > 0) {
    return `${hours}時間${min}分${sec}秒`;
  } else if (minutes > 0) {
    return `${min}分${sec}秒`;
  } else {
    return `${sec}秒`;
  }
}

// Botが準備完了したときの処理
client.once("ready", () => {
  console.log(`✅ ログイン成功: ${client.user.tag}`);
  console.log(`🔊 監視中のボイスチャンネル: ${process.env.VOICE_CHANNEL_ID}`);
  console.log(`💬 通知先のテキストチャンネル: ${process.env.TEXT_CHANNEL_ID}`);
});

// ボイスステートの変更を監視
client.on("voiceStateUpdate", async (oldState, newState) => {
  const targetVoiceChannelId = process.env.VOICE_CHANNEL_ID;
  const textChannelId = process.env.TEXT_CHANNEL_ID;

  // テキストチャンネルを取得
  const textChannel = await client.channels.fetch(textChannelId);
  if (!textChannel) {
    console.error("❌ テキストチャンネルが見つかりません");
    return;
  }

  const user = newState.member.user;
  const username = newState.member.displayName || user.username;

  // ユーザーが監視対象のボイスチャンネルに参加した場合
  if (!oldState.channelId && newState.channelId === targetVoiceChannelId) {
    // セッション開始
    const joinedAt = new Date();
    voiceSessions.set(user.id, {
      username,
      joinedAt: joinedAt.toISOString(),
    });

    // 参加通知を送信
    const joinEmbed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("🔊 ボイスチャンネル参加")
      .setDescription(`**${username}** さんがボイスチャンネルに参加しました`)
      .setTimestamp()
      .setFooter({ text: "Voice Tracker Bot" });

    await textChannel.send({ embeds: [joinEmbed] });
    console.log(`✅ ${username} がボイスチャンネルに参加しました`);
  }

  // ユーザーが監視対象のボイスチャンネルから退出した場合
  if (
    oldState.channelId === targetVoiceChannelId &&
    newState.channelId !== targetVoiceChannelId
  ) {
    const session = voiceSessions.get(user.id);

    if (session) {
      const leftAt = new Date();
      const joinedAt = new Date(session.joinedAt);
      const duration = leftAt - joinedAt;

      // セッションを削除
      voiceSessions.delete(user.id);

      // 退出通知を送信
      const leaveEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("👋 ボイスチャンネル退出")
        .setDescription(
          `**${username}** さんがボイスチャンネルから退出しました`
        )
        .addFields({
          name: "⏱️ 通話時間",
          value: formatDuration(duration),
          inline: true,
        })
        .setTimestamp()
        .setFooter({ text: "Voice Tracker Bot" });

      await textChannel.send({ embeds: [leaveEmbed] });
      console.log(
        `✅ ${username} がボイスチャンネルから退出しました (通話時間: ${formatDuration(
          duration
        )})`
      );
    }
  }
});

// エラーハンドリング
client.on("error", error => {
  console.error("❌ Discord client error:", error);
});

process.on("unhandledRejection", error => {
  console.error("❌ Unhandled promise rejection:", error);
});

// Botをログイン
client.login(process.env.DISCORD_TOKEN);
