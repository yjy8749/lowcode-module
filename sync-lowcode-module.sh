#!/bin/sh

cd ..

# 清理 lowcode-module 中的残留目录
rm -rf lowcode-module/ruoyi-vue-pro lowcode-module/yudao-ui-admin-vue3

# 定义源目录和目标子目录映射
source1="lowcode-ruoyi-vue-pro"
target1="ruoyi-vue-pro"

source2="lowcode-yudao-ui-admin-vue3"
target2="yudao-ui-admin-vue3"

# 复制函数：关键修复 - 仅匹配文件名/目录名直接包含 lowcode
copy_source() {
    local src_dir="$1"
    local tgt_dir="$2"
    
    mkdir -p "lowcode-module/$tgt_dir"
    
    # 关键修复：1. 用 -path 精确匹配文件名/目录名
    #           2. 用 sed 剥离源目录前缀
    find "$src_dir" -mindepth 1 \
        -not -path '*/.git/*' -not -path '*/.git' \
        -not -path '*/build/*' -not -path '*/build' \
        -not -path '*/node_modules/*' -not -path '*/node_modules' \
        -not -path '*/target/*' -not -path '*/target' \
        \( -type d -name '*lowcode*' -o -type f -name '*lowcode*' \) | 
        sed "s|^$src_dir/||" | 
        while read -r rel_path; do
        [ -z "$rel_path" ] && continue
        
        src_path="$src_dir/$rel_path"
        dest_path="lowcode-module/$tgt_dir/$rel_path"
        
        # 确保目标目录存在
        mkdir -p "$(dirname "$dest_path")"
        
        # 仅复制存在项
        if [ -e "$src_path" ]; then
            if [ -d "$src_path" ]; then
                cp -r "$src_path" "$dest_path"
            else
                cp "$src_path" "$dest_path"
            fi
        else
            echo "⚠️ 跳过不存在路径: $src_path" >&2
        fi
    done
}

# 执行复制
copy_source "$source1" "$target1"
copy_source "$source2" "$target2"

# 修复：复制后删除 lowcode-module 中的 target 目录
find lowcode-module -type d -name 'target' -exec rm -rf {} \;

echo "✅ 低代码模块复制完成！路径结构已保留，重复项已过滤。"
echo "   - 结果目录: lowcode-module/ruoyi-vue-pro"
echo "   - 结果目录: lowcode-module/yudao-ui-admin-vue3"

cd lowcode-ruoyi-vue-pro 
git remote add origin2 git@github.com:yjy8749/lowcode-ruoyi-vue-pro.git
git push origin2
git remote remove origin2
cd ..

cd lowcode-yudao-ui-admin-vue3
git remote add origin2 git@github.com:yjy8749/lowcode-yudao-ui-admin-vue3.git
git push origin2
git remote remove origin2
cd ..

cd lowcode-module
git remote add origin2 git@github.com:yjy8749/lowcode-module.git
git push origin2
git remote remove origin2