/// <reference path="misc.d.ts"/>
/**saltMCBBSOriginClass接口 */
interface saltMCBBSOriginClass {
    new(): saltMCBBSOriginClassNew
}
interface saltMCBBSOriginClassNew {
    /**
     * 根据选择器遍历元素
     * @param selector 字符串，选择器
     * @param callback 回调函数(index: number, el: Element): void
     */
    saltQuery(selector: string, callback: (index: number, el: Element) => void)
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
    write(key: string, value: any),
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
     * 断言
     * @param condition 为假时报错
     * @param msg 报错语句，默认为“发生错误”
     */
    assert(condition: any, msg?: string): void,
    /**
     * 带前缀打印
     * @param msg 要打印的内容
     */
    log(msg: any): void,
    /**
     * sleep 返回一个延迟一定ms的promise
     * @param time 单位毫秒
     */
    sleep(time: number)
}
/**saltMCBBS接口 */
interface saltMCBBS extends saltMCBBSOriginClassNew {
    /**
     * 夜间模式
     * @param night boolean切换为夜晚还是白天；
     * @param log 是否记录进本地存储
     *  */
    nightStyle(night: boolean, log: boolean): void,
    /**转换夜间模式 */
    toggleNightStyle(): void,
    /**显示设置面板 */
    showSettingPanel(): void,
    /**隐藏设置面板 */
    hideSettingPanel(): void,
    /**
     * 添加配置项
     * @param div 一个元素，里面的东西自己写
     * @param id 元素的名字，删除的时候用
     */
    addSetting(div: Element, id?: string): void,
    /**
     * 一种快速生成配置项的预设，结构是一个 h3 加一个 textarea
     * @param h3 配置项标题(可以是HTML代码)
     * @param textarea 默认配置
     * @param callback textarea触发change事件的回调函数，参数：el: textarea元素, ev: 事件
     * @param id 配置项的id，不填则默认为h3
     */
    addTextareaSetting(h3: string, textarea: string, callback: (el: HTMLTextAreaElement, ev: Event) => void, id?: string): void,
    /**
     * 一种快速生成配置项的预设，结构是一个 h3 加一个 input
     * @param h3 配置项标题(可以是HTML代码)
     * @param text 默认配置
     * @param callback input触发change事件的回调函数，参数：el: textarea元素, ev: 事件
     * @param id 配置项的id，不填则默认为h3
     */
    addInputSetting(h3: string, text: string, callback: (el: HTMLInputElement, ev: Event) => void, id?: string): void,
    /**
     * 一种快速生成配置项的预设，结构是一个 h3 加一个勾选框 input
     * @param h3 配置项标题
     * @param text 默认配置
     * @param callback input触发click事件的回调函数，参数：ck: 勾选与否, ev: 事件
     * @param id 配置项的id，不填则默认为h3
     */
    addCheckSetting(h3: string, checked: boolean, callback: (ck: boolean, ev: Event) => void, id?: string): void,
    /**
     * 一种快速生成配置项的预设，结构是一个 h3 加一个滑动条 input
     * @param h3 配置项标题
     * @param value 默认值
     * @param range [最小值,最大值,步长]或{min:最小值,max:最大值,step:步长}
     * @param callback input触发change事件的回调函数，参数：vl: 数字, ev: 事件
     * @param id 配置项的id，不填则默认为h3
     */
    addRangeSetting(h3: string, value: number, range: [number, number, number] | { max: number, min: number, step: number },
        callback: (vl: number, ev: Event) => void, id?: string),
    /**
     * 删除配置项
     * @param id 配置项的名字
     */
    delSetting(id: string): void,
    /**
     * 更改配置项的&lt;h3>标签
     * @param id 元素的名字
     * @param html 替换h3标签里面的HTML
     */
    changeSettingH3(id: string, html: string),
    /**
     * 输入一个元素或一段文字，在左侧栏底部添加新的链接按钮
     * @param a 一个HTMLElement，或者一段文字（如果是一段文字，那么callback参数生效）
     * @param callback 点击后执行的回调函数或点击前往的链接
     */
    addSideBarLink(a: HTMLElement | string, callback?: (ev: MouseEvent) => void | string): void,
    /**更新背景 */
    updateBackground(): void,
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
