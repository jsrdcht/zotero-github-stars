# Zotero GitHub Stars

[![zotero target version](https://img.shields.io/badge/Zotero-7-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)

Zotero GitHub Stars 是一个用于 Zotero 7 的插件，可一键查询选中文献对应 GitHub 仓库的 Star 数，并将结果写入条目的 Extra 字段，同时在文献列表中通过自定义列实时展示 Star 数。

---

## 功能特点

- 在条目右键菜单中新增"更新 GitHub Stars"命令，一次性批量更新所选条目的 Star 数；
- 为主界面文献列表注册只读列"GitHub Stars"，自动解析 Extra 字段并显示 Star 数；
- 进度窗口友好提示，可随时取消；
- 使用 [GitHub Search API](https://docs.github.com/en/rest/search?apiVersion=2022-11-28#search-repositories) 获取最佳匹配仓库的 Star 数。

## 插件安装

1. 前往 [Releases](https://github.com/jsrdcht/zotero-github-stars/releases) 下载最新的 `*.xpi` 文件；
2. 在 Zotero 中打开"工具 → 插件"，点击右上角齿轮选择"安装插件…"，选中下载的 XPI 文件；
3. 安装完成后重启 Zotero 即可开始使用。

## 使用指南

1. 在文献列表中选中希望更新的条目（支持多选）；
2. 右键选择"更新 GitHub Stars"，等待进度条完成；
3. Star 数将写入条目的 Extra 字段（形如 `GitHub Stars: 1234`），并可在"GitHub Stars"列中查看。

## 开发与构建

```bash
# 克隆仓库并安装依赖
$ git clone https://github.com/jsrdcht/zotero-github-stars.git
$ cd zotero-github-stars
$ npm install

# 开发模式（自动编译并热重载 Zotero）
$ npm run start

# 生产构建（生成 .xpi 发布文件）
$ npm run build
```

---

## 致谢

本插件基于 [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template) 修改并扩展，同时借助了 [zotero-plugin-toolkit](https://github.com/windingwind/zotero-plugin-toolkit) 提供的 API。感谢这些优秀项目的作者及其贡献者！

## License

AGPL-3.0
