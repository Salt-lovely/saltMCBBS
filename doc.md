# saltMBBS 开发文档

欢迎来到 saltMCBBS 开发文档!

## 环境搭建

---

-   需要安装：[TypeScript](https://www.tslang.cn/index.html) —— 跟着百度的教程走即可
-   推荐使用 IDE：[VSCode](https://code.visualstudio.com/)
-   推荐使用插件：
    -   Prettier - Code formatter —— 用于格式化 TypeScript 文件
    -   Live Sass Compiler —— 用于编译 Scss 文件
-   常用操作：
    -   <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd> —— 调用任务 -> 监视（这样的话 ts 文件改变之后，会自动编译 js）
-   需要下载：
    -   misc.d.ts
    -   saltMCBBS.d.ts
    -   index.d.ts
    -   将这三个文件和你的 ts 代码文件放在一起（记得时常更新）

## saltMCBBS 的特性

---

-   对原生 JS 的扩展
    -   `HTMLElement` 对象上的新方法
        -   `addClass(classes: string): void` —— **批量**添加 class
        -   `toggleClass(classes: string): void` —— **批量**切换 class
        -   `hasClass(OneClass: string): boolean` —— 判断是否存在**某个** class
        -   `removeClass(classes: string): void` —— **批量**移除 class
        -   `offset(): { top: number, left: number }` —— 返回元素到页面顶部与左侧的距离
    -   `window`对象上创建的东西
        -   `saltMCBBS` —— 主要代码所在的**实例**，它会在创建之后即刻运行
        -   `saltMCBBSCSS` —— 操作 CSS 的**实例**，它会在 `saltMCBBS` 之前创建
        -   `saltMCBBSOriginClass` —— 这不是一个实例而是一个**类**，你可以实例化后使用，或者自己写一个类继承它
    -   自定义事件
        -   `saltMCBBSload` —— saltMCBBS 加载完毕触发
            -   你可以`await`位于 window 的`saltMCBBSOriginClass`控制你的脚本在`saltMCBBS`运行完成后触发。

## 开始你的第一个 saltMCBBS 模块

---

**注意：这个示例模块里的东西已经实现了，请不要重复造轮子。**不过我好像一直在重复发明轮子（小声）。

### 示例 1：自定义勋章显示行数

#### 1-1 确定实现方法

利用 CSS 的 `max-height` 可以方便地实现这个功能。

```
let style = 'p.md_ctrl {max-height: calc(64px * ' + line + ');}'
```

而控制行数的 line 可以利用`saltMCBBS`的储存功能来保存。

```
let line = window.saltMCBBS.readWithDefault<number>('medalLine', 3)
```

紧接着，利用`saltMCBBSCSS`的 CSS 操作功能，可以实现修改 CSS。

`window.saltMCBBSCSS.putStyle`会根据 CSS 的名字修改已有的 style 元素或新建 style 元素。

```
window.saltMCBBSCSS.putStyle(style, 'medalLine')
```

#### 1-2 添加设置项

利用`saltMCBBS`已经封装的方法，可以快速实现设置项添加。

首先打包一下代码，使其成为一个函数（方法）。

```
function medalLineOP() {
    let line = window.saltMCBBS.readWithDefault<number>('medalLine', 3)
    let style = 'p.md_ctrl {max-height: calc(64px \* ' + line + ');}'
    window.saltMCBBSCSS.putStyle(style, 'medalLine')
}
```

然后利用`saltMCBBS`的`addInputSetting`方法添加设置项。

这个方法会快速添加一个带标题的，仅有一个输入框的设置项，这个方法的第三个参数是输入框触发 `change` 事件的回调函数。

```
window.saltMCBBS.addSetting({
    type: 'input',       // 这是一个文本输入框型的配置项
    title: '勋章栏高度',  // 主标题
    subtitle: '',        // 副标题
    text: '' + window.saltMCBBS.readWithDefault<number>('medalLine', 3), // 显示的文字
    callback: (el, e) => { // 回调函数 参数分别是：input元素、事件
        window.saltMCBBS.write('medalLine', parseInt(el.value)) // 储存用户的配置
        medalLineOP() // 调用函数
    },
    name: '勋章栏高度',   // 内部识别用的名字
    priority: 555,       // 优先级，SaltMCBBS自带的配置项优先级一般在500以内
})

```

考虑到用户可能会输入不合法的配置，所以我们的代码还要继续改改。

```
window.saltMCBBS.addSetting({
    type: 'input',       // 这是一个文本输入框型的配置项
    title: '勋章栏高度',  // 主标题
    subtitle: '',        // 副标题
    text: '' + window.saltMCBBS.readWithDefault<number>('medalLine', 3), // 显示的文字
    callback: (el, e) => { // 回调函数 参数分别是：input元素、事件
        let line = parseInt(el.value)
        if (isNaN(line)) { return } // 输入无法解析的字符
        if (line < 1) { line = 1 } // 不能小于1
        if (line > 15) { line = 15 } // 不能大于15
        window.saltMCBBS.write('medalLine', parseInt(el.value)) // 储存用户的配置
        medalLineOP() // 调用函数
    },
    name: '勋章栏高度',   // 内部识别用的名字
    priority: 555,       // 优先级，SaltMCBBS自带的配置项优先级一般在500以内
})
```

#### 1-3 写一个外壳

我们将以上代码合并，写成一个`function myMod()`。

```
function myMod() {
    window.saltMCBBS.addSetting({
        type: 'input',       // 这是一个文本输入框型的配置项
        title: '勋章栏高度',  // 主标题
        subtitle: '',        // 副标题
        text: '' + window.saltMCBBS.readWithDefault<number>('medalLine', 3), // 显示的文字
        callback: (el, e) => { // 回调函数 参数分别是：input元素、事件
            let line = parseInt(el.value)
            if (isNaN(line)) { return } // 输入无法解析的字符
            if (line < 1) { line = 1 } // 不能小于1
            if (line > 15) { line = 15 } // 不能大于15
            window.saltMCBBS.write('medalLine', parseInt(el.value)) // 储存用户的配置
            medalLineOP() // 调用函数
        },
        name: '勋章栏高度',   // 内部识别用的名字
        priority: 555,       // 优先级，SaltMCBBS自带的配置项优先级一般在500以内
    })
    function medalLineOP() {
        let line = window.saltMCBBS.readWithDefault<number>('medalLine', 3)
        let style = 'p.md_ctrl {max-height: calc(64px \* ' + line + ');}'
        window.saltMCBBSCSS.putStyle(style, 'medalLine')
    }
}
```

监听`saltMCBBSload`（saltMCBBS 加载完毕）事件。

```
if(!window['saltMCBBS']) // saltMCBBS是否加载完毕？
    window.addEventListener('saltMCBBSload', () => { myMod() });
else
    myMod();
```

或者下载 trigger.ts，不用自己造轮子。

```
Trigger()
async function Trigger() {
    while (!window.saltMCBBSOriginClass)
        await new Promise((resolve) => setTimeout(resolve, 100));
    myMod()
}
```

这里推荐后者，一切完成后的最终代码如下：

```
Trigger()
async function Trigger() {
    while (!window.saltMCBBSOriginClass)
        await new Promise((resolve) => setTimeout(resolve, 100)); // 每 100ms 问一句：saltMCBBSOriginClass 在吗？
    myMod()
}
function myMod() {
    medalLineOP()
    window.saltMCBBS.addSetting({
        type: 'input',       // 这是一个文本输入框型的配置项
        title: '勋章栏高度',  // 主标题
        subtitle: '',        // 副标题
        text: '' + window.saltMCBBS.readWithDefault<number>('medalLine', 3), // 显示的文字
        callback: (el, e) => { // 回调函数 参数分别是：input元素、事件
            let line = parseInt(el.value)
            if (isNaN(line)) { return } // 输入无法解析的字符
            if (line < 1) { line = 1 } // 不能小于1
            if (line > 15) { line = 15 } // 不能大于15
            window.saltMCBBS.write('medalLine', parseInt(el.value)) // 储存用户的配置
            medalLineOP() // 调用函数
        },
        name: '勋章栏高度',   // 内部识别用的名字
        priority: 555,       // 优先级，SaltMCBBS自带的配置项优先级一般在500以内
    })
    function medalLineOP() {
        let line = this.readWithDefault<number>('medalLine', 3)
        let style = 'p.md_ctrl {max-height: calc(64px \* ' + line + ');}'
        window.saltMCBBSCSS.putStyle(style, 'medalLine')
    }
}
```

![1](https://s3.ax1x.com/2020/12/05/DLecFA.png)

![2](https://s3.ax1x.com/2020/12/05/DLegJI.png)

测试成功之后，就可以将其放进你的油猴脚本启用了。
