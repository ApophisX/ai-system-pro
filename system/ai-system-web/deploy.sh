#!/bin/bash
#### !/usr/bin/expect

# 指定要传输的服务器IP地址和目录路径、默认测试环境
server=owa
remote_directory=/var/www/xunwu.openworkai.com

project_folder=$(pwd)
folder_name=dist
zip_file=$project_folder/$folder_name.zip

# if [ "$1" == "prod" ]; then
#   echo "发布生产环境"
#   server=jsnlxgyl
#   remote_directory="/home/lst/front"
# else
#   echo "发布测试环境"
# fi



cd $project_folder

# 检查是否带有 --build 参数
if [[ "$1" == "--build" ]]; then
  echo "🛠  执行构建..."
  pnpm build
else
  echo "🚀 跳过构建，仅执行部署逻辑..."
fi

# 检查 dist 文件夹是否存在
# if [ ! -d "$project_folder/dist" ]; then
#   echo "Error: $project_folder/dist folder not found."
#   exit 1
# fi

# 判断zip包是否存在，如果存在则删除
if [ -f $zip_file ]; then
  rm $zip_file
fi

# 压缩编译后的文件夹dist
zip -r -q -o $zip_file $folder_name/ public/
echo "压缩成功，等待上传..."


# 传输zip包到服务器
scp $zip_file $server:$remote_directory
echo "上传成功，等待发布..."

# 在服务器上解压缩zip包
ssh $server "unzip -o $remote_directory/$folder_name.zip -d $remote_directory"

ssh $server "rm -rf $remote_directory/$folder_name.zip"

echo "发布成功"

rm -rf $zip_file