<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 项目自定义规则

### 主动搜索与复用成熟开源方案（Open Source Reuse）

1. 在开发新功能或设计新页面时，允许并鼓励主动搜索 GitHub 上的相关开源项目、组件库、模板，以及公开网页中的优秀设计与交互方案。
2. 优先评估成熟、可靠且维护良好的现有方案。在技术合理的情况下，可以直接引入开源依赖，或在许可证允许的范围内复用和修改代码，不必重复造轮子。
3. 可以借鉴其他网站的布局、设计思路和交互体验，并将其转化为符合 AI Campus OS 产品定位的原创界面。不得未经授权直接复制受保护的代码、图片、品牌标识或其他素材。
4. 复用前检查许可证、兼容性、维护状态、依赖安全性和技术适配程度。无明确复用授权的代码不能直接复制。GPL、AGPL 等可能对本项目产生额外许可义务的方案，应先报告并征求确认。
5. 对实质性复用的第三方代码，按许可证要求保留版权和许可证声明，并记录来源链接、使用版本及修改内容。普通软件包依照其许可证和包管理规范管理。
6. 在功能开发范围内，可自主搜索、比较、选择和集成合适的开源方案，不必为每一个正常的技术选择请求确认。但涉及付费服务、敏感凭据、重大架构更换或不明确的授权风险时，先说明并等待确认。
7. 搜索和复用只是提高开发效率的手段，最终必须符合 AI Campus OS 的功能需求、界面风格、代码质量及测试标准。不要为了使用开源项目而引入不必要的复杂度。
8. 在每次开发总结中，简要说明本轮使用了哪些重要的第三方方案、为什么选择它们，以及做了什么适配修改。
