# 使用 Node.js 18 镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 设置 npm 镜像源并安装依赖
RUN npm config set registry https://registry.npmmirror.com && \
    npm install

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 8080

# 启动命令
CMD ["npm", "run", "serve"]