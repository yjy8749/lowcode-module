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
find lowcode-module -type d -name 'target' -exec rm -rf {} + 2>/dev/null

echo "✅ 低代码模块复制完成！路径结构已保留，重复项已过滤。"
echo "   - 结果目录: lowcode-module/ruoyi-vue-pro"
echo "   - 结果目录: lowcode-module/yudao-ui-admin-vue3"

cd lowcode-ruoyi-vue-pro 
echo "🧹 正在删除本地所有标签..."
git tag -d $(git tag -l) >/dev/null 2>&1
echo "📥 正在从 origin 拉取所有标签..."
git fetch origin --tags --prune-tags
git remote add origin2 git@github.com:yjy8749/lowcode-ruoyi-vue-pro.git
echo "🗑️ 正在删除 origin2 上的所有远程标签..."
remote_tags=$(git ls-remote --tags origin2 | cut -f2 | sed 's|refs/tags/||')
if [ -n "$remote_tags" ]; then
    # 使用 xargs 分批删除（避免参数过长）
    echo "$remote_tags" | xargs -I {} git push origin2 :refs/tags/{}
fi
echo "📤 正在将本地代码推送到 origin2..."
git push origin2
git push origin2 --tags
git remote remove origin2
cd ..

cd lowcode-yudao-ui-admin-vue3
echo "🧹 正在删除本地所有标签..."
git tag -d $(git tag -l) >/dev/null 2>&1
echo "📥 正在从 origin 拉取所有标签..."
git fetch origin --tags --prune-tags
git remote add origin2 git@github.com:yjy8749/lowcode-yudao-ui-admin-vue3.git
echo "🗑️ 正在删除 origin2 上的所有远程标签..."
remote_tags=$(git ls-remote --tags origin2 | cut -f2 | sed 's|refs/tags/||')
if [ -n "$remote_tags" ]; then
    # 使用 xargs 分批删除（避免参数过长）
    echo "$remote_tags" | xargs -I {} git push origin2 :refs/tags/{}
fi
echo "📤 正在将本地代码推送到 origin2..."
git push origin2
git push origin2 --tags
git remote remove origin2
cd ..

cd lowcode-module
git add .
git commit -m "feat: 同步模块代码"
echo "🧹 正在删除本地所有标签..."
git tag -d $(git tag -l) >/dev/null 2>&1
echo "📥 正在从 origin 拉取所有标签..."
git fetch origin --tags --prune-tags
echo "📤 正在将本地代码推送到 origin..."
git push origin
git remote add origin2 git@github.com:yjy8749/lowcode-module.git
echo "📤 正在将本地代码推送到 origin2..."
git push origin2
git push origin2 --tags
git remote remove origin2