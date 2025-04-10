# TileMatching - 连连看游戏

这是一个基于 React + TypeScript 开发的纯前端连连看游戏，支持多种模式切换、关卡加载、连线动画及图片/文字显示。

## 项目结构

```
TileMatching/
├── public/
│   └── images/           # A.webp ~ Z.webp 图片资源（可选）
├── src/
│   ├── components/       # Tile.tsx, GameBoard.tsx
│   ├── hooks/            # useGame.ts
│   ├── models/           # Tile.tsx（interface）
│   ├── utils/            # gameLogic.ts（棋盘生成、路径查找、重排）
│   ├── views/            # GamePage.tsx
│   └── App.tsx, main.tsx
│   └── data/             # 关卡 JSON 文件（level1.json ~ level10.json）
├── vite.config.ts        # Vite 配置
└── README.md
```

## 功能特点

- ✅ 支持 10 个关卡，读取 public/data/levelX.json 动态加载
- ✅ 卡牌以图片（A-Z.webp）或字母形式展示，自动 fallback
- ✅ 多种匹配成功后的重排模式：normal / left / right / up / down / inside / outside
- ✅ 支持连线显示动画，转折次数影响连线显示时间（0, 1, ≥2 次分别显示 500ms、1000ms、1500ms）
- ✅ 匹配逻辑采用 BFS，支持最多 3 次转弯路径
- ✅ 使用 SVG 叠加绘制连线，支持描边与发光特效
- ✅ 自适应 Tile 排列，保持固定棋盘布局

## 使用说明

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开浏览器访问 `http://localhost:5173/TileMatching/`

## 关卡配置示例（public/data/level1.json）

```json
{
  "rows": 6,
  "cols": 6,
  "mode": "left"
}
```

## 模式说明

| 模式名  | 行为说明                     |
| ------- | ---------------------------- |
| normal  | 匹配后卡牌移除，其余不动     |
| left    | 除最左边卡牌外，其它向左靠拢 |
| right   | 向右靠拢                     |
| up      | 向上靠拢                     |
| down    | 向下靠拢                     |
| inside  | 所有卡牌向中心聚拢           |
| outside | 所有卡牌向四周扩散           |

## 图片资源

- 放置于 `public/images/` 下，例如 `A.webp`, `B.webp` ... `Z.webp`
- 如果图片缺失，将以大写字母作为占位符显示

## 开发者

- 💻 基于 Vite + React + TypeScript
- ✨ 多模式动态棋盘重排逻辑由自定义算法实现
