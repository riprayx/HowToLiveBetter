# ChatGPT Web 插件设计

日期：2026-10-04
仓库：riprayx/HowToLiveBetter

## 目标

把现有《高性价比人生指南》fork 开发成可安装到 ChatGPT Web 的私有插件，同时保持原仓库正文、证据规则和构建链不变。

## 约束

- 不修改 `book/` 正文。
- 不改现有 `skills/life-decision-guide/` 的原始逻辑。
- 不新增长期运行的服务器、数据库、Cloudflare Worker 或 API 密钥。
- 插件必须能独立读取随包携带的书籍内容。
- 回答继续遵守“先查正文再答、标注第几节第几条、保留证据等级和边界”的规则。
- 当前版本只做私有插件，不处理公开发布、商店审核或多人权限。

## 方案

采用纯 Skill 插件。

新增 `chatgpt-plugin/` 作为插件源目录，并提供一个最小构建脚本。构建脚本从当前仓库复制必要资源到独立插件包，避免维护第二份正文。

预期源码与构建结构：

```text
chatgpt-plugin/
  life-decision-guide/
    SKILL.md
    agents/
      openai.yaml
tools/
  build-chatgpt-plugin.mjs

# 构建出的插件包
skills/
  life-decision-guide/
    SKILL.md
    agents/
      openai.yaml
    references/
      README.md
      index.html
      book/
      docs/
      LICENSE
      LICENSE-CODE
      SNAPSHOT.md
```

## 数据流

1. 用户在 ChatGPT 中提出人生决策问题。
2. 插件 Skill 被触发。
3. Skill 先根据资源中的 README 定位 1 到 3 个章节。
4. 从随包 `resources/book/` 中检索相关条目。
5. 读取完整条目，包括成本、收益、证据等级、来源和备注。
6. 按原 `life-decision-guide` 的规则组织回答。
7. 若书中没有覆盖，则明确说明，不凭模型记忆补数字、法条或文献。

## 构建

`node tools/build-chatgpt-plugin.mjs`：

- 清理并重建临时插件目录。
- 复制 ChatGPT Skill 入口、UI 元数据、README、index.html、book、docs 和许可证。
- 生成符合 ChatGPT 插件布局 `skills/life-decision-guide/...` 的可上传 ZIP。
- 不复制 `.git`、CI、开发工具、广告或无关资源。
- 构建失败必须以非零退出码结束。

## 验证

最小验证包括：

- 构建命令可重复执行。
- ZIP 中只有一个有效插件。
- 插件包包含全部 `book/*.md`。
- Skill 引用的资源路径均存在。
- 对一个代表性问题进行安装后的实际调用验证。

## 版本与同步

插件是仓库某次提交的静态快照。以后同步 upstream 后，只需重新运行构建脚本并更新插件版本，不需要修改服务端。

## 暂不实现

- MCP 服务。
- 实时 GitHub 拉取。
- 向量数据库。
- 自定义前端 UI。
- 用户账户系统。
- 自动公开发布。
