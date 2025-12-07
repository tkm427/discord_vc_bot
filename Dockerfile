FROM node:20-alpine

WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production

# アプリケーションファイルをコピー
COPY . .

# データディレクトリを作成
RUN mkdir -p /app/data

# 非rootユーザーで実行
USER node

# アプリケーションを起動
CMD ["node", "src/index.js"]
