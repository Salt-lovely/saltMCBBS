// 一些较大的、需要在页面加载完毕前启用的模块放在这
// 控制台部分
(function () {
    if (window.self != window.top) { return }
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
    const token = sm.randomID()
    const commandMap = {
        gid: gid, fid: fid,
        tid: tid, pid: pid,
        uid: uid, uname: uname, username: uname,
        openurl: newWindow, newwindow: newWindow,
        runjs: runJS, eval: runJS,
        togglenight: togglenightstyle, togglenightstyle: togglenightstyle, nightstyle: togglenightstyle,
        cls: cls, cleanscreen: cls,
        test: echo, echo: echo,
        help: helpMe, "?": helpMe, "？": helpMe
    }
    const helpMap = {
        gid: '前往对应大区，用法：<b>gid &lt;数字ID></b>', fid: '前往对应版块，用法：<b>fid &lt;数字ID|英文ID></b>',
        tid: '前往对应主题，用法：<b>tid &lt;数字ID></b>', pid: '前往对应帖子，用法：<b>pid &lt;数字ID></b>',
        uid: '前往对应用户主页，用法：<b>uid &lt;数字ID></b>', uname: '前往对应用户主页，用法：<b>uname &lt;用户名></b>', username: '前往对应用户主页，用法：<b>username &lt;用户名></b>',
        openurl: '新窗口打开链接，用法：<b>openurl &lt;URL></b>', newwindow: '新窗口打开链接，用法：<b>newwindow &lt;URL></b>',
        runjs: '执行指令，用法：<b>runjs &lt;指令(可以是多行的)></b>', eval: '执行指令，用法：<b>eval &lt;指令(可以是多行的)></b>',
        togglenight: '切换夜间模式，用法：<b>togglenight</b>', togglenightstyle: '切换夜间模式，用法：<b>togglenightstyle</b>', nightstyle: '切换夜间模式，用法：<b>nightstyle</b>',
        cls: '清屏，用法：<b>cls</b>', cleanscreen: '清屏，用法：<b>cleanscreen</b>',
        test: '返回输入的参数，用法：<b>test &lt;任意内容></b>', echo: '返回输入的参数，用法：<b>echo &lt;任意内容></b>',
        help: '显示帮助，用法：<b>help &lt;指令名或留空></b>', "?": '显示帮助，用法：<b>? &lt;指令名或留空></b>', "？": '显示帮助，用法：<b>？ &lt;指令名或留空></b>'
    }
    // 执行指令
    function runCommand(command: string, codeToken: string): string {
        let cmd = CmdResolve(command)
        //@ts-ignore
        if (commandMap[cmd.mainCmd]) return commandMap[cmd.mainCmd](cmd.cmdBody, codeToken)
        else return '请检查指令拼写: ' + cmd.mainCmd
    }
    /**分解指令 */
    function CmdResolve(cmd: string): SaltMCBBSCommand {
        let temp = cmd + ''
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
    function uname(cmdBody: string): string {
        if (/[\s\/\&]/.test(cmdBody)) return '用户名含有非法字符'
        newWindow(`https://www.mcbbs.net/home.php?mod=space&username=${cmdBody}`)
        return `访问用户名为${cmdBody}的用户页面`
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
    function runJS(js: string, codeToken: string): string {
        if (codeToken === token)
            if (confirm('请确认这是您本人的操作，' + prefix + '将要执行以下代码: \n' + js)) {
                let stat = '已执行JS'
                try {//@ts-ignore
                    (0, window.eval)(js) // 间接访问eval
                } catch (e) {
                    stat += '，出现错误：' + e
                } finally { return stat }
            } else
                return 'JS执行被用户取消'
        throw new Error('检测到非法的JS执行请求')
    }
    function togglenightstyle() {
        window.saltMCBBS.toggleNightStyle()
        return '切换夜间模式'
    }
    function cls() {
        setTimeout(() => { logArea.innerHTML = '' }, 0)
        return ''
    }
    function echo(cb: string) { return cb }
    function helpMe(cmd: string): string {
        let c = CmdResolve(cmd).mainCmd
        if (typeof c == 'string' && c.length > 0) {
            //@ts-ignore
            if (helpMap[c]) return helpMap[c]
        }
        let ans = '可用指令：\n'
        for (let k in helpMap) {
            ans += k + '\n'
        }
        ans += '使用<b> help &lt;指令名> </b>来获取详细说明'
        return ans
    }
    // function reload()
    class saltMCBBSConsole {
        run(command: string, codeToken: string) {
            this.log(runCommand(Trim(command), codeToken))
            logArea.scrollTop = logArea.scrollHeight // 滚动到最下层
        }
        log(s: string) {
            let div = document.createElement('div')
            div.innerHTML = s
            logArea.appendChild(div)
            console.log(prefix + ': ' + s)
        }
        hideConsolePanel() {
            consolePanel.removeClass('visible').addClass('hidden')
            inputArea.blur()
        }
        showConsolePanel() {
            consolePanel.addClass('visible').removeClass('hidden')
            inputArea.focus()
        }
        // exe(command: string) {
        //     return runCommand(command)
        // }
    }
    consolePanel.innerHTML = `<h3 class="flb" style="width:100%;margin-left:-8px;padding-right:0;">
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
                smc.run(value, token)
            }
            ev.preventDefault()
        }
    })
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
    if (window.self != window.top) { return }
    const db = new window.saltMCBBSDataBaseHandler('saltMCBBSMemeGSU3Rk2ZWSAk0M8d') // 早早启用数据库
    const sm = window.saltMCBBS
    const newDiv = () => { return document.createElement('div') }
    const simpleAntiXSS = sm.simpleAntiXSS
    // const myprefix = sm.getData('prefix')
    const emoticonPanel = (function () {
        let d = newDiv()
        d.className = 'emoticonPanel'
        d.addClass('hidden')
        d.id = 'emoticonPanel'
        d.innerHTML = `<h3 class="flb" style="width:100%;margin-left:-8px;padding-right:0;">
    <em>SaltMCBBS表情包管理</em>
    <span style="float:right">
    </span></h3>`
        // 打开使用表情包面板按钮
        let iep = document.createElement('a')
        iep.href = 'javascript:void(0);'
        iep.textContent = '使用表情包'
        iep.onclick = function (this, ev) {
            showPanel(ev.clientX, ev.clientY)
        }
        d.querySelector('h3 span')!.appendChild(iep)
        // 关闭按钮
        let a = document.createElement('a')
        a.href = 'javascript:void(0);'
        a.className = 'flbc'
        a.textContent = '关闭'
        a.onclick = function () {
            d.removeClass('visible').addClass('hidden')
        }
        d.querySelector('h3 span')!.appendChild(a)
        // // 打开按钮
        // let o = document.createElement('a')
        // o.href = 'javascript:void(0);'
        // o.textContent = '表情包管理'
        // o.onclick = function () {
        //     d.removeClass('hidden')
        //     d.addClass('visible')
        // }
        // sm.addSideBarLink(o)
        // 添加到body
        document.body.appendChild(d)
        return d
    })()
    const memeList = (function () {
        let d = newDiv()
        d.className = 'memelist'
        emoticonPanel.appendChild(d)
        return d
    })()
    const insertEmoticonPanel = (function () {
        let d = newDiv()
        // let windowWidth = window.innerWidth || document.documentElement.clientWidth, windowHeight = window.innerHeight || document.documentElement.clientHeight
        // let prop = sm.readWithDefault<{ width: number, height: number }>('insertEmoticonPanelProp', { width: Math.round(windowWidth * 0.3), height: Math.round(windowHeight * 0.3) })
        // d.style.setProperty('width', /*Math.min(prop.width, windowWidth * 0.8)*/(windowWidth * 0.3) + 'px')
        // d.style.setProperty('height', /*Math.min(prop.height, windowHeight * 0.8)*/(windowHeight * 0.3) + 'px')
        d.className = 'insertEmoticonPanel'
        d.id = 'insertEmoticonPanel'
        d.style.display = 'none'
        // 顶栏
        let tb = newDiv()
        tb.className = 'topbar'
        d.appendChild(tb)
        // 关闭按钮
        let close = newDiv()
        close.textContent = ' × '
        close.className = 'close'
        close.onclick = function () { d.style.display = 'none' }
        d.appendChild(close)
        document.body.appendChild(d)
        // 打开管理面板
        let o = document.createElement('a')
        o.href = 'javascript:void(0);'
        o.textContent = '表情包管理'
        o.onclick = function () {
            emoticonPanel.removeClass('hidden').addClass('visible')
        }
        tb.appendChild(o)
        // 侧边栏添加按钮
        let a = document.createElement('a')
        a.href = 'javascript:void(0);'
        a.textContent = '使用表情包'
        a.onclick = function (this, ev) { showPanel(ev.clientX, ev.clientY) }
        sm.addSideBarLink(a)
        // 拖动
        let mousePos = { x: 0, y: 0 }, pos = { x: 0, y: 0 }, isDrag = false
        d.addEventListener('mousedown', function (this, ev) {
            if (ev.target != this && ev.target != tb) { isDrag = false; return }
            mousePos.x = ev.clientX; mousePos.y = ev.clientY
            pos.x = parseInt(this.style.getPropertyValue('--left') ?? '0'); pos.y = parseInt(this.style.getPropertyValue('--top') ?? '0')
            isDrag = true
        })
        d.addEventListener('mousemove', function (this, ev) {
            if (!isDrag) return
            move(ev.clientX, ev.clientY)
        })
        d.addEventListener('mouseout', function (this, ev) {
            if (!isDrag) return
            move(ev.clientX, ev.clientY)
        })
        d.addEventListener('mouseup', function (this, ev) {
            if (isDrag) isDrag = false
        })
        return d
        function move(x: number, y: number) {
            let width = (window.innerWidth || document.documentElement.clientWidth) - d.offsetWidth
            let height = (window.innerHeight || document.documentElement.clientHeight) - d.offsetHeight
            let dx = pos.x + x - mousePos.x
            let dy = pos.y + y - mousePos.y
            if (dx < 0) dx = 0;
            else if (dx > width) dx = width
            if (dy < 0) dy = 0;
            else if (dy > height) dy = height
            d.style.setProperty('--left', dx + 'px')
            d.style.setProperty('--top', dy + 'px')
        }
    })()
    const insertEmoticonPanelMain = (function () {
        let m = newDiv()
        m.className = 'main'
        insertEmoticonPanel.appendChild(m)
        return m
    })()
    const insertEmoticonPanelBar = (function () {
        let bar = newDiv()
        bar.className = 'bar'
        insertEmoticonPanel.appendChild(bar)
        return bar
    })()
    let chosenList: string[] = []
    /**已经启用的表情包 */
    let enableList: string[] ///*因为reflashList()里面也要读一遍*/= sm.readWithDefault<string[]>('enableMemeList', [])
    /**已经加载到内存中的表情包 */
    let memeLoadList: MemePack[] = []
    let busyLock: [boolean, boolean] = [false, false]
    // 添加CSS
    window.saltMCBBSCSS.putStyle(
        `.insertEmoticonPanel{position:fixed;top:var(--top, 10vh);left:var(--left, 10vw);width:var(--width, 30vw);min-width:360px;height:var(--height, 30vh);min-height:270px;padding:24px 0 0;background-color:#fcf4e0;background-clip:padding-box;border:8px solid rgba(0,0,0,0.2);border-radius:8px;user-select:none;z-index:14}.insertEmoticonPanel .main{width:100%;height:calc(100% - 40px);display:grid;grid-template-columns:repeat(auto-fill, minmax(60px, 1fr));grid-template-rows:repeat(auto-fill, minmax(60px, 1fr));overflow-y:auto;scrollbar-width:thin;scrollbar-color:#999 #eee}.insertEmoticonPanel .main::-webkit-scrollbar{width:4px;height:4px}.insertEmoticonPanel .main::-webkit-scrollbar-thumb{border-radius:2px;box-shadow:inset 0 0 4px rgba(102,102,102,0.25);background:#999}.insertEmoticonPanel .main::-webkit-scrollbar-track{box-shadow:inset 0 0 4px rgba(187,187,187,0.25);border-radius:1px;background:#eee}.insertEmoticonPanel .main>div{height:0;padding:50% 0;text-align:center;position:relative;background-color:#fcf4e0;outline:1px solid #999;overflow:hidden;cursor:pointer}.insertEmoticonPanel .main>div>div{position:absolute;top:0;left:0;width:100%;text-align:center}.insertEmoticonPanel .main>div img{max-width:100%;margin-top:50%;transform:translateY(-50%);transform-origin:50% 50%}.insertEmoticonPanel .main>div::after{content:attr(title);position:absolute;top:-100%;left:0;width:100%;padding:5px 0;background-color:rgba(255,255,255,0.5);transition:0.3s ease}.insertEmoticonPanel .main>div:hover::after{top:0}.insertEmoticonPanel .bar{width:100%;height:40px;white-space:nowrap;overflow-x:auto;scrollbar-width:thin;scrollbar-color:#999 #eee}.insertEmoticonPanel .bar::-webkit-scrollbar{width:4px;height:4px}.insertEmoticonPanel .bar::-webkit-scrollbar-thumb{border-radius:2px;box-shadow:inset 0 0 4px rgba(102,102,102,0.25);background:#999}.insertEmoticonPanel .bar::-webkit-scrollbar-track{box-shadow:inset 0 0 4px rgba(187,187,187,0.25);border-radius:1px;background:#eee}.insertEmoticonPanel .bar>div{display:inline-block;padding:8px;line-height:20px;text-align:center;background-color:#fbf2db;border-left:1px solid #999;border-bottom:1px solid #999;border-top:1px solid #999;background-color:#fbf2db;cursor:pointer}.insertEmoticonPanel .bar>div.select{border-top-color:transparent;background-color:#fefaf2}.insertEmoticonPanel .bar>div:last-child{border-right:1px solid #999}.insertEmoticonPanel .close{position:absolute;top:0;right:0;width:24px;height:24px;padding:0;font-size:12px;text-align:center;cursor:pointer;transform-origin:50% 50%;transition:0.3s ease}.insertEmoticonPanel .close:hover{transform:scale(1.2)}.insertEmoticonPanel .topbar{position:absolute;top:0;width:calc(100% - 24px);height:24px;overflow:hidden;color:#3a74ad}.insertEmoticonPanel .topbar>a{float:right;height:24px;line-height:24px;color:#3a74ad}.insertEmoticonPanel .topbar>a:hover{color:#6cf}.pl .blockcode>em.importMemePack{right:calc(18px + 4rem)}.nightS .insertEmoticonPanel{background-color:#444;color:#f0f0f0;border-color:rgba(153,153,153,0.2)}.nightS .insertEmoticonPanel .main>div{background-color:#444}.nightS .insertEmoticonPanel .main>div::after{background-color:rgba(34,34,34,0.5)}.nightS .insertEmoticonPanel .bar>div{background-color:#353535}.nightS .insertEmoticonPanel .bar>div.select{background-color:#555}
`, 'saltMCBBSEmoticon')
    // 等等数据库
    await db.waitForReady();
    // 添加面板底部的删除、导入、导出按钮
    (function () {
        let op = newDiv()
        op.className = 'op'
        // addDiv('启用', enableList)
        // addDiv('禁用', disableList)
        addDiv('编辑', editMeme)
        addDiv('删除', deleteList)
        addDiv('导入', importMeme)
        addDiv('导出', exportMeme, '一次只能导出一个')
        addDiv('刷新', reflashList)
        emoticonPanel.appendChild(op)
        function addDiv(text: string, func: () => void, tip?: string) {
            let d = newDiv(); d.textContent = text; if (tip) d.title = tip
            d.onclick = func; op.appendChild(d)
        }
    })();
    // 刷新列表
    reflashList()
    // 审查页面中所有的代码栏，添加一键安装按钮
    sm.docReady(() => {
        sm.saltQuery('.blockcode', (i, el) => {
            let li = el.querySelector('ol li')
            if (!li) return
            let s = li.textContent ?? ''
            if (!(/^\s*\/[\/\*].*saltmcbbs\s*表情包/i.test(s))) return
            let em = document.createElement('em')
            em.textContent = '导入表情包'
            em.className = 'importMemePack'
            em.onclick = function () {
                if (!confirm('确定要导入表情包吗?')) return
                let x = ''
                for (let li of Array.from(el.querySelectorAll('ol li'))) {
                    x += (li.textContent ?? '').replace(/\n$/, '') + '\n'
                }
                importMeme(x)
            }
            el.appendChild(em)
        })
    })
    /**启用表情包 */
    function enableMeme(name: string) {
        let el: string[] = sm.readWithDefault<string[]>('enableMemeList', [])
        if (el.indexOf(name) != -1) return
        el.push(name)
        enableList = el
        sm.write('enableMemeList', el)
    }
    /**禁用表情包 */
    function disableMeme(name: string) {
        let el: string[] = sm.readWithDefault<string[]>('enableMemeList', [])
        if (el.indexOf(name) == -1) return
        el = el.filter((v) => { return v != name })
        enableList = el
        sm.write('enableMemeList', el)
    }
    /**删除 */
    async function deleteList() {
        if (chosenList.length < 1) return alert('请先选中一个表情')
        if (!(confirm('你确定要删除这' + chosenList.length + '个表情包吗？\n' + chosenList.join('、') + '\n删除后将无法恢复！'))) return
        if (busyLock[1]) return
        else busyLock[1] = true
        for (let mp of chosenList) {
            disableMeme(mp)
            await db.delete(mp)
        }
        await reflashList()
        busyLock[1] = false
    }
    /**编辑 */
    function editMeme() {
        if (chosenList.length < 1) return alert('请先选中一个表情')
        let target = chosenList[0]
        for (let m of memeLoadList) {
            if (m.name != target) continue
            let cb = async function (text: string) {
                /**新版本 */
                let n = sm.resolveMemePack(text)
                // 表情数量检查
                if (n.memes.length < 1) {
                    alert('表情数量为0，不可修改！')
                    return
                }
                n.name = m.name
                // 检查
                if (
                    !(
                        confirm(`“${n.name}”表情包修改确认：
老版本：作者 ${m.author ?? '佚名'}，版本 ${m.version ?? '未知版本'}，表情 ${m.memes.length}个
新版本：作者 ${n.author ?? '佚名'}，版本 ${n.version ?? '未知版本'}，表情 ${n.memes.length}个\n注意：修改后将无法恢复，建议在GitHub存档你的表情包`)
                    )
                )
                    return
                // 存入数据库
                await db.write(n.name, n)
                // enableMeme(n.name)
                reflashList()
                alert('新版本的“' + n.name + '”已经存入数据库')
            }
            sm.inputBox({
                defaultText: sm.formatMemePack(m),
                acceptCallback: cb
            })
            return
        }
    }
    /**导入
     * @param text 可选，不填的话，会跳出编辑框
     */
    function importMeme(text?: string) {
        const cb = async function (text: string) {
            let m = sm.resolveMemePack(text)
            // 表情数量检查
            if (m.memes.length < 1) {
                alert('表情数量为0，不可导入！')
                return
            }/*if (!(confirm('导入的表情数量为0，是否导入？'))) return*/
            // 表情包总得有个名字
            m.name = m.name ?? '未命名的表情包'
            // 冲突检查，不冲突也确认一遍
            let alreadyExist = await db.has(m.name)
            if (alreadyExist) {
                let n = await db.read<MemePack>(m.name, m)
                if (
                    !(
                        confirm(`已经存在名为“${m.name}”的表情包
已有版本：作者 ${n.author ?? '佚名'}，版本 ${n.version ?? '未知版本'}，表情 ${n.memes.length}个
导入版本：作者 ${m.author ?? '佚名'}，版本 ${m.version ?? '未知版本'}，表情 ${m.memes.length}个\n是否覆盖？`)
                    )
                )
                    return
                if (n.memes.length >= m.memes.length && !(confirm('检测到新版本表情数量没有增加...\n此操作不可撤销，是否覆盖？'))) // 如果新版本表情更少的话需要二次确认
                    return
            } else if (!confirm(`表情包信息：\n表情包名 ${m.name}，作者 ${m.author ?? '佚名'}\n版本 ${m.version ?? '未知版本'}，表情 ${m.memes.length}个\n确认导入？`)) return
            // 存入数据库
            await db.write(m.name, m)
            enableMeme(m.name)
            reflashList()
            alert('新的表情包“' + m.name + '”已经存入数据库，默认启用')
        }
        if (typeof text == 'string' && text.length > 0)
            cb(text)
        else
            sm.inputBox({
                placeholder: '一次只能导入一个表情包，表情包封面图是表情包最后一张图',
                acceptCallback: cb
            })
    }
    /**导出 */
    function exportMeme() {
        if (chosenList.length < 1) return alert('请先选中一个表情')
        let target = chosenList[0]
        for (let m of memeLoadList) {
            if (m.name != target) continue
            sm.inputBox({
                defaultText: sm.formatMemePack(m)
            })
            return
        }
    }
    /**将一个表情包的信息转换为一个div */
    function item(p: MemePack) {
        p.name = simpleAntiXSS(p.name ?? '未命名的表情包')
        p.author = simpleAntiXSS(p.author ?? '佚名')
        p.version = simpleAntiXSS(p.version ?? '未知版本')
        p.license = simpleAntiXSS(p.license ?? '作者版权所有')
        let d = newDiv()
        d.className = 'memeitem'
        d.onclick = function () {
            if (chosenList.indexOf(p.name) != -1) {
                chosenList = chosenList.filter((v) => { return v != p.name })
                d.removeClass('selected')
            } else {
                chosenList.push(p.name)
                d.addClass('selected')
            }
        }
        // 图片和说明文字
        let img = document.createElement('img')
        img.alt = '表情包图片'
        img.src = (p.memes[p.memes.length - 1] ?? { url: 'https://attachment.mcbbs.net/common/5f/common_110_icon.png' }).url
        let r = document.createElement('p')
        r.innerHTML = `<big><b>${p.name}</b></big><br>作者：${p.author}<br>许可证：${p.license}<br>
表情数：${p.memes.length}个，版本：${p.version}
${p.others ? '<br>\n其他信息：' + simpleAntiXSS(p.others) : ''}`
        // 复选框
        let id = sm.randomID() + 'emoticon'
        let input = document.createElement('input')
        input.type = 'checkbox'
        input.id = id
        input.checked = enableList.indexOf(p.name) != -1
        input.hidden = true
        input.onclick = function (e) {
            e.stopPropagation()
            if (input.checked)
                enableMeme(p.name)
            else
                disableMeme(p.name)
        }
        let lable = document.createElement('label')
        lable.className = 'checkbox'
        lable.htmlFor = id
        lable.onclick = function (e) { e.stopPropagation() }
        let div = newDiv()
        div.appendChild(input); div.appendChild(lable)
        // 添加到item
        d.appendChild(img); d.appendChild(r); d.appendChild(div)
        return d
    }
    /**刷新管理面板列表 */
    async function reflashList() {
        if (busyLock[0]) return
        else busyLock[0] = true
        enableList = sm.readWithDefault<string[]>('enableMemeList', [])
        chosenList = []
        /**读取所有表情包 */
        let allMemepackList = await db.readAllValue<MemePack>()
        memeLoadList = allMemepackList
        memeList.innerHTML = ''
        for (let meme of allMemepackList) {
            memeList.appendChild(item(meme))
        }
        reflashInsertEmoticonPanel()
        busyLock[0] = false
    }
    /**在指定位置显示插入表情面板 */
    function showPanel(x = 0, y = 0) {
        let d = insertEmoticonPanel
        let windowWidth = window.innerWidth || document.documentElement.clientWidth
        let windowHeight = window.innerHeight || document.documentElement.clientHeight
        // 定位
        let panelWidth = Math.round(windowWidth * 0.35)
        let panelHeight = Math.round(windowHeight * 0.3)
        d.style.setProperty('--width', panelWidth + 'px')
        d.style.setProperty('--height', panelHeight + 'px')
        let left = (windowWidth - x) > panelWidth ? x : x - panelWidth
        let top = (windowHeight - y) > panelHeight ? y : y - panelHeight
        d.style.setProperty('--left', left + 'px')
        d.style.setProperty('--top', top + 'px')
        // 显示
        d.style.display = 'block'
        // 刷新bar的内容
        if (insertEmoticonPanelBar.innerHTML == '')
            reflashInsertEmoticonPanel()
    }
    /**刷新插入表情面板 */
    function reflashInsertEmoticonPanel() {
        insertEmoticonPanelBar.innerHTML = ''
        for (let pack of memeLoadList) {
            if (enableList.indexOf(pack.name) == -1) continue
            let btn = newDiv()
            btn.innerHTML = pack.name ?? '未命名的表情包'
            btn.onclick = function () {
                changePack(pack)
                // 选中显示
                let pre = insertEmoticonPanelBar.querySelector('.select')
                if (pre) pre.classList.remove('select')
                btn.addClass('select')
            }
            insertEmoticonPanelBar.appendChild(btn)
        }
        insertEmoticonPanelBar.querySelector('div')?.click()
    }
    /**更换插入表情面板的表情栏 */
    function changePack(pack: MemePack) {
        insertEmoticonPanelMain.innerHTML = ''
        let lazyload = 0
        for (let meme of pack.memes) {
            let a = newDiv(), b = newDiv(), img = document.createElement('img')
            // 方格
            a.title = meme.name
            a.onclick = function () {
                insertMeme(meme)
            }
            // 图片
            img.alt = meme.name
            setTimeout(() => {
                img.src = meme.url
            }, Math.floor((10 * lazyload++) ** 0.5));
            // 显示
            b.appendChild(img)
            a.appendChild(b)
            insertEmoticonPanelMain.appendChild(a)
        }
    }
    /**插入表情包到指定位置 */
    function insertMeme(meme: Meme) {
        let imgStr: string, imgHTML: string
        //@ts-ignore 将表情处理成字符串
        if (typeof meme['width'] == 'undefined') {
            imgStr = `[img]${meme.url}[/img]`
            imgHTML = '<img src="' + meme.url.replace(/([\"\<\>\&])/g, '\\$1') + '" />'
        } else { //@ts-ignore
            imgStr = `[img=${meme.width},${meme.height ?? meme.width}]${meme.url}[/img]` //@ts-ignore
            imgHTML = `<img src="${meme.url.replace(/([\"\<\>\&])/g, '\\$1')}" width=${meme.width} height=${meme.height ?? meme.width} />`
        }
        // 获取当前焦点位置
        let focus = getFocus()
        if (!focus) return
        // 插入字符串
        if (focus instanceof HTMLBodyElement || focus.tagName.toUpperCase() == 'BODY') { // 如果是所见即所得编辑框
            if (!window.insertText) { // 手动补全一个insertText
                (0, eval)(`function insertText(text, movestart, moveend, select, sel) {checkFocus();if(wysiwyg) {try {if(!editdoc.execCommand('insertHTML', false, text)) {throw 'insertHTML Err';}} catch(e) {try {if(!isUndefined(editdoc.selection) && editdoc.selection.type != 'Text' && editdoc.selection.type != 'None') {movestart = false;editdoc.selection.clear();}range = isUndefined(sel) ? editdoc.selection.createRange() : sel;range.pasteHTML(text);if(text.indexOf('\n') == -1) {if(!isUndefined(movestart)) {range.moveStart('character', -strlen(text) + movestart);range.moveEnd('character', -moveend);} else if(movestart != false) {range.moveStart('character', -strlen(text));}if(!isUndefined(select) && select) {range.select();}}} catch(e) {if(!sel) {var sel = editdoc.getSelection();var range = sel.getRangeAt(0);} else {var range = sel;}if(range && range.insertNode) {range.deleteContents();}var frag = range.createContextualFragment(text);range.insertNode(frag);}}} else {if(!isUndefined(editdoc.selectionStart)) {if(editdoc._selectionStart) {editdoc.selectionStart = editdoc._selectionStart;editdoc.selectionEnd = editdoc._selectionEnd;editdoc._selectionStart = 0;editdoc._selectionEnd = 0;}var opn = editdoc.selectionStart + 0;editdoc.value = editdoc.value.substr(0, editdoc.selectionStart) + text + editdoc.value.substr(editdoc.selectionEnd);if(!isUndefined(movestart)) {editdoc.selectionStart = opn + movestart;editdoc.selectionEnd = opn + strlen(text) - moveend;} else if(movestart !== false) {editdoc.selectionStart = opn;editdoc.selectionEnd = opn + strlen(text);}} else if(document.selection && document.selection.createRange) {if(isUndefined(sel)) {sel = document.selection.createRange();}if(editbox.sel) {sel = editbox.sel;editbox.sel = null;}sel.text = text.replace(/\r?\n/g, '\r\n');if(!isUndefined(movestart)) {sel.moveStart('character', -strlen(text) +movestart);sel.moveEnd('character', -moveend);} else if(movestart !== false) {sel.moveStart('character', -strlen(text));}sel.select();} else {editdoc.value += text;}}checkFocus();}`)
            }
            window.insertText!(imgHTML)
        } else if (focus instanceof HTMLInputElement || focus instanceof HTMLTextAreaElement) { // 如果是个文本框
            let pos = focus.selectionStart ?? 0
            let v = focus.value
            focus.value = v.slice(0, pos) + imgStr + v.slice(pos)
            //@ts-ignore
            setTimeout(() => { focus.selectionStart = pos + imgStr.length }, 0) // 保持选择点
        }
        /**获取应该塞入内容的元素（焦点元素） */
        function getFocus() {
            let TaId = ['e_textarea', 'fastpostmessage', 'postmessage', 'livereplymessage', 'replymessage']
            let inputId = ['vmessage']
            /**是不是编辑页面 */
            let editPage = (function () {
                let p = document.querySelector('#postbox')
                if (p && p.querySelector('iframe'))
                    return true
                return false
            })()
            let a = document.activeElement
            if (a) {
                if (a instanceof HTMLTextAreaElement) { // 焦点处是文本框
                    // 定位到了错误的文本框
                    if ((a.id ?? '').length < 1 || TaId.indexOf(a.id ?? '') == -1) return null
                    if (!editPage) return a // 不是编辑页的情况
                    if (a.style.display != 'none') return a // 处于纯文本编辑状态
                }
                if (a instanceof HTMLBodyElement && a.contentEditable == 'true') { // 焦点处是一个可编辑文档
                    // 肯定是编辑页了
                    let iframe = document.querySelector('#postbox')!.querySelector('iframe')! //document.querySelector('#postbox iframe')
                    if (iframe.style.display != 'none') // 处于所见即所得状态
                        return a
                    return document.querySelector('#postbox')!.querySelector('textarea')! // 返回纯文本编辑框
                }
                if (a instanceof HTMLInputElement) // 焦点处是一个单行文本框
                    if (inputId.indexOf(a.id ?? '') != -1) // 是快速回复之类的文本框
                        return a
            }
            // 没有获取到合适的元素，开始盲猜
            if (editPage) {
                let ta = document.querySelector('#postbox')!.querySelector('textarea')!
                if (ta.style.display != 'none') return ta // 处于纯文本编辑状态
                let iframe = document.querySelector('#postbox')!.querySelector('iframe')!
                if (iframe.contentDocument && iframe.contentDocument.body && iframe.contentDocument.body.contentEditable == 'true')
                    return iframe.contentDocument.body
            } else {
                for (let s of [...TaId, ...inputId]) { // 遍历所有可能可用的
                    let el = document.getElementById(s)
                    if (el && el.allInViewport() && el.style.display != 'none') return el
                }
            }
            // 没有其他选项了
            return null
        }
    }
})();