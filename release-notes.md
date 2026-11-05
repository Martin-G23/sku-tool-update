# 发布说明

每次发布新版本：

1. 更新两份源码中的 `CurrentVersion`。
2. 提交代码到 GitHub。
3. 创建并推送标签，例如 `v1.1.0`。
4. GitHub Actions 自动编译个人版和分享版并创建 Release。
5. Cloudflare Worker 自动读取最新 Release，已安装工具启动后会提示更新。
