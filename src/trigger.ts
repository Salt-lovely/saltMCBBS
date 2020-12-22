// saltMCBBS - MOD - Example
// saltMCBBS - DIS - 一个示例模块
// saltMCBBS - VER - 0.1.3
(function () {
    Trigger()
    async function Trigger() {
        let safe = 0
        while (!window.saltMCBBSOriginClass && safe++ < 2000)
            await new Promise((resolve) => setTimeout(resolve, 50));
        myMod()
    }
    function myMod() {
        /**saltMCBBS实例 */
        const saltMCBBS = window.saltMCBBS
        /**saltMCBBSCSS实例 */
        const saltMCBBSCSS = window.saltMCBBSCSS
        // const saltMCBBSOriginClass = window.saltMCBBSOriginClass
        console.log('这里放你的代码, 简易代码文档见下方的 Example 函数')
    }
})()

function Example() {
    if (2 - 1 == 1) {
        console.warn('这个函数是让你看的不是让你运行的')
        return
    }
    if (2 - 0 == 2) throw new Error('我说了这个函数是让你看的不是让你运行的');

    // 这里的示例代码仅供参考, 请下载 misc、saltMCBBS、index 三个 .d.ts 文件
    // 找不到想要的方法? 请使用 Ctrl + F 查找
    // 最好使用 TypeScript 而不是 JavaScript 写代码
    // 注: 可以用 JS, 毕竟 TS 最后也要变成 JS 的 

    // saltMCBBS实例
    const saltMCBBS = window.saltMCBBS
    // saltMCBBSCSS实例
    const saltMCBBSCSS = window.saltMCBBSCSS
    let value: any // 这个是为了保证示例代码不报错存在的, 自己写的时候不要用 any

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    saltMCBBS.getTID() // 获取当前页面 TID, 没有则返回 0
    saltMCBBS.getUID() // 获取当前用户 UID, 没有则返回 0

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // 使用 Trim, 去除字符串两侧的空格
    // 主流浏览器自带 trim 方法, 这里的 Trim 是为了那些老旧浏览器存在的
    saltMCBBS.Trim('  字符串   ') // 返回 '字符串'

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // 使用 formatToStringArray, 格式化字符串为字符串数组
    saltMCBBS.formatToStringArray(' a \n b \n c \n \n   \n d \n') // 返回 ['a', 'b', 'c', 'd'] <- 自动排除空行, 去掉两侧空格

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // 使用 addChildren, 批量添加子元素
    let parent = document.createElement('div'), span = document.createElement('span'), a = document.createElement('a')
    saltMCBBS.addChildren(parent, [span, a]) // parent 现在有了 span 和 a 两个元素为子元素

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // 使用本地数据读写功能
    // 第一个参数: 数据的键, 可以理解为存放位置, 只能用数字、字母、横杠, 用了别的字符可能出错
    // 你的模块添加的数据可以被别人的模块读取, 因此可能产生冲突(两个模块都读写“a”这个键, 然后两个模块都原地爆炸)
    // 建议: 键名改成 “你的模块名-键名” 如: “SaltRPG-PlayerLevel”
    saltMCBBS.write('your-key', '默认值') // 写入
    saltMCBBS.read('your-key') // 读取, 读取不到则返回 null, 不推荐使用这个方法
    saltMCBBS.readWithDefault('your-key', '默认值') // 读取, 读取不到则返回默认值, 同时写入默认值, 推荐使用这个
    // 你可以写入 数字、布尔、字符串、数组、json对象 等等东西, 但是读取的时候务必按同样的格式操作
    // 比如 saltMCBBS.write('your-key', 233) 后, 读取时请这么写 saltMCBBS.read<number>('your-key') 确保你知道你读取的是一个数字

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // showSettingPanel / hideSettingPanel, 显示/隐藏设置面板, 重复调用不会报错
    saltMCBBS.showSettingPanel() // 显示
    saltMCBBS.hideSettingPanel() // 隐藏

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // 快速添加配置项
    // 默认内容可以使用 本地数据读写功能 获取

    // 配置项为一个大文本框
    value = saltMCBBS.readWithDefault('your-key', '默认值') // 获取用户的配置 或 '默认值'
    saltMCBBS.addTextareaSetting('标题', value, (el, ev) => {
        console.log(el) // 被修改的 textarea 元素
        console.log(ev) // 事件
        saltMCBBS.write('your-key', el.value) // 记录用户的输入
    }, '配置项名字')

    // 配置项为一个输入框
    value = saltMCBBS.readWithDefault('your-key', '默认值') // 获取用户的配置 或 '默认值'
    saltMCBBS.addInputSetting('标题', value, (el, ev) => {
        console.log(el) // 被修改的 input 元素
        console.log(ev) // 事件
        saltMCBBS.write('your-key', el.value) // 记录用户的输入
    }, '配置项名字')

    // 配置项为一个选择框
    value = saltMCBBS.readWithDefault('your-key', true) // 获取用户的配置 或默认值 true
    saltMCBBS.addCheckSetting('标题', value, (ck, ev) => {
        console.log(ck) // 用户点击后是否勾选
        console.log(ev) // 事件
        saltMCBBS.write('your-key', ck) // 记录用户是否勾选
    })

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // 使用 saltQuery, 根据CSS选择器遍历元素
    saltMCBBS.saltQuery('.abc', (index, el) => {
        // 遍历所有含有 abc 的 class 的元素  
        console.log(index) // 这是获取到的第几个元素
        console.log(el) // 这是获取到的元素中的一个
    })

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // 使用 saltObserver, 异步监听页面元素变化
    // 这个方法有两个可选参数, 对 Observer 不熟悉的话请不要使用
    saltMCBBS.saltObserver('append_parent', () => {
        // 监听了 id 为 append_parent 的函数
        // 这个回调函数是 MutationCallback 类型的
        // 在被监听元素(以及子元素)改变时触发
    })

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // 使用 addSideBarLink 方法, 在左侧栏底部添加新的按钮
    // 如果传入的是一段文字, 那么函数会自行生成一个新的 a 元素, 并监听鼠标点击事件
    saltMCBBS.addSideBarLink('一段文字', (ev) => {
        // 左侧栏下方会出现一个新的按钮, 写着 '一段文字'
        // 这个回调函数则是那个新的按钮被点击后触发的
    })
    // 示例, 你看到的 “SaltMCBBS 设置” 按钮是怎么来的
    saltMCBBS.addSideBarLink('SaltMCBBS 设置', () => { window.saltMCBBS.showSettingPanel() })

    // 如果传入的是一个元素, 则回调函数失效, 而这个元素请自己处理
    let anchor = document.createElement('a')
    saltMCBBS.addSideBarLink(anchor)

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // 对新手可能不太友好的功能

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // 使用 sleep 方法, 返回一个延时 Promise
    // 配合 await 关键字, 可以实现延时功能
    saltMCBBS.sleep(233) // 返回一个延时 233ms 的Promise

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // 使用 addSetting 方法, 添加一个配置项
    // 这个方法添加配置项最自由, 不过里面的元素、事件什么的请自己处理
    // 最后请用一个 div 包裹起来
    let div = document.createElement('div')
    saltMCBBS.addSetting(div, '配置项名字')

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // 仅在 saltMCBBS 起效的页面存在
    div.addClass('a b c')       // HTMLElement 的新方法: 批量添加class(不会重复添加已有的class)
    div.toggleClass('a b c')    // HTMLElement 的新方法: 批量切换class(有->没有, 没有->有)
    div.hasClass('a')           // HTMLElement 的新方法: 是否存在class(返回 boolean)
    div.removeClass('a b c')    // HTMLElement 的新方法: 批量删除class(删除没有的class不会报错)

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
} /**/