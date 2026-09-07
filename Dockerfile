FROM node:22-trixie-slim

# 開発に必要な OS パッケージ
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Corepackのダウンロード確認プロンプトを無効化
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# pnpm を有効化
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app