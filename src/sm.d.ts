/// <reference path="misc.d.ts"/>
/**saltMCBBSOriginClass接口 */
interface saltMCBBSOriginClass {
    new(): saltMCBBSOriginClassNew
}
interface saltMCBBSOriginClassNew {
    consolePanel: HTMLElement;
    /**
     * 当你担心HTML代码中含有script或者style之类的恶意内容时
     * @param s HTML代码
     */
    simpleAntiXSS(s: string): string,
    /**弹出一个类似于inputbox的弹窗
     * 
     * 有确定和取消按钮，分别触发两个不同的回调函数
     */
    inputBox(options: {
        placeholder?: string,
        defaultText?: string,
        acceptCallback?: (text: string) => void,
        cancelCallback?: (text: string) => void,
    }): void,
    /**
     * 将表情包对象整理为输出字符串
     * @param m 表情包对象
     */
    formatMemePack(m: MemePack): string,
    /**将字符串转换为MemePack */
    resolveMemePack(s: string): MemePack,
    /**将字符串转换为Meme数组 */
    formatMeme(s: string): Meme[],
    /**筛除数组中的重复元素 */
    unique<T>(arr: T[]): T[],
    /**随机生成字母数字组合, 可以用于id */
    randomID(len?: number): string,
    /**相当于setInterval */
    tick(handler: Function, second?: number): number,
    /**相当于clearInterval */
    clearTick(handlerNum: number),
    /**获取当前时间戳 */
    getTime(): number,
    getData(key: 'antiWaterRegExp'): RegExp[];
    getData(key: 'noticImgUrl'): String[];
    getData(key: 'medalLinkPrefix' | 'version' | 'prefix'): String;
    getData(key: 'randomStringGen'): String[][];
    /**
     * 获取一些由于闭包而不能直接访问的数据
     * @param key 键值, 详见方法重载, 默认返回空字符串
     */
    getData(key: string): any,
    /**
     * 将页面平滑地滚动到某个位置
     * @param targetY 目标高度
     * @param step 自定义步数, 每一步 20ms, 默认25步, 即 500ms
     */
    scrollTo(targetY: number, step: number): void,
    /**
     * 在文档加载完毕之后执行代码，类似于jQuery的$(function)
     * @param callback 要执行的代码
     */
    docReady(callback: () => void): void,
    /**
     * 在文档即将加载完毕时执行代码，执行时间可能早于jQuery的$(function)
     * @param callback 要执行的代码
     */
    async docNearlyReady(callback: () => void): void,
    /**
     * 根据选择器遍历元素
     * @param selector 字符串，选择器
     * @param callback 回调函数(index: number, el: Element): void
     */
    saltQuery(selector: string, callback: (index: number, el: Element) => void): void,
    /**
     * 封装了MutationObserver的少许操作，自动开始监视
     * @param id 要监听的元素ID(字符串)或一个元素(Element)
     * @param callback 回调函数
     * @returns 成果则返回一个已经开始监听的MutationObserver对象，否则返回null
     */
    saltObserver(id: string, callback: MutationCallback, watchAttr?: boolean, watchChildList?: boolean): MutationObserver | null,
    /**
     * 根据key存入本地存储
     * @param key 键值
     * @param value 要存放的值
     */
    write(key: string, value: any): void,
    /**
     * 根据key读取本地数据
     * @param key 键值
     */
    read<T>(key: string): T,
    /**
     * 根据key读取本地数据，若没有则写入默认数据
     * @param key 键值
     *  */
    readWithDefault<T>(key: string, defaultValue: T): T,
    /**
     * 数组中随机挑选一个返回
     * @param arr 数组
     */
    randomChoice<T>(arr: T[]): T | null,
    /**
     * 将字符串分割成字符串数组，去掉空项与每一项的两侧空格
     * @param str 要分割的字符串
     * @param spliter 按什么划分，默认按换行划分
     */
    formatToStringArray(str: string, spliter?: string): string[],
    /**
     * 去除字符串数组中匹配的字符串
     * @param arr 要处理的字符串
     * @param test 用于测试的正则表达式，默认为两个斜杠开头
     */
    cleanStringArray(arr: string[], test?: RegExp): string[],
    /**删除字符串两侧的空格 */
    Trim(x: string): string,
    /**将格式正确的obj变成a元素 */
    obj2a(obj: AnchorObj[], targetDefault?: string): HTMLAnchorElement[],
    /**批量添加子节点 */
    addChildren(parent: Element, children: NodeListOf<Element> | Element[]): void,
    /**
     * 根据UID获取用户信息
     * @param uid 用户的UID
     * @param callback 回调函数
     * @param retry 失败后重试次数
     * @param retryTime 重试时间间隔
     */
    fetchUID(uid: number | string, callback: (data: BBSAPIResponceData) => void, retry?: number, retryTime?: number): void,
    /**
     * 根据TID获取帖子信息
     * @param tid 帖子的TID
     * @param callback 回调函数
     * @param page 页码，每页5楼
     * @param retry 失败后重试次数
     * @param retryTime 重试时间间隔
     */
    fetchTID(tid: number | string, callback: fetchTIDcallback, page?: number, retry?: number, retryTime?: number): void,
    /**获取当前用户的UID*/
    getUID(): number,
    /**获取当前页面的TID，没有则返回0*/
    getTID(): number,
    /**
     * 在屏幕右下角输出提示信息
     * @param info 要显示的信息, HTML
     * @param callback 点击后的回调函数, 如果用户点击关闭则不会触发, 回调函数可以接受一个销毁这个消息的函数作为参数
     * @param type 类型 0-默认 1-信息(其实就是默认) 2-成功 3-警告 4-出错 默认为0
     */
    message(html: string, callback?: (() => void) | ((removeDiv: () => void) => void), type?: number): void,
    /**
     * 断言
     * @param condition 为假时报错
     * @param msg 报错语句，默认为“发生错误”
     */
    assert(condition: any, msg?: string): asserts condition,
    /**
     * 带前缀打印
     * @param msg 要打印的内容
     */
    log(msg: any): void,
    /**
     * sleep 返回一个延迟一定ms的promise
     * @param time 单位毫秒
     */
    sleep(time: number): void
}
/**saltMCBBS接口 */
interface saltMCBBS extends saltMCBBSOriginClassNew {
    /**配置框 */
    settingPanel: HTMLElement,
    /**
     * 夜间模式
     * @param night boolean切换为夜晚还是白天；
     * @param log 是否记录进本地存储
     */
    nightStyle(night: boolean, log: boolean): void,
    /**转换夜间模式 */
    toggleNightStyle(): void,
    /**显示设置面板 */
    showSettingPanel(): void,
    /**隐藏设置面板 */
    hideSettingPanel(): void,
    /**
     * 水帖审查工具
     * @param RegExps 审查用的正则表达式数组, 不填则默认使用内置的
     * @param ignoreWarned 是否忽略那些已经被制裁的帖子, 默认为是
     * @param callback 回调函数, 接受 3个参数: 代表一层楼的 div 元素, 这层楼的内容所在的元素, 处理后的文本; 没有的话则使用默认处理方式
     */
    antiWater(RegExps?: RegExp[], ignoreWarned?: boolean,
        callback?: (el: HTMLElement, ts: HTMLElement, text: string) => void): Promise<void>,
    /**
     * 添加配置项
     * @param div 一个settingOptions，里面的东西看misc.d.ts
     */
    addSetting(div: settingOptions): void,
    /**
     * 添加配置项
     * @param div 一个元素，里面的东西自己写
     * @param id 元素的名字，删除的时候用
     * @param priority 配置项排序优先级
     */
    addSetting(div: Element, id?: string, priority?: number): void,
    /**
     * 一种快速生成配置项的预设，结构是一个 h3 加一个 textarea
     * @param h3 配置项标题(可以是HTML代码)
     * @param textarea 默认配置
     * @param callback textarea触发change事件的回调函数，参数：el: textarea元素, ev: 事件
     * @param id 配置项的id，不填则默认为h3
     * @param priority 配置项排序优先级
     */
    addTextareaSetting(h3: string, textarea: string, callback: (el: HTMLTextAreaElement, ev: Event) => void, id?: string, priority?: number): void,
    /**
     * 一种快速生成配置项的预设，结构是一个 h3 加一个 input
     * @param h3 配置项标题(可以是HTML代码)
     * @param text 默认配置
     * @param callback input触发change事件的回调函数，参数：el: textarea元素, ev: 事件
     * @param id 配置项的id，不填则默认为h3
     * @param priority 配置项排序优先级
     */
    addInputSetting(h3: string, text: string, callback: (el: HTMLInputElement, ev: Event) => void, id?: string, priority?: number): void,
    /**
     * 一种快速生成配置项的预设，结构是一个 h3 加一个勾选框 input
     * @param h3 配置项标题
     * @param text 默认配置
     * @param callback input触发click事件的回调函数，参数：ck: 勾选与否, ev: 事件
     * @param id 配置项的id，不填则默认为h3
     * @param priority 配置项排序优先级
     */
    addCheckSetting(h3: string, checked: boolean, callback: (ck: boolean, ev: Event) => void, id?: string, priority?: number): void,
    /**
     * 一种快速生成配置项的预设，结构是一个 h3 加一个滑动条 input
     * @param h3 配置项标题
     * @param value 默认值
     * @param range [最小值,最大值,步长]或{min:最小值,max:最大值,step:步长}
     * @param callback input触发change事件的回调函数，参数：vl: 数字, ev: 事件
     * @param id 配置项的id，不填则默认为h3
     * @param priority 配置项排序优先级
     */
    addRangeSetting(h3: string, value: number, range: [number, number, number] | { max: number, min: number, step: number },
        callback: (vl: number, ev: Event) => void, id?: string, priority?: number): void,
    /**
     * 删除配置项
     * @param id 配置项的名字
     */
    delSetting(id: string): void,
    /**根据优先级整理配置项 */
    sortSetting(): void,
    /**
     * 更改配置项的&lt;h3>标签
     * @param id 元素的名字
     * @param html 替换h3标签里面的HTML
     */
    changeSettingH3(id: string, html: string): void,
    /**
     * 输入一个元素或一段文字，在左侧栏底部添加新的链接按钮
     * @param a 一个HTMLElement，或者一段文字（如果是一段文字，那么callback参数生效）
     * @param callback 点击后执行的回调函数或点击前往的链接
     */
    addSideBarLink(a: HTMLElement | string, callback?: (ev: MouseEvent) => void | string): void,
    /**更新背景 */
    updateBackground(): void,
    /**更新主题颜色 */
    updateThemeColor(): string,
}
/**saltMCBBSCSS接口 */
interface saltMCBBScss {
    /**
     * 将css代码存入内存，成功则返回true
     * @param css css代码
     * @param key css标记
     */
    setStyle(css: string, key: string): boolean,
    /**
     * 返回内存中的css代码，没找到则返回空字符串
     * @param key css标记
     */
    getStyle(key: string): string,
    /**
     * 启用css
     * 
     * 有代码无标记：创建style直接放代码
     * 
     * 有标记无代码：寻找内存中的css代码
     * 
     * 有代码有标记：更新已有style或创建style，同时更新内存中的css代码
     * 
     * @param css css代码
     * @param key css标记
     */
    putStyle(css?: string, key?: string): boolean,
    /**
     * 根据key删除对应的style
     * @param key css标记
     */
    delStyle(key: string): boolean,
    /**
     * 根据key替换已有的style, 替换成功返回true, 非法输入/没有此元素返回false
     * @param css css代码
     * @param key css标记
     */
    replaceStyle(css: string, key: string): boolean,
    /**根据key获取style元素, 没找到的话返回null */
    getStyleElement(key: string): Element | null,
    /**根据key对指定元素设置属性 */
    setStyleElement(key: string, el: Element): boolean,
}
/**saltMCBBSDataBaseHandler 类接口 */
interface saltMCBBSDataBaseHandler {
    new(database: string, mainStoreName?: string, prefix?: string): saltMCBBSDataBaseHandlerInstance
}
/**saltMCBBSDataBaseHandler 实例 */
interface saltMCBBSDataBaseHandlerInstance {
    /**数据库 */
    // db: IDBDatabase, // 万分不推荐去读取这个，用getStore()
    /**是否处于可交互状态 */
    readable: boolean,
    prefix: string,
    /**
     * 判断是否存在记录，不存在或者undefined或者出错均会返回false
     * @param key 键
     */
    has(key: string): Promise<boolean>,
    /**
     * 读取
     * @param key 键
     * @param defaultValue 默认值
     */
    read<T>(key: string, defaultValue: T): Promise<T>,
    /**
     * 写入或覆盖
     * @param key 键
     * @param value 值
     */
    write<T>(key: string, value: T): Promise<void>,
    /**
     * 删除一条记录
     * @param key 键
     */
    delete(key: string): Promise<void>,
    /**获取数据库里所有的记录 */
    readAll<T>(): Promise<{ mainKey: string; value: T; }[]>,
    /**获取数据库里所有的值 */
    readAllValue<T>(): Promise<T[]>,
    /**获取数据库里所有的键 */
    readAllKey(): Promise<string[]>,
    /**等待数据库准备完毕 */
    waitForReady(): Promise<void>,
    /**获取store
     * 
     * store存活时间很短，请立即使用
     */
    getStore(): IDBObjectStore,
}
/**saltMCBBScss里面存放的样式记录 */
interface styleMap {
    [index: string]: string,
}
/**fetchUID的回调函数 */
interface fetchUIDcallback {
    (data: BBSAPIResponceData): void
}
/**fetchTID的回调函数 */
interface fetchTIDcallback {
    (data: TIDAPIResponceData): void
}
