# Cloudflare 自动更新接口

此 Worker 从 GitHub Releases 读取最新版本，并提供：

- `/update-personal.json`：个人版更新信息
- `/update.json`：分享版更新信息
- `/health`：健康检查

部署前修改 `cloudflare.config.ts` 中的 GitHub 仓库信息，然后登录 Cloudflare CLI：

```powershell
npm install
cf auth login
cf deploy
```

部署完成后，将工具源码中的 `DefaultUpdateManifestUrl` 改成 Worker 的 `/update-personal.json` 地址；分享版使用 `/update.json`。
