// 咳咳，我把四个类写一起是因为VSCODE有代码折叠，大家不要学我
/* 
设置面板

顶栏移动到页面左侧 5

// 升级HTTP请求 8 <- 废案

显示MCBBS的LOGO 10
显示右上角广告栏 11

冲突修复功能 21
左侧用户信息跟随 22
回到顶部按钮动画 23
代码栏样式优化 24
帖子分类高亮 25

反嗅探措施 31
处理探针后是否通知 32
水帖检测机制 41
帖子分类高亮 43
另一种图片懒加载 45
启用反反盗链功能 46
懒加载时启用代理 47

启用勋章栏功能 50
勋章大图高斯模糊 51
勋章栏高度 52

举报记录功能 61 数字记录在本地/pid记录在数据库

签名栏高度控制 62

自定义评分理由 201
自定义举报理由 202
昼间模式下的背景图片 210
夜间模式下的背景图片 211
主体部分的透明度 212

自定义水帖匹配正则 220 数据库

打算实装的功能
控制台功能
*/
(function () {
    /**版本 */
    const myversion = '0.1.8'
    // /**历史 */
    // const myhistory = ``
    /**前缀 */
    const myprefix = '[SaltMCBBS]'
    /**勋章文件地址前缀 */
    const medalLinkPrefix = 'https://www.mcbbs.net/static/image/common/'
    // /**占位用的，一个字符 */
    // const placeholderSpan = '<span style="color:transparent;display:inline">无</span>'
    // /**占位用的，两个字符 */
    // const placeholderSpan2 = '<span style="color:transparent;display:inline">空白</span>'
    /**消息提醒的图标 */
    const noticimgurl = [
        'https://s3.ax1x.com/2020/11/28/DynR1S.png',
        'https://s3.ax1x.com/2020/11/28/DynW6g.png',
        'https://s3.ax1x.com/2020/11/28/DynfXQ.png',
        'https://s3.ax1x.com/2020/11/28/Dyn2p8.png',
        'https://s3.ax1x.com/2020/11/28/Dyn4mj.png',
        'https://s3.ax1x.com/2020/11/28/Dyn50s.png',
        'https://s3.ax1x.com/2020/11/28/Dyncff.png',
    ]
    /**技术性前缀, 防止变量名冲突 */
    const techprefix = 'saltMCBBS-'
    /**安全锁 */
    let autoRunLock = true
    /**配置项优先级操作 */
    let myPriority = 0
    /**数据库处理 */
    let dbHandler: saltMCBBSDataBaseHandlerInstance
    /**反水帖小工具判定正则 */
    const antiWaterRegExp = [
        // 表情包会被处理成'/meme/'的文字形式
        /^[\s\S]{0,2}([\.\*\s]|\/meme\/)*(\S|\/meme\/)\s*(\2([\.\*\s]|\/meme\/)*)*([\.\*\s]|\/meme\/)*[\s\S]?\s?$/, // 刷同一个字/表情包
        /^[\s\S]{0,3}(请?让?我是?来?|可以)?.{0,3}([水氵]{3}|[水氵][一二两亿]?[帖贴下]+|完成每?日?一?水?帖?贴?的?任务)[\s\S]{0,3}$/, // "水水水"、"完成任务"之类的无意义回帖
    ]
    const randomStringGen = [
        'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'.split(''),
        'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0123456789'.split('')
    ]
    /**原始类，包含各种基础方法*/
    class saltMCBBSOriginClass implements saltMCBBSOriginClass {
        messagePanel: HTMLElement = document.querySelector('#messagePanel') ?? document.createElement('div') // 右侧消息框
        consolePanel: HTMLElement = document.querySelector('#consolePanel') ?? document.createElement('div') // 右侧消息框
        constructor() {
            // 初始化消息框和控制台
            let mg = this.messagePanel
            if (!(mg.hasAttribute('id'))) {
                mg.id = 'messagePanel'
                mg.className = 'messagePanel'
                document.body.append(mg)
            }
            let cc = this.consolePanel
            if (!(cc.hasAttribute('id'))) {
                cc.id = 'consolePanel'
                cc.className = 'consolePanel'
                // document.body.append(cc)
            }
        }
        resolveMemePack(s: string): MemePack {
            let getAuthor = /[\"\'](?:表情包?|(?:meme)?packe?t?)?(?:author|原?作者)[\"\']\s*[\:\,\;：，；]\s*[\"\'](.*?)[\"\']/ig.exec(s)
            let getVersion = /[\"\'](?:表情包?|(?:meme)?packe?t?)?(?:ver(?:sion)?|版本号?)[\"\']\s*[\:\,\;：，；]\s*(?:[\"\'](.*?)[\"\']|(\d+))/ig.exec(s)
            let getName = /[\"\'](?:表情包?|(?:meme)?packe?t?)?(?:name|名[字称]?)[\"\']\s*[\:\,\;：，；]\s*[\"\'](.*?)[\"\']/ig.exec(s)
            let getOther = /[\"\'](?:表情包?|(?:meme)?packe?t?)?(?:备注|其他|说明)[\"\']\s*[\:\,\;：，；]\s*[\"\'](.*?)[\"\']/ig.exec(s)
            let obj: MemePack = {
                name: getName ? getName[1] : '未知名称',
                memes: this.formatMeme(s)
            }
            if (getAuthor) obj.author = getAuthor[1]
            if (getVersion) obj.version = getVersion[1] ?? getVersion[2]
            if (getOther) obj.others = getOther[1]
            return obj
        }
        /**获取字符串中所有表情 */
        formatMeme(s: string): Meme[] {
            let r = /\!?\[(.*?)\]\s*\((.*?)\)/g
            let m = [], temp
            while ((temp = r.exec(s)) != null)
                m.push({ name: temp[1], url: temp[2] })
            return m
        }
        /**筛除数组中的重复元素 */
        unique<T>(arr: T[]): T[] {
            // if (!Array.isArray(arr)) {
            //     console.log('type error!')
            //     return arr
            // }
            this.assert(Array.isArray(arr))
            let array: T[] = [];
            for (var i = 0; i < arr.length; i++) {
                if (array.indexOf(arr[i]) == -1) {
                    array.push(arr[i]);
                }
            }
            return array
        }
        /**随机生成字母数字组合, 可以用于id */
        randomID(len = 16): string {
            let s = this.randomChoice(randomStringGen[0])
            for (let i = 1; i < len; i++)
                s += this.randomChoice(randomStringGen[1])
            if (document.getElementById(s)) // 不与现成的id冲突
                return this.randomID(len)
            else
                return s
        }
        /**相当于setInterval, 不过第二个参数是秒 */
        tick(handler: Function, second = 1) {
            this.assert(second > 0, '时间间隔不能小于0!')
            return setInterval(handler, Math.round(second * 1000))
        }
        /**相当于clearInterval */
        clearTick(handlerNum: number) {
            clearInterval(handlerNum)
        }
        /**获取当前时间戳 */
        getTime() {
            return (new Date()).getTime()
        }
        getData(key: 'antiWaterRegExp'): RegExp[];
        getData(key: 'noticImgUrl'): String[];
        getData(key: 'medalLinkPrefix'): String;
        getData(key: 'randomStringGen'): String[][];
        /**
         * 获取一些由于闭包而不能直接访问的数据
         * @param key 默认返回空字符串
         */
        getData(key: string): any {
            let temp: any // 做一下简单的隔离
            switch (key) {
                case 'antiWaterRegExp': return antiWaterRegExp
                case 'noticImgUrl': return noticimgurl
                case 'medalLinkPrefix': return medalLinkPrefix
                case 'randomStringGen': return randomStringGen
                default: temp = ''
            }
            return temp
        }
        /**
         * 将页面平滑地滚动到某个位置
         * @param targetY 目标高度
         * @param step 每一步 20ms, 默认25步, 即 500ms
         */
        scrollTo(targetY = 0, steps = 25) {
            // 目标位置
            if (targetY < 0) { targetY = 0 }
            if (targetY > document.body.offsetHeight - 200) { targetY = document.body.offsetHeight - 200 }
            // 计算步长
            var step = (targetY - document.documentElement.scrollTop) / steps; // 50步
            // 滚动文档
            let safe = 0; // 安全锁
            let timer = setInterval(() => {
                var diff = Math.abs(targetY - document.documentElement.scrollTop);
                if (diff > Math.abs(step)) {
                    document.documentElement.scrollTop += step;
                    safe += 1
                } else {
                    document.documentElement.scrollTop = targetY;
                    clearInterval(timer);
                }
                if (safe > steps + 5) {
                    document.documentElement.scrollTop = targetY;
                    clearInterval(timer);
                }
            }, 20);
        }
        /**
         * 在文档加载完毕之后执行代码，类似于jQuery的$(function)
         * @param callback 要执行的代码
         */
        docReady(callback: () => void) {
            if (document.readyState != 'loading') {
                callback()
            } else {
                document.addEventListener('readystatechange', () => {
                    if (document.readyState == 'interactive') {
                        callback()
                    }
                })
            }
        }
        /**
         * 在文档即将加载完毕时执行代码，执行时间可能早于jQuery的$(function)
         * @param callback 要执行的代码
         */
        async docNearlyReady(callback: () => void) {
            if (document.readyState != 'loading') {
                callback()
            } else {
                while (!document.getElementById('ft')
                    && !document.body.querySelector('.mc_map_border_foot')
                    && document.readyState == 'loading')
                    await this.sleep(5)
                callback()
            }
        }
        /**
         * 根据选择器遍历元素
         * @param selector 字符串，选择器
         * @param callback 回调函数(index: number, el: Element): void
         */
        saltQuery(selector: string, callback: (index: number, el: Element) => void) {
            let elems = document.querySelectorAll(selector)
            for (let i = 0; i < elems.length; i++) {
                callback(i, elems[i])
            }
        }
        /**
         * 封装了MutationObserver的少许操作，自动开始监视
         * @param id 要监听的元素ID(字符串)或一个元素(Element)
         * @param callback 回调函数
         * @returns 成果则返回一个已经开始监听的MutationObserver对象，否则返回null
         */
        saltObserver(id: string | Element, callback: MutationCallback, watchAttr: boolean = false, watchChildList: boolean = true): MutationObserver | null {
            if (!watchAttr && !watchChildList) { return null }
            let targetNode: Element | null = null
            if (typeof id == 'string') {
                targetNode = document.getElementById(id)
            } else if (id instanceof Element) {
                targetNode = id
            }
            if (!targetNode) { return null }
            let x = new MutationObserver(callback)
            let json: MutationObserverInit = { attributes: watchAttr, childList: watchChildList, subtree: true, }
            x.observe(targetNode, json)
            return x
        }
        /**
         * 根据key存入本地存储
         * @param key 键值
         * @param value 要存放的值
         */
        write(key: string, value: any) {
            if (value) {
                value = JSON.stringify(value);
            }
            localStorage.setItem(techprefix + key, value);
        }
        /**
         * 根据key读取本地数据
         * @param key 键值
         */
        read<T>(key: string): T {
            let value: string | null = localStorage.getItem(techprefix + key);
            if (value && value != "undefined" && value != "null") {
                return <T>JSON.parse(value);
            }
            return <T><unknown>null;
        }
        /**
         * 根据key读取本地数据，若没有则写入默认数据
         * @param key 键值
         */
        readWithDefault<T>(key: string, defaultValue: T): T {
            let value: string | null = localStorage.getItem(techprefix + key);
            if (value && value != "undefined" && value != "null") {
                let temp = <T>JSON.parse(value)
                if (typeof defaultValue == 'boolean' && typeof temp == 'string') { // 防坑措施
                    // @ts-ignore
                    if (temp == 'true') { temp = true } else { temp = false }
                }
                return temp;
            }
            this.write(key, defaultValue)
            return defaultValue;
        }
        randomChoice<T>(arr: T[]): T {
            if (arr.length < 1) {
                return <T><unknown>null
            }
            return arr[Math.floor(Math.random() * arr.length)]
        }
        /**
         * 将字符串分割成字符串数组，去掉空项与每一项的两侧空格
         * @param str 要分割的字符串
         * @param spliter 按什么划分，默认按换行划分
         */
        formatToStringArray(str: string, spliter: string = '\n'): string[] {
            let arr: string[] = []
            let temparr = str.split(spliter)
            for (let x of temparr) {
                let s = this.Trim(x)
                if (s.length > 0) {
                    arr.push(s)
                }
            }
            return arr
        }
        /**
         * 去除字符串数组中匹配的字符串
         * @param arr 要处理的字符串
         * @param test 用于测试的正则表达式
         */
        cleanStringArray(arr: string[], test: RegExp = /^\/\//): string[] {
            let fin = []
            for (let s of arr) {
                if (!(test.test(s)))
                    fin.push(s)
            }
            return fin
        }
        /**删除字符串两侧的空格 */
        Trim(x: string) {
            return x.replace(/^\s+|\s+$/gm, '');
        }
        /**将格式正确的obj变成a元素 */
        obj2a(obj: AnchorObj[], targetDefault = '_self'): HTMLAnchorElement[] {
            let as: HTMLAnchorElement[] = []
            if (['_self', '_parent', '_blank', '_top'].indexOf(targetDefault) != -1) {
                targetDefault = '_self'
            }
            for (let x of obj) {
                let a = document.createElement('a')
                a.href = x.url
                if (typeof x.img == 'string' && x.img.length > 2) {
                    a.innerHTML = `<img src="${x.img}">`
                }
                a.innerHTML += x.text
                if (typeof x.target == 'string' && ['_self', '_parent', '_blank', '_top'].indexOf(x.target) != -1) {
                    a.target = x.target
                } else {
                    a.target = targetDefault
                }
                if (typeof x.class == 'string' && x.class.length > 0) {
                    a.className = x.class
                }
                if (typeof x.title == 'string' && x.title.length > 0) {
                    a.title = x.title
                }
                as.push(a)
            }
            return as
        }
        /**批量添加子节点 */
        addChildren(parent: Element, children: NodeListOf<Element> | Element[]) {
            for (let i = 0; i < children.length; i++) {
                parent.appendChild(children[i])
            }
        }
        /**
         * 根据UID获取信息
         * @param uid 用户的UID
         * @param callback 回调函数
         * @param retry 失败后重试次数
         * @param retryTime 重试时间间隔
         */
        fetchUID(uid: number | string, callback: fetchUIDcallback, retry = 2, retryTime = 1500) {
            // this.log(uid)
            if (typeof uid == 'string') { uid = parseInt(uid) }
            if (uid < 1 || isNaN(uid)) { return } // 为零则说明没有登录
            let obj = this
            fetch('https://www.mcbbs.net/api/mobile/index.php?module=profile&uid=' + uid)
                .then(response => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        return Promise.reject(Object.assign({}, response.json(), {
                            status: response.status,
                            statusText: response.statusText
                        }))
                    }
                })
                .then((data) => { callback(data) })
                .catch((error) => {
                    console.log(error)
                    if (retry > 0) { setTimeout(() => { obj.fetchUID(uid, callback, retry - 1, retryTime) }, retryTime); }
                });
        }
        /**
         * 根据TID获取帖子信息
         * @param tid 帖子的TID
         * @param callback 回调函数
         * @param page 页码，每页5楼
         * @param retry 重试次数
         * @param retryTime 重试时间间隔
         */
        fetchTID(tid: number | string, callback: fetchTIDcallback, page = 1, retry = 2, retryTime = 1500) {
            if (typeof tid == 'string') { tid = parseInt(tid) }
            if (tid < 1 || isNaN(tid)) { return } // 为零则说明没有帖子
            let obj = this
            fetch('https://www.mcbbs.net/api/mobile/index.php?version=4&module=viewthread&tid=' + tid + '&page=' + page)
                .then(response => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        return Promise.reject(Object.assign({}, response.json(), {
                            status: response.status,
                            statusText: response.statusText
                        }))
                    }
                })
                .then((data) => { callback(data) })
                .catch((error) => {
                    if (retry > 0) { setTimeout(() => { obj.fetchTID(tid, callback, page, retry - 1, retryTime) }, retryTime); }
                });
        }
        /**获取当前用户的UID，没有则返回0*/
        getUID() {
            return typeof window.discuz_uid ? parseInt(window.discuz_uid) : 0
        }
        /**获取当前页面的TID，没有则返回0*/
        getTID() {
            return parseInt((window.tid ? window.tid + '' : null) ?? (window.location.href.match(/thread-([\d]+)/) ?? window.location.href.match(/tid\=([\d]+)/) ?? ['0', '0'])[1])
        }
        /**
         * 在屏幕右下角输出提示信息
         * @param info 要显示的信息, HTML
         * @param callback 点击后的回调函数, 如果用户点击关闭则不会触发, 回调函数可以接受一个销毁这个消息的函数作为参数
         * @param type 类型 0-默认 1-信息(其实就是默认) 2-成功 3-警告 4-出错 默认为0
         */
        message(html: string, callback?: (() => void) | ((removeDiv: () => void) => void), type: number = 0) {
            let div = document.createElement('div')
            div.innerHTML = html
            div.className = switchType(type)
            div.addEventListener('click', () => {
                if (callback)
                    callback(removeDiv)
            })
            // 添加关闭按钮
            let close = document.createElement('div')
            close.className = 'close-button'
            close.addEventListener('click', function (this, ev) {
                ev.stopPropagation()
                removeDiv()
            })
            div.appendChild(close)
            // 输出信息
            this.messagePanel.appendChild(div)
            function removeDiv() {
                div.remove()
            }
            /**根据type返回类名 */
            function switchType(type: number) {
                switch (type) {
                    case 1:
                        return 'info'
                    case 2:
                        return 'success'
                    case 3:
                        return 'warn'
                    case 4:
                        return 'error'
                    default:
                        return 'normal'
                }
            }
        }
        /**
         * 断言
         * @param condition 为假时报错
         * @param msg 报错语句，默认为“发生错误”
         */
        assert(condition: any, msg: string = '发生错误'): asserts condition {
            if (!condition) throw new Error(myprefix + ': ' + msg)
        }
        /**
         * 带前缀打印
         * @param msg 要打印的内容
         */
        log(msg: any) {
            let t = typeof msg
            let p = myprefix + ': '
            if (t == 'boolean' || t == 'number' || t == 'string') { console.log(p + msg) }
            else if (t == 'object') { console.log(p, msg) }
            else if (msg instanceof Array) { console.log(p + '[' + msg.join(', ') + ']') }
            else if (t == 'undefined') { console.log(p + 'undefined') }
            else { console.log(p); console.log(msg) }
        }
        // /**history: 显示更新历史*/
        // history() {
        //     console.log('%c ' + myprefix + ' %c 开源地址: https://github.com/Salt-lovely/saltMCBBS ', 'background-color:Wheat;color:Sienna;font-size:1rem;font-weight:bold;padding:4px;', 'font-size:1rem')
        // }
        /**version: 显示版本*/
        version() {
            console.log('%c ' + myprefix + ' %c ' + myversion + ' 开源地址: https://github.com/Salt-lovely/saltMCBBS ', 'background-color:Wheat;color:Sienna;font-size:1rem;font-weight:bold;padding:4px;', 'font-size:1rem')
        }
        /**
         * sleep 返回一个延迟一定ms的promise
         * @param time 单位毫秒
        */
        sleep(time: number) {
            return new Promise((resolve) => setTimeout(resolve, time));
        }
    }
    // 继承原始类
    class saltMCBBS extends saltMCBBSOriginClass implements saltMCBBS {
        settingPanel: HTMLElement = document.createElement('div') // 配置框
        links: HTMLElement = document.createElement('div') // 左侧栏底部的一大堆链接
        moveTopBarToLeft: boolean = this.readWithDefault<boolean>('SaltMoveTopBarToLeft', true)
        dataBaseHandler: saltMCBBSDataBaseHandlerInstance = dbHandler // 数据库读写代理
        // ==========================================================
        // ========== 以下直到另一个分割线之前, 都是内部代码 ==========
        // ==========================================================
        constructor(autorun = false) {
            super()
            if (!autorun) { return }
            window.saltMCBBSCSS.setStyle( // 主要更改
                `body{background-attachment:fixed}body>div[style]:not([id]):not([class]){float:left}body:hover>.mc_map_wp{transition-delay:0s}body>.mc_map_wp{padding-top:0;margin-top:0;overflow:visible;display:inline-block;margin-left:calc(50% - 565px);transition:0.3s ease;transition-delay:0.5s}body>.mc_map_wp:hover{transition-delay:0s}body>.mc_map_wp>.new_wp{padding-top:0 !important;padding-bottom:0 !important}body>.mc_map_wp>.new_wp h2 img{max-height:74px}.pmwarn{width:auto !important;background-size:16px !important}ul.xl.xl2.o.cl .pmwarn{background:url(template/mcbbs/image/warning.gif) no-repeat 0px 2px}#uhd>.mn>ul .pmwarn a{background:url(template/mcbbs/image/warning.gif) no-repeat 0px 2px !important;background-size:16px !important}.warned{opacity:0.2;transition:0.3s ease}.warned:hover{opacity:0.9}.reported{position:relative}.reported::after{content:"已举报";top:57px;left:400px;font-size:3rem;font-weight:bold;color:#c32;position:absolute;opacity:0.5;pointer-events:none}.reported.warned::after{content:"已制裁";color:#2c4}.consolePanel{width:50vw;min-width:360px;left:25vw;max-height:80vh;top:10vh;position:fixed;background-color:#fbf2db;background-clip:padding-box;padding:0 8px 8px 8px;border:8px solid;border-radius:8px;border-color:rgba(0,0,0,0.2);box-sizing:border-box;overflow-y:auto;transition:0.3s ease, opacity 0.2s ease;z-index:999999;scrollbar-width:thin;scrollbar-color:#999 #eee}.consolePanel::-webkit-scrollbar{width:4px;height:4px}.consolePanel::-webkit-scrollbar-thumb{border-radius:4px;box-shadow:inset 0 0 4px rgba(102,102,102,0.25);background:#999}.consolePanel::-webkit-scrollbar-track{box-shadow:inset 0 0 4px rgba(187,187,187,0.25);border-radius:4px;background:#eee}.consolePanel.visible{opacity:1;left:25vw}.consolePanel.hidden{opacity:0;left:-90vw;transition-timing-function:ease-in}.consolePanel>div{margin:42px 0 5px 0;min-height:10vh;max-height:calc(80vh - 6rem - 46px);scrollbar-width:thin;scrollbar-color:#999 #eee}.consolePanel>div::-webkit-scrollbar{width:4px;height:4px}.consolePanel>div::-webkit-scrollbar-thumb{border-radius:4px;box-shadow:inset 0 0 4px rgba(102,102,102,0.25);background:#999}.consolePanel>div::-webkit-scrollbar-track{box-shadow:inset 0 0 4px rgba(187,187,187,0.25);border-radius:4px;background:#eee}.consolePanel>textarea{resize:vertical;font-size:1rem;line-height:1.2rem;height:2.4rem;min-height:1.2rem;max-height:24rem;width:calc(100% - 8px);border:none;border-width:0;scrollbar-width:thin;scrollbar-color:#999 #eee}.consolePanel>textarea::-webkit-scrollbar{width:8px;height:8px}.consolePanel>textarea::-webkit-scrollbar-thumb{border-radius:8px;box-shadow:inset 0 0 4px rgba(102,102,102,0.25);background:#999}.consolePanel>textarea::-webkit-scrollbar-track{box-shadow:inset 0 0 4px rgba(187,187,187,0.25);border-radius:8px;background:#eee}.settingPanel{width:50vw;min-width:360px;left:25vw;max-height:80vh;top:10vh;position:fixed;background-color:#fbf2db;background-clip:padding-box;padding:0 8px 8px 8px;border:8px solid;border-radius:8px;border-color:rgba(0,0,0,0.2);box-sizing:border-box;overflow-y:auto;transition:0.3s ease, opacity 0.2s ease;z-index:999999;scrollbar-width:thin;scrollbar-color:#999 #eee}.settingPanel::-webkit-scrollbar{width:4px;height:4px}.settingPanel::-webkit-scrollbar-thumb{border-radius:4px;box-shadow:inset 0 0 4px rgba(102,102,102,0.25);background:#999}.settingPanel::-webkit-scrollbar-track{box-shadow:inset 0 0 4px rgba(187,187,187,0.25);border-radius:4px;background:#eee}.settingPanel.visible{opacity:1;top:10vh}.settingPanel.hidden{opacity:0;top:-90vh;transition-timing-function:ease-in}.settingPanel>*{width:100%;box-sizing:border-box;margin-bottom:8px;float:left}.settingPanel>*:first-child{background-color:#fbf2db;position:sticky;top:0;z-index:99}.settingPanel .flb span>a{color:#3a74ad}.settingPanel .flb span>a:hover{color:#6cf}.settingPanel h3{font-size:0.875rem}.settingPanel h3 small{font-size:0.75rem;color:grey}.settingPanel h3.half-h3{width:calc(50% - 14px);padding:0 10px 0 0;float:left;text-align:right}.settingPanel textarea{resize:vertical;line-height:1.2em;height:3.6em;min-height:2.4em;max-height:24em;width:calc(100% - 8px);border:none;border-width:0;scrollbar-width:thin;scrollbar-color:#999 #eee}.settingPanel textarea::-webkit-scrollbar{width:8px;height:8px}.settingPanel textarea::-webkit-scrollbar-thumb{border-radius:8px;box-shadow:inset 0 0 4px rgba(102,102,102,0.25);background:#999}.settingPanel textarea::-webkit-scrollbar-track{box-shadow:inset 0 0 4px rgba(187,187,187,0.25);border-radius:8px;background:#eee}.settingPanel input{width:calc(50% - 4px);float:left;text-align:center}.settingPanel input[type="range"]{width:calc(100% - 8px)}.settingPanel input[type="checkbox"]{display:none}.messagePanel{position:fixed;width:calc(15rem + 16px);padding:8px;max-height:100vh;bottom:0;right:0;font-size:1rem;color:#000000;box-sizing:content-box}.messagePanel>div{width:100%;min-height:16px;bottom:0;padding:8px;margin:4px 0;border-radius:4px;opacity:0.75;box-sizing:border-box;float:left;transition:0.3s ease;position:relative;z-index:99999}.messagePanel>div.normal{background-color:#efefef}.messagePanel>div.info{background-color:#b7d9ff}.messagePanel>div.warn{background-color:#fff8b7}.messagePanel>div.success{background-color:#b7ffbb}.messagePanel>div.error{background-color:#ffc2b7}.messagePanel>div:hover{opacity:1}.messagePanel>div>.close-button{width:16px;height:16px;top:0;right:0;position:absolute;transition:0.3s ease;transform-origin:50% 50%}.messagePanel>div>.close-button::after{content:"×";font-size:16px;line-height:16px;color:#000000}.messagePanel>div>.close-button:hover{transform:scale(1.2)}input[type="checkbox"]+label.checkbox{position:relative;width:48px;height:24px;margin-left:calc(25% - 24px);background:#999;float:left;border-radius:12px;cursor:pointer;transition:background 0.3s;z-index:1}input[type="checkbox"]+label.checkbox[disabled]{cursor:not-allowed;opacity:0.75}input[type="checkbox"]+label.checkbox::before,input[type="checkbox"]+label.checkbox::after{transition:0.3s ease;position:absolute}input[type="checkbox"]+label.checkbox::before{content:"关";top:2px;left:28px;color:#fff;line-height:20px}input[type="checkbox"]+label.checkbox::after{content:"";top:2px;left:2px;width:20px;height:20px;border-radius:10px;background:#fff}input[type="checkbox"]:checked+label.checkbox{background-color:var(--MExtBtnClr, #e91e63)}input[type="checkbox"]:checked+label.checkbox::before{content:"开";left:8px}input[type="checkbox"]:checked+label.checkbox::after{left:26px}input[type="checkbox"]:active+label.checkbox::after{width:28px}input[type="checkbox"]:checked:active+label.checkbox::after{left:18px}textarea.pt{line-height:1.25em;resize:vertical;min-height:5em;max-height:56.25em;scrollbar-width:thin;scrollbar-color:#999 #eee}textarea.pt::-webkit-scrollbar{width:8px;height:8px}textarea.pt::-webkit-scrollbar-thumb{border-radius:8px;box-shadow:inset 0 0 4px rgba(102,102,102,0.25);background:#999}textarea.pt::-webkit-scrollbar-track{box-shadow:inset 0 0 4px rgba(187,187,187,0.25);border-radius:8px;background:#eee}#ct .mn .bm .tdats .alt.h th{padding-top:0;padding-bottom:0;border-top:0;border-bottom:0}#ct .mn .bm .tdats .tb{margin-top:0}.plhin .sign{scrollbar-width:thin;scrollbar-color:#999 #eee}.plhin .sign::-webkit-scrollbar{width:4px;height:4px}.plhin .sign::-webkit-scrollbar-thumb{border-radius:4px;box-shadow:inset 0 0 4px rgba(102,102,102,0.25);background:#999}.plhin .sign::-webkit-scrollbar-track{box-shadow:inset 0 0 4px rgba(187,187,187,0.25);border-radius:4px;background:#eee}.linksStillOnTopBar{width:100%;text-align:center}.linksStillOnTopBar>a{display:inline-block;width:90%;padding:4px 6px;border-radius:4px}.linksStillOnTopBar>a:hover{background:var(--MExtBtnClr, #e91e63);color:white}#toptb{transition:opacity 0.3s ease}
`
                , 'main'
            )
            window.saltMCBBSCSS.setStyle( // movePageHead 所需CSS
                `body.night-style #saltNewPageHead{--saltNewPageHeadbgcolor-l-t:rgba(68,68,68,0.5);--saltNewPageHeadbgcolor-l:#444;--saltNewPageHeadbgcolor:#363636}body.night-style #saltNewPageHead,body.night-style #saltNewPageHead a{color:#f0f0f0}body.night-style #saltNewPageHead a:hover{color:#6cf}body.night-style #saltNewPageHead .y_search,body.night-style #saltNewPageHead #scbar_type_menu{background-image:none;background-color:#444}body.night-style #saltNewPageHead .y_search{outline:none}body.night-style #saltNewPageHead .y_search .y_search_btn button{box-shadow:none;filter:invert(0.8) hue-rotate(170deg)}body.night-style #saltNewPageHead .y_search .y_search_inp{background-color:#555;background-image:none}body.night-style #saltNewPageHead .y_search .y_search_inp input{background-color:#666}body.night-style #saltNewPageHead .y_search .scbar_type_td{background-color:#555;background-image:none}#toptb{display:none}#saltNewPageHead{position:fixed;width:310px;height:100vh;top:0;left:-340px;padding:10px 30px;background-color:var(--saltNewPageHeadbgcolor-l-t, #fdf6e699);color:#111;transition:0.4s ease;transition-delay:0.4s;overflow-x:hidden;opacity:0.35;z-index:999999}#saltNewPageHead:hover{left:0;background-color:var(--saltNewPageHeadbgcolor-l, #fdf6e6);opacity:1;transition:0.4s ease}#saltNewPageHead::after{content:"saltMCBBS脚本，开发语言: Typescript + SCSS";position:absolute;top:90vh;right:0;color:var(--saltNewPageHeadbgcolor, #fbf2dc);z-index:-1}#saltNewPageHead .y_search,#saltNewPageHead .userinfo,#saltNewPageHead .links,#saltNewPageHead .addons{width:100%;margin:0;margin-bottom:0.75rem;overflow:auto;border-bottom:#ccc;font-size:1rem}#saltNewPageHead .y_search{background-color:transparent;outline:1px solid #ccc;overflow-y:hidden}#saltNewPageHead .y_search,#saltNewPageHead .y_search table{width:100%}#saltNewPageHead .y_search .y_search_btn{opacity:0.5}#saltNewPageHead .y_search .y_search_btn:hover{opacity:0.9}#saltNewPageHead .y_search .y_search_inp{width:calc(100% - 42px);background-image:none}#saltNewPageHead .y_search .y_search_inp input{width:calc(100% - 10px)}#saltNewPageHead .y_search .scbar_type_td{width:48px;background-image:none}#saltNewPageHead #scbar_type_menu{top:var(--top, 322px) !important}#saltNewPageHead .userinfo{overflow-x:hidden}#saltNewPageHead .userinfo>div,#saltNewPageHead .userinfo>span{margin-bottom:0.5rem}#saltNewPageHead .userinfo .username{width:100%;height:100px;font-weight:bold;position:relative}#saltNewPageHead .userinfo .username a{top:2px;position:absolute;font-size:1.75rem}#saltNewPageHead .userinfo .username div{top:calc(8px + 2rem);width:10.2em;position:absolute;color:#999}#saltNewPageHead .userinfo .username img{right:7px;top:4px;position:absolute;border-radius:10%;-webkit-filter:drop-shadow(0 3px 4px #222);filter:drop-shadow(0 3px 4px #222)}#saltNewPageHead .userinfo .thread{width:100%;display:flex;font-size:0.875rem;text-align:center}#saltNewPageHead .userinfo .thread span,#saltNewPageHead .userinfo .thread a{width:100%;display:inline-block}#saltNewPageHead .userinfo .progress{width:95%;height:0.75rem;margin-left:auto;margin-right:auto;outline:1px solid #ccc;background-color:var(--saltNewPageHeadbgcolor, #fbf2dc);position:relative;display:block;transition:0.3s ease}#saltNewPageHead .userinfo .progress>span{height:100%;background-color:var(--progresscolor, #6cf);display:block}#saltNewPageHead .userinfo .progress::after{content:attr(tooltip);display:block;width:140%;left:-20%;top:0;position:absolute;font-size:0.7rem;color:transparent;text-align:center;transition:0.3s ease}#saltNewPageHead .userinfo .progress:hover{transform:translateY(0.5rem)}#saltNewPageHead .userinfo .progress:hover::after{top:-1rem;color:inherit}#saltNewPageHead .userinfo .credit{position:relative;font-size:0.875rem}#saltNewPageHead .userinfo .credit span{width:calc(50% - 4px);display:inline-block;height:1.2rem;line-height:1.2rem;padding-left:1rem;position:relative;box-sizing:border-box}#saltNewPageHead .userinfo .credit span img{left:1px;top:2px;position:absolute}#saltNewPageHead .links a{width:100%;height:1.75rem;line-height:1.75rem;display:inline-block;background-color:#fff0;text-align:center;font-size:1rem;border-bottom:1px solid #eee}#saltNewPageHead .links a:hover{background-color:var(--saltNewPageHeadbgcolor, #fbf2dc)}#saltNewPageHead .links a:last-child{border-bottom:none}#saltNewPageHead .links .showmenu{padding-right:0;background-image:none}#saltNewPageHead .addons a{width:calc(50% - 4px);display:inline-block;height:1.6rem;line-height:1.6rem;text-align:center;font-size:1rem;background-color:#fff0;border:1px solid transparent}#saltNewPageHead .addons a:hover{background-color:var(--saltNewPageHeadbgcolor, #fbf2dc);border-color:#efefef}#saltNewPageHead .addons a img{display:inline-block;vertical-align:middle;max-width:1.5rem;max-height:1.5rem;margin-right:0.5rem}
`
                , 'pagehead'
            )
            window.saltMCBBSCSS.setStyle( // 夜间模式样式
                `body.nightS{--bodybg:#2b2b2b;--bodybg-l:#2b2b2b;--bodybg-l-t:rgba(43,43,43,0)}body.nightS input,body.nightS button,body.nightS select,body.nightS textarea{background-color:#3d3d3d;background-image:none;border-color:#837c73;color:#eaeaea}body.nightS{background-color:#1c1c1c !important;background-image:var(--bodyimg-night);color:#eaeaea}body.nightS .mc_map_wp{box-shadow:0 0 20px 1px #000}body.nightS .mc_map_border_right,body.nightS .mc_map_border_left,body.nightS .mc_map_border_top,body.nightS .mc_map_border_foot{background-color:#2b2b2b;background-image:none;color:#eaeaea}body.nightS #body_fixed_bg{opacity:0}body.nightS .fl .forum_index_title,body.nightS .sttl,body.nightS .mn .bm_h{background-color:#3d3d3d;padding-left:16px}body.nightS .p_pop,body.nightS .p_pof,body.nightS .sllt{background-color:#3d3d3d;border-color:#837c73;background-image:none}body.nightS .p_pop a,body.nightS .p_pof a,body.nightS .sllt a{color:#eaeaea}body.nightS .p_pop a:hover,body.nightS .p_pof a:hover,body.nightS .sllt a:hover{color:#6cf;background-color:#837c73}body.nightS #pt .z a,body.nightS #pt .z em,body.nightS #pt .z span{color:#eaeaea}body.nightS #nv_right{background-color:#3d3d3d;background-image:none}body.nightS #nv_right a{color:#eaeaea}body.nightS #nv_right a:hover{color:#6cf}body.nightS .m_c,body.nightS .tm_c{background-color:#2b2b2b;color:#eaeaea}body.nightS .m_c .dt th,body.nightS .tm_c .dt th{background-color:#2b2b2b}body.nightS .m_c .px,body.nightS .m_c .pt,body.nightS .m_c .ps,body.nightS .m_c select,body.nightS .tm_c .px,body.nightS .tm_c .pt,body.nightS .tm_c .ps,body.nightS .tm_c select{background-color:#3d3d3d;border-top:none;border-bottom:none;border-left:none;border-right:none;border-width:0px}body.nightS .m_c .o,body.nightS .tm_c .o{background-color:#3d3d3d}body.nightS .m_c a,body.nightS .tm_c a{color:#eaeaea}body.nightS .m_c a:hover,body.nightS .tm_c a:hover{color:#6cf}body.nightS .xi2,body.nightS .xi2 a,body.nightS .xi3 a{color:#69f}body.nightS .nfl .f_c{background-color:#444;border:none}body.nightS .alt>th,body.nightS .alt>td{background-color:#3d3d3d}body.nightS .dt td,body.nightS .dt th{background-color:#3d3d3d}body.nightS .dt td a,body.nightS .dt th a{color:#eaeaea}body.nightS .dt td a:hover,body.nightS .dt th a:hover{color:#6cf}body.nightS .dt tr:not(.alt) td,body.nightS .dt tr:not(.alt) th{background-color:#2b2b2b}body.nightS .bm{background-color:transparent}body.nightS #toptb{background-image:none;background-color:#3d3d3d}body.nightS #toptb .y_search{background-image:none;background-color:#444}body.nightS #toptb .y_search .y_search_btn button{box-shadow:none;filter:invert(0.8) hue-rotate(170deg)}body.nightS #toptb .y_search .y_search_inp{background-color:#555;background-image:none}body.nightS #toptb .y_search .y_search_inp input{background-color:#666}body.nightS #toptb .y_search .scbar_type_td{background-color:#555;background-image:none}body.nightS #user_info_menu{background-image:none;background-color:#525252}body.nightS #user_info_menu .linksStillOnTopBar a{color:#eaeaea}body.nightS #user_info_menu .linksStillOnTopBar a:hover{background:var(--MExtBtnClr, #999)}body.nightS .tl th em,body.nightS .tl th em a{color:#4dc4ff}body.nightS #diy_chart #frame48dS31{border-color:transparent !important}body.nightS #diy_chart .frame{background-color:#3d3d3d;border-color:transparent}body.nightS #diy_chart .frame .column{color:#eaeaea}body.nightS #diy_chart .frame .column a{color:#eaeaea}body.nightS #diy_chart .frame .column a:hover{color:#6cf}body.nightS #diy_chart .frame .column .tab-title.title{background-color:#2b2b2b !important}body.nightS #diy_chart .frame .column .tab-title.title ul{background-color:#3d3d3d !important}body.nightS #diy_chart .frame .column .tab-title.title ul li a{border-color:transparent !important}body.nightS #diy_chart .frame .column .tab-title.title ul li:not(.a) a{background-color:#525252}body.nightS #diy_chart .frame .column .tab-title.title ul li.a a{background-color:#666}body.nightS #diy_chart .frame .column .tb-c>div{background-color:#3d3d3d}body.nightS #diy_chart #tabVpFJkk{background-color:#3d3d3d !important;border-color:transparent !important}body.nightS .mn>.bm>.bm{background-color:#3d3d3d;border-color:transparent}body.nightS .mn>.bm>.bm .bm_h{background-color:#1c1c1c;background-image:none}body.nightS .mn>.bm>.bm .bm_c{background-color:#3d3d3d;border-color:transparent}body.nightS .portal_left_dev{border:none}body.nightS .portal_left_dev .portal_left_title{background-color:#1c1c1c;background-image:none}body.nightS .portal_left_dev .portal_left_title[style*="background"]{background-color:#1c1c1c !important;background-image:none !important}body.nightS .portal_left_dev .portal_left_content{border-color:transparent;background-color:#3d3d3d}body.nightS .portal_left_dev a{color:#eaeaea}body.nightS .portal_left_dev a:hover{color:#6cf}body.nightS #ct .mn .bm,body.nightS #group_sd .bm{border:none}body.nightS #ct .mn .bm .bm_h,body.nightS #group_sd .bm .bm_h{background-color:#1c1c1c;background-image:none}body.nightS #ct .mn .bm .area,body.nightS #ct .mn .bm .bm_c,body.nightS #group_sd .bm .area,body.nightS #group_sd .bm .bm_c{background-color:#3d3d3d;border-color:transparent}body.nightS #ct .mn .bm .area .frame,body.nightS #ct .mn .bm .bm_c .frame,body.nightS #group_sd .bm .area .frame,body.nightS #group_sd .bm .bm_c .frame{background-color:transparent}body.nightS #ct .mn a,body.nightS #group_sd a{color:#eaeaea}body.nightS #ct .mn a:hover,body.nightS #group_sd a:hover{color:#6cf}body.nightS #diy_right .frame{background-color:transparent}body.nightS #diy_right .block{background-color:#3d3d3d !important;border-color:transparent !important}body.nightS #diy_right .block .title{background-color:#1c1c1c;background-image:none}body.nightS #diy_right .block a{color:#eaeaea}body.nightS #diy_right .block a:hover{color:#6cf}body.nightS #diy_right .portal_news,body.nightS #diy_right .portal_game,body.nightS #diy_right .modpack,body.nightS #diy_right .portal_zb,body.nightS #diy_right .portal_note{border-color:transparent}body.nightS .special_user_info{background-color:#3d3d3d;background-image:none}body.nightS .special_user_info .special_info{background-color:transparent;background-image:none}body.nightS .special_user_info .special_info>div{background-color:#525252}body.nightS .special_user_info a{color:#eaeaea}body.nightS .special_user_info a:hover{color:#6cf}body.nightS .portal_block_summary iframe{filter:brightness(0.5)}body.nightS .pgb a{background-color:transparent}body.nightS .pgt .pg a,body.nightS .pgt .pg strong,body.nightS .pgt .pg label,body.nightS .pgs .pg a,body.nightS .pgs .pg strong,body.nightS .pgs .pg label{color:#eaeaea;background-color:transparent}body.nightS .pgt .pg strong,body.nightS .pgs .pg strong{background-color:#3d3d3d}body.nightS .pgbtn,body.nightS .pgbtn a{border:none;box-shadow:none}body.nightS .pgbtn a{background-color:#3d3d3d;color:#eaeaea;border:none}body.nightS #wp .wp{background-color:#2b2b2b;color:#eaeaea}body.nightS #wp .wp table,body.nightS #wp .wp tr,body.nightS #wp .wp td{border-color:#837c73}body.nightS #wp .wp table a,body.nightS #wp .wp tr a,body.nightS #wp .wp td a{color:#eaeaea}body.nightS #wp .wp table a:hover,body.nightS #wp .wp tr a:hover,body.nightS #wp .wp td a:hover{color:#6cf}body.nightS #postlist{background-color:transparent;border:none}body.nightS #postlist>table,body.nightS .plhin,body.nightS #f_pst{border:none;box-shadow:none}body.nightS #postlist>table tr,body.nightS #postlist>table td,body.nightS #postlist>table div,body.nightS .plhin tr,body.nightS .plhin td,body.nightS .plhin div,body.nightS #f_pst tr,body.nightS #f_pst td,body.nightS #f_pst div{border-color:#837c73}body.nightS #postlist>table .ad,body.nightS .plhin .ad,body.nightS #f_pst .ad{background-color:#3d3d3d}body.nightS #postlist>table td.pls,body.nightS .plhin td.pls,body.nightS #f_pst td.pls{background-color:#2b2b2b;border:none}body.nightS #postlist>table td.plc,body.nightS .plhin td.plc,body.nightS #f_pst td.plc{background-color:#3d3d3d;border:none}body.nightS #postlist>table .pls .avatar img,body.nightS .plhin .pls .avatar img,body.nightS #f_pst .pls .avatar img{background-color:#3d3d3d;background-image:none}body.nightS #postlist>table a,body.nightS .plhin a,body.nightS #f_pst a{color:#eaeaea}body.nightS #postlist>table a:hover,body.nightS .plhin a:hover,body.nightS #f_pst a:hover{color:#6cf}body.nightS .plhin .quote{background-color:#525252;color:#eaeaea}body.nightS .plhin .pcb .t_fsz>table table{color:#444}body.nightS .plhin .pcb .t_fsz>table .spoilerbutton{border:1px solid #525252}body.nightS .plhin .pcb .t_fsz>table .spoilerbody>table{color:#eaeaea;text-shadow:none}body.nightS .plhin.warned{opacity:0.1}body.nightS .plhin.warned:hover{opacity:0.9}body.nightS .plhin .tbn .mt.bbda{background-image:none;background-color:#3d3d3d}body.nightS .plhin .tbn ul{border-top:none;border-bottom:none;border-left:none;border-right:none;border-width:0px}body.nightS #vfastpost{background-color:transparent;background-image:none}body.nightS #vfastpost #vf_l,body.nightS #vfastpost #vf_m,body.nightS #vfastpost #vf_r,body.nightS #vfastpost #vf_b{background-color:#2b2b2b;background-image:none}body.nightS #vfastpost #vf_m input{border-color:transparent;color:#eaeaea !important}body.nightS #vfastpost #vf_l{border-radius:5px 0 0 5px}body.nightS #vfastpost #vf_r{border-radius:0 5px 5px 0}body.nightS #vfastpost #vreplysubmit{background-color:#2b2b2b;background-image:none;box-shadow:none;position:relative}body.nightS #vfastpost #vreplysubmit:after{content:"快速回复";position:absolute;top:0;left:0;width:100%;height:38px;line-height:38px;font-size:1rem}body.nightS #p_btn a,body.nightS #p_btn a i{background-color:#525252;background-image:none}body.nightS .psth{background-color:#525252;background-image:none}body.nightS #postlist.bm{border-color:#837c73}body.nightS #mymodannouncement,body.nightS #myskinannouncement,body.nightS #mytextureannouncement,body.nightS #my16modannouncement,body.nightS #announcement,body.nightS #announcement1,body.nightS #announcement2,body.nightS .cgtl caption,body.nightS .locked{background-color:#2b2b2b;border:none}body.nightS #fastpostform .pls,body.nightS #fastpostform .plc{border:none}body.nightS #fastposteditor,body.nightS #fastposteditor .bar,body.nightS #fastposteditor .area,body.nightS #fastposteditor .pt{background-color:#2b2b2b;border:none}body.nightS #fastposteditor .fpd a{filter:drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff)}body.nightS #postform .tedt>div{background-color:#3d3d3d}body.nightS #postform .tedt .bar .fpd a{filter:drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff)}body.nightS #postform .tedt .area,body.nightS #postform .tedt .area textarea{background-color:#2b2b2b}body.nightS .pi strong a{border-color:transparent}body.nightS #threadstamp img{filter:drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff)}body.nightS .blockcode{background-color:#2b2b2b;background-image:url(https://attachment.mcbbs.net/forum/202101/22/221225qf7ml74pmu2rggmz.png);border-color:#999;color:#eaeaea}body.nightS .blockcode ol li{color:#fff}body.nightS .blockcode ol li:hover{background:#706b5c;color:#d9e6f2}body.nightS #ct .bm.bml.pbn .bm_c,body.nightS #ct .bm.bmw.fl .bm_c{background-color:#3d3d3d !important}body.nightS #ct .mn a.bm_h{background-color:#3d3d3d !important;border:none;color:#eaeaea}body.nightS #ct .mn a.bm_h:hover{color:#6cf}body.nightS #ct .fastpreview .bm_c{background-color:#2b2b2b !important}body.nightS #ct .fastpreview .bm_c .pcb{background-color:#2b2b2b}body.nightS #threadlist .th,body.nightS #threadlisttableid{background-color:transparent}body.nightS #threadlist .th tr th,body.nightS #threadlist .th tr td,body.nightS #threadlisttableid tr th,body.nightS #threadlisttableid tr td{background-color:transparent;border:none}body.nightS #threadlist .th tr:hover>th,body.nightS #threadlist .th tr:hover>td,body.nightS #threadlisttableid tr:hover>th,body.nightS #threadlisttableid tr:hover>td{background-color:#525252}body.nightS #pgt{background-color:transparent !important}body.nightS #thread_types>li a,body.nightS #separatorline th,body.nightS #separatorline td,body.nightS #forumnewshow,body.nightS #f_pst .bm_c{background-color:#3d3d3d !important}body.nightS #livethread{border-color:#837c73}body.nightS #livethread #livereplycontentout{background-color:#2b2b2b;scrollbar-width:thin;scrollbar-color:#eee #999}body.nightS #livethread #livereplycontentout::-webkit-scrollbar{width:8px;height:8px}body.nightS #livethread #livereplycontentout::-webkit-scrollbar-thumb{border-radius:8px;box-shadow:inset 0 0 4px rgba(102,102,102,0.25);background:#999}body.nightS #livethread #livereplycontentout::-webkit-scrollbar-track{box-shadow:inset 0 0 4px rgba(187,187,187,0.25);border-radius:8px;background:#eee}body.nightS #livethread #livereplycontent{background-color:#2b2b2b}body.nightS #livethread #livereplycontent>div{background-color:#3d3d3d}body.nightS #livethread #livefastcomment{border-color:#837c73;background-color:#2b2b2b}body.nightS #livethread #livefastcomment textarea{background-color:#3d3d3d;color:#eaeaea !important}body.nightS #waterfall li{background-image:none;background-color:#3d3d3d;transition:0.3 ease}body.nightS #waterfall li:hover{background-color:#525252}body.nightS #waterfall li>*{background-image:none;background-color:transparent}body.nightS .area .frame{background-color:#3d3d3d}body.nightS #portal_block_857,body.nightS #portal_block_873,body.nightS #portal_block_871{background-color:#3d3d3d !important}body.nightS #framet3reHb,body.nightS #framecpjFn1,body.nightS #framecvgTv9{border-color:#837c73 !important}body.nightS #ct .appl{border-color:transparent !important}body.nightS #ct .appl .tbn h2{background-color:#1c1c1c;background-image:none}body.nightS #ct .appl .tbn ul{border:none}body.nightS #ct .appl .tbn ul li:hover{background-color:#3d3d3d}body.nightS #ct .appl .tbn a{color:#eaeaea}body.nightS #ct .appl .tbn a:hover{color:#6cf}body.nightS #ct .mn .bm{background-color:transparent}body.nightS #ct .mn .bm .tb.cl,body.nightS #ct .mn .bm .bm_h{background-color:#1c1c1c;background-image:none}body.nightS #ct .mn .bm .tb.cl h3,body.nightS #ct .mn .bm .bm_h h3{color:#eaeaea !important}body.nightS #ct .mn .bm .bm.mtm,body.nightS #ct .mn .bm .bm_c{background-color:#3d3d3d;border-color:transparent}body.nightS #ct .mn .bm ul li{color:#eaeaea}body.nightS #ct .mn .bm ul.buddy li{background-color:#3d3d3d;border:none}body.nightS #ct .mn .bm a{color:#eaeaea}body.nightS #ct .mn .bm a:hover{color:#6cf}body.nightS #ct .mn .bm .bm.bmn.mtm.cl{background-color:transparent !important}body.nightS #ct .mn .bm input,body.nightS #ct .mn .bm select,body.nightS #ct .mn .bm option{background-color:#3d3d3d;background-image:none;border-top:none;border-bottom:none;border-left:none;border-right:none;border-width:0px}body.nightS #ct .mn .bm .nts{background-color:#3d3d3d}body.nightS #ct .mn .bm .nts .ntc_body[style*="color"]{color:#eaeaea !important}body.nightS #ct .mn .bm .pg a,body.nightS #ct .mn .bm .pg strong,body.nightS #ct .mn .bm .pg label{color:#eaeaea;background-color:transparent}body.nightS #ct .mn .bm .pg strong{background-color:#3d3d3d}body.nightS #ct .mn .bm .tdats th,body.nightS #ct .mn .bm .tdats td{background-color:#2b2b2b}body.nightS #ct .mn .bm .tdats th.alt,body.nightS #ct .mn .bm .tdats td.alt{background-color:#3d3d3d}body.nightS #ct .mn .bm .tdats .alt th,body.nightS #ct .mn .bm .tdats .alt td{background-color:#3d3d3d}body.nightS #ct .mn .bm .tdats .alt.h th,body.nightS #ct .mn .bm .tdats .alt.h td{color:#3d3d3d;background-color:#eaeaea}body.nightS #threadlist .pbw h3 a{color:#69f}body.nightS #threadlist .pbw h3 a:visited{color:#b54dff}body.nightS #threadlist .pbw p{color:#eaeaea}body.nightS #td_sightml .tedt>div{background-color:#3d3d3d}body.nightS #td_sightml .tedt .bar .fpd a{filter:drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff)}body.nightS #td_sightml .tedt .area,body.nightS #td_sightml .tedt .area textarea{background-color:#2b2b2b}body.nightS #nv>ul{background-color:#2b2b2b;background-image:none;border:none}body.nightS #nv>ul li:first-child>a,body.nightS #nv>ul li:first-child>a:hover{border-left:none}body.nightS #nv>ul li:last-child>a,body.nightS #nv>ul li:last-child>a:hover{border-right:none}body.nightS #nv>ul li>a{background-color:#3d3d3d}body.nightS #nv>ul li>a,body.nightS #nv>ul li>a:hover{border-color:#3d3d3d}body.nightS #nv>ul li>a:hover{background-color:#525252}body.nightS #uhd{background-color:#3d3d3d;border-color:#2b2b2b}body.nightS #uhd ul.tb.cl{border-bottom-color:#2b2b2b}body.nightS #uhd ul.tb.cl li a{background-color:#2b2b2b;border:none;color:#eaeaea}body.nightS #uhd ul.tb.cl li a:hover{color:#6cf}body.nightS #uhd .mn ul li a{color:#eaeaea}body.nightS #uhd .mn ul li a :hover{color:#6cf}body.nightS #ct{border-color:#2b2b2b}body.nightS #ct[style*="background:#fff"]{background-color:#3d3d3d !important}body.nightS .tl{background-color:transparent}body.nightS .tl tr{background-color:transparent}body.nightS .tl tr th,body.nightS .tl tr td{background-color:transparent;border:none}body.nightS .tl tr:hover th,body.nightS .tl tr:hover td{background-color:#525252}body.nightS #visitor_content,body.nightS #friend_content,body.nightS .emp,body.nightS .blocktitle{color:#eaeaea}body.nightS #visitor_content a,body.nightS #friend_content a,body.nightS .emp a,body.nightS .blocktitle a{color:#eaeaea}body.nightS #visitor_content a:hover,body.nightS #friend_content a:hover,body.nightS .emp a:hover,body.nightS .blocktitle a:hover{color:#6cf;background-color:#837c73}body.nightS #typeid_ctrl_menu{background-color:#3d3d3d;border-color:#837c73}body.nightS #typeid_ctrl_menu li{color:#eaeaea}body.nightS #editorbox{background-color:#3d3d3d}body.nightS #editorbox>*{background-color:transparent}body.nightS #editorbox .tb .a a,body.nightS #editorbox .tb .current a{background-color:#525252}body.nightS #editorbox .area{background-color:#2b2b2b}body.nightS .ftid a{background-color:#3d3d3d;border-color:#837c73;color:#eaeaea !important}body.nightS .exfm{background-color:#525252;border-color:#837c73}body.nightS #e_controls{background-color:#525252}body.nightS #e_controls .b1r a,body.nightS #e_controls .b2r a{border:none;border-width:0px}body.nightS #e_controls .b1r a:not(.dp),body.nightS #e_controls .b2r a:not(.dp){filter:drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff)}body.nightS #e_controls .b1r a.dp,body.nightS #e_controls .b2r a.dp{background-color:#525252;color:#eaeaea}body.nightS #e_textarea{background-color:#2b2b2b}body.nightS #e_body .area,body.nightS #rstnotice,body.nightS #e_bbar,body.nightS .area{background-color:#3d3d3d;border-color:#837c73}body.nightS #nav>a,body.nightS #content>*>a,body.nightS li>a,body.nightS #end>a,body.nightS #footer strong>a{color:#eaeaea}body.nightS #nav>a:hover,body.nightS #content>*>a:hover,body.nightS li>a:hover,body.nightS #end>a:hover,body.nightS #footer strong>a:hover{color:#6cf}body.nightS #content p.author{background-color:#3d3d3d}body.nightS .xl label,body.nightS .xl label a{color:#f99}body.nightS a[style*="or:"][style*="#333333"],body.nightS font[style*="or:"][style*="#333333"]{color:#e0e0e0 !important}body.nightS a[style*="or:"][style*="#663399"],body.nightS font[style*="or:"][style*="#663399"]{color:#de90df !important}body.nightS a[style*="or:"][style*="#8f2a90"],body.nightS font[style*="or:"][style*="#8f2a90"]{color:#de90df !important}body.nightS a[style*="or:"][style*="#660099"],body.nightS font[style*="or:"][style*="#660099"]{color:#bf8cd9 !important}body.nightS a[style*="or:"][style*="#660000"],body.nightS font[style*="or:"][style*="#660000"]{color:#c66 !important}body.nightS a[style*="or:"][style*="#993333"],body.nightS font[style*="or:"][style*="#993333"]{color:#f99 !important}body.nightS a[style*="or:"][style*="#EE1B2E"],body.nightS font[style*="or:"][style*="#EE1B2E"]{color:#f99 !important}body.nightS a[style*="or:"][style*="#ff0000"],body.nightS font[style*="or:"][style*="#ff0000"]{color:#f99 !important}body.nightS a[style*="or:"][style*="#FF0000"],body.nightS font[style*="or:"][style*="#FF0000"]{color:#f99 !important}body.nightS a[style*="or:"][style*="#CC0000"],body.nightS font[style*="or:"][style*="#CC0000"]{color:#f99 !important}body.nightS a[style*="or:"][style*="#EE5023"],body.nightS font[style*="or:"][style*="#EE5023"]{color:#e97c5d !important}body.nightS a[style*="or:"][style*="#996600"],body.nightS font[style*="or:"][style*="#996600"]{color:#e6a219 !important}body.nightS a[style*="or:"][style*="#663300"],body.nightS font[style*="or:"][style*="#663300"]{color:#d97f26 !important}body.nightS a[style*="or:"][style*="#006666"],body.nightS font[style*="or:"][style*="#006666"]{color:#6cc !important}body.nightS a[style*="or:"][style*="#3C9D40"],body.nightS font[style*="or:"][style*="#3C9D40"]{color:#8f8 !important}body.nightS a[style*="or:"][style*="#009900"],body.nightS font[style*="or:"][style*="#009900"]{color:#9f9 !important}body.nightS a[style*="or:"][style*="#2897C5"],body.nightS font[style*="or:"][style*="#2897C5"]{color:#52b6e0 !important}body.nightS a[style*="or:"][style*="#3366ff"],body.nightS font[style*="or:"][style*="#3366ff"]{color:#6af !important}body.nightS a[style*="or:"][style*="#2b65b7"],body.nightS font[style*="or:"][style*="#2b65b7"]{color:#6af !important}body.nightS a[style*="or:"][style*="#003399"],body.nightS font[style*="or:"][style*="#003399"]{color:#6af !important}body.nightS a[style*="or:"][style*="#2B65B7"],body.nightS font[style*="or:"][style*="#2B65B7"]{color:#6af !important}body.nightS a[style*="or:"][style*="#330066"],body.nightS font[style*="or:"][style*="#330066"]{color:#b28cd9 !important}body.nightS a[style*="or:"][style*="#8F2A90"],body.nightS font[style*="or:"][style*="#8F2A90"]{color:#cf61d1 !important}body.nightS a[style*="or:"][style*="#EC1282"],body.nightS font[style*="or:"][style*="#EC1282"]{color:#f655a8 !important}body.nightS a[style*="nd-co"][style*="#FFFFFF"]{background-color:transparent !important}body.nightS a[style*="nd-co"][style*="Wheat"]{background-color:transparent !important}body.nightS a[style*="nd-co"][style*="white"]{background-color:transparent !important}body.nightS a[style*="nd-co"][style*="#ffffff"]{background-color:transparent !important}body.nightS font[color*="#000"]{color:#fff !important}body.nightS font[color*="black"]{color:#fff !important}body.nightS font[color*="Black"]{color:#fff !important}body.nightS font[color*="333333"]{color:#e0e0e0 !important}body.nightS font[color*="353535"]{color:#e0e0e0 !important}body.nightS font[color*="660000"]{color:#c66 !important}body.nightS font[color*="8b0000"]{color:#c66 !important}body.nightS font[color*="ff0000"]{color:#f99 !important}body.nightS font[color*="red"]{color:#f99 !important}body.nightS font[color*="Red"]{color:#f99 !important}body.nightS font[color*="000080"]{color:#8af !important}body.nightS font[color*="0000ff"]{color:#8af !important}body.nightS font[color*="3366ff"]{color:#8af !important}body.nightS font[color*="003399"]{color:#8af !important}body.nightS font[color*="blue"]{color:#8af !important}body.nightS font[color*="Blue"]{color:#8af !important}body.nightS font[color*="Navy"]{color:#8af !important}body.nightS font[color*="339933"]{color:#9f9 !important}body.nightS font[color*="009900"]{color:#9f9 !important}body.nightS font[color*="008000"]{color:#9f9 !important}body.nightS font[color*="006400"]{color:#9f9 !important}body.nightS font[color*="#0640"]{color:#9f9 !important}body.nightS font[color*="green"]{color:#9f9 !important}body.nightS font[color*="Green"]{color:#9f9 !important}body.nightS font[color*="660099"]{color:#bf8cd9 !important}body.nightS font[color*="4b0082"]{color:#b54dff !important}body.nightS font[color*="Indigo"]{color:#b54dff !important}body.nightS font[color*="DarkOrchid"]{color:#c57ce9 !important}body.nightS font[color*="800080"]{color:#e830e8 !important}body.nightS font[color*="Purple"]{color:#e830e8 !important}body.nightS font[color*="2d76c4"]{color:#5c97d6 !important}body.nightS font[color*="Olive"]{color:#ff3 !important}body.nightS font[color*="Sienna"]{color:#d28460 !important}body.nightS font[style*="nd-co"][style*="#FFFFFF"]{background-color:transparent !important}body.nightS font[style*="nd-co"][style*="Wheat"]{background-color:transparent !important}body.nightS font[style*="nd-co"][style*="white"]{background-color:transparent !important}body.nightS font[style*="nd-co"][style*="#ffffff"]{background-color:transparent !important}body.nightS .t_f[style*="background-color"][style*="#FBF2DB"]{background-color:transparent !important}body.nightS .consolePanel,body.nightS .settingPanel{background-color:#2b2b2b;color:#eaeaea;border-color:rgba(153,153,153,0.2)}body.nightS .consolePanel textarea,body.nightS .settingPanel textarea{background-color:#3d3d3d;border:none}body.nightS .consolePanel input,body.nightS .settingPanel input{border:none;border-width:0px}body.nightS .consolePanel *:first-child,body.nightS .settingPanel *:first-child{background-color:#2b2b2b}body.nightS .consolePanel div h3>small,body.nightS .settingPanel div h3>small{color:#aaa}
`
                , 'night-style'
            )
            window.saltMCBBSCSS.setStyle( // 勋章样式
                `p.md_ctrl{position:relative;float:left;min-width:120px;overflow:visible;margin-left:5px;padding-left:10px}p.md_ctrl,p.md_ctrl:hover{max-height:var(--maxHeight, 96px)}p.md_ctrl.salt-expand,p.md_ctrl.salt-expand:hover{max-height:var(--expandHeight, 960px)}p.md_ctrl.expandable{padding-bottom:32px;overflow:hidden}p.md_ctrl .saltExpandHandler{position:absolute;bottom:0;left:0;width:100%;height:32px;color:#3882a7;background-image:linear-gradient(0deg, #e3c99e, #e3c99e, rgba(227,201,158,0));cursor:pointer}p.md_ctrl .saltExpandHandler:after{content:"点击展开";display:block;width:100%;height:32px;line-height:32px;text-align:center}p.md_ctrl.salt-expand .saltExpandHandler:after{content:"点击收起"}p.md_ctrl:not(.expandable) .saltExpandHandler{display:none}p.md_ctrl>a{width:100%}p.md_ctrl>a>img{animation:dropdown 0.5s ease;position:relative;width:35px;height:55px;-webkit-filter:drop-shadow(0 3px 2px #000);filter:drop-shadow(0 3px 2px #000);margin:4.5px;transition:filter 0.5s ease}p.md_ctrl>a>img:hover{animation:pickup 0.5s ease;-webkit-transform:matrix3d(1, 0, 0, 0, 0, 1, 0, -0.001, 0, 0, 1, 0, 0, -1.6, 0, 0.85);transform:matrix3d(1, 0, 0, 0, 0, 1, 0, -0.001, 0, 0, 1, 0, 0, -1.6, 0, 0.85);-webkit-filter:drop-shadow(0 5px 4px rgba(0,0,0,0.75));filter:drop-shadow(0 5px 4px rgba(0,0,0,0.75))}body.night-style p.md_ctrl .saltExpandHandler{color:#6cf;background-image:linear-gradient(0deg, var(--bodybg-l, #313131), var(--bodybg-l, #313131), var(--bodybg-l-t, rgba(49,49,49,0)))}body #append_parent>.tip_4,body .tip_4.aimg_tip,body .pls .tip_4,body .tip_4[id*="attach"],body dd>.tip_4{background-color:#e3c99eee !important;max-height:90px !important;width:140px;margin-top:35px}body .tip_4.aimg_tip,body .tip_4[id*="attach"]{width:200px !important;padding:5px !important;background-image:none !important}body .tip_4[id*="attach"] .tip_c{padding:5px !important;background-image:none !important}body .tip_4.aimg_tip p{pointer-events:auto !important}body #append_parent>.tip_4{margin-top:40px;margin-left:-10px}body .tip_3,body .tip_4{transition:opacity 0.4s ease !important;width:105px;height:165px;padding:0;border:none;border-radius:5px;margin-top:85px;margin-left:44px;pointer-events:none !important;overflow:hidden;background-color:rgba(153,153,153,0.75);box-shadow:0px 10px 25px -4px #000;image-rendering:pixelated}body .tip_3::before,body .tip_4::before{content:"";position:absolute;z-index:-1;top:-7px;left:-7px;width:119px;height:187px;background-size:119px 187px !important;-webkit-filter:saturate(140%);filter:saturate(140%)}body .tip .tip_horn{display:none}body .tip .tip_c{padding:20px 15px 0 15px;height:165px;color:#222;line-height:1.2em}body .tip .tip_c>p,body .tip .tip_c>h4{color:#222}body .tip .tip_c h4{border-bottom:1px solid #fff;text-align:center}body .tip[id$="_menu"][id^="m"]{display:flex}body .tip[id$="_menu"][id^="m"] .tip_c{height:auto;margin:auto;padding:0 0 5px 0;background-color:rgba(255,255,255,0.4);text-shadow:0 0 1px #fff, 0 0 1px #fff, 0 0 1px #fff, 0 0 1px #fff}body .tip[id$="_menu"][id^="m"] .tip_c>p,body .tip[id$="_menu"][id^="m"] .tip_c>h4{padding:5px 10px 0}body .tip::after{content:"";position:absolute;height:100%;width:100%;top:0;left:0;background-image:linear-gradient(142deg, #fff0 0%, #fff4 5%, #fff2 28%, #fff0 29%, #fff0 70%, #fff2 70.5%, #fff2 73%, #fff0 74%, #fff4 75%, #fff2 85%, #fff0 85.1%);z-index:-1}body div[id$="_menu"]:before{background-repeat:no-repeat;background:var(--bgimg, transparent);z-index:-1}body div[id$="_101_menu"]:before{--bgimg:url(static/image/common/m_a2.png)}body div[id$="_102_menu"]:before{--bgimg:url(static/image/common/m_a3.png)}body div[id$="_103_menu"]:before{--bgimg:url(static/image/common/m_a6.png)}body div[id$="_11_menu"]:before{--bgimg:url(static/image/common/m_d1.png)}body div[id$="_12_menu"]:before{--bgimg:url(static/image/common/m_d2.png)}body div[id$="_104_menu"]:before{--bgimg:url(static/image/common/m_b1.png)}body div[id$="_105_menu"]:before{--bgimg:url(static/image/common/m_b3.png)}body div[id$="_106_menu"]:before{--bgimg:url(static/image/common/m_b4.png)}body div[id$="_234_menu"]:before{--bgimg:url(static/image/common/m_b5.gif)}body div[id$="_107_menu"]:before{--bgimg:url(static/image/common/m_rc1.png)}body div[id$="_108_menu"]:before{--bgimg:url(static/image/common/m_rc3.png)}body div[id$="_109_menu"]:before{--bgimg:url(static/image/common/m_rc5.png)}body div[id$="_250_menu"]:before{--bgimg:url(static/image/common/m_c_10years.png)}body div[id$="_76_menu"]:before{--bgimg:url(static/image/common/m_g5.png)}body div[id$="_58_menu"]:before{--bgimg:url(static/image/common/m_g3.png)}body div[id$="_59_menu"]:before{--bgimg:url(static/image/common/m_g4.png)}body div[id$="_21_menu"]:before{--bgimg:url(static/image/common/m_noob.png)}body div[id$="_9_menu"]:before{--bgimg:url(static/image/common/m_c2.png)}body div[id$="_2_menu"]:before{--bgimg:url(static/image/common/m_c3.png)}body div[id$="_38_menu"]:before{--bgimg:url(static/image/common/m_c1.png)}body div[id$="_112_menu"]:before{--bgimg:url(static/image/common/m_c4.png)}body div[id$="_251_menu"]:before{--bgimg:url(static/image/common/m_c_piglin.png)}body div[id$="_155_menu"]:before{--bgimg:url(static/image/common/m_cape_mc2011.png)}body div[id$="_156_menu"]:before{--bgimg:url(static/image/common/m_cape_mc2012.png)}body div[id$="_157_menu"]:before{--bgimg:url(static/image/common/m_cape_mc2013.png)}body div[id$="_158_menu"]:before{--bgimg:url(static/image/common/m_cape_mc2015.png)}body div[id$="_159_menu"]:before{--bgimg:url(static/image/common/m_cape_Tr.png)}body div[id$="_180_menu"]:before{--bgimg:url(static/image/common/m_cape_cobalt.png)}body div[id$="_181_menu"]:before{--bgimg:url(static/image/common/m_cape_maper.png)}body div[id$="_196_menu"]:before{--bgimg:url(static/image/common/m_cape_mc2016.png)}body div[id$="_247_menu"]:before{--bgimg:url(static/image/common/m_cape_Mojira.png)}body div[id$="_45_menu"]:before{--bgimg:url(static/image/common/m_s1.png)}body div[id$="_127_menu"]:before{--bgimg:url(static/image/common/m_s2.png)}body div[id$="_78_menu"]:before{--bgimg:url(static/image/common/m_p_pc.png)}body div[id$="_113_menu"]:before{--bgimg:url(static/image/common/m_p_and.png)}body div[id$="_114_menu"]:before{--bgimg:url(static/image/common/m_p_ios.png)}body div[id$="_141_menu"]:before{--bgimg:url(static/image/common/m_p_wp.png)}body div[id$="_160_menu"]:before{--bgimg:url(static/image/common/m_p_w10.png)}body div[id$="_115_menu"]:before{--bgimg:url(static/image/common/m_p_box360.png)}body div[id$="_116_menu"]:before{--bgimg:url(static/image/common/m_p_boxone.png)}body div[id$="_117_menu"]:before{--bgimg:url(static/image/common/m_p_ps3.png)}body div[id$="_118_menu"]:before{--bgimg:url(static/image/common/m_p_ps4.png)}body div[id$="_119_menu"]:before{--bgimg:url(static/image/common/m_p_psv.png)}body div[id$="_170_menu"]:before{--bgimg:url(static/image/common/m_p_wiiu.png)}body div[id$="_209_menu"]:before{--bgimg:url(static/image/common/m_p_switch.png)}body div[id$="_227_menu"]:before{--bgimg:url(static/image/common/m_p_3ds.png)}body div[id$="_56_menu"]:before{--bgimg:url(static/image/common/m_g1.png)}body div[id$="_57_menu"]:before{--bgimg:url(static/image/common/m_g2.png)}body div[id$="_61_menu"]:before{--bgimg:url(static/image/common/m_p1.png)}body div[id$="_62_menu"]:before{--bgimg:url(static/image/common/m_p2.png)}body div[id$="_63_menu"]:before{--bgimg:url(static/image/common/m_p3.png)}body div[id$="_46_menu"]:before{--bgimg:url(static/image/common/m_p4.png)}body div[id$="_64_menu"]:before{--bgimg:url(static/image/common/m_p5.png)}body div[id$="_65_menu"]:before{--bgimg:url(static/image/common/m_p6.png)}body div[id$="_66_menu"]:before{--bgimg:url(static/image/common/m_p7.png)}body div[id$="_75_menu"]:before{--bgimg:url(static/image/common/m_p8.png)}body div[id$="_85_menu"]:before{--bgimg:url(static/image/common/m_p9.png)}body div[id$="_86_menu"]:before{--bgimg:url(static/image/common/m_p10.png)}body div[id$="_100_menu"]:before{--bgimg:url(static/image/common/m_p11.png)}body div[id$="_175_menu"]:before{--bgimg:url(static/image/common/m_p12.png)}body div[id$="_182_menu"]:before{--bgimg:url(static/image/common/m_p13.png)}body div[id$="_91_menu"]:before{--bgimg:url(static/image/common/m_h1.png)}body div[id$="_93_menu"]:before{--bgimg:url(static/image/common/m_h2.png)}body div[id$="_92_menu"]:before{--bgimg:url(static/image/common/m_h3.png)}body div[id$="_94_menu"]:before{--bgimg:url(static/image/common/m_h4.png)}body div[id$="_95_menu"]:before{--bgimg:url(static/image/common/m_h5.png)}body div[id$="_96_menu"]:before{--bgimg:url(static/image/common/m_h6.png)}body div[id$="_152_menu"]:before{--bgimg:url(static/image/common/m_h7.png)}body div[id$="_183_menu"]:before{--bgimg:url(static/image/common/m_h8.png)}body div[id$="_200_menu"]:before{--bgimg:url(static/image/common/m_h9.png)}body div[id$="_210_menu"]:before{--bgimg:url(static/image/common/m_h10.png)}body div[id$="_70_menu"]:before{--bgimg:url(static/image/common/m_arena_v1.png)}body div[id$="_72_menu"]:before{--bgimg:url(static/image/common/m_arena_v2.png)}body div[id$="_88_menu"]:before{--bgimg:url(static/image/common/m_arena_v3.png)}body div[id$="_111_menu"]:before{--bgimg:url(static/image/common/m_arena_v4.png)}body div[id$="_69_menu"]:before{--bgimg:url(static/image/common/m_arena_w1.png)}body div[id$="_68_menu"]:before{--bgimg:url(static/image/common/m_arena_w2.png)}body div[id$="_73_menu"]:before{--bgimg:url(static/image/common/m_arena_w3.png)}body div[id$="_74_menu"]:before{--bgimg:url(static/image/common/m_arena_w4.png)}body div[id$="_89_menu"]:before{--bgimg:url(static/image/common/m_arena_w5.png)}body div[id$="_90_menu"]:before{--bgimg:url(static/image/common/m_arena_w6.png)}body div[id$="_98_menu"]:before{--bgimg:url(static/image/common/m_arena_w8.png)}body div[id$="_99_menu"]:before{--bgimg:url(static/image/common/m_arena_w7.png)}body div[id$="_120_menu"]:before{--bgimg:url(static/image/common/m_arena_v5.png)}body div[id$="_121_menu"]:before{--bgimg:url(static/image/common/m_arena_w9.png)}body div[id$="_122_menu"]:before{--bgimg:url(static/image/common/m_arena_w10.png)}body div[id$="_123_menu"]:before{--bgimg:url(static/image/common/m_arena_i1.png)}body div[id$="_129_menu"]:before{--bgimg:url(static/image/common/m_arena_v6.png)}body div[id$="_130_menu"]:before{--bgimg:url(static/image/common/m_arena_w11.png)}body div[id$="_131_menu"]:before{--bgimg:url(static/image/common/m_arena_w12.png)}body div[id$="_132_menu"]:before{--bgimg:url(static/image/common/m_arena_i2.png)}body div[id$="_143_menu"]:before{--bgimg:url(static/image/common/m_arena_v7.png)}body div[id$="_144_menu"]:before{--bgimg:url(static/image/common/m_arena_v7f.png)}body div[id$="_145_menu"]:before{--bgimg:url(static/image/common/m_arena_w13.png)}body div[id$="_146_menu"]:before{--bgimg:url(static/image/common/m_arena_w14.png)}body div[id$="_164_menu"]:before{--bgimg:url(static/image/common/m_arena_v8.png)}body div[id$="_165_menu"]:before{--bgimg:url(static/image/common/m_arena_w15.png)}body div[id$="_166_menu"]:before{--bgimg:url(static/image/common/m_arena_w16.png)}body div[id$="_176_menu"]:before{--bgimg:url(static/image/common/m_arena_v9.png)}body div[id$="_177_menu"]:before{--bgimg:url(static/image/common/m_arena_w17.png)}body div[id$="_178_menu"]:before{--bgimg:url(static/image/common/m_arena_w18.png)}body div[id$="_184_menu"]:before{--bgimg:url(static/image/common/m_arena_v10.png)}body div[id$="_185_menu"]:before{--bgimg:url(static/image/common/m_arena_w19.png)}body div[id$="_186_menu"]:before{--bgimg:url(static/image/common/m_arena_w20.png)}body div[id$="_204_menu"]:before{--bgimg:url(static/image/common/m_arena_v11.png)}body div[id$="_205_menu"]:before{--bgimg:url(static/image/common/m_arena_w21.png)}body div[id$="_206_menu"]:before{--bgimg:url(static/image/common/m_arena_w22.png)}body div[id$="_211_menu"]:before{--bgimg:url(static/image/common/m_arena_v12.png)}body div[id$="_212_menu"]:before{--bgimg:url(static/image/common/m_arena_w23.png)}body div[id$="_213_menu"]:before{--bgimg:url(static/image/common/m_arena_w24.png)}body div[id$="_224_menu"]:before{--bgimg:url(static/image/common/m_arena_v13.png)}body div[id$="_225_menu"]:before{--bgimg:url(static/image/common/m_arena_w25.png)}body div[id$="_226_menu"]:before{--bgimg:url(static/image/common/m_arena_w26.png)}body div[id$="_237_menu"]:before{--bgimg:url(static/image/common/m_arena14_1.png)}body div[id$="_238_menu"]:before{--bgimg:url(static/image/common/m_arena14_2.png)}body div[id$="_239_menu"]:before{--bgimg:url(static/image/common/m_arena14_3.png)}body div[id$="_136_menu"]:before{--bgimg:url(static/image/common/m_s_v1.png)}body div[id$="_167_menu"]:before{--bgimg:url(static/image/common/m_s_bili.png)}body div[id$="_174_menu"]:before{--bgimg:url(static/image/common/m_s_v2.png)}body div[id$="_195_menu"]:before{--bgimg:url(static/image/common/m_s_v3.png)}body div[id$="_218_menu"]:before{--bgimg:url(static/image/common/m_s_bili2.png)}body div[id$="_240_menu"]:before{--bgimg:url(static/image/common/m_s_v4.png)}body div[id$="_253_menu"]:before{--bgimg:url(static/image/common/m_s_wiki.png)}body div[id$="_254_menu"]:before{--bgimg:url(static/image/common/m_s_mcwiki.png)}body div[id$="_124_menu"]:before{--bgimg:url(static/image/common/m_pearena_v1.png)}body div[id$="_125_menu"]:before{--bgimg:url(static/image/common/m_pearena_w2.png)}body div[id$="_126_menu"]:before{--bgimg:url(static/image/common/m_pearena_w1.png)}body div[id$="_133_menu"]:before{--bgimg:url(static/image/common/m_pearena_v2.png)}body div[id$="_134_menu"]:before{--bgimg:url(static/image/common/m_pearena_w4.png)}body div[id$="_135_menu"]:before{--bgimg:url(static/image/common/m_pearena_w3.png)}body div[id$="_147_menu"]:before{--bgimg:url(static/image/common/m_pearena_v3.png)}body div[id$="_148_menu"]:before{--bgimg:url(static/image/common/m_pearena_w6.png)}body div[id$="_149_menu"]:before{--bgimg:url(static/image/common/m_pearena_w5.png)}body div[id$="_161_menu"]:before{--bgimg:url(static/image/common/m_pearena_v4.png)}body div[id$="_162_menu"]:before{--bgimg:url(static/image/common/m_pearena_w8.png)}body div[id$="_163_menu"]:before{--bgimg:url(static/image/common/m_pearena_w7.png)}body div[id$="_171_menu"]:before{--bgimg:url(static/image/common/m_pearena_v5.png)}body div[id$="_172_menu"]:before{--bgimg:url(static/image/common/m_pearena_w10.png)}body div[id$="_173_menu"]:before{--bgimg:url(static/image/common/m_pearena_w9.png)}body div[id$="_190_menu"]:before{--bgimg:url(static/image/common/m_pearena_w13.png)}body div[id$="_192_menu"]:before{--bgimg:url(static/image/common/m_pearena_v6.png)}body div[id$="_193_menu"]:before{--bgimg:url(static/image/common/m_pearena_w11.png)}body div[id$="_194_menu"]:before{--bgimg:url(static/image/common/m_pearena_w12.png)}body div[id$="_201_menu"]:before{--bgimg:url(static/image/common/m_pearena_v7.png)}body div[id$="_202_menu"]:before{--bgimg:url(static/image/common/m_pearena_w16.png)}body div[id$="_203_menu"]:before{--bgimg:url(static/image/common/m_pearena_w15.png)}body div[id$="_214_menu"]:before{--bgimg:url(static/image/common/m_pearena_v8.png)}body div[id$="_215_menu"]:before{--bgimg:url(static/image/common/m_pearena_w18.png)}body div[id$="_216_menu"]:before{--bgimg:url(static/image/common/m_pearena_w17.png)}body div[id$="_221_menu"]:before{--bgimg:url(static/image/common/m_pearena_v9.png)}body div[id$="_222_menu"]:before{--bgimg:url(static/image/common/m_pearena_w20.png)}body div[id$="_223_menu"]:before{--bgimg:url(static/image/common/m_pearena_w19.png)}body div[id$="_229_menu"]:before{--bgimg:url(static/image/common/m_pearena_v10.png)}body div[id$="_230_menu"]:before{--bgimg:url(static/image/common/m_pearena_w22.png)}body div[id$="_231_menu"]:before{--bgimg:url(static/image/common/m_pearena_w21.png)}body div[id$="_241_menu"]:before{--bgimg:url(static/image/common/m_pearena_v11.png)}body div[id$="_242_menu"]:before{--bgimg:url(static/image/common/m_pearena_w24.png)}body div[id$="_243_menu"]:before{--bgimg:url(static/image/common/m_pearena_w23.png)}body div[id$="_197_menu"]:before{--bgimg:url(static/image/common/m_pofg_v1.png)}body div[id$="_198_menu"]:before{--bgimg:url(static/image/common/m_pofg_v2.png)}body div[id$="_199_menu"]:before{--bgimg:url(static/image/common/m_pofg_v3.png)}body div[id$="_137_menu"]:before{--bgimg:url(static/image/common/m_g_cw.png)}body div[id$="_138_menu"]:before{--bgimg:url(static/image/common/m_g_trp.png)}body div[id$="_139_menu"]:before{--bgimg:url(static/image/common/m_g_tas.png)}body div[id$="_140_menu"]:before{--bgimg:url(static/image/common/m_g_sc.png)}body div[id$="_142_menu"]:before{--bgimg:url(static/image/common/m_g_sl.png)}body div[id$="_150_menu"]:before{--bgimg:url(static/image/common/m_g_hayo.png)}body div[id$="_151_menu"]:before{--bgimg:url(static/image/common/m_g_aa.png)}body div[id$="_153_menu"]:before{--bgimg:url(static/image/common/m_g_is.png)}body div[id$="_154_menu"]:before{--bgimg:url(static/image/common/m_g_cbl.png)}body div[id$="_168_menu"]:before{--bgimg:url(static/image/common/m_g_ntl.png)}body div[id$="_169_menu"]:before{--bgimg:url(static/image/common/m_g_tcp.png)}body div[id$="_179_menu"]:before{--bgimg:url(static/image/common/m_g_mpw.png)}body div[id$="_207_menu"]:before{--bgimg:url(static/image/common/m_g_ud.png)}body div[id$="_217_menu"]:before{--bgimg:url(static/image/common/m_g_bs.png)}body div[id$="_219_menu"]:before{--bgimg:url(static/image/common/m_g_pcd.png)}body div[id$="_220_menu"]:before{--bgimg:url(static/image/common/m_g_gwnw.png)}body div[id$="_228_menu"]:before{--bgimg:url(static/image/common/m_g_lw.png)}body div[id$="_232_menu"]:before{--bgimg:url(static/image/common/m_g_uel.png)}body div[id$="_233_menu"]:before{--bgimg:url(static/image/common/m_g_tgc.png)}body div[id$="_235_menu"]:before{--bgimg:url(static/image/common/m_g_nf.png)}body div[id$="_236_menu"]:before{--bgimg:url(static/image/common/m_g_mcbk.png)}body div[id$="_244_menu"]:before{--bgimg:url(static/image/common/m_g_pos.png)}body div[id$="_245_menu"]:before{--bgimg:url(static/image/common/m_g_stc.png)}body div[id$="_246_menu"]:before{--bgimg:url(static/image/common/m_g_cps.png)}body div[id$="_248_menu"]:before{--bgimg:url(static/image/common/m_g_wiki.png)}body div[id$="_249_menu"]:before{--bgimg:url(static/image/common/m_g_rmg.png)}body div[id$="_252_menu"]:before{--bgimg:url(static/image/common/m_g_tml.png)}@keyframes pickup{0%{-webkit-transform:matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);transform:matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)}50%{-webkit-transform:matrix3d(1, 0, 0, -0.002, 0, 1, 0, -0.002, 0, 0, 1, 0, 0, -1, 0, 0.92);transform:matrix3d(1, 0, 0, -0.002, 0, 1, 0, -0.002, 0, 0, 1, 0, 0, -1, 0, 0.92)}100%{-webkit-transform:matrix3d(1, 0, 0, 0, 0, 1, 0, -0.001, 0, 0, 1, 0, 0, -1.6, 0, 0.85);transform:matrix3d(1, 0, 0, 0, 0, 1, 0, -0.001, 0, 0, 1, 0, 0, -1.6, 0, 0.85)}}@keyframes dropdown{0%{-webkit-transform:matrix3d(1, 0, 0, 0, 0, 1, 0, -0.001, 0, 0, 1, 0, 0, -1.6, 0, 0.85);transform:matrix3d(1, 0, 0, 0, 0, 1, 0, -0.001, 0, 0, 1, 0, 0, -1.6, 0, 0.85)}50%{-webkit-transform:matrix3d(1, 0, 0, -0.001, 0, 1, 0, -0.002, 0, 0, 1, 0, 0, -1.1, 0, 0.92);transform:matrix3d(1, 0, 0, -0.001, 0, 1, 0, -0.002, 0, 0, 1, 0, 0, -1.1, 0, 0.92)}100%{-webkit-transform:matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);transform:matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)}}
`, 'medal'
            )
            window.saltMCBBSCSS.setStyle( // 帖子高亮
                `#threadlisttableid>tbody[classified]{--backcolor:transparent;--backcolor-t1:transparent;--backcolor-t2:transparent;--backcolor-t3:transparent;background-image:-webkit-linear-gradient(90deg, var(--backcolor) 0%, var(--backcolor-t1) .2%, var(--backcolor-t2) .5%, var(--backcolor-t3) 45%, transparent 100%);background-image:linear-gradient(90deg, var(--backcolor) 0%, var(--backcolor-t1) .2%, var(--backcolor-t2) .5%, var(--backcolor-t3) 45%, transparent 100%)}#threadlisttableid>tbody[classified].digestpost{--backcolor:#0db1f2;--backcolor-t1:rgba(13,177,242,0.8);--backcolor-t2:rgba(13,177,242,0.08);--backcolor-t3:rgba(13,177,242,0)}#threadlisttableid>tbody[classified].reward{--backcolor:#f2690d;--backcolor-t1:rgba(242,105,13,0.8);--backcolor-t2:rgba(242,105,13,0.08);--backcolor-t3:rgba(242,105,13,0)}#threadlisttableid>tbody[classified].big-reward{--backcolor:#f20d93;--backcolor-t1:rgba(242,13,147,0.8);--backcolor-t2:rgba(242,13,147,0.08);--backcolor-t3:rgba(242,13,147,0)}#threadlisttableid>tbody[classified].great-reward{--backcolor:#f20dd3;--backcolor-t1:rgba(242,13,211,0.8);--backcolor-t2:rgba(242,13,211,0.08);--backcolor-t3:rgba(242,13,211,0)}#threadlisttableid>tbody[classified].solved{--backcolor:#0df2ad;--backcolor-t1:rgba(13,242,173,0.8);--backcolor-t2:rgba(13,242,173,0.08);--backcolor-t3:rgba(13,242,173,0)}#threadlisttableid>tbody[classified].locked{--backcolor:#333;--backcolor-t1:rgba(51,51,51,0.8);--backcolor-t2:rgba(51,51,51,0.08);--backcolor-t3:rgba(51,51,51,0)}#threadlisttableid>tbody[classified].top-1{--backcolor:#0dd7f2;--backcolor-t1:rgba(13,215,242,0.8);--backcolor-t2:rgba(13,215,242,0.08);--backcolor-t3:rgba(13,215,242,0)}#threadlisttableid>tbody[classified].top-2{--backcolor:#2196f3;--backcolor-t1:rgba(33,150,243,0.8);--backcolor-t2:rgba(33,150,243,0.08);--backcolor-t3:rgba(33,150,243,0)}#threadlisttableid>tbody[classified].top-3{--backcolor:#f28f0d;--backcolor-t1:rgba(242,143,13,0.8);--backcolor-t2:rgba(242,143,13,0.08);--backcolor-t3:rgba(242,143,13,0)}#threadlisttableid>tbody[classified].punitive-publicity{--backcolor:crimson;--backcolor-t1:rgba(220,20,60,0.8);--backcolor-t2:rgba(220,20,60,0.08);--backcolor-t3:rgba(220,20,60,0)}
`, 'threadClassify'
            )
            // 防止篡改
            this.moveTopBarToLeft = this.readWithDefault<boolean>('SaltMoveTopBarToLeft', true)
            // 显示版本 // 与更新历史
            this.version() // this.history()
            // 创建事件
            let ev = new CustomEvent('saltMCBBSload', { detail: { name: 'saltMCBBS', version: myversion } })
            // 初始化
            let timeBeforeInit = this.getTime()
            console.log('%c ' + myprefix + ': 开始初始化', 'font-size:1rem')
            this.init()
            let timeAfterInit = this.getTime()
            console.log('%c ' + myprefix + ': 初始化完毕, 耗时 %c' + (timeAfterInit - timeBeforeInit) + ' %cms', 'font-size:1rem', 'font-size:1rem;color:orange', 'font-size:1rem')
            // 以下部分需要在文档加载完毕后执行
            this.docNearlyReady(() => {
                // 统计用时
                let timeBeforeMainFunc = this.getTime()
                console.log('%c ' + myprefix + ': 开始加载脚本', 'font-size:1rem')
                // 移动顶部栏到左侧
                this.movePageHead()
                // 检查警告记录
                this.warnOP()
                // 添加自定义评分/举报理由
                this.reasonListOP()
                // 勋章相关
                this.medalOP()
                // 论坛特性修复
                this.bugFixOP()
                // 动画效果
                this.animationOP()
                // MCBBS Extender冲突修复
                this.confiectFixOP()
                // 安全功能
                this.antiSniff()
                // 举报记忆功能
                this.reportRememberOP()
                // 图片懒加载
                this.lazyLoadImgOP()
                // 图片代理
                this.imgProxyOP()
                // 帖子分类
                this.threadClassifyOP()
                // 反水帖
                this.antiWaterOP()
                // 关闭安全锁
                autoRunLock = false
                // 整理配置项
                this.sortSetting()
                // 触发事件
                window.dispatchEvent(ev)
                // 统计用时
                let timeAfterMainFunc = this.getTime()
                console.log('%c ' + myprefix + ': 脚本加载完毕, 耗时 %c' + (timeAfterMainFunc - timeBeforeMainFunc) + ' %cms', 'font-size:1rem', 'font-size:1rem;color:orange', 'font-size:1rem')
            })
        }
        /**初始化 */
        init() {
            let obj = this
            // 使用主要CSS
            window.saltMCBBSCSS.putStyle('', 'main')
            // 启用夜间模式
            let isNight = this.readWithDefault<boolean>('isNightStyle', false)
            this.nightStyle(isNight, false)
            // 初始化设置面板
            let sp = this.settingPanel
            sp.id = techprefix + 'settingPanel'
            sp.className = 'settingPanel'
            // 添加关闭按钮
            let settingPanelTitle = document.createElement('div');
            settingPanelTitle.innerHTML = `<h3 class="flb" style="width:100%;margin-left:-8px;padding-right:0;"><em>SaltMCBBS ${myversion} 设置面板</em>
            <span style="float:right">
            <a class="sslct_btn" onclick="extstyle('./template/mcbbs/style/winter')" title="冬季"><i style="background:#4d82ff"></i></a>
            <a class="sslct_btn" onclick="extstyle('./template/mcbbs/style/default')" title="经典"><i style="background:#70ba5e"></i></a>
            <a class="sslct_btn" onclick="extstyle('./template/mcbbs/style/nether')" title="下界"><i style="background:#ae210f"></i></a>
            <a href="javascript:;" onclick="window.saltMCBBS.toggleNightStyle()" title="点击切换夜间/正常模式">切换夜间模式</a>
            <a href="https://github.com/Salt-lovely/saltMCBBS/releases" target="_blank" title="前往GitHub下载最新版">下载最新版SaltMCBBS</a>
            <a href="javascript:;" class="flbc" onclick="saltMCBBS.hideSettingPanel()" title="关闭">关闭</a>
            </span></h3>`;
            this.addSetting(settingPanelTitle, techprefix + 'settingPanelTitle');
            // 添加到body上
            this.hideSettingPanel()
            document.body.prepend(sp)
            // 添加背景设置
            this.addTextareaSetting('昼间模式下的背景图片 <small>一行一个, 填写超链接(URL)，随机选择，开头添加“//”暂时禁用这个图片</small>', this.readWithDefault<string[]>('dayBackgroundImage', []).join('\n'), (el) => {
                obj.write('dayBackgroundImage', obj.formatToStringArray(el.value))
                obj.updateBackground()
            }, '昼间模式下的背景图片', 210)
            this.addTextareaSetting('夜间模式下的背景图片 <small>一行一个, 填写超链接(URL)，随机选择，开头添加“//”暂时禁用这个图片</small>', this.readWithDefault<string[]>('nightBackgroundImage', []).join('\n'), (el) => {
                obj.write('nightBackgroundImage', obj.formatToStringArray(el.value))
                obj.updateBackground()
            }, '夜间模式下的背景图片', 211)
            let opacity = this.readWithDefault<number>('mcmapwpOpacity', 0.5)
            document.body.style.setProperty('--mcmapwpOpacity', opacity + '')
            this.addRangeSetting('主体部分的透明度<small> 仅在有背景图片时启用, 当前不透明度: ' + opacity + '</small>', opacity, [0, 1, 0.05],
                (vl, ev) => {
                    this.write('mcmapwpOpacity', vl)
                    this.changeSettingH3('主体部分的透明度', '主体部分的透明度<small> 仅在有背景图片时启用, 当前不透明度: ' + vl + '</small>')
                    document.body.style.setProperty('--mcmapwpOpacity', vl + '')
                }, '主体部分的透明度', 212)
            this.updateBackground()
            // 注入CSS
            initCSSOP()
            /**初始化的时候就要注入CSS的功能
             * 
             * 不能添加需要读取数据库的/读取DOM元素的功能
             */
            function initCSSOP() {
                // 顶栏移动与否
                if (obj.moveTopBarToLeft) {
                    window.saltMCBBSCSS.putStyle('#toptb{opacity:0}')
                } else {
                    window.saltMCBBSCSS.putStyle('body>.mc_map_wp{margin-top:50px;}#e_controls[style*="fixed"]{top:47px !important;}')
                }
                // 帖子页面左侧层主信息跟随页面滚动
                let isUserInfoSticky = obj.readWithDefault('userInfoSticky', true)
                window.saltMCBBSCSS.setStyle(`
.plhin td.pls{
    overflow: visible;
}
.plhin td.pls > div.favatar{
    position: sticky;
    top: ${obj.moveTopBarToLeft ? '0' : '50px'};
}
div.tip[id^="g_up"] {
    left: 20px !important;
    top: 160px !important;
}`, 'userInfoSticky')
                userInfoSticky(isUserInfoSticky)
                obj.addSetting({
                    type: 'check',
                    title: '层主信息栏跟随页面',
                    subtitle: '帖子页面左侧层主信息跟随页面滚动',
                    checked: isUserInfoSticky,
                    callback: (ck, ev) => {
                        obj.write('userInfoSticky', ck)
                        userInfoSticky(ck)
                    },
                    name: '左侧用户信息跟随',
                    priority: 22
                })
                function userInfoSticky(b: boolean) {
                    if (b)
                        window.saltMCBBSCSS.putStyle('', 'userInfoSticky')
                    else
                        window.saltMCBBSCSS.delStyle('userInfoSticky')
                }
                // 显示MCBBS的LOGO 与 右上角广告栏
                let showLOGO = obj.readWithDefault<boolean>('showMCBBSLogo', true), showRightTopAd = obj.readWithDefault<boolean>('showRightTopAd', true)
                let showTopObjectsCSSKey = 'showTopObjectsCSSKey'
                showTopObjects(showLOGO, showRightTopAd)
                obj.addSetting({
                    type: 'check',
                    title: '显示MCBBS的LOGO',
                    subtitle: '显示页面顶部的MCBBS LOGO',
                    checked: showLOGO,
                    callback: (ck, ev) => {
                        showLOGO = ck
                        obj.write('showMCBBSLogo', ck)
                        showTopObjects(showLOGO, showRightTopAd)
                    },
                    priority: 10
                })
                obj.addSetting({
                    type: 'check',
                    title: '显示右上角广告栏',
                    subtitle: '显示页面顶部右上角的广告栏',
                    checked: showRightTopAd,
                    callback: (ck, ev) => {
                        showRightTopAd = ck
                        obj.write('showRightTopAd', ck)
                        showTopObjects(showLOGO, showRightTopAd)
                    },
                    priority: 11
                })
                function showTopObjects(logo: boolean, ad: boolean) {
                    let css = '/*显示/隐藏顶部LOGO的css*/'
                    if (!logo && !ad) {
                        css += '.new_wp .hdc{display:none;}'
                    } else if (!logo) {
                        css += '.new_wp .hdc h2{display:none;}'
                    } else if (!ad) {
                        css += '.new_wp .hdc #um + .y{display:none;}'
                    }
                    window.saltMCBBSCSS.putStyle(css, showTopObjectsCSSKey)
                }
                // 回到顶部按钮动画
                let enableScrollTopAnime = obj.readWithDefault('scrollTopAnime', true)
                window.saltMCBBSCSS.setStyle(`
/**/
#scrolltop {
    visibility: visible !important;
    overflow: hidden;
    width: 100px;
    margin-left: -1px;
    opacity: 1;
    transition: 0.3s ease;
}
#scrolltop:not([style]) {
    display: none;
}
#scrolltop[style*="hidden"] {
    opacity: 0 !important;
    pointer-events: none;
}
#scrolltop[style*="hidden"] .scrolltopa {
    margin-left: -40px;
}`, 'scrollTopAnime')
                scrollTopAnime(enableScrollTopAnime)
                // obj.addCheckSetting('回到顶部按钮动画<br><small>兼容MCBBS Extender</small>', obj.readWithDefault('scrollTopAnime', true), (ck, ev) => {
                //     obj.write('scrollTopAnime', ck)
                //     scrollTopAnime(ck)
                // }, '回到顶部按钮动画', 23)
                obj.addSetting({
                    type: 'check',
                    title: '回到顶部按钮动画',
                    subtitle: '兼容MCBBS Extender',
                    checked: enableScrollTopAnime,
                    callback: (ck, ev) => {
                        obj.write('scrollTopAnime', ck)
                        scrollTopAnime(ck)
                    },
                    name: '回到顶部按钮动画',
                    priority: 23
                })
                function scrollTopAnime(b: boolean) {
                    if (b)
                        window.saltMCBBSCSS.putStyle('', 'scrollTopAnime')
                    else
                        window.saltMCBBSCSS.delStyle('scrollTopAnime')
                }
                // 签名栏高度
                let signHeight = obj.readWithDefault('signBarHeight', 200)
                obj.addSetting({
                    type: 'input',
                    title: '签名栏高度控制',
                    subtitle: '单位像素，小于0禁用此功能，设为0屏蔽签名栏',
                    text: signHeight + '',
                    callback: (el, ev) => {
                        let n = parseInt(el.value)
                        if (isNaN(n)) return
                        signBarHeightControl(n)
                        obj.write('signBarHeight', n)
                    },
                    priority: 62,
                })
                signBarHeightControl(signHeight)
                function signBarHeightControl(h: number) {
                    if (h < 0)
                        window.saltMCBBSCSS.delStyle('signBarHeight')
                    else if (h > 0)
                        window.saltMCBBSCSS.putStyle(`
/**/
.plhin .sign{max-height:${h}px !important;overflow-y:auto;transition:max-height .3s ease;}
`, 'signBarHeight')
                    else if (h == 0) {
                        window.saltMCBBSCSS.putStyle(`
/**/
.plhin .sign{display:none}
`, 'signBarHeight')
                    }
                }
            }
        }
        /**movePageHead 移动顶栏到页面左侧*/
        movePageHead() {
            this.assert(autoRunLock, '不在页面初始运行状态')
            let obj = this
            // 配置
            let enableSaltMoveTopBarToLeft = this.moveTopBarToLeft
            this.addCheckSetting('顶栏移动到页面左侧<br><small>使用左侧栏代替顶栏的功能</small>', enableSaltMoveTopBarToLeft, (ck, ev) => {
                this.write('SaltMoveTopBarToLeft', ck)
                this.message('"顶栏移动到页面左侧"配置项需要刷新生效<br>点击刷新', () => { location.reload() }, 3)
            }, '顶栏移动到页面左侧', 5)
            if (!enableSaltMoveTopBarToLeft) {
                window.saltMCBBSCSS.delStyle('pagehead')
                document.querySelector('#user_info_menu')?.appendChild(this.links)
                this.addSideBarLink('切换夜间模式', () => { obj.toggleNightStyle() })
                this.addSideBarLink('SaltMCBBS 设置', () => { obj.showSettingPanel() })
                this.links.className = 'linksStillOnTopBar'
                return
            }
            /**左侧栏，分三个部分*/
            let leftdiv = document.createElement('div') // 准备放到页面最左边
            leftdiv.id = 'saltNewPageHead'

            /**userinfo 用户信息 */
            let userinfo = document.createElement('div')
            /**links 一大堆链接 */
            let links = this.links
            /**addons 添加的额外按钮 */
            let addons = document.createElement('div')

            // links 一大堆链接
            let headlinks = document.querySelectorAll('#toptb .z a') // 顶部左侧4个链接
            this.addChildren(links, headlinks)
            /**打开设置界面按钮 */
            this.addSideBarLink('切换夜间模式', () => { obj.toggleNightStyle() })
            this.addSideBarLink('SaltMCBBS 设置', () => { obj.showSettingPanel() })
            links.className = 'links'

            // addons 添加的额外按钮
            let myaddon: AnchorObj[] = [ // { text: '', url: '', target: '', img:'' }, // _self _blank
                { text: '签到', url: 'plugin.php?id=dc_signin', img: 'https://patchwiki.biligame.com/images/mc/3/3f/23qf12ycegf4vgfbj7gehffrur6snkv.png' },
                { text: '任务', url: 'home.php?mod=task', img: 'https://patchwiki.biligame.com/images/mc/9/98/kbezikk5l83s2l2ewht1mhr8fltn0dv.png' },
                { text: '消息', url: 'home.php?mod=space&do=notice&view=mypost', class: 'saltmessage', img: noticimgurl[0] },
                // { text: '粉丝', url: 'home.php?mod=follow&do=follower', target: '_self' },
                { text: '好友', url: 'home.php?mod=space&do=friend', img: 'https://www.mcbbs.net/template/mcbbs/image/friends.png' },
                { text: '勋章', url: 'home.php?mod=medal', img: 'https://patchwiki.biligame.com/images/mc/2/26/85hl535hwws6snk4dt430lh3k7nyknr.png' },
                { text: '道具', url: 'home.php?mod=magic', img: 'https://www.mcbbs.net/template/mcbbs/image/tools.png' },
                { text: '收藏', url: 'home.php?mod=space&do=favorite&view=me', img: 'https://patchwiki.biligame.com/images/mc/d/dd/hnrqjfj0x2wl46284js23m26fgl3q8l.png' },
                { text: '挖矿', url: 'plugin.php?id=mcbbs_lucky_card:prize_pool', img: 'https://www.mcbbs.net/source/plugin/mcbbs_lucky_card/magic/magic_lucky_card.gif' },
                { text: '宣传', url: 'plugin.php?id=mcbbs_ad:ad_manage', img: 'https://patchwiki.biligame.com/images/mc/4/43/pfmuw066q7ugi0wv4eyfjbeu3sxd3a4.png' },
                { text: '设置', url: 'home.php?mod=spacecp', title: 'SaltMCBBS设置在下面', img: 'https://patchwiki.biligame.com/images/mc/9/90/dr8rvwsbxfgr79liq91icuxkj6nprve.png' },
            ]
            this.addChildren(addons, this.obj2a(myaddon))
            addons.className = 'addons'

            // userinfo 用户信息
            movePageHeadGetUserInfo(userinfo)
            userinfo.className = 'userinfo'

            // 添加节点
            leftdiv.appendChild(userinfo)
            // 移动搜索框
            let searchbox = document.querySelector('.cl.y_search')
            if (searchbox instanceof HTMLElement) { leftdiv.appendChild(searchbox) }
            let searchtype = document.querySelector('#scbar_type_menu')
            if (searchtype instanceof HTMLElement) {
                leftdiv.appendChild(searchtype)
                if (searchbox instanceof HTMLElement) {
                    // 控制高度, 适应各个比例的浏览器窗口
                    searchtype.style.setProperty('--top', Math.floor(Math.max(searchbox.offsetTop, 200) + 25) + 'px')
                }
            }
            // 继续添加节点
            leftdiv.appendChild(addons); leftdiv.appendChild(links)
            leftdiv.addEventListener('dblclick', () => { obj.toggleNightStyle() })
            document.body.appendChild(leftdiv)

            // 添加CSS
            window.saltMCBBSCSS.putStyle('', 'pagehead')
            /**更新左侧栏的信息 */
            function movePageHeadGetUserInfo(el: Element) {
                // let safe = 0
                let uid = obj.getUID()
                if (uid < 1) { return } // 为零则说明没有登录
                obj.fetchUID(uid, (data: BBSAPIResponceData) => {
                    // console.log(data)
                    let variable: BBSAPIResponceDataVariables = data.Variables
                    let space: BBSAPIResponceDataVariablesSpace = variable.space
                    let creaitex: BBSAPIResponceDataVariablesExtcredits = variable.extcredits
                    obj.messageOp(variable.notice)     //处理新消息相关
                    let credits = space.credits;        //总积分
                    let post = space.posts;             //回帖
                    let thread = space.threads;         //主题
                    let digestpost = space.digestposts; //精华
                    let extcredits = [
                        '0',
                        space.extcredits1,
                        space.extcredits2,
                        space.extcredits3,
                        space.extcredits4,
                        space.extcredits5,
                        space.extcredits6,
                        space.extcredits7,
                        space.extcredits8,
                    ]
                    let uid = space.uid // uid
                    let uname = space.username ?? ''  //用户名
                    let group = space.group; //用户组信息
                    let lowc = parseInt(group.creditslower), highc = parseInt(group.creditshigher)
                    let grouptitle = space.group.grouptitle ?? ''; //用户组
                    let progress = Math.round((parseInt(credits) - highc) / (lowc - highc) * 10000) / 100
                    let progresstitle = highc + ' -> ' + lowc + ' | 还需: ' + (lowc - parseInt(credits)) + ' | 进度: ' + progress + '%'
                    el.innerHTML = `
<div class="username">
<a href="https://www.mcbbs.net/?${uid}">${uname}</a>
<div>${space.customstatus}</div>
<img id="settingsaltMCBBS" src="https://www.mcbbs.net/uc_server/data/avatar/${uidFormat(uid)}_avatar_middle.jpg" width=100 />
</div>
<div class="thread">
<a href="https://www.mcbbs.net/forum.php?mod=guide&view=my&type=reply" target="_blank">回帖数: ${post}</a>
<a href="https://www.mcbbs.net/forum.php?mod=guide&view=my" target="_blank">主题数: ${thread}</a>
<span>精华帖: ${digestpost}</span>
</div>
<span class="progress" tooltip="${progresstitle}"><span style="width:${progress}%">&nbsp;</span></span>
<div class="credit">
<span><a href="https://www.mcbbs.net/home.php?mod=spacecp&ac=credit" target="_self">总积分: ${credits}</a></span>
<span><a href="https://www.mcbbs.net/home.php?mod=spacecp&ac=usergroup" target="_self">${grouptitle}</a></span>
<span>${creaitex[1].img}${creaitex[1].title}: ${extcredits[1] + creaitex[1].unit}</span>
<span>${creaitex[2].img}${creaitex[2].title}: ${extcredits[2] + creaitex[2].unit}</span>
<span>${creaitex[3].img}${creaitex[3].title}: ${extcredits[3] + creaitex[3].unit}</span>
<span>${creaitex[4].img}${creaitex[4].title}: ${extcredits[4] + creaitex[4].unit}</span>
<span>${creaitex[5].img}${creaitex[5].title}: ${extcredits[5] + creaitex[5].unit}</span>
<span>${creaitex[6].img}${creaitex[6].title}: ${extcredits[6] + creaitex[6].unit}</span>
<span>${creaitex[7].img}${creaitex[7].title}: ${extcredits[7] + creaitex[7].unit}</span>
<span>${creaitex[8].img}${creaitex[8].title}: ${extcredits[8] + creaitex[8].unit}</span>
</div>
`
                    function uidFormat(uid: string | number) {
                        let u = uid + ''
                        while (u.length < 9)
                            u = '0' + u
                        return u.slice(0, 3) + '/' + u.slice(3, 5) + '/' + u.slice(5, 7) + '/' + u.slice(7, 9)
                    }
                })
            }
        }
        /**获取新消息的数量并显示 */
        messageOp(notice: BBSAPIResponceDataVariablesNotice) {
            let xx = document.querySelector('#saltNewPageHead .addons a.saltmessage')
            if (!xx) { return }
            let msg: number[] = [
                parseInt(notice.newmypost), // 新回复
                parseInt(notice.newpm),     // 新私信
                parseInt(notice.newprompt), // 新通知
                parseInt(notice.newpush),   // 新推送
            ], sum = 0
            for (var i in msg) { sum += msg[i] }
            if (sum > 6) { sum = 6 }
            if (sum > 0) {
                xx.setAttribute('title', `新回复: ${msg[0]} | 新私信: ${msg[1]} | 新通知: ${msg[2]} | 新推送: ${msg[3]}`)
            }
            let img = document.querySelector('#saltNewPageHead .addons a.saltmessage img')
            if (img) { img.setAttribute('src', noticimgurl[sum]) }
        }
        /**警告相关 */
        warnOP() {
            this.assert(autoRunLock, '不在页面初始运行状态')
            // 看帖页面
            this.saltQuery('#postlist .plhin:not([warnOP])', (i, el) => {
                // 给所有被警告的帖子添加 warned 类
                if (el.querySelector('.plc .pi a[title*="受到警告"]')) {
                    if (el.parentElement) {
                        el.parentElement.classList.add('warned')
                    } else {
                        el.classList.add('warned')
                    }
                } else {
                    // 有的帖子只是被扣分了
                    for (let td of Array.from(el.querySelectorAll('.rate td.xg1,.rate td.xw1'))) {
                        if (td.textContent?.indexOf('人气 -') == 0 // 总计人气为负数或一次被扣了5点积分
                            || td.textContent == '-10' || td.textContent == '-5' || td.textContent == '-15' || td.textContent == '-20') {
                            if (el.parentElement) {
                                el.parentElement.classList.add('warned')
                            } else {
                                el.classList.add('warned')
                            }
                        }
                    }
                }
                // 添加查看警告按钮
                // 获取UID
                let uid: string = '0'
                let uname = el.querySelector('.authi .xw1')
                if (uname) {
                    uid = (/uid=(\d+)/.exec(uname.getAttribute('href') ?? '') ?? ['', '0'])[1]
                }
                if (uid != '0') {
                    // 添加按钮
                    let a = el.querySelector('.favatar ul.xl')
                    if (!a) { // 没有这个ul就自建一个
                        a = document.createElement('ul')
                        a.className = 'xl xl2 o cl'
                        let f = el.querySelector('.pls.favatar')
                        if (f) { f.appendChild(a) }
                    }
                    let li = document.createElement('li')
                    li.className = 'pmwarn'; li.appendChild(addWarnBtn(uid))
                    a.appendChild(li)
                }
                // 标记元素
                el.setAttribute('warnOP', '')
            })
            // 用户页
            this.saltQuery('#uhd:not([warnOP])', (i, el) => {
                // 获取UID
                let uid: string = window.discuz_uid
                let uname = el.querySelector('.h .avt a')
                if (uname) {
                    console.log(uname)
                    uid = (/uid=(\d+)/.exec(uname.getAttribute('href') ?? '') ?? ['', '0'])[1]
                }
                // 添加按钮
                let a = el.querySelector('.mn ul')
                let li = document.createElement('li')
                li.className = 'pmwarn'; li.appendChild(addWarnBtn(uid))
                if (a) {
                    a.appendChild(li)
                } else {
                    let div = document.createElement('div'); div.className = 'mn'
                    let ul = document.createElement('ul')
                    ul.appendChild(li)
                    div.appendChild(ul)
                    el.prepend(div)
                }
                // 标记元素
                el.setAttribute('warnOP', '')
            })
            function addWarnBtn(uid: number | string, text: string = '查看警告记录') {
                let a = document.createElement('a')
                a.href = 'forum.php?mod=misc&action=viewwarning&tid=19&uid=' + uid
                a.title = text; a.textContent = text
                a.className = 'xi2'
                a.setAttribute('onclick', 'showWindow(\'viewwarning\', this.href)')
                return a
            }
        }
        /**自定义评分、举报理由 */
        reasonListOP() {
            this.assert(autoRunLock, '不在页面初始运行状态')
            /**监听评分与举报理由列表 */
            this.saltObserver('append_parent', () => {
                // 添加评分理由
                let rateUl = document.querySelector('.reasonselect:not([done])')
                // console.log(rateUl);
                if (rateUl) {
                    /**评分理由列表 */
                    let rateReasonList = this.cleanStringArray(this.readWithDefault<string[]>('rateReasonList', []))
                    rateUl.setAttribute('done', '')
                    for (let rea of rateReasonList) {
                        let li = document.createElement('li')
                        li.textContent = rea
                        li.onmouseover = function () { li.className = 'xi2 cur1' }
                        li.onmouseout = function () { li.className = '' }
                        li.onclick = function () {
                            let r: HTMLElement | null = document.getElementById('reason')
                            if (r instanceof HTMLInputElement) { r.value = li.textContent ?? '' }
                        }
                        rateUl.appendChild(li)
                    }
                }
                // 添加举报理由
                let reportUl = document.querySelector('#report_reasons:not([done])')
                // console.log(reportUl);
                if (reportUl) {
                    /**举报理由列表 */
                    let reportReasonList = this.cleanStringArray(this.readWithDefault<string[]>('reportReasonList', []))
                    reportUl.setAttribute('done', '')
                    // 移动“其他”选项
                    let qita = reportUl.querySelector('input[value="其他"]')
                    /**其他选项的父元素lable */
                    let qitaP: HTMLElement | null = null
                    /**伴随的一个br */
                    let qitabr: Element | null = null
                    // 开始添加自定义的举报理由
                    if (qita) {
                        qitaP = qita.parentElement
                        if (qitaP) {
                            qitabr = qitaP.nextElementSibling
                        }
                    }
                    for (let rea of reportReasonList) {
                        let br = document.createElement('br')
                        let label = document.createElement('label')
                        label.innerHTML = `<input type="radio" name="report_select" class="pr" onclick="$('report_other').style.display='none';$('report_msg').style.display='none';$('report_message').value='${rea}'" value="${rea}">${rea}`
                        reportUl.appendChild(label); reportUl.appendChild(br)
                    }
                    // 把那两个元素塞回去
                    if (qitaP) { reportUl.appendChild(qitaP) }
                    if (qitabr) { reportUl.appendChild(qitabr) }
                }
            })
            // 评分理由设置项
            /**评分理由列表 */
            let rateReasonList = this.readWithDefault<string[]>('rateReasonList', [])
            this.addTextareaSetting('自定义评分理由<small> 评分时可供选择的理由，一行一个，开头添加“//”暂时禁用</small>', rateReasonList.join('\n'), (el: HTMLTextAreaElement, e: Event) => {
                this.write('rateReasonList', this.formatToStringArray(el.value))
            }, '自定义评分理由', 101)
            // 举报理由设置项
            /**举报理由列表 */
            let reportReasonList = this.readWithDefault<string[]>('reportReasonList', [])
            this.addTextareaSetting('自定义举报理由<small> 举报时可供选择的理由，一行一个，开头添加“//”暂时禁用</small>', reportReasonList.join('\n'), (el: HTMLTextAreaElement, e: Event) => {
                this.write('reportReasonList', this.formatToStringArray(el.value))
            }, '自定义举报理由', 102)
        }
        /**论坛特性修复 */
        bugFixOP() {
            this.assert(autoRunLock, '不在页面初始运行状态')
            // 版块页面帖子列表的错位问题
            // let threadList = document.querySelector('#moderate table tbody')
            // if (threadList) {
            //     // 有公告存在时，作者栏向上错位1px
            //     let threadListBy = threadList?.querySelector('td.by')
            //     if (threadListBy && threadListBy.innerHTML.length < 2) { threadListBy.innerHTML = '&nbsp;' }
            // }
            window.saltMCBBSCSS.putStyle(
                `#threadlist table{border-collapse:collapse}#threadlist table td,#threadlist table th{border-bottom:0px;}#threadlist table tr{border-bottom:1px solid #CFB78E;}`
                , 'threadListBugFix')

        }
        /**勋章相关 */
        medalOP() {
            this.assert(autoRunLock, '不在页面初始运行状态')
            let obj = this
            let enable = this.readWithDefault('saltMedalFunction', true)
            let blur = this.readWithDefault('saltMedalBlur', true)
            window.saltMCBBSCSS.setStyle('div.tip[id$="_menu"]:before{image-rendering:auto;filter:blur(3px)}', 'saltMedalBlurCSS')
            // 添加设置项
            this.addCheckSetting('启用勋章栏功能<br><small> 特别的勋章样式(会被MCBBS Extender覆盖)</small>', enable, (ck, ev) => {
                this.write('saltMedalFunction', ck)
                enable = ck
                if (enable) {
                    window.saltMCBBSCSS.putStyle('', 'medal')
                    setTimeout(sub, 500)
                } else {
                    window.saltMCBBSCSS.delStyle('medal')
                }
            }, '启用勋章栏功能', 50)
            this.addCheckSetting('勋章大图高斯模糊<br><small>不再使用默认的等比放大</small>', blur, (ck, ev) => {
                this.write('saltMedalBlur', ck)
                if (ck) {
                    window.saltMCBBSCSS.putStyle('', 'saltMedalBlurCSS')
                } else {
                    window.saltMCBBSCSS.delStyle('saltMedalBlurCSS')
                }
            }, '勋章大图高斯模糊', 51)
            this.addInputSetting('勋章栏高度<br><small> 64像素/行, 可以输入小数(会被MCBBS Extender覆盖)</small>', this.readWithDefault<number>('medalLine', 3) + '', (el, e) => {
                let line = parseFloat(el.value)
                if (isNaN(line)) { return }
                if (line < 0.5) { line = 0.5 }
                if (line > 25) { line = 25 }
                this.write('medalLine', line)
                if (enable) { sub() } else {
                    this.message('使用勋章栏高度控制功能前，需要先启用勋章栏功能', (f) => { f() }, 3)
                }
            }, '勋章栏高度', 52)
            // 是否启用
            if (enable) {
                window.saltMCBBSCSS.putStyle('', 'medal')
                sub()
            }
            // 模糊
            if (blur) {
                window.saltMCBBSCSS.putStyle('', 'saltMedalBlurCSS')
            }
            // 监听页面出现新的勋章栏
            this.saltObserver('postlist', () => {
                if (document.querySelector('p.md_ctrl:not([saltMedalFunction-checked])')) {
                    sub()
                }
            })
            async function sub() { // 因为只涉及部分元素的class操作，所以放在异步
                let line = obj.readWithDefault<number>('medalLine', 2.5)
                let style = 'p.md_ctrl,p.md_ctrl:hover{--maxHeight:calc(64px * ' + line + ');}'
                window.saltMCBBSCSS.putStyle(style, 'medalLine')
                addBtn()
                heightCheck()
                setTimeout(() => {
                    addBtn()
                    heightCheck()
                }, 500)
                function heightCheck() {
                    obj.saltQuery('p.md_ctrl', (i, el) => {
                        if (!(el instanceof HTMLElement)) { return }
                        if (el.scrollHeight > el.offsetHeight + 3) { // 有2px的边框误差
                            // obj.log(el.scrollHeight + '||' + el.offsetHeight)
                            el.addClass('expandable')
                        } else {
                            el.removeClass('expandable')
                        }
                    })
                }
                function addBtn() {// 添加展开/关闭按钮
                    obj.saltQuery('p.md_ctrl:not([saltMedalFunction-checked])', (i, el) => {
                        if (!(el instanceof HTMLElement)) { return }
                        el.setAttribute('saltMedalFunction-checked', '')
                        let img = el.querySelectorAll('a img'); if (img.length < 1) { return }
                        // 通过a确定实际高度
                        let a = el.querySelector('a'); if (!a) { return }
                        // 点击后展开
                        el.style.setProperty('--expandHeight', (a.offsetHeight + 96) + 'px')
                        let div = document.createElement('div')
                        div.addClass('saltExpandHandler')
                        div.addEventListener('click', () => {
                            el.toggleClass('salt-expand')
                        })
                        el.appendChild(div)
                    })
                }
            }
        }
        /**反嗅探 */
        antiSniff() {
            let enable = this.readWithDefault<boolean>('saltAntiSniff', true), tellme = this.readWithDefault<boolean>('saltAntiSniffRecat', true)
            let obj = this
            /**使用Set来确保页面中的个人空间探针重复时不会全部复读一遍 */
            let pages = new Set<string>()
            this.addCheckSetting('反嗅探措施<br><small>屏蔽一些坛友的部分探针</small>', enable, (ck, ev) => {
                this.write('saltAntiSniff', ck)
                if (ck)
                    sub()
            }, '反嗅探措施', 31)
            this.addCheckSetting('处理探针后是否通知<br><small>右下角的提示可能会有点烦人</small>', tellme, (ck, ev) => {
                this.write('saltAntiSniffRecat', ck)
                tellme = ck
            }, '处理探针后是否通知', 32)
            if (enable)
                sub()
            async function sub() {
                obj.saltQuery('img:not([saltAntiSniff-check-done])', (i, el) => {
                    if (el instanceof HTMLImageElement) {
                        el.setAttribute('saltAntiSniff-check-done', '') // 标记为已处理
                        if (el.hasAttribute('src')) {
                            if (el.src.indexOf('home.php?') != -1 &&
                                !/(\&additional\=removevlog|mod\=task\&do\=apply)(\&|$)/.test(el.src)) {
                                if (tellme)
                                    obj.message('侦测到<img>探针: <br>' + el.src + '<br>类型: Discuz!访客探针', (f) => { f() })
                                console.log(el)
                                if (!pages.has(el.src)) {
                                    pages.add(el.src)
                                    setTimeout(() => { el.src += '&additional=removevlog' }, 50)
                                }
                                // else {
                                //     obj.message('重复' + el.src)
                                // }
                                // obj.log('已处理<img>探针')
                            }
                        }
                        if (el.hasAttribute('file')) {
                            if ((el.getAttribute('file') ?? '').indexOf('home.php?') != -1 &&
                                !/\&additional\=removevlog(\&|$)/.test((el.getAttribute('file') ?? ''))) {
                                if (tellme)
                                    obj.message('侦测到<img>探针: <br>' + (el.getAttribute('file') ?? '') + '<br>类型: Discuz!访客探针', (f) => { f() })
                                console.log(el)
                                el.setAttribute('file', (el.getAttribute('file') ?? '') + '&additional=removevlog')
                                // obj.log('已处理<img>探针')
                            }
                        }
                    }
                })
                // 鼠标滑过显示个人信息框的那种锚点
                obj.saltQuery('a.notabs:not([saltAntiSniff-check-done])', (i, el) => {
                    if (el instanceof HTMLAnchorElement && el.hasAttribute('href')) {
                        el.setAttribute('saltAntiSniff-check-done', '') // 标记为已处理
                        el.addEventListener('mouseout', () => {
                            obj.log('已处理访客探针: ' + el.href)
                            fetch(el.href + '&view=admin&additional=removevlog')
                        })
                    }
                })
            }
        }
        /**记忆用户举报过的帖子 */
        reportRememberOP() {
            this.assert(autoRunLock, '不在页面初始运行状态')
            // pid数组记录在数据库，最大显示数量记录在localstorage
            let obj = this
            let saveKey = 'saltReportRemember'
            let numSaveKey = 'saltReportRememberLength'
            // let enable = true
            main()
            /**主过程 */
            async function main() {
                if (obj.getUID() < 1) {
                    obj.message('未检测到UID<br>点击重试 <a href="https://www.mcbbs.net/member.php?mod=logging&action=login">点击登录</a> <a href="https://www.mcbbs.net/bilibili_connect.php?mod=auth&op=login">B站登录</a>', (f) => {
                        f()
                        main()
                    })
                    return
                }
                saveKey += '-' + obj.getUID()
                await obj.dataBaseHandler.waitForReady() // 等待数据库准备完毕
                await update()
                // 检测帖子
                check()
                // 添加配置项
                // obj.addInputSetting('帖子举报历史记录长度<br><small>建议在4w以内, 设为 0 关闭此功能</small>',
                //     '' + obj.readWithDefault<number>(numSaveKey, 1024),
                //     (el, ev) => {
                //         let len = parseInt(el.value)
                //         if (isNaN(len)) { return }
                //         if (len < 0) { len = 0 }
                //         if (len > 1048576) { len = 1048576 }
                //         obj.write(numSaveKey, len)
                //     }, '举报记录功能', 61)
                obj.addSetting({
                    type: 'input',
                    title: '帖子举报历史记录长度',
                    subtitle: '建议在4w以内, 设为 0 关闭此功能',
                    text: '' + obj.readWithDefault<number>(numSaveKey, 1024),
                    callback: (el, ev) => {
                        let len = parseInt(el.value)
                        if (isNaN(len)) { return }
                        if (len < 0) { len = 0 }
                        if (len > 1048576) { len = 1048576 }
                        obj.write(numSaveKey, len)
                    },
                    name: '举报记录功能',
                    priority: 61,
                })
                // 监听用户点击举报
                let obs = obj.saltObserver('append_parent', () => {
                    // 获取举报按钮
                    let reportBtn = document.querySelector('#report_submit[fwin]:not([done])')
                    // console.log(reportUl);
                    if (reportBtn) {
                        /**举报理由列表 */
                        reportBtn.setAttribute('done', '')
                        /**提取PID, 没提取到则为0 */
                        let pid = ((reportBtn.getAttribute('fwin') ?? '0').match(/\d+/) ?? ['0'])[0]
                        if (pid != '0') {
                            reportBtn.addEventListener('click', () => {
                                obj.log('检测到举报: pid-' + pid)
                                push(pid)
                            })
                        }
                    }
                })
            }
            /**将刚刚举报的帖子的PID压入本地储存 */
            async function push(pid: number | string) {
                // 管理PID
                if (typeof pid == 'string') {
                    pid = parseInt(pid)
                    if (isNaN(pid) || pid < 1) {
                        return
                    }
                } else if (typeof pid == 'number') {
                    if (pid < 1) {
                        return
                    }
                } else if (typeof pid == 'bigint') {
                    if (pid < 1) {
                        return
                    }
                }
                // 获取PID列表
                let pidList = await obj.dataBaseHandler.read<number[]>(saveKey, [])
                pidList.push(pid)
                // 记录
                await obj.dataBaseHandler.write(saveKey, pidList)
                obj.log('已记录举报: pid-' + pid)
                // 刷新检测
                check()
            }
            /**去除某个历史记录 */
            // async function remove(pid: number | string) {
            //     // 管理PID
            //     if (typeof pid == 'string') {
            //         pid = parseInt(pid)
            //         if (isNaN(pid) || pid < 1) {
            //             return
            //         }
            //     } else if (typeof pid == 'number') {
            //         if (pid < 1) {
            //             return
            //         }
            //     } else if (typeof pid == 'bigint') {
            //         if (pid < 1) {
            //             return
            //         }
            //     }
            //     // 获取PID列表
            //     let pidList = obj.readWithDefault<number[]>(saveKey, [])
            //     let inedx = pidList.indexOf(pid)
            //     if (inedx != -1) {
            //         pidList.splice(inedx, 1)
            //     }
            //     // 刷新检测
            //     check()
            // }
            /**给已举报的帖子添加标记 */
            async function check() {
                // let pidList = cut(obj.readWithDefault<number[]>(saveKey, []), obj.readWithDefault<number>(numSaveKey, 1024))
                let pidList = cut(await obj.dataBaseHandler.read<number[]>(saveKey, []), obj.readWithDefault<number>(numSaveKey, 1024))
                // console.log(pidList)
                // 检查是不是有帖子被错误打上了标记
                for (let div of Array.from(document.querySelectorAll('#postlist > div.reported'))) {
                    if (!(div instanceof HTMLElement)) { continue }
                    let pid = parseInt(((div.getAttribute('id') ?? '0').match(/\d+/) ?? ['0'])[0])
                    if (pidList.indexOf(pid) == -1) {
                        div.removeClass('reported')
                    }
                }
                // 检查是不是有帖子没有打上标记
                for (let div of Array.from(document.querySelectorAll('#postlist > div:not(.reported)'))) {
                    if (!(div instanceof HTMLElement)) { continue }
                    let pid = parseInt(((div.getAttribute('id') ?? '0').match(/\d+/) ?? ['0'])[0])
                    if (pidList.indexOf(pid) != -1) {
                        div.addClass('reported')
                    }
                }
            }
            /**数组控制长度 */
            function cut(list: number[], len: number): number[] {
                let newlist = list
                let diff = newlist.length - len
                if (diff < 1) { return newlist }
                newlist = newlist.slice(diff)
                return newlist
            }
            /**升级数据到0.1.7 */
            async function update() {
                let oldData = obj.read<number[]>(saveKey)
                if (!oldData || oldData.length == 0) return
                let newData = obj.unique([...oldData, ...(await obj.dataBaseHandler.read<number[]>(saveKey, []))])
                // obj.log(oldData)
                // obj.log(newData)
                // localStorage.removeItem(techprefix + saveKey)
                await obj.dataBaseHandler.write(saveKey, newData)
            }
        }
        /**替代Discuz的图片懒加载 */
        lazyLoadImgOP() {
            this.assert(autoRunLock, '不在页面初始运行状态')
            let enable = this.readWithDefault<boolean>('lazyLoadImgEnable', true), obj = this
            this.addCheckSetting('另一种图片懒加载<br><small>一种更友好的图片懒加载方式</small>', enable, (ck, ev) => {
                obj.write('lazyLoadImgEnable', ck)
                obj.message('图片懒加载模式切换需要刷新生效', (f) => { f() }, 3)
            }, '另一种图片懒加载', 45)
            //懒加载时启用代理
            // 检查有没有启用懒加载
            if (!enable) { return }
            // 获取页面上尚未被discuz懒加载的图片
            let imgs: HTMLImageElement[]
            if (window.lazyload) { // 如果页面中已有BBS的lazyload
                imgs = HTMLImgFliter(window.lazyload.imgs ?? [])
                window.lazyload.imgs = [] // 劫持
            } else {
                imgs = HTMLImgFliter([
                    ...Array.from(document.querySelectorAll('.t_fsz .t_f img:not([src]):not([lazyloaded])')),
                    ...Array.from(document.querySelectorAll('.t_fsz .t_f img[src*="static/image/common/none.gif"]:not([lazyloaded])')),
                    ...Array.from(document.querySelectorAll('.t_fsz .pattl img[src*="static/image/common/none.gif"]:not([lazyloaded])')),
                ])
            }
            let obs = new IntersectionObserver((entries) => {
                let img = entries[0].target
                obs.unobserve(img)
                if (!(img instanceof HTMLImageElement)) { return } // 可能监听错了？
                img.setAttribute('src', img.getAttribute('file') ?? '')
                img.setAttribute('alt', '图片加载中, 请稍作等待......')
                obj.log('加载图片: ' + (img.getAttribute('file') ?? ''))
                // 控制图片大小
                setTimeout(() => { if (!(img.hasAttribute('loaded')) && img.hasAttribute('lazyloadthumb')) { window.thumbImg(img) } }, 500)
                // 不放心, 所以1.5s、5s、10s后再处理一次
                setTimeout(() => { if (!(img.hasAttribute('loaded')) && img.hasAttribute('lazyloadthumb')) { window.thumbImg(img) } }, 1500)
                setTimeout(() => { if (!(img.hasAttribute('loaded')) && img.hasAttribute('lazyloadthumb')) { window.thumbImg(img) } }, 5000)
                setTimeout(() => { if (!(img.hasAttribute('loaded')) && img.hasAttribute('lazyloadthumb')) { window.thumbImg(img) } }, 10000)
            });
            for (let img of imgs) {
                img.setAttribute('lazyloaded', 'true') // 标记为已开始加载, 骗过Discuz的懒加载
                img.src = '' // src为空
                img.style.maxWidth = '750px'
                // 控制图片大小
                img.addEventListener('load', () => {
                    img.setAttribute('loaded', '')
                    if (img.hasAttribute('lazyloadthumb')) { window.thumbImg(img) }
                })
                // 失败提示
                img.addEventListener('error', () => {
                    if (img.hasAttribute('waitRetry'))
                        img.alt = '加载失败, 点击重试或等待自动重载......'
                    img.setAttribute('waitRetry', '') // 标记为等待重新加载
                })
                // 点击重试
                img.addEventListener('click', () => {
                    if (!(img.hasAttribute('loaded')) && img.hasAttribute('waitRetry')) {
                        img.alt = '图片重新加载中......'
                        img.removeAttribute('waitRetry') // 去除等待重新加载的标记
                        img.numAttribute('retry').add(1)
                        // 重新加载
                        img.src = img.getAttribute('file') ?? img.getAttribute('src') ?? ''
                    }
                })
                // 监听
                obs.observe(img)
                obj.log('劫持图片: ' + (img.getAttribute('file') ?? ''))
            }
            /**过滤一个元素数组, 返回一个图片元素数组 */
            function HTMLImgFliter(elems: Element[]): HTMLImageElement[] {
                let imgs: HTMLImageElement[] = []
                for (let el of elems)
                    if (el instanceof HTMLImageElement)
                        imgs.push(el)
                return imgs
            }
        }
        /**给图片添加代理、反防盗链 */
        imgProxyOP() {
            let enableProxy = this.readWithDefault<boolean>('LoadImgProxyEnable', true),
                enableAntiASL = this.readWithDefault<boolean>('antiAntiStealingLinkEnable', true),
                obj = this
            /**选择器 */
            let cssSelector = window.location.href.indexOf('action=printable') == -1 ? '.t_fsz .t_f img, .img img' : 'body > img, body > * > img'
            cssSelector += window.location.href.indexOf('/forum.php') != -1 ? ', .common p > img' : ''// 带预览图的格式浏览版块
            cssSelector += window.location.href.indexOf('thread') != -1 ? ', .plhin .sign img' : ''// 浏览帖子时检查一下签名框
            this.addCheckSetting('启用代理加载图片<br><small>访问imgur等现在访问困难的图床</small>', enableProxy, (ck, ev) => {
                enableProxy = ck
                obj.write('LoadImgProxyEnable', ck)
                obj.message('代理加载配置需要刷新页面生效', (f) => { f() }, 3)
            }, '启用代理加载图片', 47)
            this.addCheckSetting('启用反反盗链功能<br><small>访问微博、贴吧等后来启用反盗链的图床</small>', enableAntiASL, (ck, ev) => {
                enableAntiASL = ck
                obj.write('antiAntiStealingLinkEnable', ck)
                obj.message('反反盗链配置需要刷新页面生效', (f) => { f() }, 3)
            }, '启用反反盗链功能', 46)
            handler()
            this.saltObserver('ct', handler) // 别问，只是一个适配功能
            function handler() {
                obj.saltQuery(cssSelector, (i, img) => {
                    if (img instanceof HTMLImageElement) {
                        if (enableProxy) { addProxy(img) }
                        if (enableAntiASL) { antiAntiStealingLink(img) }
                    }
                })
            }
            /**使用代理 */
            function addProxy(img: HTMLImageElement): void {
                if (img.hasAttribute('proxyed')) { return }
                let src = '', attr = 'src' // attr: 要处理的属性, 默认src, 没有则处理file
                /**代理, 用了多个worker分流, 不然用的人多了很容易爆炸 */
                let proxy = obj.randomChoice([
                    // 'https://saltproxy.saltlovely.workers.dev/', // 我的worker, 流量有限
                    // 'https://public-cdrl-proxy.moushu.workers.dev/', // 白嫖朋友的worker, 也是免费套餐流量有限
                    'https://images.weserv.nl/?url=', // 火力无限.jpg
                ])
                /**需要代理的网站列表 */
                let needProxyWebSite = ['imgur.com/', 'upload.cc/']
                src = img.getAttribute(attr) ?? ''
                if (src.indexOf('static/image/common/none.gif') != -1 || src.length < 4) {
                    attr = 'file'
                    src = img.getAttribute(attr) ?? ''
                }
                for (let s of needProxyWebSite) {
                    if (src.indexOf(s) != -1) {
                        obj.log('检查到需要代理的图床: ' + s + '\n - 链接: ' + src)
                        src = proxy + src
                        img.setAttribute(attr, src)
                        img.setAttribute('proxyed', '')
                        return
                    }
                }
            }
            /**反反盗链 */
            function antiAntiStealingLink(img: HTMLImageElement) {
                if (img.hasAttribute('referrerpolicy')) { return }
                let src = '', attr = 'src' // attr: 要处理的属性, 默认src, 没有则处理file
                /**需要反反盗链的图床网址 */
                let antiStealingLinkWebSite = ['sinaimg.cn', 'tiebapic.baidu.com', 'qpic.cn', 'planetminecraft.com', 'hdslb.com',/*'bvimg.com',*/]
                /**需要特殊反反盗链的图床网址 */
                let advancedAntiStealingLinkWebSite = ['hiphotos.bdimg.com', 'minecraftxz.com',]
                src = img.getAttribute(attr) ?? ''
                if (src.indexOf('static/image/common/none.gif') != -1 || src.length < 4) {
                    attr = 'file'
                    src = img.getAttribute(attr) ?? ''
                }
                for (let s of advancedAntiStealingLinkWebSite) {
                    if (src.indexOf(s) != -1) {
                        iframeSet(img, s, src)
                        return
                    }
                }
                for (let s of antiStealingLinkWebSite) {
                    if (src.indexOf(s) != -1) {
                        noRefSet(img, s)
                        return
                    }
                }
                /**取消请求头中的来源以绕过反盗链 */
                function noRefSet(img: HTMLImageElement, tuChuang: string) {
                    img.setAttribute('referrerpolicy', 'no-referrer')
                    // img.setAttribute('referrerPolicy', 'no-referrer')
                    obj.log('检查到需要反反盗链的图床: ' + tuChuang + '\n - 链接: ' + src)
                }
                /**使用iframe加载来绕过反盗链 */
                function iframeSet(img: HTMLImageElement, tuChuang: string, src: string) {
                    img.setAttribute('referrerpolicy', 'no-referrer')
                    obj.log('检查到需要代理以反反盗链的图床: ' + tuChuang + '\n - 链接: ' + src)
                    src = 'https://images.weserv.nl/?url=' + src // 转发代理
                    img.src = src
                    //                     // let id = 'iframeimg' + Math.floor(Math.random() * 1e16)
                    //                     let iframe = document.createElement('iframe')
                    //                     // iframe.id = id
                    //                     iframe.style.border = 'none'
                    //                     iframe.style.borderWidth = '0px'
                    //                     img.parentElement!.appendChild(iframe)
                    //                     if (!iframe.contentDocument) { console.log('dasdasdasdada'); return }
                    //                     // 写入img
                    //                     iframe.contentDocument.body.innerHTML = `<!-- SaltMCBBS -->
                    // <img id="img" src="${src.replace('http:', 'https:')}">
                    // <img id="img" src="${src.replace('https:', 'http:')}">`
                    //                     // <script>
                    //                     // /*(function() { 
                    //                     //     img = document.getElementById("img")
                    //                     //     img.onload = function(){
                    //                     //         parent.document.getElementById("${id}").height = img.offsetHeight+"px";
                    //                     //         parent.document.getElementById("${id}").width = img.offsetWidth+"px";
                    //                     //     }
                    //                     // })*/
                    //                     // </script>
                    //                     // img.style.display = 'none'
                    //                     iframe.style.display = 'none'
                }
            }
        }
        /**帖子分类 */
        threadClassifyOP() {
            let enable = this.readWithDefault<boolean>('threadClassifyEnable', true), obj = this
            this.addCheckSetting('帖子分类高亮<br><small>按照帖子的类型进行高亮</small>', enable, (ck, ev) => {
                obj.write('threadClassifyEnable', ck)
                enable = ck
                if (enable) { fullCheck(); window.saltMCBBSCSS.putStyle('', 'threadClassify') }
                else { disable(); window.saltMCBBSCSS.delStyle('threadClassify') }
            }, '帖子分类高亮', 43)
            // 检查是否启用
            if (enable) { fullCheck(); window.saltMCBBSCSS.putStyle('', 'threadClassify') }
            // 监听帖子列表
            let threadlisttableid = document.querySelector('#threadlisttableid')
            if (threadlisttableid) {
                this.saltObserver(threadlisttableid, () => {
                    if (enable) { fullCheck() }
                })
            }
            /*
            ** 主题分类（如“讨论”“娱乐”“临时”之类的）会塞进“type”属性里 **
            ** 主题作者昵称（如“混乱”）会塞进“author”属性里 **
            ** 其他属性以类的形式添加到帖子列表的帖子上 **
            top-1 top-2 top-3 本版置顶 大区置顶 全局置顶
            debate newbie 辩论 新人帖
            reward big-reward great-reward 悬赏 高额悬赏100+金粒 高额悬赏500+金粒
            solved 解决
            locked 锁帖
            hot-1 hot-2 hot-3 热帖1 热帖2 热帖3
            rec-1 rec-2 rec-3 推荐1 推荐2 推荐3
            recommend moderator-recommend excellent digestpost 推荐 版主推荐 优秀 精华
            file pic good bad 有附件 有图片 被加分 被扣分
            punitive-publicity 晒尸
            */
            /**启用 */
            async function fullCheck() {
                obj.saltQuery('#threadlisttableid > tbody:not([classified])', (i, el) => {
                    if (!(el instanceof HTMLElement)) { return }
                    el.setAttribute('classified', '') // 添加标记
                    el.setAttribute('type', el.querySelector('th > em a')?.textContent ?? '') // 主题分类
                    el.setAttribute('author', (el.querySelector('.by cite')?.textContent ?? '').replace(/^\s|\s$/g, '')) // 作者昵称
                    /**帖子图标的title */
                    let title = el.querySelector('.icn a')?.getAttribute('title') ?? ''
                    let thread = el.querySelector('th a.s.xst')?.textContent ?? ''
                    // 判断置顶
                    if (title.indexOf('全局置顶') != -1) { el.addClass('top-3') }
                    else if (title.indexOf('分类置顶') != -1) { el.addClass('top-2') }
                    else if (title.indexOf('本版置顶') != -1) { el.addClass('top-1') }
                    // 辩论 新人帖
                    if (title.indexOf('辩论') != -1) { el.addClass('debate') }
                    if (el.querySelector('img[alt="新人帖"]')) { el.addClass('newbie') }
                    // 悬赏
                    if (title.indexOf('悬赏') != -1) {
                        el.addClass('reward')
                        let pirce = parseInt(((el.querySelector('a[title="只看进行中的"]')?.textContent ?? '').match(/\d+/) ?? ['30'])[0])
                        if (pirce >= 100) { el.addClass('big-reward') }
                        if (pirce >= 500) { el.addClass('great-reward') }
                    }
                    // 已解决
                    if (el.querySelector('th a[title="只看已解决的"]')) { el.addClass('solved') }
                    // 锁帖
                    if (title.indexOf('关闭的主题') != -1) { el.addClass('locked') }
                    // 热帖
                    if (el.querySelector('th img[src$="hot_3.gif"]')) { el.addClass('hot-3') }
                    if (el.querySelector('th img[src$="hot_2.gif"]')) { el.addClass('hot-2') }
                    if (el.querySelector('th img[src$="hot_1.gif"]')) { el.addClass('hot-1') }
                    // 推荐帖
                    if (el.querySelector('th img[src$="recommend_3.gif"]')) { el.addClass('rec-3') }
                    if (el.querySelector('th img[src$="recommend_2.gif"]')) { el.addClass('rec-2') }
                    if (el.querySelector('th img[src$="recommend_1.gif"]')) { el.addClass('rec-1') }
                    // 推荐 版主推荐 优秀 精华
                    if (el.querySelector('th img[alt="推荐"]')) { el.addClass('recommend') }
                    if (el.querySelector('th img[alt="版主推荐"]')) { el.addClass('moderator-recommend') }
                    if (el.querySelector('th img[alt="优秀"]')) { el.addClass('excellent') }
                    if (el.querySelector('th img[alt="digest"]')) { el.addClass('digestpost') }
                    // 有附件 有图片 被加分 被扣分
                    if (el.querySelector('th img[alt="attach_img"]')) { el.addClass('pic') }
                    if (el.querySelector('th img[alt="attachment"]')) { el.addClass('file') }
                    if (el.querySelector('th img[alt="agree"]')) { el.addClass('good') }
                    if (el.querySelector('th img[alt="disagree"]')) { el.addClass('bad') }
                    // 晒尸
                    if (/[\[【]\s?.*晒尸\s?[】\]]|^(剽窃|转账)晒尸/.test(thread)) { el.addClass('punitive-publicity') }
                })
            }
            /**禁用 */
            async function disable() {
                obj.saltQuery('#threadlisttableid > tbody[classified]', (i, el) => {
                    if (!(el instanceof HTMLElement)) { return }
                    el.removeAttribute('classified')
                    el.removeAttribute('type')
                    el.removeAttribute('author')
                    el.removeClass('top-1 top-2 top-3 debate newbie reward big-reward great-reward solved locked hot-1 hot-2 hot-3 rec-1 rec-2 rec-3 recommend moderator-recommend excellent digestpost file pic good bad punitive-publicity')
                })
            }
        }
        /**内置反水帖 */
        antiWaterOP() {
            this.assert(autoRunLock, '不在页面初始运行状态')
            let obj = this
            let enableAntiWater = this.readWithDefault<boolean>('SaltAntiWater', false)
            this.addCheckSetting('水帖检测机制<br><small>只会检测页面中的漏网水帖</small>', enableAntiWater, (ck, ev) => {
                this.write('SaltAntiWater', ck)
                this.message('"水帖检测机制"配置项需要刷新生效<br>点击刷新', () => { location.reload() }, 3)
            }, '水帖检测机制', 41);
            (async function () { // 涉及到数据库读写，因此是异步
                await obj.dataBaseHandler.waitForReady() // 等待数据库准备完毕
                /**存起来的内容 */
                let antiWaterRegExpRaw = await obj.dataBaseHandler.read<string>('SaltAntiWaterRegExp',
                    '// 写法: /表达式/标记 -- 表达式: 正则表达式 -- 标记: i-忽略大小写 g-多次匹配 m-多行匹配 -- 示例: /[6六six]{3,}/i' +
                    '\n' + /^[\s\S]{0,2}([\.\*\s]|\/meme\/)*(\S|\/meme\/)\s*(\2([\.\*\s]|\/meme\/)*)*([\.\*\s]|\/meme\/)*[\s\S]?\s?$/ +
                    '\n' + /^[\s\S]{0,3}(请?让?我是?来?|可以)?.{0,3}([水氵]{3}|[水氵][一二两亿]?[帖贴下]+|完成每?日?一?水?帖?贴?的?任务)[\s\S]{0,3}$/)
                /**整理成正则表达式数组 */
                let antiWaterRegExp = string2RegExp(
                    obj.cleanStringArray(
                        obj.formatToStringArray(antiWaterRegExpRaw)
                    )
                )
                obj.addTextareaSetting('自定义水帖匹配正则<small> 匹配水帖，一行一个，开头添加“//”暂时禁用</small>', antiWaterRegExpRaw, (el, ev) => {
                    obj.dataBaseHandler.write('SaltAntiWaterRegExp', el.value)
                    antiWaterRegExp = string2RegExp(
                        obj.cleanStringArray(
                            obj.formatToStringArray(el.value)
                        )
                    )
                    if (enableAntiWater) { obj.antiWater(antiWaterRegExp) }
                }, '自定义水帖匹配正则', 220)
                // 如果启用
                if (enableAntiWater) {
                    setTimeout(() => {
                        obj.antiWater(antiWaterRegExp)
                    }, 500);
                }
            })()
            function string2RegExp(str: string[]): RegExp[] {
                let r: RegExp[] = []
                for (let s of str) {
                    if (s.indexOf('/') != 0) { continue }
                    s = s.slice(1)
                    if (s.indexOf('/') < 1) { continue }
                    let p = s.slice(0, s.lastIndexOf('/')), a = s.slice(s.lastIndexOf('/')).replace(/[^igm]/g, '')
                    r.push(new RegExp(p, a))
                }
                return r
            }
        }
        /**动画效果 */
        animationOP() {
            this.assert(autoRunLock, '不在页面初始运行状态')
            let obj = this
            // 全局更新夜间模式
            document.addEventListener('visibilitychange', updateNightStyle)
            function updateNightStyle() {
                if (document.hidden) return
                /**配置中是不是夜间模式 */
                let isNight = obj.readWithDefault<boolean>('isNightStyle', false)
                /**页面是否处于夜间模式 */
                let isReallyNight = document.body.hasClass('nightS')
                if (isNight != isReallyNight)
                    obj.nightStyle(isNight, false)
            }
            // 代码栏样式优化
            let temp = '', tempFontSize = getRootFontSize()
            for (let i = 10; i < getMaxCodeLine(); i++)
                temp += i + '.\\A '
            window.saltMCBBSCSS.setStyle(`
/**/
.pl .blockcode {position: relative;max-height: 60rem;scrollbar-width: thin;scrollbar-color: #eee #999;overflow-y: auto;}
.pl .blockcode > div {position: relative;z-index: 10;}
.pl .blockcode::-webkit-scrollbar {width: 10px;height: 10px;}
.pl .blockcode::-webkit-scrollbar-thumb {border-radius: 10px;box-shadow: inset 0 0 4px rgba(102, 102, 102, 0.25);background: #999;}
.pl .blockcode::-webkit-scrollbar-track {box-shadow: inset 0 0 4px rgba(187, 187, 187, 0.25);border-radius: 10px;background: #eee;}
.pl .blockcode > div::after {
    content: "01.\\A 02.\\A 03.\\A 04.\\A 05.\\A 06.\\A 07.\\A 08.\\A 09.\\A ${temp}";
    position: absolute;overflow: hidden;width: 31px;height: 100%;top: 0;left: 0;font-size: 1rem;line-height: ${tempFontSize + 4}px;text-align: right;}
.pl .blockcode > em {top: 2px;right: 2px;position: absolute;margin: 0 0 0 0;z-index: 12;}
.pl .blockcode > em:hover {outline: 1px dashed;}
.pl .blockcode ol {overflow: auto;max-width: 750px;margin-left: 33px !important;font-size: 1rem;scrollbar-width: thin;scrollbar-color: #eee #999;list-style: none;}
.pl .blockcode ol::-webkit-scrollbar {width: 10px;height: 10px;}
.pl .blockcode ol::-webkit-scrollbar-thumb {border-radius: 10px;box-shadow: inset 0 0 4px rgba(102, 102, 102, 0.25);background: #999;}
.pl .blockcode ol::-webkit-scrollbar-track {box-shadow: inset 0 0 4px rgba(187, 187, 187, 0.25);border-radius: 10px;background: #eee;}
.pl .blockcode ol li {color: #333;height: ${tempFontSize + 4}px;padding-left: 1rem;margin-left: 0;font-size: 1rem;line-height: ${tempFontSize + 4}px;list-style: none;white-space: pre;}
/*.pl .blockcode::after {content: "";position: absolute;width: 42px;height: 100%;top: 0;left: 0;border-right: 1px solid #ccc;background-color: #ededed;z-index: 1;}*/
.pl .blockcode .line-counter{display: none;}/*兼容MCBBS Extender*/
`, 'blockCodeCSS')
            blockCodeCSSFunc(this.readWithDefault('blockCodeCSSFunc', true))
            this.addCheckSetting('代码栏样式优化<br><small>兼容模式下覆盖MCBBS Extender</small>', this.readWithDefault('blockCodeCSSFunc', true), (ck, ev) => {
                this.write('blockCodeCSSFunc', ck)
                blockCodeCSSFunc(ck)
            }, '代码栏样式优化', 24)
            function blockCodeCSSFunc(b: boolean) {
                if (b)
                    window.saltMCBBSCSS.putStyle('', 'blockCodeCSS')
                else
                    window.saltMCBBSCSS.delStyle('blockCodeCSS')
            }
            function getMaxCodeLine(): number {
                let max = 11
                let ol = Array.from(document.querySelectorAll('.blockcode ol'))
                for (let l of ol)
                    if (l instanceof HTMLElement)
                        if (l.querySelectorAll('li').length >= max)
                            max = l.querySelectorAll('li').length + 1
                return max
            }
            function getRootFontSize(): number {
                let style = document.defaultView?.getComputedStyle(document.body, '') ?? { fontSize: '12px' }
                let fs = parseInt(style.fontSize);
                if (isNaN(fs))
                    return 12
                else
                    return fs
            }

        }
        /**其他脚本冲突修复 */
        confiectFixOP() {
            this.assert(autoRunLock, '不在页面初始运行状态')
            let obj = this
            let enabled = this.readWithDefault<boolean>('saltMCBBSconfiectFix', true)
            this.addCheckSetting('冲突修复功能<br><small>尝试修复与其他脚本的冲突</small>', enabled, (ck, ev) => {
                this.write('saltMCBBSconfiectFix', ck)
                if (ck) sub()
            }, '冲突修复功能', 21)
            /**移动顶栏的情况下导致的问题 */
            function sub() {
                let links = obj.links
                let ul = document.querySelector('.user_info_menu_btn'); if (!ul || !(ul instanceof HTMLElement)) { return }
                let a = ul.querySelectorAll('a'), othersArchor: HTMLElement[] = []
                for (let i = 4; i < a.length; i++) {
                    othersArchor.push(a[i])
                }
                if (othersArchor.length > 0) {
                    obj.addChildren(links, othersArchor)
                    obj.log(othersArchor) // 仅在侦测到其他锚点时启用
                }
            }
            /**MCBBS Extender专项兼容 */
            function MExtFix() {
                // 勋章栏重复修复
                if (document.querySelector('.md_ctrl .hoverable-medal')) {
                    window.saltMCBBSCSS.putStyle(`
/*修复勋章栏的偏移*/
p.md_ctrl{padding-left: 0;}
div.tip.tip_4[id*=md_] p{position:relative;top:0;transform:none;}
                `, 'MExtConfiectFixCSS-medal')
                }
                if (document.querySelector('.blockcode .line-counter')) {
                    window.saltMCBBSCSS.putStyle(`
/*代码行数*/
.pl .blockcode ol{
    margin-left: 0 !important;
}
.pl .blockcode > div::after{
    width: 35px;
    height: calc(100% - 15px);
    margin-top: 10px;
}
.pl .blockcode div[id]{
    max-height: 999rem;
}
body.nightS .pl .blockcode div[id]{
    background: none;
}
                `, 'MExtConfiectFixCSS-blockcode')
                }
                window.saltMCBBSCSS.putStyle(`
/*修复同时出现两个警告按钮*/
.pmwarn + .view_warns_inposts,
.pmwarn + .view_warns_home,
.view_warns_inposts + .pmwarn,
.view_warns_home + .pmwarn{
    display: none;
}
                `, 'MExtConfiectFixCSS2')
            }
            if (enabled) {
                // 通用修复
                if (this.readWithDefault<boolean>('SaltMoveTopBarToLeft', true)) {
                    sub()
                    setTimeout(() => { sub() }, 500)
                    window.addEventListener('load', () => { sub() })
                }
                // MCBBS Extender冲突修复
                setTimeout(() => {
                    if (typeof window.MExt != 'undefined') {
                        MExtFix()
                    }
                }, 500)
            }

        }
        // ==========================================================
        // ========== 以上直到另一个分割线之前, 都是内部代码 ==========
        // ==========================================================
        /**
         * 水帖审查工具, 一个异步函数(考虑到正则匹配很花时间)
         * @param RegExps 审查用的正则表达式数组, 不填则默认使用内置的
         * @param ignoreWarned 是否忽略那些已经被制裁的帖子, 默认为是
         * @param callback 回调函数, 接受 3个参数, 代表一层楼的 div 元素, 这层楼的内容所在的元素, 处理后的文本, 没有的话则使用默认处理方式
         */
        async antiWater(RegExps: RegExp[] = antiWaterRegExp, ignoreWarned: boolean = true, callback?: (el: HTMLElement, ts: HTMLElement, text: string) => void) {
            let obj = this
            // 默认忽略那些已经被制裁的帖子
            let queryStr = ignoreWarned ? '#postlist > div:not(.warned)' : '#postlist > div'
            // console.log(queryStr)
            this.saltQuery(queryStr, (i, el) => {
                if (!(el instanceof HTMLElement)) { return }
                let td = el.querySelector('td[id^="postmessage"]')
                if (!(td instanceof HTMLElement)) { return }
                // el 代表一层楼的 div 元素
                // td 这层楼的内容所在的元素
                /**复制了td的HTML, 实现隔离 */
                let tempEl: Element | null = document.createElement('div')
                tempEl.innerHTML = td.innerHTML
                for (let img of Array.from(tempEl.querySelectorAll('img[smilieid]')))
                    if (img instanceof HTMLImageElement)
                        img.replaceWith('/meme/') // 表情包会被处理成'/meme/'的文字形式
                for (let font0 of Array.from(tempEl.querySelectorAll('font[style*="font-size:0px"]')))
                    if (font0 instanceof HTMLImageElement)
                        font0.remove() // 不可见的节点将被忽略
                /**引用框 */
                let quote = tempEl.querySelector('div.quote')
                if (quote) {
                    /**回复别人帖子的引用框总是存在一个anchor */
                    let a = quote.querySelector('a')
                    if (a) // 同时这个anchor的内容是 xxx 发表于 xxxx-xx-xx xx:xx
                        if (/.*\s?发表于.*\d{4}/.test(a.textContent ?? ''))
                            quote.remove() // 忽略引用回帖
                }
                /**最后编辑时间 */
                let pstatus = tempEl.querySelector('i.pstatus')
                if (pstatus)
                    if (/./.test(pstatus.textContent ?? ''))
                        pstatus.remove() // 忽略最后编辑时间
                let t = tempEl.textContent ?? ''
                for (let aw of RegExps) {
                    if (aw.test(t)) {
                        if (callback) {
                            callback(el, td, t)
                        } else {
                            obj.message((el.hasClass('reported') ? '该疑似水帖已被您举报' : '发现未制裁的疑似水帖')
                                + ':<br><span>' + tempEl.innerHTML + '</span>',
                                () => { obj.scrollTo(el.offset().top - 50) })
                        }
                        break // 不再复读
                    }
                }
                tempEl = null // 释放内存
            })
        }
        /**更新背景 */
        updateBackground() {
            // 昼间
            let dbg = this.readWithDefault<string[]>('dayBackgroundImage', [])
            putDayImg(this.randomChoice(this.cleanStringArray(dbg)))
            // 夜间
            let nbg = this.readWithDefault<string[]>('nightBackgroundImage', [])
            putNightImg(this.randomChoice(this.cleanStringArray(nbg)))
            // 封装一下操作
            function putDayImg(link: string | null) {
                if (typeof link == 'string' && link.length > 0) {
                    window.saltMCBBSCSS.putStyle(`
                    body{--bodyimg-day:url('${link}');background-image:var(--bodyimg-day);background-size:cover;}
                    body:not(.night-style) #body_fixed_bg{opacity:0}
                    body:not(.night-style) .mc_map_wp,
                    body:not(.night-style) #scrolltop,
                    body:not(.night-style) #toptb
                    {opacity:var(--mcmapwpOpacity,0.5)}
                    body:not(.night-style):hover .mc_map_wp,
                    body:not(.night-style):hover #scrolltop,
                    body:not(.night-style):hover #toptb
                    {opacity:1}`, 'setBackgroundImage-day')
                } else {
                    window.saltMCBBSCSS.delStyle('setBackgroundImage-day')
                }
            }
            function putNightImg(link: string | null) {
                if (typeof link == 'string' && link.length > 0) {
                    window.saltMCBBSCSS.putStyle(`
                    body{--bodyimg-night:url('${link}');background-size:cover;}
                    body.night-style #body_fixed_bg{opacity:0}
                    body.night-style .mc_map_wp,
                    body.night-style #scrolltop,
                    body.night-style #toptb
                    {opacity:var(--mcmapwpOpacity,0.5)}
                    body.night-style:hover .mc_map_wp,
                    body.night-style:hover #scrolltop,
                    body.night-style:hover #toptb
                    {opacity:1}`, 'setBackgroundImage-night')
                } else {
                    window.saltMCBBSCSS.delStyle('setBackgroundImage-night')
                }
            }
        }
        // 设置面板相关操作
        /**隐藏设置面板 */
        hideSettingPanel() {
            this.settingPanel.classList.remove('visible')
            this.settingPanel.classList.add('hidden')
        }
        /**显示设置面板 */
        showSettingPanel() {
            this.settingPanel.classList.remove('hidden')
            this.settingPanel.classList.add('visible')
        }
        /**
         * 添加配置项
         */
        addSetting(div: settingOptions): void;
        addSetting(div: Element, id?: string, priority?: number): void;
        addSetting(div: settingOptions | Element, id?: string, priority?: number) {
            if (div instanceof Element) {
                if (typeof id == 'string' && id.length > 0) {
                    div.setAttribute('name', id)
                }
                if (!priority) {
                    priority = myPriority
                    myPriority += 500
                }
                div.setAttribute('priority', priority + '')
                this.settingPanel.appendChild(div)
            } else if (typeof div.type == 'string') {
                switch (div.type) {
                    case 'check':
                        this.addCheckSetting(
                            div.title + (div.subtitle ? '<br><small> ' + div.subtitle + '</small>' : ''),
                            div.checked,
                            div.callback,
                            div.name ?? div.title,
                            div.priority
                        )
                        if (!autoRunLock) { this.sortSetting() }
                        return
                    case 'input':
                        this.addInputSetting(
                            div.title + (div.subtitle ? '<br><small> ' + div.subtitle + '</small>' : ''),
                            div.text,
                            div.callback,
                            div.name ?? div.title,
                            div.priority
                        )
                        if (!autoRunLock) { this.sortSetting() }
                        return
                    case 'textarea':
                        this.addTextareaSetting(
                            div.title + (div.subtitle ? '<small> ' + div.subtitle + '</small>' : ''),
                            div.text,
                            div.callback,
                            div.name ?? div.title,
                            div.priority
                        )
                        if (!autoRunLock) { this.sortSetting() }
                        return
                    case 'range':
                        this.addRangeSetting(
                            div.title + (div.subtitle ? '<small> ' + div.subtitle + '</small>' : ''),
                            div.value,
                            div.range,
                            div.callback,
                            div.name ?? div.title,
                            div.priority
                        )
                        if (!autoRunLock) { this.sortSetting() }
                        return
                    case 'normal':
                        this.addSetting(
                            div.element,
                            div.name,
                            div.priority
                        )
                        if (!autoRunLock) { this.sortSetting() }
                        return
                    default:
                        this.assert(false, '配置项类型错误: 未知的类型' + div)
                        if (!autoRunLock) { this.sortSetting() }
                        return
                }
            } else {
                return this.assert(false, '参数错误: ' + div)
            }
        }
        /**
         * 一种快速生成配置项的预设，结构是一个 h3 加一个 textarea
         * @param h3 配置项标题(可以是HTML代码)
         * @param textarea 默认配置
         * @param callback textarea触发change事件的回调函数，参数：el: textarea元素, ev: 事件
         * @param id 配置项的id，不填则默认为h3
         */
        addTextareaSetting(h3: string, textarea: string, callback: (el: HTMLTextAreaElement, ev: Event) => void, id?: string, priority?: number) {
            let newsetting = document.createElement('div')
            newsetting.innerHTML = '<h3>' + h3 + '</h3>'
            let textareaEl = document.createElement('textarea')
            textareaEl.value = textarea
            textareaEl.addEventListener('change', function (this: HTMLTextAreaElement, e: Event) { callback(this, e) })
            newsetting.appendChild(textareaEl)
            this.addSetting(newsetting, id ?? h3, priority)
        }
        /**
         * 一种快速生成配置项的预设，结构是一个 h3 加一个 input
         * @param h3 配置项标题(可以是HTML代码)
         * @param text 默认配置
         * @param callback input触发change事件的回调函数，参数：el: textarea元素, ev: 事件
         * @param id 配置项的id，不填则默认为h3
         */
        addInputSetting(h3: string, text: string, callback: (el: HTMLInputElement, ev: Event) => void, id?: string, priority?: number) {
            let newsetting = document.createElement('div')
            newsetting.innerHTML = '<h3 class="half-h3">' + h3 + '</h3>'
            let inputEl = document.createElement('input')
            inputEl.value = text
            inputEl.addEventListener('change', function (this: HTMLInputElement, e: Event) { callback(this, e) })
            newsetting.appendChild(inputEl)
            this.addSetting(newsetting, id ?? h3, priority)
        }
        /**
         * 一种快速生成配置项的预设，结构是一个 h3 加一个 input
         * @param h3 配置项标题(可以是HTML代码)
         * @param text 默认配置
         * @param callback input触发click事件的回调函数，参数：ck: 勾选与否, ev: 事件
         * @param id 配置项的id，不填则默认为h3
         */
        addCheckSetting(h3: string, checked: boolean, callback: (ck: boolean, ev: Event) => void, id?: string, priority?: number) {
            let newsetting = document.createElement('div')
            newsetting.innerHTML = '<h3 class="half-h3">' + h3 + '</h3>'
            let inputEl = document.createElement('input'), inputId = this.randomID()
            // inputEl.value = text
            inputEl.id = inputId
            inputEl.type = 'checkbox'
            inputEl.checked = checked
            inputEl.addEventListener('click', function (this: HTMLInputElement, e: Event) { callback(this.checked, e) })
            newsetting.appendChild(inputEl)
            let label = document.createElement('label')
            label.className = 'checkbox'
            label.htmlFor = inputId
            newsetting.appendChild(label)
            this.addSetting(newsetting, id ?? h3, priority)
        }
        /**
         * 一种快速生成配置项的预设，结构是一个 h3 加一个滑动条 input
         * @param h3 配置项标题(可以是HTML代码)
         * @param value 默认值
         * @param range [最小值,最大值,步长]或{min:最小值,max:最大值,step:步长}
         * @param callback input触发change事件的回调函数，参数：vl: 数字, ev: 事件
         * @param id 配置项的id，不填则默认为h3
         */
        addRangeSetting(h3: string, value: number, range: [number, number, number] | { max: number, min: number, step: number }, callback: (vl: number, ev: Event) => void, id?: string, priority?: number) {
            /**范围控制: 最小值, 最大值, 步长 */
            let rg: [number, number, number] = [0, 0, 0]
            if (range instanceof Array) {
                rg[0] = range[0] ?? 0
                rg[1] = range[1] ?? 100
                rg[2] = range[2] ?? 1
            } else {
                rg[0] = range.min ?? 0
                rg[1] = range.max ?? 100
                rg[2] = range.step ?? 1
            }
            // 最小值小于最大值
            if (rg[0] > rg[1]) {
                let temp = rg[0]
                rg[0] = rg[1]
                rg[1] = temp
            }
            let newsetting = document.createElement('div')
            newsetting.innerHTML = '<h3>' + h3 + '</h3>'
            let inputEl = document.createElement('input')
            inputEl.type = 'range'
            // 写入数据
            inputEl.min = rg[0] + ''
            inputEl.max = rg[1] + ''
            inputEl.step = rg[2] + ''
            inputEl.value = value + ''
            // 监听事件
            inputEl.addEventListener('change', function (this, ev) {
                callback(parseFloat(this.value), ev)
            })
            // 写入元素
            newsetting.appendChild(inputEl)
            this.addSetting(newsetting, id ?? h3, priority)
        }
        /**
         * 删除配置项
         * @param id 元素的名字
         */
        delSetting(id: string) {
            if (!(typeof id == 'string' && id.length > 0)) { return }
            let div = this.settingPanel.children
            for (let x of div) {
                if (x.hasAttribute('name') && x.getAttribute('name') == id) {
                    this.log('已找到配置项: ' + id)
                    this.settingPanel.removeChild(x)
                    return
                }
            }
        }
        /**根据优先级整理配置项 */
        sortSetting() {
            let divs = Array.from(document.querySelectorAll('#saltMCBBS-settingPanel > *'))
            for (let div of divs) {
                if (!div.hasAttribute('priority')) {
                    div.setAttribute('priority', '99999999')
                } else if (isNaN(parseInt(div.getAttribute('priority') ?? ''))) {
                    div.setAttribute('priority', '99999998')
                }
            }
            divs.sort((a, b) => {
                return parseInt(a.getAttribute('priority') ?? '') - parseInt(b.getAttribute('priority') ?? '')
            })
            this.addChildren(this.settingPanel, divs)
        }
        /**
         * 更改配置项的&lt;h3>标签
         * @param id 元素的名字
         * @param html 替换h3标签里面的HTML
         */
        changeSettingH3(id: string, html: string) {
            if (!(typeof id == 'string' && id.length > 0)) { return }
            let div = this.settingPanel.children
            for (let x of div) {
                if (x.hasAttribute('name') && x.getAttribute('name') == id) {
                    this.log('已找到配置项: ' + id)
                    let h3 = x.querySelector('h3')
                    // console.log(h3);
                    if (h3)
                        h3.innerHTML = html
                    return
                }
            }
        }
        /**
         * 输入一个元素或一段文字，在左侧栏底部添加新的链接按钮
         * @param a 一个HTMLElement，或者一段文字（如果是一段文字，那么callback参数生效）
         * @param callback 点击后执行的回调函数或点击前往的链接
         */
        addSideBarLink(a: HTMLElement | string, callback?: (ev: MouseEvent) => void | string) {
            let links = this.links
            if (typeof a == 'string') {
                let anchor = document.createElement('a')
                anchor.textContent = a
                anchor.href = 'javascript: void(0);'
                if (typeof callback == 'function') {
                    anchor.addEventListener('click', (ev) => { callback(ev) })
                } else if (typeof callback == 'string') {
                    anchor.href = callback
                }
                links.appendChild(anchor)
            } else if (a instanceof HTMLElement) {
                links.appendChild(a)
            }
        }
        /**
         * 夜间模式
         * @param night boolean切换为夜晚还是白天；
         * @param log 是否记录进本地存储
         *  */
        nightStyle(night = true, log = false) {
            if (night) {
                window.saltMCBBSCSS.putStyle('', 'night-style')
                document.body.addClass('night-style nightS')
            } else {
                document.body.removeClass('night-style nightS')
            }
            if (log) {
                this.write('isNightStyle', night)
            }
        }
        /**转换夜间模式 */
        toggleNightStyle() {
            let isnight = this.readWithDefault<boolean>('isNightStyle', false)
            this.nightStyle(!isnight, true)
        }
    }
    /**CSS相关操作的类*/
    class saltMCBBSCSS implements saltMCBBScss {
        constructor() {
            // null
        }
        private styles: styleMap = {}
        // key: 标记style
        /**
         * 将css代码存入内存，成功则返回true
         * @param css css代码
         * @param key css标记
         */
        setStyle(css: string, key: string): boolean {
            if (typeof css != 'string' || typeof key != 'string') { return false }
            this.styles[key] = css
            return true
        }
        /**
         * 返回内存中的css代码，没找到则返回空字符串
         * @param key css标记
         */
        getStyle(key: string): string {
            if (typeof key != 'string') { return '' }
            if (this.styles[key])
                return this.styles[key]
            else
                return ''
        }
        /**
         * 启用css
         * 有代码无标记：创建style直接放代码
         * 有标记无代码：寻找内存中的css代码
         * 有代码有标记：更新已有style或创建style，同时更新内存中的css代码
         * @param css css代码
         * @param key css标记
         */
        putStyle(css: string, key: string): boolean {
            /**0-不合法 1-有css无key 2-有key无css 3-有css有key */
            let status = 0
            if (typeof css == 'string' && css.length > 2) {
                status += 1
            }
            if (typeof key == 'string' && key.length > 0) {
                status += 2
            }
            switch (status) {
                case 0: // 0-不合法
                    return false
                case 1: // 1-有css无key
                    let s = document.createElement('style')
                    s.textContent = css
                    document.head.appendChild(s)
                    break
                case 2: // 2-有key无css
                    let c = this.getStyle(key)
                    if (c.length > 0) {
                        let x = this.getStyleElement(key)
                        // 若style不存在
                        if (!x) {
                            let s = document.createElement('style')
                            s.textContent = c
                            this.setStyleElement(key, s)
                            document.head.appendChild(s)
                        } else {
                            if (x.textContent != c)
                                x.textContent = c
                        }
                    } else { return false }
                    break
                case 3: // 3-有css有key
                    let x = this.getStyleElement(key)
                    // 若style不存在
                    if (!x) {
                        this.styles[key] = css
                        let s = document.createElement('style')
                        s.textContent = css
                        this.setStyleElement(key, s)
                        document.head.appendChild(s)
                    }
                    // 若已有style元素
                    else {
                        this.styles[key] = css
                        if (x.textContent != css)
                            x.textContent = css
                    }
                    break
            }
            return true
        }
        /**
         * 根据key删除对应的style
         * @param key css标记
         */
        delStyle(key: string): boolean {
            if (typeof key != 'string') { return false }
            let el = this.getStyleElement(key)
            if (el) {
                el.remove()
                return true
            } else {
                return false
            }
        }
        /**
         * 根据key替换已有的style, 替换成功返回true, 非法输入/没有此元素返回false
         * @param css css代码
         * @param key css标记
         */
        replaceStyle(css: string, key: string): boolean {
            if (typeof css != 'string' || typeof key != 'string') { return false }
            let el = this.getStyleElement(key)
            if (el) {
                this.styles[key] = css
                el.textContent = css
            } else {
                this.putStyle(css, key) // putStyle 包括了 this.styles[key] = css
            }
            return true
        }
        /**根据key获取style元素, 没找到的话返回null */
        getStyleElement(key: string): Element | null {
            if (typeof key != 'string') { return null }
            return document.querySelector(`style[${techprefix + key}]`)
        }
        /**根据key对指定元素设置属性 */
        setStyleElement(key: string, el: Element): boolean {
            if (typeof key != 'string' || !(el instanceof Element)) { return false }
            el.setAttribute(techprefix + key, '')
            return true
        }
    }
    /**数据操作的类 */
    class saltMCBBSDataBaseHandler implements saltMCBBSDataBaseHandler {
        db!: IDBDatabase
        readable: boolean = false
        prefix: string
        getStore: () => IDBObjectStore
        constructor(database: string, mainStoreName = 'mainStore', prefix = '[saltMCBBSDataBaseHandler]') {
            this.prefix = prefix
            let obj = this
            let dbRequest = indexedDB.open(database, 1) // 1 是版本号，别改
            dbRequest.onupgradeneeded = function (this: IDBRequest, ev: Event) {
                console.log(`%c${obj.prefix}: 创建数据库 ${database}`, 'font-size:1rem;')
                obj.db = this.result
                console.log(`%c${obj.prefix}: 创建仓库 ${database}`, 'font-size:1rem;')
                let s = obj.db.createObjectStore(mainStoreName, {
                    keyPath: 'mainKey' // 主键一律命名为 mainKey
                })
                s.createIndex('indexByKey', 'mainKey', {
                    unique: true
                })
            }
            dbRequest.onsuccess = function (ev) {
                obj.readable = true
                obj.db = dbRequest.result
            }
            this.getStore = function () {
                return this.db.transaction(mainStoreName, 'readwrite').objectStore(mainStoreName)
            }
        }
        read<T>(key: string, defaultValue: T): Promise<T> {
            this.assertReadable()
            let obj = this
            return new Promise<T>(function (resolve, reject) {
                let request = obj.getStore().get(key)
                request.onsuccess = function () {
                    if (typeof request.result != 'undefined' && typeof request.result.value != 'undefined')
                        resolve(request.result.value)
                    else {
                        obj.write(key, defaultValue)
                        resolve(defaultValue)
                    }
                }
                request.onerror = function (ev) {
                    obj.write(key, defaultValue)
                    console.log(ev)
                    resolve(defaultValue)
                }
            })
        }
        write<T>(key: string, value: T): Promise<void> {
            this.assertReadable()
            let obj = this
            return new Promise<void>(function (resolve, reject) {
                let request = obj.getStore().put({ mainKey: key, value: value })
                request.onsuccess = function () {
                    resolve()
                }
                request.onerror = function (ev) {
                    reject(ev)
                }
            })
            // request.onsuccess
        }
        readAllKey() {
            this.assertReadable()
            let obj = this
            let store = this.getStore()
            let keys: string[] = []
            return new Promise<string[]>(function (resolve, reject) {
                store.openKeyCursor().onsuccess = function (this, ev) {
                    let cur = this.result
                    if (cur) {
                        keys.push(cur.key + '')
                        cur.continue()
                    }
                    else
                        resolve(keys)
                }
            })
        }
        /*
        async readAll<T>() {
            this.assertReadable()
            // let obj = this
            // let store = this.getStore()
            let keys = await this.readAllKey()
            let value: { mainKey: string, value: T }[] = []
            for (let k of keys)
                value.push({ mainKey: k, value: await this.read(k, <T><unknown>null) })
            return value
        }*/
        async readAll<T>() {
            this.assertReadable()
            // let obj = this
            let store = this.getStore()
            let keys: { mainKey: string, value: T }[] = []
            return new Promise<{ mainKey: string, value: T }[]>(function (resolve, reject) {
                store.openKeyCursor().onsuccess = function (this, ev) {
                    let cur = this.result
                    if (cur) {
                        // @ts-ignore
                        keys.push({ mainKey: cur.key + '', value: cur.value })
                        cur.continue()
                    }
                    else
                        resolve(keys)
                }
            })
        }
        async waitForReady() {
            // console.log(this.readable)
            while (!this.readable)
                await new Promise((resolve) => setTimeout(resolve, 5));
            // console.log(this.readable)
        }
        /**断言数据库已经准备完毕 */
        assertReadable() {
            if (!this.readable || !this.db) { throw new Error(this.prefix + ': 你不能访问一个尚未准备完毕的数据库') }
        }
    }
    // 开始给HTMLElement添加奇怪的方法
    (function () {
        if (!HTMLElement.prototype.addClass) {
            HTMLElement.prototype.addClass = function (classes: string): void {
                let cls = String(classes).replace(/\s+/gm, ',').split(',');
                for (let c of cls) {
                    this.classList.add(c)
                }
            }
        }
        if (!HTMLElement.prototype.toggleClass) {
            HTMLElement.prototype.toggleClass = function (classes: string): void {
                var cls = String(classes).replace(/\s+/gm, ',').split(',');
                for (var c of cls) {
                    if (this.classList.contains(c))
                        this.classList.remove(c);
                    else
                        this.classList.add(c);
                }
            }
        }
        if (!HTMLElement.prototype.hasClass) {
            HTMLElement.prototype.hasClass = function (OneClass: string): boolean {
                return this.classList.contains(OneClass);
            }
        }
        if (!HTMLElement.prototype.removeClass) {
            HTMLElement.prototype.removeClass = function (classes: string): void {
                var cls = String(classes).replace(/\s+/gm, ',').split(',');
                for (var c of cls) {
                    this.classList.remove(c);
                }
            }
        }
        if (!HTMLElement.prototype.offset) {
            HTMLElement.prototype.offset = function () {
                if (!this.getClientRects().length)
                    return { top: 0, left: 0 };
                var rect = this.getBoundingClientRect();
                var win = this.ownerDocument.defaultView ?? { pageYOffset: 0, pageXOffset: 0 };
                return {
                    top: rect.top + win.pageYOffset,
                    left: rect.left + win.pageXOffset
                }
            }
        }
        if (!HTMLElement.prototype.numAttribute) {
            HTMLElement.prototype.numAttribute = function (key: string) {
                let value: number
                if (this.hasAttribute(key)) {
                    value = parseInt(this.getAttribute(key) ?? '')
                } else {
                    value = 0
                    this.setAttribute(key, value + '')
                }
                if (isNaN(value)) {
                    value = 0
                    this.setAttribute(key, value + '')
                }
                return {
                    value: value,
                    set: (num: number) => {
                        this.setAttribute(key, num + '')
                        return this.numAttribute(key)
                    },
                    add: (num: number) => {
                        this.setAttribute(key, (value + num) + '')
                        return this.numAttribute(key)
                    }
                }
            }
        }
    })();
    // 兼容性检查
    (function () {
        if (!window.indexedDB) {
            let s = myprefix + myversion + ': 您的浏览器并不支持**完整**的 IndexedDB 功能, 请使用 0.1.6 版本\n'
                + 'Your browser does not support a STABLE version of IndexedDB, please work at ver-0.1.6.'
            // console.log(s)
            setTimeout(function () { alert(s) }, 0) // 防止程序挂起
            throw new Error(s)
        }
    })();
    // ??????
    window['saltMCBBSCSS'] = new saltMCBBSCSS(); // saltMCBBSCSS 实例
    dbHandler = new saltMCBBSDataBaseHandler('saltMCBBSlvPJIXr13EqdD67b') // 不信能撞车
    window['saltMCBBS'] = new saltMCBBS(true); // saltMCBBS 实例
    window['saltMCBBSOriginClass'] = saltMCBBSOriginClass; // saltMCBBSOriginClass 类
    window['saltMCBBSDataBaseHandler'] = saltMCBBSDataBaseHandler; // saltMCBBSDataBaseHandler 类
    // 测试时间差
    // let gt = window.saltMCBBS.getTime
    // let startTime = gt()
    // window.saltMCBBS.docReady(() => { console.log('docReady: ' + (gt() - startTime)) })
    // window.saltMCBBS.docNearlyReady(() => { console.log('docNearlyReady: ' + (gt() - startTime)) })
    // async function a() {
    //     let db = dbHandler
    //     let gt = window.saltMCBBS.getTime
    //     await db.waitForReady()
    //     let startTime = gt()
    //     console.log(await db.readAll())
    //     console.log('ReadAll: ' + (gt() - startTime))
    // }
    // window.saltMCBBS.docReady(a)
})();
// 控制台部分
(function () {
    // type mainCmd = 'tid' | 'uid' | 'fid' | 'runjs'
    interface SaltMCBBSCommand {
        // length: number,
        mainCmd: string,
        cmdBody: string
    }
    const prefix = '[SaltMCBBS控制台]'
    const sm = window.saltMCBBS
    const consolePanel = sm.consolePanel
    const logArea = document.createElement('div')
    const inputArea = document.createElement('textarea')
    const newWindow = window.open
    const Trim = sm.Trim
    const commandMap = {
        gid: gid,
        fid: fid,
        tid: tid,
        pid: pid,
        uid: uid,
        runjs: runJS,
    }
    // 执行指令
    function runCommand(command: string): string {
        let cmd = CmdResolve(command)
        //@ts-ignore
        if (commandMap[cmd.mainCmd]) return commandMap[cmd.mainCmd](cmd.cmdBody)
        else return '请检查指令拼写: ' + cmd.mainCmd
    }
    /**分解指令 */
    function CmdResolve(cmd: string): SaltMCBBSCommand {
        let temp = Trim(cmd)
        let p = temp.replace('\n', ' ').indexOf(' ')
        if (p == -1)
            return {
                mainCmd: temp,
                cmdBody: ''
            }
        else
            return {
                mainCmd: temp.slice(0, p).toLowerCase(),
                cmdBody: Trim(temp.slice(p) ?? '')
            }
    }
    function tid(cmdBody: string): string {
        let tid = parseInt(cmdBody)
        if (isNaN(tid) || tid < 1)
            return '错误的tid'
        newWindow(`https://www.mcbbs.net/thread-${tid}-1-1.html`)
        return `访问tid为${tid}的主题帖`
    }
    function pid(cmdBody: string): string {
        let pid = parseInt(cmdBody)
        if (isNaN(pid) || pid < 1)
            return '错误的pid'
        newWindow(`https://www.mcbbs.net/forum.php?mod=redirect&goto=findpost&ptid=0&pid=${pid}`)
        return `访问pid为${pid}的帖子`
    }
    function uid(cmdBody: string): string {
        let uid = parseInt(cmdBody)
        if (isNaN(uid) || uid < 1)
            return '错误的uid'
        newWindow(`https://www.mcbbs.net/?${uid}`)
        return `访问uid为${uid}的用户页面`
    }
    function gid(cmdBody: string): string {
        let gid = parseInt(cmdBody)
        if (isNaN(gid) || gid < 1)
            return '错误的gid'
        newWindow(`https://www.mcbbs.net/forum.php?gid=${gid}`)
        return `访问gid为${gid}的大区`
    }
    function fid(cmdBody: string): string {
        if (cmdBody.length < 1)
            return '错误的fid'
        newWindow(`https://www.mcbbs.net/forum-${cmdBody}-1.html`)
        return `访问fid为${cmdBody}的版块`
    }
    function runJS(js: string): string {
        if (confirm('请确认这是您本人的操作，' + prefix + '将要执行以下代码: \n' + js)) {
            window.eval(js)
            return '已执行JS'
        }
        return 'JS执行被用户取消'
    }
    class saltMCBBSConsole {
        run(command: string) {
            this.log(runCommand(command))
        }
        log(s: string) {
            let div = document.createElement('div')
            div.innerHTML = s
            logArea.appendChild(div)
            console.log(prefix + ': ' + s)
        }
        hideConsolePanel() {
            consolePanel.addClass('hidden')
            consolePanel.removeClass('visible')
        }
        showConsolePanel() {
            consolePanel.addClass('visible')
            consolePanel.removeClass('hidden')
        }
        // exe(command: string) {
        //     return runCommand(command)
        // }
    }
    consolePanel.innerHTML = `<h3 class="flb" style="width:calc(100% - 16px);margin-left:-8px;padding-right:0;position:absolute;top:0">
    <em>SaltMCBBS控制台</em>
    <span style="float:right">
    <a href="javascript:;" class="flbc" onclick="saltMCBBSConsole.hideConsolePanel()" title="关闭">关闭</a>
    </span></h3>`
    logArea.contentEditable = 'false'
    inputArea.addEventListener('keypress', function (this, ev) {
        let smc = window.saltMCBBSConsole
        let value = this.value + ''
        if (!ev.shiftKey && ev.code == 'Enter') {
            this.value = ''
            if (!/^\s*$/.test(value)) {
                smc.log('·> ' + value)
                smc.run(value)
            }
            ev.preventDefault()
        }
    })
    // inputArea.addEventListener('keyup', function (this, ev) {
    //     if (!ev.shiftKey && ev.code == 'Enter')
    //         if (/^\n+$/.test(this.value))
    //             this.value = ''
    // })
    consolePanel.appendChild(logArea)
    consolePanel.appendChild(inputArea)
    document.body.appendChild(consolePanel)
    window['saltMCBBSConsole'] = new saltMCBBSConsole()
    window.saltMCBBSConsole.hideConsolePanel()
    document.body.addEventListener('keydown', function (this, ev) {
        if (ev.ctrlKey && ev.code == 'Backquote')
            window.saltMCBBSConsole.showConsolePanel()
    })
})();
// 表情包部分
(async function () {
    const db = new window.saltMCBBSDataBaseHandler('saltMCBBSMemeGSU3Rk2ZWSAk0M8d')
    const sm = window.saltMCBBS
    await db.waitForReady()
})();
