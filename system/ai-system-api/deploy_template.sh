#!/bin/bash
#### !/usr/bin/expect

# 指定要传输的服务器IP地址和目录路径、默认测试环境
server=owa
remote_directory=/home/api/demoapp.openworkai.com

project_folder=$(pwd)
project_name=demoapp
zip_file=$project_folder/${project_name}.zip

# if [ "$1" == "prod" ]; then
#   echo "发布生产环境"
#   server=jsnlxgyl
#   remote_directory="/home/lst/front"
# else
#   echo "发布测试环境"
# fi

cd $project_folder
pnpm build

# 判断zip包是否存在，如果存在则删除
if [ -f $zip_file ]; then
  rm $zip_file
fi

# 压缩编译后的文件夹dist
zip -r -q -o $zip_file dist/ cert/ .env .env.production ecosystem.config.js nest-cli.json package.json tsconfig.build.json tsconfig.json
echo "压缩成功，等待上传..."


# 传输zip包到服务器
scp $zip_file $server:$remote_directory
echo "上传成功，等待发布..."

# 在服务器上解压缩zip包
ssh $server "unzip -o $remote_directory/$project_name.zip -d $remote_directory"
ssh $server "rm -rf $remote_directory/$project_name.zip"
ssh $server "pm2 restart demoapp"
echo "发布成功"

# 删除本地的zip包
rm -f $zip_file
echo "清理本地zip包成功"
