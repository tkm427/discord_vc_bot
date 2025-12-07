# Discord Voice Tracker Bot

Discordのボイスチャンネルへの入退室を監視し、テキストチャンネルに通知を送信するBotです。通話時間の記録機能も搭載しています。

## 機能

- 🔊 特定のボイスチャンネルへの入室を検知して通知
- 👋 ボイスチャンネルからの退出時に通話時間を表示
- 📊 通話履歴をJSONファイルに保存
- 🚀 fly.ioでの運用に対応

## セットアップ

### 1. Discord Botの作成

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. 「New Application」をクリックしてアプリケーションを作成
3. 「Bot」タブからBotを追加
4. 「TOKEN」をコピー（後で使用します）
5. 「Privileged Gateway Intents」で以下を有効化：
   - `PRESENCE INTENT`
   - `SERVER MEMBERS INTENT`
   - `MESSAGE CONTENT INTENT`

### 2. Botをサーバーに招待

1. 「OAuth2」→「URL Generator」タブを開く
2. 「SCOPES」で `bot` を選択
3. 「BOT PERMISSIONS」で以下を選択：
   - `Read Messages/View Channels`
   - `Send Messages`
   - `Embed Links`
   - `Connect`
   - `View Channel`
4. 生成されたURLからBotをサーバーに招待

### 3. 必要な情報の取得

Discord開発者モードを有効にして、以下のIDをコピーします：

- **サーバーID (GUILD_ID)**: サーバーを右クリック → 「IDをコピー」
- **ボイスチャンネルID (VOICE_CHANNEL_ID)**: 監視したいボイスチャンネルを右クリック → 「IDをコピー」
- **テキストチャンネルID (TEXT_CHANNEL_ID)**: 通知を送信したいテキストチャンネルを右クリック → 「IDをコピー」

### 4. ローカルでの実行

```bash
# 依存関係をインストール
npm install

# 環境変数ファイルを作成
cp .env.example .env

# .envファイルを編集して必要な情報を入力
# DISCORD_TOKEN=your_bot_token_here
# GUILD_ID=your_guild_id_here
# VOICE_CHANNEL_ID=your_voice_channel_id_here
# TEXT_CHANNEL_ID=your_text_channel_id_here

# Botを起動
npm start
```

## fly.ioへのデプロイ

### 前提条件

- fly.ioアカウントを作成済み
- flyctlコマンドラインツールをインストール済み

```bash
# flyctlのインストール (macOS)
brew install flyctl

# ログイン
flyctl auth login
```

### デプロイ手順

```bash
# 1. fly.ioアプリを作成（初回のみ）
flyctl launch --no-deploy

# 2. ボリュームを作成（データ永続化用）
flyctl volumes create voice_tracker_data --region nrt --size 1

# 3. 環境変数を設定
flyctl secrets set DISCORD_TOKEN=your_bot_token_here
flyctl secrets set GUILD_ID=your_guild_id_here
flyctl secrets set VOICE_CHANNEL_ID=your_voice_channel_id_here
flyctl secrets set TEXT_CHANNEL_ID=your_text_channel_id_here

# 4. デプロイ
flyctl deploy

# 5. ログを確認
flyctl logs
```

### デプロイ後の管理

```bash
# アプリの状態を確認
flyctl status

# ログをリアルタイムで確認
flyctl logs -f

# アプリを再起動
flyctl apps restart

# データを確認（SSH接続）
flyctl ssh console
cd /app/data
cat session_history.json
```

## データ保存

通話履歴は以下のファイルに保存されます：

- `data/sessions.json`: 現在のアクティブセッション
- `data/session_history.json`: 過去の通話履歴

### データ形式例

```json
[
  {
    "userId": "123456789012345678",
    "username": "ユーザー名",
    "joinedAt": "2025-12-06T10:00:00.000Z",
    "leftAt": "2025-12-06T11:30:00.000Z",
    "durationMs": 5400000,
    "durationFormatted": "1時間30分0秒"
  }
]
```

## トラブルシューティング

### Botがオンラインにならない

- Discord Tokenが正しいか確認
- Botの権限が適切に設定されているか確認

### 通知が送信されない

- チャンネルIDが正しいか確認
- Botがテキストチャンネルにアクセスできるか確認（権限）

### fly.ioでエラーが発生する

```bash
# ログを確認
flyctl logs

# アプリを再起動
flyctl apps restart
```

## ライセンス

MIT
