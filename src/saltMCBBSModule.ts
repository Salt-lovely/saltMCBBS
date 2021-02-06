// 一些较大的模块放在这
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
    const commandMap = {
        gid: gid,
        fid: fid,
        tid: tid,
        pid: pid,
        uid: uid,
        uname: uname,
        username: uname,
        openurl: newWindow,
        newwindow: newWindow,
        runjs: runJS,
        togglenight: togglenightstyle,
        togglenightstyle: togglenightstyle,
        cls: cls,
        cleanscreen: cls
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
    function runJS(js: string): string {
        if (confirm('请确认这是您本人的操作，' + prefix + '将要执行以下代码: \n' + js)) {
            window.eval(js)
            return '已执行JS'
        }
        return 'JS执行被用户取消'
    }
    function togglenightstyle() {
        window.saltMCBBS.toggleNightStyle()
        return '切换夜间模式'
    }
    function cls() {
        setTimeout(() => { logArea.innerHTML = '' }, 0)
        return ''
    }
    // function reload()
    class saltMCBBSConsole {
        run(command: string) {
            this.log(runCommand(Trim(command)))
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
            inputArea.blur()
        }
        showConsolePanel() {
            consolePanel.addClass('visible')
            consolePanel.removeClass('hidden')
            inputArea.focus()
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
    // const resolveMemePack = sm.resolveMemePack
    const newDiv = () => { return document.createElement('div') }
    const simpleAntiXSS = sm.simpleAntiXSS
    const emoticonPanel = (function () {
        let d = newDiv()
        d.className = 'emoticonPanel'
        d.addClass('hidden')
        d.id = 'emoticonPanel'
        d.innerHTML = `<h3 class="flb" style="width:calc(100% - 16px);margin-left:-8px;padding-right:0;position:absolute;top:0">
    <em>SaltMCBBS表情包管理</em>
    <span style="float:right">
    </span></h3><div class="memelist"></div>`
        // 关闭按钮
        let a = document.createElement('a')
        a.href = 'javascript:void(0);'
        a.className = 'flbc'
        a.textContent = '关闭'
        a.onclick = function () {
            d.removeClass('visible')
            d.addClass('hidden')
        }
        d.querySelector('h3 span')!.appendChild(a)
        // 打开按钮
        let o = document.createElement('a')
        o.href = 'javascript:void(0);'
        o.textContent = '表情包管理'
        o.onclick = function () {
            d.removeClass('hidden')
            d.addClass('visible')
        }
        sm.addSideBarLink(o)
        // 添加到body
        document.body.appendChild(d)
        return d
    })()
    const memeList = emoticonPanel.querySelector('.memelist')!
    if (!(memeList instanceof HTMLElement)) { return }
    let chosenList: string[] = []
    let enableList: string[] = sm.readWithDefault<string[]>('enableMemeList', [])
    let memeLoadList: MemePack[] = []
    // 等等数据库
    await db.waitForReady();
    // console.log(db.has('a'))
    // 添加面板底部的删除、导入、导出按钮
    (function () {
        let op = newDiv()
        op.className = 'op'
        // addDiv('启用', enableList)
        // addDiv('禁用', disableList)
        addDiv('删除', deleteList)
        addDiv('导入', importMeme)
        addDiv('导出', exportMeme)
        emoticonPanel.appendChild(op)
        function addDiv(text: string, func: () => void) {
            let d = newDiv(); d.textContent = text
            d.onclick = func; op.appendChild(d)
        }
    })()
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
    /**删除 - TODO */
    function deleteList() {
        if (chosenList.length < 1) return
        if (!(confirm('你确定要删除这' + chosenList.length + '个表情包吗？\n' + chosenList.join('、') + '\n删除后将无法恢复！'))) return
    }
    /**导入 */
    function importMeme() {
        const cb = async function (text: string) {
            let m = sm.resolveMemePack(text)
            // 表情数量检查
            if (m.memes.length < 1) {
                alert('导入的表情数量为0，不可导入！')
                return
            }/*if (!(confirm('导入的表情数量为0，是否导入？'))) return*/
            // 表情包总得有个名字
            m.name = m.name ?? '未命名的表情包'
            // 冲突检查
            let alreadyExist = await db.has(m.name)
            if (alreadyExist) {
                let n = await db.read<MemePack>(m.name, m)
                if (
                    !(
                        confirm(`已经存在名为“${m.name}”的表情包
已有版本：作者 ${n.author ?? '佚名'}，版本 ${n.version ?? '未知版本'}，表情 ${n.memes.length}个
导入版本：作者 ${n.author ?? '佚名'}，版本 ${n.version ?? '未知版本'}，表情 ${m.memes.length}个
是否覆盖？`)
                    )
                )
                    return
                if (n.memes.length >= m.memes.length && !(confirm('检测到新版本表情数量没有增加...\n此操作不可撤销，是否覆盖？'))) // 如果新版本表情更少的话需要二次确认
                    return
            }
            // 存入数据库
            await db.write(m.name, m)
            alert('新的表情包' + m.name + '已经存入数据库，默认不启用')
        }
        sm.inputBox({
            placeholder: '请注意：一次只能导入一个表情包',
            acceptCallback: cb
        })
    }
    /**导出 - TODO */
    function exportMeme() {
        if (chosenList.length < 1) return
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
                chosenList.filter((v) => { return v != p.name })
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
        r.innerHTML = `<big><b>${p.name}</b></big><br>
作者：${p.author}<br>
版本：${p.version}<br>
许可证：${p.license}<br>
表情数量：${p.memes.length}个${p.others ? '<br>\n其他信息：' + simpleAntiXSS(p.others) : ''}`
        // 复选框
        let input = document.createElement('input')
        input.type = 'checkbox'
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
        // 添加到item
        d.appendChild(img); d.appendChild(r); d.appendChild(input); d.appendChild(lable)
        return d
    }
})();