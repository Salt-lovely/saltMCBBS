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
    -   <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd> —— 调用任务 -> 监视（这样的话 ts 文件保存之后，会自动编译为 js）
-   需要下载：
    -   misc.d.ts
    -   sm.d.ts
    -   index.d.ts
    -   将这三个文件和你的 ts 代码文件放在一起（记得时常更新）

## saltMCBBS 的特性

---

-   对原生 JS 的扩展
    -   `HTMLElement` 对象上的新方法
        -   `addClass(classes: string): void` —— **批量**添加 class。
        -   `toggleClass(classes: string): void` —— **批量**切换 class。
        -   `hasClass(OneClass: string): boolean` —— 判断是否存在**某个** class。
        -   `removeClass(classes: string): void` —— **批量**移除 class。
        -   `offset(): { top: number, left: number }` —— 返回元素到页面顶部与左侧的距离。
        -   `numAttribute(key: string): numAttrReturn` —— 以类似数字的形式记录数据到元素，`.value`获取数字。
        -   `inViewport(): boolean` —— 元素是否部分在可视区域中。
        -   `allInViewport(): boolean` —— 元素是否**全部**出现在可视区域中。
    -   `window`对象上创建的东西
        -   `saltMCBBS` —— 主要代码所在的**实例**，它会在创建之后即刻运行。
        -   `saltMCBBSCSS` —— 操作 CSS 的**实例**，它会在 `saltMCBBS` 之前创建。
        -   `saltMCBBSOriginClass` —— 这不是一个实例而是一个**类**，你可以实例化后使用，或者自己写一个类继承它。
        -   `saltMCBBSDataBaseHandler` —— 这不是一个实例而是一个**类**，你可以实例化后使用，或者自己写一个类继承它。
    -   自定义事件
        -   `saltMCBBSload` —— saltMCBBS 加载完毕触发。
            -   你可以等待 window 的`saltMCBBSOriginClass`出现，控制你的脚本在`saltMCBBS`运行完成后触发。
            -   推荐使用`window.saltMCBBS.docReady(function(){})`。

## 制作可以用于 SaltMCBBS 的表情包！

---

### 表情包名、作者、版本、许可证等信息！

请注意：SaltMCBBS 拥有神奇的解析工具，大可不必按照标准写法来。

-   表情包名（必填）：
    -   标准写法：`"名字":"XXXXXXX"`
    -   可以识别的其他写法：`"名"："XXXXXXX"` `"表情包名"："XXXXXXX"`
-   作者（非必填）：
    -   标准写法：`"作者":"XXXXXXX"`
    -   可以识别的其他写法：`"表情作者"："XXXXXXX"` `"表情包作者"："XXXXXXX"`
-   版本（非必填）：
    -   标准写法：`"版本":"XXXXXXX"`
    -   可以识别的其他写法：`"表情版本"："XXXXXXX"` `"表情包版本号"："XXXXXXX"`
-   许可证（非必填）：
    -   标准写法：`"许可证":"XXXXXXX"`
    -   可以识别的其他写法：`"授权协议"："XXXXXXX"` `"表情包许可证书"：123456`
-   其他信息（非必填）：
    -   标准写法：`"其他":"XXXXXXX"`
    -   可以识别的其他写法：`"说明"："XXXXXXX"` `"表情包备注"："XXXXXXX"`

示例：

```
除了必要信息部分需要按照格式来，其他地方你可以随便写啥
"名字":"一个神奇的表情包" ASDFGHJKL

你甚至可以空好几行，在这里加入表情

"作者":"神奇的作者<sup>你甚至可以用HTML代码</sup>" <-- 对没错就是这么神奇！
'版本号'：123456 // 对没错，你甚至可以直接写数字
"授权许可":"996许可证" 啊哈哈哈哈
"备注"："不要直接换行，用<br>来换行" 你可以在外面写任何东西

文字部分带有的HTML代码会经过XSS审查工具处理
```

### 添加表情

为了保持最大兼容，SaltMCBBS 采用类似于 Markdown 的图片格式来标记表情。

即`![表情说明](表情URL)`格式，还有限定大小的写法`![表情说明](表情URL){宽,高}`。

当然，SaltMCBBS 拥有强大的解析能力：

```
![表情说明](表情URL) 呜啦啦啦
你可以使用全角符号 ！【表情说明】（表情URL）
你还可以用空格来代替前面的感叹号  【表情说明】(表情URL)
如果只写了宽，那么默认高=宽 ！【表情说明】（表情URL）{宽}

表情URL会经过XSS审查工具处理
```

### 一个示例

```
你可以复制这一整段话，导入SaltMCBBS
![这是表情1](//www.mcbbs.net/template/mcbbs/image/warning.gif) <<这是警告卡的图片
"名字":"这是一个示例表情包，试完记得删"
![这是表情2](//www.mcbbs.net/template/mcbbs/image/warning.gif) <<这也是警告卡的图片
"作者":"作者<sup>好吧我懒得想名字了</sup>"
![这是表情3](//www.mcbbs.net/template/mcbbs/image/warning.gif){20} <<这还是警告卡的图片
'版本号'："我是版本"
![这是表情4](//www.mcbbs.net/template/mcbbs/image/warning.gif){40 ,40} <<这是一张比较大警告卡的图片
"授权许可":"不知看"
![这是表情5](//www.mcbbs.net/template/mcbbs/image/warning.gif){50，50} <<这是一张很大警告卡的图片
"备注"："会<br>换行<br>我<br>也是诗人"
!【这是表情6】(//www.mcbbs.net/static/image/feed/friend.gif) <<这不是警告卡的图片
```

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
