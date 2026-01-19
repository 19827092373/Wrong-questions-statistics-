# 课堂错题统计系统

帮助教师高效追踪学生错题情况的教学辅助工具。

## 项目结构

```
wrong-questions-statistics/
├── src/                    # React版本源代码（主版本）
│   ├── components/         # React组件
│   ├── stores/             # Zustand状态管理
│   ├── hooks/              # 自定义Hooks
│   └── styles/             # 样式文件
├── public/                 # 静态资源
├── package.json            # React版本依赖配置
├── vite.config.js          # Vite配置（React）
└── eslint.config.js        # ESLint配置
```

## 技术栈

### React版本（主版本）
- **React 19** - UI框架
- **Zustand** - 状态管理（带持久化）
- **Vite** - 构建工具
- **SCSS** - 样式预处理器
- **Lucide React** - 图标库

## 功能特性

- ✅ **学生点名系统** - 支持批量导入、随机点名、权重配置
- ✅ **题号矩阵** - 可视化错题统计，支持连续颜色渐变
- ✅ **错题榜** - 按错误次数排序，显示高频错题
- ✅ **数据导出** - 生成统计报告图片
- ✅ **数据备份** - 支持导入/导出JSON格式数据
- ✅ **设置面板** - 可配置抽取权重、动画速度等

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```

## 主要改进

### 颜色渐变系统
- 从固定的4个颜色等级改为**连续渐变色**
- 根据错误次数动态计算HSL颜色值
- 从黄色（低错误）平滑过渡到红色（高错误）
- 支持任意错误次数（1次、2次...10次+）的精确颜色映射

## 开发者

Dev: 感恩烧饼
