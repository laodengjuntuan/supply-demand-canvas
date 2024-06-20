# (供需关系图)supply-demand-canvas
准备做若干个供需关系图，首先是最普通的，然后准备增加联邦基金利率的

# 打包命令
npx rollup src/main.js -o index.js
npx rollup src/main.js -o index.js --watch

# 项目启动
打包过后的项目直接双击index.html启动即可

# 思路
思路其实很简单，由于canvas的动画是把整个画布擦除（当然有些情况下可以保留部分，但是这种情况比较稀有），一个是专门用于重绘的部分，一个是各个组件的各自绘制逻辑。然后把这些绘制逻辑注册进负责重绘的函数里。