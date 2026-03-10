#!/bin/bash
# 部署脚本：构建 -> 打包 -> 上传 -> 解压 -> 安装依赖 -> 重启 PM2
# 用法: ./deploy.sh [prod|test]  默认 test

set -e  # 任一命令失败立即退出

# 配置
server=owa
remote_directory=/home/api/xunwu-api.openworkai.com
project_folder=$(cd "$(dirname "$0")" && pwd)
project_name=xunwu-client-api
zip_file=$project_folder/${project_name}.zip

# 环境切换（可按需取消注释并配置）
# if [ "$1" == "prod" ]; then
#   echo ">>> 发布生产环境"
#   server=jsnlxgyl
#   remote_directory="/home/lst/front"
# else
#   echo ">>> 发布测试环境"
# fi

echo ">>> 1. 本地构建..."
cd "$project_folder"
pnpm build

echo ">>> 2. 打包..."
[ -f "$zip_file" ] && rm -f "$zip_file"
zip -r -q -o "$zip_file" dist/ cert/ .env .env.production ecosystem.config.js nest-cli.json package.json pnpm-lock.yaml tsconfig.build.json tsconfig.json

echo ">>> 3. 上传到 $server ..."
scp "$zip_file" "$server:$remote_directory"

echo ">>> 4. 远程解压"
ssh "$server" "cd $remote_directory && \
  unzip -o -q ${project_name}.zip && \
  rm -f ${project_name}.zip"

# echo ">>> 5. 远程安装依赖"
# ssh "$server" "cd $remote_directory && \
#   pnpm install --prod --frozen-lockfile"

echo ">>> 6. 远程重启"
ssh $server "bash -l -c 'pm2 restart ${project_name}'"

# pnpm install --prod --frozen-lockfile && \
# pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production"

echo ">>> 6. 清理本地 zip..."
rm -f "$zip_file"

echo ">>> 部署完成"
