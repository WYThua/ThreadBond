# 使用 Node.js 18 Debian 镜像（更好的 Prisma 兼容性）
FROM node:18-slim

# 安装必要的系统依赖
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 设置 npm 镜像源并安装依赖
RUN npm config set registry https://registry.npmmirror.com && \
    npm install

# 复制源代码
COPY . .

# 生成 Prisma 客户端
RUN npx prisma generate

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "run", "dev"]