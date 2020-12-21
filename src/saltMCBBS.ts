'use strict';
// ==UserScript==
// @name         saltMCBBS
// @namespace    http://salt.is.lovely/
// @description  salt's MCBBS 拓展
// @author       salt
// @match        https://*.mcbbs.net/*
// @grant        none
// @license      CC BY-NC-SA 4.0
// @run-at       document-end
// ==/UserScript==
(function () {
    /**版本 */
    let myversion = '0.1.5'
    /**历史 */
    let myhistory = ``
    /**前缀 */
    let myprefix = '[SaltMCBBS]'
    /**勋章文件地址前缀 */
    let medalLinkPrefix = 'https://www.mcbbs.net/static/image/common/'
    /**占位用的，一个字符 */
    let placeholderSpan = '<span style="color:transparent;display:inline">无</span>'
    /**占位用的，两个字符 */
    let placeholderSpan2 = '<span style="color:transparent;display:inline">空白</span>'
    /**消息提醒的图标 */
    let noticimgurl = [
        'https://s3.ax1x.com/2020/11/28/DynR1S.png',
        'https://s3.ax1x.com/2020/11/28/DynW6g.png',
        'https://s3.ax1x.com/2020/11/28/DynfXQ.png',
        'https://s3.ax1x.com/2020/11/28/Dyn2p8.png',
        'https://s3.ax1x.com/2020/11/28/Dyn4mj.png',
        'https://s3.ax1x.com/2020/11/28/Dyn50s.png',
        'https://s3.ax1x.com/2020/11/28/Dyncff.png',
    ]
    /**技术性前缀, 防止变量名冲突 */
    let techprefix = 'saltMCBBS-'
    /**安全锁 */
    let autoRunLock = true
    /**原始类，包含各种基础方法*/
    class saltMCBBSOriginClass implements saltMCBBSOriginClass {
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
         *  */
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
                return <T>JSON.parse(value);
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
         * 断言
         * @param condition 为假时报错
         * @param msg 报错语句，默认为“发生错误”
         */
        assert(condition: any, msg: string = '发生错误'): void {
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
        /**history: 显示更新历史*/
        history() {
            this.log(myhistory)
        }
        /**version: 显示版本*/
        version() {
            this.log(myversion)
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
        settingPanel: HTMLElement = document.createElement('div')
        links: HTMLElement = document.createElement('div') // 左侧栏底部的一大堆链接
        constructor(autorun = false) {
            super()
            window.saltMCBBSCSS.setStyle( // 主要更改
                `body{background-image:var(--bodyimg-day);background-attachment:fixed;background-size:cover}body>div[style]:not([id]):not([class]){float:left}body:hover>.mc_map_wp{transition-delay:0s}body>.mc_map_wp{padding-top:0;margin-top:0;overflow:visible;display:inline-block;margin-left:calc(50% - 565px);transition:0.3s ease;transition-delay:0.5s}body>.mc_map_wp:hover{transition-delay:0s}body>.mc_map_wp>.new_wp{padding-top:0 !important;padding-bottom:0 !important}body>.mc_map_wp>.new_wp h2 img{max-height:74px}.pmwarn{width:auto !important;background-size:16px !important}ul.xl.xl2.o.cl .pmwarn{background:url(template/mcbbs/image/warning.gif) no-repeat 0px 2px}#uhd>.mn>ul .pmwarn a{background:url(template/mcbbs/image/warning.gif) no-repeat 0px 2px !important;background-size:16px !important}.warned{opacity:0.2}.warned:hover{opacity:0.9}#scrolltop{visibility:visible !important;opacity:1;transition:0.3s ease}#scrolltop:not([style]){display:none}#scrolltop[style*="hidden"]{margin-left:-10px;opacity:0 !important}.pl .blockcode{position:relative}.pl .blockcode>em{top:2px;right:2px;position:absolute;margin:0 0 0 0}.pl .blockcode>em:hover{outline:1px dashed}.pl .blockcode ol{overflow:scroll;max-width:45em}.pl .blockcode ol li{color:#444;margin-left:29px;line-height:1.8em;height:1.8em;white-space:pre}.settingPanel{width:40vw;min-width:360px;left:30vw;max-height:85vh;top:10vh;position:fixed;background-color:#fbf2db;background-clip:padding-box;padding:0 8px 8px 8px;border:8px solid;border-radius:8px;border-color:rgba(0,0,0,0.2);box-sizing:border-box;overflow-y:auto;transition:0.3s ease, opacity 0.2s ease;z-index:999999}.settingPanel.visible{opacity:1;top:10vh}.settingPanel.hidden{opacity:0;top:-90vh;transition-timing-function:ease-in}.settingPanel>*{width:100%;box-sizing:border-box;margin-bottom:8px;float:left}.settingPanel .flb span>a{color:#3a74ad}.settingPanel .flb span>a:hover{color:#6cf}.settingPanel h3{font-size:0.875rem}.settingPanel h3 small{font-size:0.5em;color:grey}.settingPanel h3.half-h3{width:calc(50% - 14px);padding:0 10px 0 0;float:left;text-align:right}.settingPanel textarea{resize:vertical;height:4em;min-height:2em;max-height:20em;width:calc(100% - 8px)}.settingPanel input{width:calc(50% - 4px);float:left;text-align:center}.settingPanel input[type="range"]{width:calc(100% - 8px)}
`
                , 'main'
            )
            window.saltMCBBSCSS.setStyle( // movePageHead 所需CSS
                `body.night-style #saltNewPageHead{--saltNewPageHeadbgcolor-l-t:rgba(68,68,68,0.5);--saltNewPageHeadbgcolor-l:#444;--saltNewPageHeadbgcolor:#363636}body.night-style #saltNewPageHead,body.night-style #saltNewPageHead a{color:#f0f0f0}body.night-style #saltNewPageHead a:hover{color:#6cf}body.night-style #saltNewPageHead .y_search,body.night-style #saltNewPageHead #scbar_type_menu{background-image:none;background-color:#444}body.night-style #saltNewPageHead .y_search{outline:none}body.night-style #saltNewPageHead .y_search .y_search_btn button{box-shadow:none;filter:invert(0.8) hue-rotate(170deg)}body.night-style #saltNewPageHead .y_search .y_search_inp{background-color:#555;background-image:none}body.night-style #saltNewPageHead .y_search .y_search_inp input{background-color:#666}body.night-style #saltNewPageHead .y_search .scbar_type_td{background-color:#555;background-image:none}#toptb{display:none}#saltNewPageHead{position:fixed;width:310px;height:100vh;top:0;left:-340px;padding:10px 30px;background-color:var(--saltNewPageHeadbgcolor-l-t, #fdf6e699);color:#111;transition:0.4s ease;transition-delay:0.4s;overflow-x:hidden;opacity:0.35;z-index:999999}#saltNewPageHead:hover{left:0;background-color:var(--saltNewPageHeadbgcolor-l, #fdf6e6);opacity:1;transition:0.4s ease}#saltNewPageHead::after{content:"saltMCBBS脚本，开发语言: Typescript + SCSS";position:absolute;top:90vh;right:0;color:var(--saltNewPageHeadbgcolor, #fbf2dc);z-index:-1}#saltNewPageHead .y_search,#saltNewPageHead .userinfo,#saltNewPageHead .links,#saltNewPageHead .addons{width:100%;margin:0;margin-bottom:0.75rem;overflow:auto;border-bottom:#ccc;font-size:1rem}#saltNewPageHead .y_search{background-color:transparent;outline:1px solid #ccc;overflow-y:hidden}#saltNewPageHead .y_search,#saltNewPageHead .y_search table{width:100%}#saltNewPageHead .y_search .y_search_btn{opacity:0.5}#saltNewPageHead .y_search .y_search_btn:hover{opacity:0.9}#saltNewPageHead .y_search .y_search_inp{width:calc(100% - 42px);background-image:none}#saltNewPageHead .y_search .y_search_inp input{width:calc(100% - 10px)}#saltNewPageHead .y_search .scbar_type_td{width:48px;background-image:none}#saltNewPageHead #scbar_type_menu{top:322px !important}#saltNewPageHead .userinfo{overflow-x:hidden}#saltNewPageHead .userinfo>div,#saltNewPageHead .userinfo>span{margin-bottom:0.5rem}#saltNewPageHead .userinfo .username{width:100%;height:100px;font-weight:bold;position:relative}#saltNewPageHead .userinfo .username a{top:2px;position:absolute;font-size:1.75rem}#saltNewPageHead .userinfo .username div{top:calc(8px + 2rem);width:10.2em;position:absolute;color:#999}#saltNewPageHead .userinfo .username img{right:7px;top:4px;position:absolute;border-radius:10%;-webkit-filter:drop-shadow(0 3px 4px #222);filter:drop-shadow(0 3px 4px #222)}#saltNewPageHead .userinfo .thread{width:100%;display:flex;font-size:0.875rem;text-align:center}#saltNewPageHead .userinfo .thread span,#saltNewPageHead .userinfo .thread a{width:100%;display:inline-block}#saltNewPageHead .userinfo .progress{width:95%;height:0.75rem;margin-left:auto;margin-right:auto;outline:1px solid #ccc;background-color:var(--saltNewPageHeadbgcolor, #fbf2dc);position:relative;display:block;transition:0.3s ease}#saltNewPageHead .userinfo .progress>span{height:100%;background-color:var(--progresscolor, #6cf);display:block}#saltNewPageHead .userinfo .progress::after{content:attr(tooltip);display:block;width:140%;left:-20%;top:0;position:absolute;font-size:0.7rem;color:transparent;text-align:center;transition:0.3s ease}#saltNewPageHead .userinfo .progress:hover{transform:translateY(0.5rem)}#saltNewPageHead .userinfo .progress:hover::after{top:-1rem;color:inherit}#saltNewPageHead .userinfo .credit{position:relative;font-size:0.875rem}#saltNewPageHead .userinfo .credit span{width:calc(50% - 4px);display:inline-block;height:1.2rem;line-height:1.2rem;padding-left:1rem;position:relative;box-sizing:border-box}#saltNewPageHead .userinfo .credit span img{left:1px;top:2px;position:absolute}#saltNewPageHead .links a{width:100%;height:1.75rem;line-height:1.75rem;display:inline-block;background-color:#fff0;text-align:center;font-size:1rem;border-bottom:1px solid #eee}#saltNewPageHead .links a:hover{background-color:var(--saltNewPageHeadbgcolor, #fbf2dc)}#saltNewPageHead .links a:last-child{border-bottom:none}#saltNewPageHead .links .showmenu{padding-right:0;background-image:none}#saltNewPageHead .addons a{width:calc(50% - 4px);display:inline-block;height:1.6rem;line-height:1.6rem;text-align:center;font-size:1rem;background-color:#fff0;border:1px solid transparent}#saltNewPageHead .addons a:hover{background-color:var(--saltNewPageHeadbgcolor, #fbf2dc);border-color:#efefef}#saltNewPageHead .addons a img{display:inline-block;vertical-align:middle;max-width:1.5rem;max-height:1.5rem;margin-right:0.5rem}
`
                , 'pagehead'
            )
            window.saltMCBBSCSS.setStyle( // 夜间模式样式
                `body.night-style{--bodybg:#2b2b2b;--bodybg-l:#2b2b2b;--bodybg-l-t:rgba(43,43,43,0)}body.night-style input,body.night-style button,body.night-style select,body.night-style textarea{background-color:#3d3d3d;background-image:none;border-color:#837c73;color:#eaeaea}body.night-style{background-color:#1c1c1c !important;background-image:var(--bodyimg-night);color:#eaeaea}body.night-style .mc_map_wp{box-shadow:0 0 20px 1px #000}body.night-style .mc_map_border_right,body.night-style .mc_map_border_left,body.night-style .mc_map_border_top,body.night-style .mc_map_border_foot{background-color:#2b2b2b;background-image:none;color:#eaeaea}body.night-style #body_fixed_bg{opacity:0}body.night-style .fl .forum_index_title,body.night-style .sttl,body.night-style .mn .bm_h{background-color:#3d3d3d;padding-left:16px}body.night-style .p_pop,body.night-style .p_pof,body.night-style .sllt{background-color:#3d3d3d;border-color:#837c73;background-image:none}body.night-style .p_pop a:hover,body.night-style .p_pof a:hover,body.night-style .sllt a:hover{background-color:#837c73}body.night-style #pt .z a,body.night-style #pt .z em,body.night-style #pt .z span{color:#eaeaea}body.night-style #nv_right{background-color:#3d3d3d;background-image:none}body.night-style #nv_right a{color:#eaeaea}body.night-style #nv_right a:hover{color:#6cf}body.night-style .m_c,body.night-style .tm_c{background-color:#2b2b2b;color:#eaeaea}body.night-style .m_c .dt th,body.night-style .tm_c .dt th{background-color:#2b2b2b}body.night-style .m_c .px,body.night-style .m_c .pt,body.night-style .m_c .ps,body.night-style .m_c select,body.night-style .tm_c .px,body.night-style .tm_c .pt,body.night-style .tm_c .ps,body.night-style .tm_c select{background-color:#3d3d3d;border-top:none;border-bottom:none;border-left:none;border-right:none;border-width:0px}body.night-style .m_c .o,body.night-style .tm_c .o{background-color:#3d3d3d}body.night-style .m_c a,body.night-style .tm_c a{color:#eaeaea}body.night-style .m_c a:hover,body.night-style .tm_c a:hover{color:#6cf}body.night-style .xi2,body.night-style .xi2 a,body.night-style .xi3 a{color:#69f}body.night-style .nfl .f_c{background-color:#444;border:none}body.night-style #diy_chart #frame48dS31{border-color:transparent !important}body.night-style #diy_chart .frame{background-color:#3d3d3d;border-color:transparent}body.night-style #diy_chart .frame .column{color:#eaeaea}body.night-style #diy_chart .frame .column a{color:#eaeaea}body.night-style #diy_chart .frame .column a:hover{color:#6cf}body.night-style #diy_chart .frame .column .tab-title.title{background-color:#2b2b2b !important}body.night-style #diy_chart .frame .column .tab-title.title ul{background-color:#3d3d3d !important}body.night-style #diy_chart .frame .column .tab-title.title ul li a{border-color:transparent !important}body.night-style #diy_chart .frame .column .tab-title.title ul li:not(.a) a{background-color:#525252}body.night-style #diy_chart .frame .column .tab-title.title ul li.a a{background-color:#666}body.night-style #diy_chart .frame .column .tb-c>div{background-color:#3d3d3d}body.night-style #diy_chart #tabVpFJkk{background-color:#3d3d3d !important;border-color:transparent !important}body.night-style .mn>.bm>.bm{background-color:#3d3d3d;border-color:transparent}body.night-style .mn>.bm>.bm .bm_h{background-color:#1c1c1c;background-image:none}body.night-style .mn>.bm>.bm .bm_c{background-color:#3d3d3d;border-color:transparent}body.night-style .portal_left_dev{border:none}body.night-style .portal_left_dev .portal_left_title{background-color:#1c1c1c;background-image:none}body.night-style .portal_left_dev .portal_left_title[style*="background"]{background-color:#1c1c1c !important;background-image:none !important}body.night-style .portal_left_dev .portal_left_content{border-color:transparent;background-color:#3d3d3d}body.night-style .portal_left_dev a{color:#eaeaea}body.night-style .portal_left_dev a:hover{color:#6cf}body.night-style #ct .mn .bm,body.night-style #group_sd .bm{border:none}body.night-style #ct .mn .bm .bm_h,body.night-style #group_sd .bm .bm_h{background-color:#1c1c1c;background-image:none}body.night-style #ct .mn .bm .area,body.night-style #ct .mn .bm .bm_c,body.night-style #group_sd .bm .area,body.night-style #group_sd .bm .bm_c{background-color:#3d3d3d;border-color:transparent}body.night-style #ct .mn .bm .area .frame,body.night-style #ct .mn .bm .bm_c .frame,body.night-style #group_sd .bm .area .frame,body.night-style #group_sd .bm .bm_c .frame{background-color:transparent}body.night-style #ct .mn a,body.night-style #group_sd a{color:#eaeaea}body.night-style #ct .mn a:hover,body.night-style #group_sd a:hover{color:#6cf}body.night-style #diy_right .frame{background-color:transparent}body.night-style #diy_right .block{background-color:#3d3d3d !important;border-color:transparent !important}body.night-style #diy_right .block .title{background-color:#1c1c1c;background-image:none}body.night-style #diy_right .block a{color:#eaeaea}body.night-style #diy_right .block a:hover{color:#6cf}body.night-style #diy_right .portal_news,body.night-style #diy_right .portal_game,body.night-style #diy_right .modpack,body.night-style #diy_right .portal_zb,body.night-style #diy_right .portal_note{border-color:transparent}body.night-style .special_user_info{background-color:#3d3d3d;background-image:none}body.night-style .special_user_info .special_info{background-color:transparent;background-image:none}body.night-style .special_user_info .special_info>div{background-color:#525252}body.night-style .special_user_info a{color:#eaeaea}body.night-style .special_user_info a:hover{color:#6cf}body.night-style .portal_block_summary iframe{filter:brightness(0.5)}body.night-style .pgb a{background-color:transparent}body.night-style .pgt .pg a,body.night-style .pgt .pg strong,body.night-style .pgt .pg label,body.night-style .pgs .pg a,body.night-style .pgs .pg strong,body.night-style .pgs .pg label{color:#eaeaea;background-color:transparent}body.night-style .pgt .pg strong,body.night-style .pgs .pg strong{background-color:#3d3d3d}body.night-style .pgbtn,body.night-style .pgbtn a{border:none;box-shadow:none}body.night-style .pgbtn a{background-color:#3d3d3d;color:#eaeaea;border:none}body.night-style #wp .wp{background-color:#2b2b2b;color:#eaeaea}body.night-style #wp .wp table,body.night-style #wp .wp tr,body.night-style #wp .wp td{border-color:#837c73}body.night-style #wp .wp table a,body.night-style #wp .wp tr a,body.night-style #wp .wp td a{color:#eaeaea}body.night-style #wp .wp table a:hover,body.night-style #wp .wp tr a:hover,body.night-style #wp .wp td a:hover{color:#6cf}body.night-style #postlist{background-color:transparent;border:none}body.night-style #postlist>table,body.night-style .plhin,body.night-style #f_pst{border:none;box-shadow:none}body.night-style #postlist>table tr,body.night-style #postlist>table td,body.night-style #postlist>table div,body.night-style .plhin tr,body.night-style .plhin td,body.night-style .plhin div,body.night-style #f_pst tr,body.night-style #f_pst td,body.night-style #f_pst div{border-color:#837c73}body.night-style #postlist>table .ad,body.night-style .plhin .ad,body.night-style #f_pst .ad{background-color:#3d3d3d}body.night-style #postlist>table td.pls,body.night-style .plhin td.pls,body.night-style #f_pst td.pls{background-color:#2b2b2b;border:none}body.night-style #postlist>table td.plc,body.night-style .plhin td.plc,body.night-style #f_pst td.plc{background-color:#3d3d3d;border:none}body.night-style #postlist>table .pls .avatar img,body.night-style .plhin .pls .avatar img,body.night-style #f_pst .pls .avatar img{background-color:#3d3d3d;background-image:none}body.night-style #postlist>table a,body.night-style .plhin a,body.night-style #f_pst a{color:#eaeaea}body.night-style #postlist>table a:hover,body.night-style .plhin a:hover,body.night-style #f_pst a:hover{color:#6cf}body.night-style .plhin .quote{background-color:#525252;color:#eaeaea}body.night-style .plhin .pcb .t_fsz>table table{color:#444;text-shadow:0 0 1px #fff, 0 0 1px #fff, 0 0 1px #fff, 0 0 1px #fff}body.night-style .plhin .pcb .t_fsz>table .spoilerbutton{border:1px solid #3d3d3d}body.night-style .plhin .pcb .t_fsz>table .spoilerbody>table{color:#eaeaea;text-shadow:none}body.night-style .plhin.warned{opacity:0.1}body.night-style .plhin.warned:hover{opacity:0.9}body.night-style #vfastpost{background-color:transparent;background-image:none}body.night-style #vfastpost #vf_l,body.night-style #vfastpost #vf_m,body.night-style #vfastpost #vf_r,body.night-style #vfastpost #vf_b{background-color:#2b2b2b;background-image:none}body.night-style #vfastpost #vf_m input{border-color:transparent;color:#eaeaea !important}body.night-style #vfastpost #vf_l{border-radius:5px 0 0 5px}body.night-style #vfastpost #vf_r{border-radius:0 5px 5px 0}body.night-style #vfastpost #vreplysubmit{background-color:#2b2b2b;background-image:none;box-shadow:none;position:relative}body.night-style #vfastpost #vreplysubmit:after{content:"快速回复";position:absolute;top:0;left:0;width:100%;height:38px;line-height:38px;font-size:1rem}body.night-style #p_btn a,body.night-style #p_btn a i{background-color:#525252;background-image:none}body.night-style .psth{background-color:#525252;background-image:none}body.night-style #postlist.bm{border-color:#837c73}body.night-style #mymodannouncement,body.night-style #myskinannouncement,body.night-style #mytextureannouncement,body.night-style #my16modannouncement,body.night-style .cgtl caption,body.night-style .locked{background-color:#2b2b2b;border:none}body.night-style #fastpostform .pls,body.night-style #fastpostform .plc{border:none}body.night-style #fastposteditor,body.night-style #fastposteditor .bar,body.night-style #fastposteditor .area,body.night-style #fastposteditor .pt{background-color:#2b2b2b;border:none}body.night-style #fastposteditor .fpd a{filter:drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff)}body.night-style .pi strong a{border-color:transparent}body.night-style #threadstamp img{filter:drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff)}body.night-style .blockcode{filter:invert(0.8) hue-rotate(170deg)}body.night-style .blockcode ol li{color:#222}body.night-style #ct .bm.bml.pbn .bm_c,body.night-style #ct .bm.bmw.fl .bm_c{background-color:#3d3d3d !important}body.night-style #ct #pgt,body.night-style #ct #thread_types>li a,body.night-style #ct #separatorline th,body.night-style #ct #separatorline td,body.night-style #ct #forumnewshow,body.night-style #ct #f_pst .bm_c{background-color:#3d3d3d !important}body.night-style #ct #threadlist .th,body.night-style #ct #threadlisttableid{background-color:transparent}body.night-style #ct #threadlist .th tr th,body.night-style #ct #threadlist .th tr td,body.night-style #ct #threadlisttableid tr th,body.night-style #ct #threadlisttableid tr td{background-color:transparent;border:none}body.night-style #ct #threadlist .th tr:hover th,body.night-style #ct #threadlist .th tr:hover td,body.night-style #ct #threadlisttableid tr:hover th,body.night-style #ct #threadlisttableid tr:hover td{background-color:#525252}body.night-style #ct .mn a.bm_h{background-color:#3d3d3d !important;border:none;color:#eaeaea}body.night-style #ct .mn a.bm_h:hover{color:#6cf}body.night-style #ct #waterfall li{background-image:none;background-color:#3d3d3d;transition:0.3 ease}body.night-style #ct #waterfall li:hover{background-color:#525252}body.night-style #ct #waterfall li>*{background-image:none;background-color:transparent}body.night-style #ct .appl{border-color:transparent !important}body.night-style #ct .appl .tbn h2{background-color:#1c1c1c;background-image:none}body.night-style #ct .appl .tbn ul{border:none}body.night-style #ct .appl .tbn ul li:hover{background-color:#3d3d3d}body.night-style #ct .appl .tbn a{color:#eaeaea}body.night-style #ct .appl .tbn a:hover{color:#6cf}body.night-style #ct .mn .bm{background-color:transparent}body.night-style #ct .mn .bm .tb.cl,body.night-style #ct .mn .bm .bm_h{background-color:#1c1c1c;background-image:none}body.night-style #ct .mn .bm .tb.cl h3,body.night-style #ct .mn .bm .bm_h h3{color:#eaeaea !important}body.night-style #ct .mn .bm .bm.mtm,body.night-style #ct .mn .bm .bm_c{background-color:#3d3d3d;border-color:transparent}body.night-style #ct .mn .bm ul li{color:#eaeaea}body.night-style #ct .mn .bm ul.buddy li{background-color:#3d3d3d;border:none}body.night-style #ct .mn .bm a{color:#eaeaea}body.night-style #ct .mn .bm a:hover{color:#6cf}body.night-style #ct .mn .bm .bm.bmn.mtm.cl{background-color:transparent !important}body.night-style #ct .mn .bm input,body.night-style #ct .mn .bm select,body.night-style #ct .mn .bm option{background-color:#3d3d3d;background-image:none;border-top:none;border-bottom:none;border-left:none;border-right:none;border-width:0px}body.night-style #ct .mn .bm .nts{background-color:#3d3d3d}body.night-style #ct .mn .bm .nts .ntc_body[style*="color"]{color:#eaeaea !important}body.night-style #nv>ul{background-color:#2b2b2b;background-image:none;border:none}body.night-style #nv>ul li:first-child>a,body.night-style #nv>ul li:first-child>a:hover{border-left:none}body.night-style #nv>ul li:last-child>a,body.night-style #nv>ul li:last-child>a:hover{border-right:none}body.night-style #nv>ul li>a{background-color:#3d3d3d}body.night-style #nv>ul li>a,body.night-style #nv>ul li>a:hover{border-color:#3d3d3d}body.night-style #nv>ul li>a:hover{background-color:#525252}body.night-style #uhd{background-color:#3d3d3d;border-color:#2b2b2b}body.night-style #uhd ul.tb.cl{border-bottom-color:#2b2b2b}body.night-style #uhd ul.tb.cl li a{background-color:#2b2b2b;border:none;color:#eaeaea}body.night-style #uhd ul.tb.cl li a:hover{color:#6cf}body.night-style #ct{border-color:#2b2b2b}body.night-style .tl{background-color:transparent}body.night-style .tl tr{background-color:transparent}body.night-style .tl tr th,body.night-style .tl tr td{background-color:transparent;border:none}body.night-style .tl tr:hover th,body.night-style .tl tr:hover td{background-color:#525252}body.night-style #typeid_ctrl_menu{background-color:#3d3d3d;border-color:#837c73}body.night-style #typeid_ctrl_menu li{color:#eaeaea}body.night-style #editorbox{background-color:#3d3d3d}body.night-style #editorbox>*{background-color:transparent}body.night-style #editorbox .tb .a a,body.night-style #editorbox .tb .current a{background-color:#525252}body.night-style #editorbox .ftid a{background-color:#525252;color:#eaeaea !important}body.night-style #editorbox #e_controls{background-color:#525252}body.night-style #editorbox #e_controls .b1r a,body.night-style #editorbox #e_controls .b2r a{border:none;border-width:0px}body.night-style #editorbox #e_controls .b1r a:not(.dp),body.night-style #editorbox #e_controls .b2r a:not(.dp){filter:drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff)}body.night-style #editorbox #e_controls .b1r a.dp,body.night-style #editorbox #e_controls .b2r a.dp{background-color:#525252;color:#eaeaea}body.night-style #editorbox #e_textarea{background-color:#2b2b2b}body.night-style #editorbox #rstnotice,body.night-style #editorbox #e_bbar,body.night-style #editorbox .area{background-color:#3d3d3d;border-color:#837c73}body.night-style #editorbox .area{background-color:#2b2b2b}body.night-style #editorbox .exfm{background-color:#525252}body.night-style #nav>a,body.night-style #content>*>a,body.night-style li>a,body.night-style #end>a,body.night-style #footer strong>a{color:#eaeaea}body.night-style #nav>a:hover,body.night-style #content>*>a:hover,body.night-style li>a:hover,body.night-style #end>a:hover,body.night-style #footer strong>a:hover{color:#6cf}body.night-style #content p.author{background-color:#3d3d3d}body.night-style .xl label,body.night-style .xl label a{color:#f99}body.night-style a[style*="color"][style*="#333333"],body.night-style font[style*="color"][style*="#333333"]{color:#e0e0e0 !important}body.night-style a[style*="color"][style*="#663399"],body.night-style font[style*="color"][style*="#663399"]{color:#de90df !important}body.night-style a[style*="color"][style*="#8f2a90"],body.night-style font[style*="color"][style*="#8f2a90"]{color:#de90df !important}body.night-style a[style*="color"][style*="#660099"],body.night-style font[style*="color"][style*="#660099"]{color:#bf8cd9 !important}body.night-style a[style*="color"][style*="#660000"],body.night-style font[style*="color"][style*="#660000"]{color:#c66 !important}body.night-style a[style*="color"][style*="#993333"],body.night-style font[style*="color"][style*="#993333"]{color:#f99 !important}body.night-style a[style*="color"][style*="#EE1B2E"],body.night-style font[style*="color"][style*="#EE1B2E"]{color:#f99 !important}body.night-style a[style*="color"][style*="#ff0000"],body.night-style font[style*="color"][style*="#ff0000"]{color:#f99 !important}body.night-style a[style*="color"][style*="#FF0000"],body.night-style font[style*="color"][style*="#FF0000"]{color:#f99 !important}body.night-style a[style*="color"][style*="#EE5023"],body.night-style font[style*="color"][style*="#EE5023"]{color:#d97f26 !important}body.night-style a[style*="color"][style*="#996600"],body.night-style font[style*="color"][style*="#996600"]{color:#e6a219 !important}body.night-style a[style*="color"][style*="#663300"],body.night-style font[style*="color"][style*="#663300"]{color:#d97f26 !important}body.night-style a[style*="color"][style*="#006666"],body.night-style font[style*="color"][style*="#006666"]{color:#6cc !important}body.night-style a[style*="color"][style*="#3C9D40"],body.night-style font[style*="color"][style*="#3C9D40"]{color:#8f8 !important}body.night-style a[style*="color"][style*="#009900"],body.night-style font[style*="color"][style*="#009900"]{color:#9f9 !important}body.night-style a[style*="color"][style*="#3366ff"],body.night-style font[style*="color"][style*="#3366ff"]{color:#6af !important}body.night-style a[style*="color"][style*="#2b65b7"],body.night-style font[style*="color"][style*="#2b65b7"]{color:#6af !important}body.night-style a[style*="color"][style*="#003399"],body.night-style font[style*="color"][style*="#003399"]{color:#6af !important}body.night-style a[style*="color"][style*="#2B65B7"],body.night-style font[style*="color"][style*="#2B65B7"]{color:#6af !important}body.night-style a[style*="color"][style*="#330066"],body.night-style font[style*="color"][style*="#330066"]{color:#b28cd9 !important}body.night-style a[style*="color"][style*="#8F2A90"],body.night-style font[style*="color"][style*="#8F2A90"]{color:#cf61d1 !important}body.night-style a[style*="background-color"][style*="#FFFFFF"],body.night-style font[style*="background-color"][style*="#FFFFFF"]{background-color:transparent !important}body.night-style a[style*="background-color"][style*="Wheat"],body.night-style font[style*="background-color"][style*="Wheat"]{background-color:transparent !important}body.night-style font[color*="#660000"]{color:#c66 !important}body.night-style font[color*="red"]{color:#f99 !important}body.night-style font[color*="Red"]{color:#f99 !important}body.night-style font[color*="#000080"]{color:#8af !important}body.night-style font[color*="#3366ff"]{color:#8af !important}body.night-style font[color*="#003399"]{color:#8af !important}body.night-style font[color*="blue"]{color:#8af !important}body.night-style font[color*="Blue"]{color:#8af !important}body.night-style font[color*="#339933"]{color:#9f9 !important}body.night-style font[color*="#009900"]{color:#9f9 !important}body.night-style font[color*="green"]{color:#9f9 !important}body.night-style font[color*="Green"]{color:#9f9 !important}body.night-style font[color*="black"]{color:#fff !important}body.night-style font[color*="Black"]{color:#fff !important}body.night-style font[color*="#660099"]{color:#bf8cd9 !important}body.night-style font[color*="#2d76c4"]{color:#5c97d6 !important}body.night-style .t_f[style*="background-color"][style*="#FBF2DB"]{background-color:transparent !important}body.night-style .settingPanel{background-color:#2b2b2b;color:#eaeaea}body.night-style .settingPanel textarea{background-color:#3d3d3d;border:none}body.night-style .settingPanel input{border:none;border-width:0px}
`
                , 'night-style'
            )
            window.saltMCBBSCSS.setStyle( // 勋章样式
                `p.md_ctrl{position:relative;overflow:hidden;margin-left:15px}p.md_ctrl,p.md_ctrl:hover{max-height:var(--maxHeight, 96px)}p.md_ctrl.salt-expand,p.md_ctrl.salt-expand:hover{max-height:var(--expandHeight, 960px)}p.md_ctrl.expandable{padding-bottom:32px}p.md_ctrl .saltExpandHandler{position:absolute;bottom:0;left:0;width:100%;height:32px;color:#3882a7;background-image:linear-gradient(0deg, #e3c99e, #e3c99e, rgba(227,201,158,0));cursor:pointer}p.md_ctrl .saltExpandHandler:after{content:"点击展开";display:block;width:100%;height:32px;line-height:32px;text-align:center}p.md_ctrl.salt-expand .saltExpandHandler:after{content:"点击收起"}p.md_ctrl:not(.expandable) .saltExpandHandler{display:none}p.md_ctrl>a{width:100%}p.md_ctrl>a>img{animation:dropdown 0.5s ease;position:relative;width:35px;height:55px;-webkit-filter:drop-shadow(0 2px 1px #000);filter:drop-shadow(0 2px 1px #000);margin:4.5px;transition:filter 0.5s ease}p.md_ctrl>a>img:hover{animation:pickup 0.5s ease;-webkit-transform:matrix3d(1, 0, 0, 0, 0, 1, 0, -0.001, 0, 0, 1, 0, 0, -1.6, 0, 0.92);transform:matrix3d(1, 0, 0, 0, 0, 1, 0, -0.001, 0, 0, 1, 0, 0, -1.6, 0, 0.92);-webkit-filter:drop-shadow(0 3px 2px rgba(0,0,0,0.5));filter:drop-shadow(0 3px 2px rgba(0,0,0,0.5))}body.night-style p.md_ctrl .saltExpandHandler{color:#6cf;background-image:linear-gradient(0deg, var(--bodybg-l, #313131), var(--bodybg-l, #313131), var(--bodybg-l-t, rgba(49,49,49,0)))}body #append_parent>.tip_4,body .tip_4.aimg_tip,body .pls .tip_4,body .tip_4[id*="attach"],body dd>.tip_4{background-color:#e3c99eee !important;max-height:90px !important;width:140px;margin-top:35px}body .tip_4.aimg_tip,body .tip_4[id*="attach"]{width:200px !important;padding:5px !important;background-image:none !important}body .tip_4[id*="attach"] .tip_c{padding:5px !important;background-image:none !important}body .tip_4.aimg_tip p{pointer-events:auto !important}body #append_parent>.tip_4{margin-top:40px;margin-left:-10px}body .tip_3,body .tip_4{transition:opacity 0.4s ease !important;width:105px;height:165px;padding:0;border:none;border-radius:5px;margin-top:85px;margin-left:44px;pointer-events:none !important;overflow:hidden;background-color:rgba(34,34,34,0.75);box-shadow:0px 10px 25px -4px #000;image-rendering:pixelated}body .tip_3::before,body .tip_4::before{content:"";position:absolute;z-index:-1;top:-7px;left:-7px;width:119px;height:187px;background-size:119px 187px !important;-webkit-filter:saturate(140%);filter:saturate(140%)}body .tip .tip_horn{display:none}body .tip .tip_c{background-image:linear-gradient(142deg, #fff0 0%, #fff7 5%, #fff5 28%, #fff0 29%, #fff0 70%, #fff5 70.5%, #fff5 73%, #fff0 74%, #fff7 75%, #fff7 85%, #fff0 85.1%);padding:20px 15px 0 15px;height:165px;color:#222}body .tip .tip_c>p,body .tip .tip_c>h4{color:#222;text-shadow:0 0 1px #fff, 0 0 1px #fff, 0 0 1px #fff,
 0 0 1px #fff, 0 0 1px #fff, 0 0 2px #fff, 0 0 3px #fff,
 0 0 3px #fff, 0 0 3px #fff !important}body .tip .tip_c h4{border-bottom:1px solid #fff}body div[id*="_menu"]:before{background-repeat:no-repeat}body #md_101_menu:before,body #medal_101_menu:before{background:url(static/image/common/m_a2.png)}body #md_102_menu:before,body #medal_102_menu:before{background:url(static/image/common/m_a3.png)}body #md_103_menu:before,body #medal_103_menu:before{background:url(static/image/common/m_a6.png)}body #md_11_menu:before,body #medal_11_menu:before{background:url(static/image/common/m_d1.png)}body #md_12_menu:before,body #medal_12_menu:before{background:url(static/image/common/m_d2.png)}body #md_104_menu:before,body #medal_104_menu:before{background:url(static/image/common/m_b1.png)}body #md_105_menu:before,body #medal_105_menu:before{background:url(static/image/common/m_b3.png)}body #md_106_menu:before,body #medal_106_menu:before{background:url(static/image/common/m_b4.png)}body #md_234_menu:before,body #medal_234_menu:before{background:url(static/image/common/m_b5.gif)}body #md_107_menu:before,body #medal_107_menu:before{background:url(static/image/common/m_rc1.png)}body #md_108_menu:before,body #medal_108_menu:before{background:url(static/image/common/m_rc3.png)}body #md_109_menu:before,body #medal_109_menu:before{background:url(static/image/common/m_rc5.png)}body #md_250_menu:before,body #medal_250_menu:before{background:url(static/image/common/m_c_10years.png)}body #md_76_menu:before,body #medal_76_menu:before{background:url(static/image/common/m_g5.png)}body #md_58_menu:before,body #medal_58_menu:before{background:url(static/image/common/m_g3.png)}body #md_59_menu:before,body #medal_59_menu:before{background:url(static/image/common/m_g4.png)}body #md_21_menu:before,body #medal_21_menu:before{background:url(static/image/common/m_noob.png)}body #md_9_menu:before,body #medal_9_menu:before{background:url(static/image/common/m_c2.png)}body #md_2_menu:before,body #medal_2_menu:before{background:url(static/image/common/m_c3.png)}body #md_38_menu:before,body #medal_38_menu:before{background:url(static/image/common/m_c1.png)}body #md_112_menu:before,body #medal_112_menu:before{background:url(static/image/common/m_c4.png)}body #md_251_menu:before,body #medal_251_menu:before{background:url(static/image/common/m_c_piglin.png)}body #md_155_menu:before,body #medal_155_menu:before{background:url(static/image/common/m_cape_mc2011.png)}body #md_156_menu:before,body #medal_156_menu:before{background:url(static/image/common/m_cape_mc2012.png)}body #md_157_menu:before,body #medal_157_menu:before{background:url(static/image/common/m_cape_mc2013.png)}body #md_158_menu:before,body #medal_158_menu:before{background:url(static/image/common/m_cape_mc2015.png)}body #md_159_menu:before,body #medal_159_menu:before{background:url(static/image/common/m_cape_Tr.png)}body #md_180_menu:before,body #medal_180_menu:before{background:url(static/image/common/m_cape_cobalt.png)}body #md_181_menu:before,body #medal_181_menu:before{background:url(static/image/common/m_cape_maper.png)}body #md_196_menu:before,body #medal_196_menu:before{background:url(static/image/common/m_cape_mc2016.png)}body #md_247_menu:before,body #medal_247_menu:before{background:url(static/image/common/m_cape_Mojira.png)}body #md_45_menu:before,body #medal_45_menu:before{background:url(static/image/common/m_s1.png)}body #md_127_menu:before,body #medal_127_menu:before{background:url(static/image/common/m_s2.png)}body #md_78_menu:before,body #medal_78_menu:before{background:url(static/image/common/m_p_pc.png)}body #md_113_menu:before,body #medal_113_menu:before{background:url(static/image/common/m_p_and.png)}body #md_114_menu:before,body #medal_114_menu:before{background:url(static/image/common/m_p_ios.png)}body #md_141_menu:before,body #medal_141_menu:before{background:url(static/image/common/m_p_wp.png)}body #md_160_menu:before,body #medal_160_menu:before{background:url(static/image/common/m_p_w10.png)}body #md_115_menu:before,body #medal_115_menu:before{background:url(static/image/common/m_p_box360.png)}body #md_116_menu:before,body #medal_116_menu:before{background:url(static/image/common/m_p_boxone.png)}body #md_117_menu:before,body #medal_117_menu:before{background:url(static/image/common/m_p_ps3.png)}body #md_118_menu:before,body #medal_118_menu:before{background:url(static/image/common/m_p_ps4.png)}body #md_119_menu:before,body #medal_119_menu:before{background:url(static/image/common/m_p_psv.png)}body #md_170_menu:before,body #medal_170_menu:before{background:url(static/image/common/m_p_wiiu.png)}body #md_209_menu:before,body #medal_209_menu:before{background:url(static/image/common/m_p_switch.png)}body #md_227_menu:before,body #medal_227_menu:before{background:url(static/image/common/m_p_3ds.png)}body #md_56_menu:before,body #medal_56_menu:before{background:url(static/image/common/m_g1.png)}body #md_57_menu:before,body #medal_57_menu:before{background:url(static/image/common/m_g2.png)}body #md_61_menu:before,body #medal_61_menu:before{background:url(static/image/common/m_p1.png)}body #md_62_menu:before,body #medal_62_menu:before{background:url(static/image/common/m_p2.png)}body #md_63_menu:before,body #medal_63_menu:before{background:url(static/image/common/m_p3.png)}body #md_46_menu:before,body #medal_46_menu:before{background:url(static/image/common/m_p4.png)}body #md_64_menu:before,body #medal_64_menu:before{background:url(static/image/common/m_p5.png)}body #md_65_menu:before,body #medal_65_menu:before{background:url(static/image/common/m_p6.png)}body #md_66_menu:before,body #medal_66_menu:before{background:url(static/image/common/m_p7.png)}body #md_75_menu:before,body #medal_75_menu:before{background:url(static/image/common/m_p8.png)}body #md_85_menu:before,body #medal_85_menu:before{background:url(static/image/common/m_p9.png)}body #md_86_menu:before,body #medal_86_menu:before{background:url(static/image/common/m_p10.png)}body #md_100_menu:before,body #medal_100_menu:before{background:url(static/image/common/m_p11.png)}body #md_175_menu:before,body #medal_175_menu:before{background:url(static/image/common/m_p12.png)}body #md_182_menu:before,body #medal_182_menu:before{background:url(static/image/common/m_p13.png)}body #md_91_menu:before,body #medal_91_menu:before{background:url(static/image/common/m_h1.png)}body #md_93_menu:before,body #medal_93_menu:before{background:url(static/image/common/m_h2.png)}body #md_92_menu:before,body #medal_92_menu:before{background:url(static/image/common/m_h3.png)}body #md_94_menu:before,body #medal_94_menu:before{background:url(static/image/common/m_h4.png)}body #md_95_menu:before,body #medal_95_menu:before{background:url(static/image/common/m_h5.png)}body #md_96_menu:before,body #medal_96_menu:before{background:url(static/image/common/m_h6.png)}body #md_152_menu:before,body #medal_152_menu:before{background:url(static/image/common/m_h7.png)}body #md_183_menu:before,body #medal_183_menu:before{background:url(static/image/common/m_h8.png)}body #md_200_menu:before,body #medal_200_menu:before{background:url(static/image/common/m_h9.png)}body #md_210_menu:before,body #medal_210_menu:before{background:url(static/image/common/m_h10.png)}body #md_70_menu:before,body #medal_70_menu:before{background:url(static/image/common/m_arena_v1.png)}body #md_72_menu:before,body #medal_72_menu:before{background:url(static/image/common/m_arena_v2.png)}body #md_88_menu:before,body #medal_88_menu:before{background:url(static/image/common/m_arena_v3.png)}body #md_111_menu:before,body #medal_111_menu:before{background:url(static/image/common/m_arena_v4.png)}body #md_69_menu:before,body #medal_69_menu:before{background:url(static/image/common/m_arena_w1.png)}body #md_68_menu:before,body #medal_68_menu:before{background:url(static/image/common/m_arena_w2.png)}body #md_73_menu:before,body #medal_73_menu:before{background:url(static/image/common/m_arena_w3.png)}body #md_74_menu:before,body #medal_74_menu:before{background:url(static/image/common/m_arena_w4.png)}body #md_89_menu:before,body #medal_89_menu:before{background:url(static/image/common/m_arena_w5.png)}body #md_90_menu:before,body #medal_90_menu:before{background:url(static/image/common/m_arena_w6.png)}body #md_98_menu:before,body #medal_98_menu:before{background:url(static/image/common/m_arena_w8.png)}body #md_99_menu:before,body #medal_99_menu:before{background:url(static/image/common/m_arena_w7.png)}body #md_120_menu:before,body #medal_120_menu:before{background:url(static/image/common/m_arena_v5.png)}body #md_121_menu:before,body #medal_121_menu:before{background:url(static/image/common/m_arena_w9.png)}body #md_122_menu:before,body #medal_122_menu:before{background:url(static/image/common/m_arena_w10.png)}body #md_123_menu:before,body #medal_123_menu:before{background:url(static/image/common/m_arena_i1.png)}body #md_129_menu:before,body #medal_129_menu:before{background:url(static/image/common/m_arena_v6.png)}body #md_130_menu:before,body #medal_130_menu:before{background:url(static/image/common/m_arena_w11.png)}body #md_131_menu:before,body #medal_131_menu:before{background:url(static/image/common/m_arena_w12.png)}body #md_132_menu:before,body #medal_132_menu:before{background:url(static/image/common/m_arena_i2.png)}body #md_143_menu:before,body #medal_143_menu:before{background:url(static/image/common/m_arena_v7.png)}body #md_144_menu:before,body #medal_144_menu:before{background:url(static/image/common/m_arena_v7f.png)}body #md_145_menu:before,body #medal_145_menu:before{background:url(static/image/common/m_arena_w13.png)}body #md_146_menu:before,body #medal_146_menu:before{background:url(static/image/common/m_arena_w14.png)}body #md_164_menu:before,body #medal_164_menu:before{background:url(static/image/common/m_arena_v8.png)}body #md_165_menu:before,body #medal_165_menu:before{background:url(static/image/common/m_arena_w15.png)}body #md_166_menu:before,body #medal_166_menu:before{background:url(static/image/common/m_arena_w16.png)}body #md_176_menu:before,body #medal_176_menu:before{background:url(static/image/common/m_arena_v9.png)}body #md_177_menu:before,body #medal_177_menu:before{background:url(static/image/common/m_arena_w17.png)}body #md_178_menu:before,body #medal_178_menu:before{background:url(static/image/common/m_arena_w18.png)}body #md_184_menu:before,body #medal_184_menu:before{background:url(static/image/common/m_arena_v10.png)}body #md_185_menu:before,body #medal_185_menu:before{background:url(static/image/common/m_arena_w19.png)}body #md_186_menu:before,body #medal_186_menu:before{background:url(static/image/common/m_arena_w20.png)}body #md_204_menu:before,body #medal_204_menu:before{background:url(static/image/common/m_arena_v11.png)}body #md_205_menu:before,body #medal_205_menu:before{background:url(static/image/common/m_arena_w21.png)}body #md_206_menu:before,body #medal_206_menu:before{background:url(static/image/common/m_arena_w22.png)}body #md_211_menu:before,body #medal_211_menu:before{background:url(static/image/common/m_arena_v12.png)}body #md_212_menu:before,body #medal_212_menu:before{background:url(static/image/common/m_arena_w23.png)}body #md_213_menu:before,body #medal_213_menu:before{background:url(static/image/common/m_arena_w24.png)}body #md_224_menu:before,body #medal_224_menu:before{background:url(static/image/common/m_arena_v13.png)}body #md_225_menu:before,body #medal_225_menu:before{background:url(static/image/common/m_arena_w25.png)}body #md_226_menu:before,body #medal_226_menu:before{background:url(static/image/common/m_arena_w26.png)}body #md_237_menu:before,body #medal_237_menu:before{background:url(static/image/common/m_arena14_1.png)}body #md_238_menu:before,body #medal_238_menu:before{background:url(static/image/common/m_arena14_2.png)}body #md_239_menu:before,body #medal_239_menu:before{background:url(static/image/common/m_arena14_3.png)}body #md_136_menu:before,body #medal_136_menu:before{background:url(static/image/common/m_s_v1.png)}body #md_167_menu:before,body #medal_167_menu:before{background:url(static/image/common/m_s_bili.png)}body #md_174_menu:before,body #medal_174_menu:before{background:url(static/image/common/m_s_v2.png)}body #md_195_menu:before,body #medal_195_menu:before{background:url(static/image/common/m_s_v3.png)}body #md_218_menu:before,body #medal_218_menu:before{background:url(static/image/common/m_s_bili2.png)}body #md_240_menu:before,body #medal_240_menu:before{background:url(static/image/common/m_s_v4.png)}body #md_253_menu:before,body #medal_253_menu:before{background:url(static/image/common/m_s_wiki.png)}body #md_254_menu:before,body #medal_254_menu:before{background:url(static/image/common/m_s_mcwiki.png)}body #md_124_menu:before,body #medal_124_menu:before{background:url(static/image/common/m_pearena_v1.png)}body #md_125_menu:before,body #medal_125_menu:before{background:url(static/image/common/m_pearena_w2.png)}body #md_126_menu:before,body #medal_126_menu:before{background:url(static/image/common/m_pearena_w1.png)}body #md_133_menu:before,body #medal_133_menu:before{background:url(static/image/common/m_pearena_v2.png)}body #md_134_menu:before,body #medal_134_menu:before{background:url(static/image/common/m_pearena_w4.png)}body #md_135_menu:before,body #medal_135_menu:before{background:url(static/image/common/m_pearena_w3.png)}body #md_147_menu:before,body #medal_147_menu:before{background:url(static/image/common/m_pearena_v3.png)}body #md_148_menu:before,body #medal_148_menu:before{background:url(static/image/common/m_pearena_w6.png)}body #md_149_menu:before,body #medal_149_menu:before{background:url(static/image/common/m_pearena_w5.png)}body #md_161_menu:before,body #medal_161_menu:before{background:url(static/image/common/m_pearena_v4.png)}body #md_162_menu:before,body #medal_162_menu:before{background:url(static/image/common/m_pearena_w8.png)}body #md_163_menu:before,body #medal_163_menu:before{background:url(static/image/common/m_pearena_w7.png)}body #md_171_menu:before,body #medal_171_menu:before{background:url(static/image/common/m_pearena_v5.png)}body #md_172_menu:before,body #medal_172_menu:before{background:url(static/image/common/m_pearena_w10.png)}body #md_173_menu:before,body #medal_173_menu:before{background:url(static/image/common/m_pearena_w9.png)}body #md_190_menu:before,body #medal_190_menu:before{background:url(static/image/common/m_pearena_w13.png)}body #md_192_menu:before,body #medal_192_menu:before{background:url(static/image/common/m_pearena_v6.png)}body #md_193_menu:before,body #medal_193_menu:before{background:url(static/image/common/m_pearena_w11.png)}body #md_194_menu:before,body #medal_194_menu:before{background:url(static/image/common/m_pearena_w12.png)}body #md_201_menu:before,body #medal_201_menu:before{background:url(static/image/common/m_pearena_v7.png)}body #md_202_menu:before,body #medal_202_menu:before{background:url(static/image/common/m_pearena_w16.png)}body #md_203_menu:before,body #medal_203_menu:before{background:url(static/image/common/m_pearena_w15.png)}body #md_214_menu:before,body #medal_214_menu:before{background:url(static/image/common/m_pearena_v8.png)}body #md_215_menu:before,body #medal_215_menu:before{background:url(static/image/common/m_pearena_w18.png)}body #md_216_menu:before,body #medal_216_menu:before{background:url(static/image/common/m_pearena_w17.png)}body #md_221_menu:before,body #medal_221_menu:before{background:url(static/image/common/m_pearena_v9.png)}body #md_222_menu:before,body #medal_222_menu:before{background:url(static/image/common/m_pearena_w20.png)}body #md_223_menu:before,body #medal_223_menu:before{background:url(static/image/common/m_pearena_w19.png)}body #md_229_menu:before,body #medal_229_menu:before{background:url(static/image/common/m_pearena_v10.png)}body #md_230_menu:before,body #medal_230_menu:before{background:url(static/image/common/m_pearena_w22.png)}body #md_231_menu:before,body #medal_231_menu:before{background:url(static/image/common/m_pearena_w21.png)}body #md_241_menu:before,body #medal_241_menu:before{background:url(static/image/common/m_pearena_v11.png)}body #md_242_menu:before,body #medal_242_menu:before{background:url(static/image/common/m_pearena_w24.png)}body #md_243_menu:before,body #medal_243_menu:before{background:url(static/image/common/m_pearena_w23.png)}body #md_197_menu:before,body #medal_197_menu:before{background:url(static/image/common/m_pofg_v1.png)}body #md_198_menu:before,body #medal_198_menu:before{background:url(static/image/common/m_pofg_v2.png)}body #md_199_menu:before,body #medal_199_menu:before{background:url(static/image/common/m_pofg_v3.png)}body #md_137_menu:before,body #medal_137_menu:before{background:url(static/image/common/m_g_cw.png)}body #md_138_menu:before,body #medal_138_menu:before{background:url(static/image/common/m_g_trp.png)}body #md_139_menu:before,body #medal_139_menu:before{background:url(static/image/common/m_g_tas.png)}body #md_140_menu:before,body #medal_140_menu:before{background:url(static/image/common/m_g_sc.png)}body #md_142_menu:before,body #medal_142_menu:before{background:url(static/image/common/m_g_sl.png)}body #md_150_menu:before,body #medal_150_menu:before{background:url(static/image/common/m_g_hayo.png)}body #md_151_menu:before,body #medal_151_menu:before{background:url(static/image/common/m_g_aa.png)}body #md_153_menu:before,body #medal_153_menu:before{background:url(static/image/common/m_g_is.png)}body #md_154_menu:before,body #medal_154_menu:before{background:url(static/image/common/m_g_cbl.png)}body #md_168_menu:before,body #medal_168_menu:before{background:url(static/image/common/m_g_ntl.png)}body #md_169_menu:before,body #medal_169_menu:before{background:url(static/image/common/m_g_tcp.png)}body #md_179_menu:before,body #medal_179_menu:before{background:url(static/image/common/m_g_mpw.png)}body #md_207_menu:before,body #medal_207_menu:before{background:url(static/image/common/m_g_ud.png)}body #md_217_menu:before,body #medal_217_menu:before{background:url(static/image/common/m_g_bs.png)}body #md_219_menu:before,body #medal_219_menu:before{background:url(static/image/common/m_g_pcd.png)}body #md_220_menu:before,body #medal_220_menu:before{background:url(static/image/common/m_g_gwnw.png)}body #md_228_menu:before,body #medal_228_menu:before{background:url(static/image/common/m_g_lw.png)}body #md_232_menu:before,body #medal_232_menu:before{background:url(static/image/common/m_g_uel.png)}body #md_233_menu:before,body #medal_233_menu:before{background:url(static/image/common/m_g_tgc.png)}body #md_235_menu:before,body #medal_235_menu:before{background:url(static/image/common/m_g_nf.png)}body #md_236_menu:before,body #medal_236_menu:before{background:url(static/image/common/m_g_mcbk.png)}body #md_244_menu:before,body #medal_244_menu:before{background:url(static/image/common/m_g_pos.png)}body #md_245_menu:before,body #medal_245_menu:before{background:url(static/image/common/m_g_stc.png)}body #md_246_menu:before,body #medal_246_menu:before{background:url(static/image/common/m_g_cps.png)}body #md_248_menu:before,body #medal_248_menu:before{background:url(static/image/common/m_g_wiki.png)}body #md_249_menu:before,body #medal_249_menu:before{background:url(static/image/common/m_g_rmg.png)}body #md_252_menu:before,body #medal_252_menu:before{background:url(static/image/common/m_g_tml.png)}@keyframes pickup{0%{-webkit-transform:matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);transform:matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)}50%{-webkit-transform:matrix3d(1, 0, 0, -0.002, 0, 1, 0, -0.002, 0, 0, 1, 0, 0, -1, 0, 0.95);transform:matrix3d(1, 0, 0, -0.002, 0, 1, 0, -0.002, 0, 0, 1, 0, 0, -1, 0, 0.95)}100%{-webkit-transform:matrix3d(1, 0, 0, 0, 0, 1, 0, -0.001, 0, 0, 1, 0, 0, -1.6, 0, 0.92);transform:matrix3d(1, 0, 0, 0, 0, 1, 0, -0.001, 0, 0, 1, 0, 0, -1.6, 0, 0.92)}}@keyframes dropdown{0%{-webkit-transform:matrix3d(1, 0, 0, 0, 0, 1, 0, -0.001, 0, 0, 1, 0, 0, -1.6, 0, 0.92);transform:matrix3d(1, 0, 0, 0, 0, 1, 0, -0.001, 0, 0, 1, 0, 0, -1.6, 0, 0.92)}50%{-webkit-transform:matrix3d(1, 0, 0, -0.001, 0, 1, 0, -0.002, 0, 0, 1, 0, 0, -1.1, 0, 0.95);transform:matrix3d(1, 0, 0, -0.001, 0, 1, 0, -0.002, 0, 0, 1, 0, 0, -1.1, 0, 0.95)}100%{-webkit-transform:matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);transform:matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)}}
`, 'medal')
            if (autorun) {
                this.log('运行saltMCBBS主过程')
                // 创建事件
                let ev = new CustomEvent('saltMCBBSload', { detail: { name: 'saltMCBBS', version: myversion } })
                // 初始化
                this.init()
                // 显示版本与更新历史
                this.version(); this.history()
                // 使用主要CSS
                window.saltMCBBSCSS.putStyle('', 'main'); window.saltMCBBSCSS.putStyle('', 'medal')
                // 启用夜间模式
                this.nightStyle(this.readWithDefault<boolean>('isNightStyle', false), false)
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
                // 触发事件
                window.dispatchEvent(ev)
                // 关闭安全锁
                autoRunLock = false
            }
        }
        /**初始化 */
        init() {
            let obj = this
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
            }, '昼间模式下的背景图片')
            this.addTextareaSetting('夜间模式下的背景图片 <small>一行一个, 填写超链接(URL)，随机选择，开头添加“//”暂时禁用这个图片</small>', this.readWithDefault<string[]>('nightBackgroundImage', []).join('\n'), (el) => {
                obj.write('nightBackgroundImage', obj.formatToStringArray(el.value))
                obj.updateBackground()
            }, '夜间模式下的背景图片')
            let opacity = this.readWithDefault<number>('mcmapwpOpacity', 0.5)
            this.addRangeSetting('主体部分的透明度<br><small>仅在有背景图片时启用, 当前不透明度: ' + opacity + '</small>', opacity, [0, 1, 0.05],
                (vl, ev) => {
                    this.write('mcmapwpOpacity', vl)
                    this.changeSettingH3('主体部分的透明度', '主体部分的透明度<small> 仅在有背景图片时启用, 当前不透明度: ' + vl + '</small>')
                    document.body.style.setProperty('--mcmapwpOpacity', vl + '')
                }, '主体部分的透明度')
            this.updateBackground()
        }
        /**movePageHead 移动顶栏到页面左侧*/
        movePageHead() {
            this.assert(autoRunLock, '不在页面初始运行状态')
            let obj = this
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
            this.addSideBarLink('SaltMCBBS 设置', () => { window.saltMCBBS.showSettingPanel() })
            links.className = 'links'

            // addons 添加的额外按钮
            let myaddon: AnchorObj[] = [ // { text: '', url: '', target: '', img:'' }, // _self _blank
                { text: '签到', url: 'plugin.php?id=dc_signin', img: 'https://patchwiki.biligame.com/images/mc/3/3f/23qf12ycegf4vgfbj7gehffrur6snkv.png' },
                { text: '任务', url: 'home.php?mod=task', img: 'https://patchwiki.biligame.com/images/mc/9/98/kbezikk5l83s2l2ewht1mhr8fltn0dv.png' },
                { text: '消息', url: 'home.php?mod=space&do=pm', class: 'saltmessage', img: noticimgurl[0] },
                // { text: '粉丝', url: 'home.php?mod=follow&do=follower', target: '_self' },
                { text: '好友', url: 'home.php?mod=space&do=friend', img: 'https://www.mcbbs.net/template/mcbbs/image/friends.png' },
                { text: '勋章', url: 'home.php?mod=medal', img: 'https://patchwiki.biligame.com/images/mc/2/26/85hl535hwws6snk4dt430lh3k7nyknr.png' },
                { text: '道具', url: 'home.php?mod=magic', img: 'https://www.mcbbs.net/template/mcbbs/image/tools.png' },
                { text: '收藏', url: 'home.php?mod=space&do=favorite&view=me', img: 'https://patchwiki.biligame.com/images/mc/d/dd/hnrqjfj0x2wl46284js23m26fgl3q8l.png' },
                { text: '挖矿', url: 'plugin.php?id=mcbbs_lucky_card:prize_pool', img: 'https://www.mcbbs.net/source/plugin/mcbbs_lucky_card/magic/magic_lucky_card.gif' },
                { text: '宣传', url: 'plugin.php?id=mcbbs_ad:ad_manage', img: 'https://patchwiki.biligame.com/images/mc/4/43/pfmuw066q7ugi0wv4eyfjbeu3sxd3a4.png' },
                { text: '设置', url: 'home.php?mod=spacecp', title: '点击头像配置saltMCBBS', img: 'https://patchwiki.biligame.com/images/mc/9/90/dr8rvwsbxfgr79liq91icuxkj6nprve.png' },
            ]
            this.addChildren(addons, this.obj2a(myaddon))
            addons.className = 'addons'

            // userinfo 用户信息
            this.movePageHeadGetUserInfo(userinfo)
            userinfo.className = 'userinfo'

            // 添加节点
            leftdiv.appendChild(userinfo)
            // 移动搜索框
            let searchbox = document.querySelector('.cl.y_search')
            if (searchbox) { leftdiv.appendChild(searchbox) }
            let searchtype = document.querySelector('#scbar_type_menu')
            if (searchtype) { leftdiv.appendChild(searchtype) }
            // 继续添加节点
            leftdiv.appendChild(addons); leftdiv.appendChild(links)
            leftdiv.addEventListener('dblclick', () => { obj.toggleNightStyle() })
            document.body.appendChild(leftdiv)

            // 添加CSS
            window.saltMCBBSCSS.putStyle('', 'pagehead')
        }
        /**更新左侧栏的信息 */
        movePageHeadGetUserInfo(el: Element) {
            // let safe = 0
            let uid = this.getUID()
            if (uid < 1) { return } // 为零则说明没有登录
            this.fetchUID(uid, (data) => {
                // console.log(data)
                let variable: BBSAPIResponceDataVariables = data.Variables
                let space: BBSAPIResponceDataVariablesSpace = variable.space
                let creaitex: BBSAPIResponceDataVariablesExtcredits = variable.extcredits
                this.messageOp(variable.notice)     //处理新消息相关
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
                let uname = space.username || ''  //用户名
                let group = space.group; //用户组信息
                let lowc = parseInt(group.creditslower), highc = parseInt(group.creditshigher)
                let grouptitle = space.group.grouptitle || ''; //用户组
                let progress = Math.round((parseInt(credits) - highc) / (lowc - highc) * 10000) / 100
                let progresstitle = highc + ' -> ' + lowc + ' | 还需: ' + (lowc - parseInt(credits)) + ' | 进度: ' + progress + '%'
                el.innerHTML = `
<div class="username">
<a href="https://www.mcbbs.net/?${uid}">${uname}</a>
<div>${space.customstatus}</div>
<img id="settingsaltMCBBS" src="https://www.mcbbs.net/uc_server/avatar.php?uid=${uid}&size=middle" height=100 />
</div>
<div class="thread">
<a href="https://www.mcbbs.net/forum.php?mod=guide&view=my&type=reply" target="_blank">回帖数: ${post}</a>
<a href="https://www.mcbbs.net/forum.php?mod=guide&view=my" target="_blank">主题数: ${thread}</a>
<span>精华帖: ${digestpost}</span>
</div>
<span class="progress" tooltip="${progresstitle}"><span style="width:${progress}%">&nbsp;</span></span>
<div class="credit">
<span>总积分: ${credits}</span>
<span>${grouptitle}</span>
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
                // document.getElementById('settingsaltMCBBS')?.addEventListener('click', () => { window.saltMCBBS.showSettingPanel() })
            })
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
                // console.log(el)
                if (el.querySelector('.plc .pi a[title*="受到警告"]')) {
                    if (el.parentElement) {
                        el.parentElement.classList.add('warned')
                    } else {
                        el.classList.add('warned')
                    }
                }
                // 添加查看警告按钮
                // 获取UID
                let uid: string = '0'
                let uname = el.querySelector('.authi .xw1')
                if (uname) {
                    uid = (/uid=(\d+)/.exec(uname.getAttribute('href') || '') || ['', '0'])[1]
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
                    uid = (/uid=(\d+)/.exec(uname.getAttribute('href') || '') || ['', '0'])[1]
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
            let obs = this.saltObserver('append_parent', () => {
                // 添加评分理由
                let rateUl = document.querySelector('.reasonselect:not([done])')
                // console.log(rateUl);
                if (rateUl) {
                    /**评分理由列表 */
                    let rateReasonList = this.readWithDefault<string[]>('rateReasonList', [])
                    rateUl.setAttribute('done', '')
                    for (let rea of rateReasonList) {
                        let li = document.createElement('li')
                        li.textContent = rea
                        li.onmouseover = function () { li.className = 'xi2 cur1' }
                        li.onmouseout = function () { li.className = '' }
                        li.onclick = function () {
                            let r: HTMLElement | null = document.getElementById('reason')
                            if (r instanceof HTMLInputElement) { r.value = li.textContent || '' }
                        }
                        rateUl.appendChild(li)
                    }
                }
                // 添加举报理由
                let reportUl = document.querySelector('#report_reasons:not([done])')
                // console.log(reportUl);
                if (reportUl) {
                    /**举报理由列表 */
                    let reportReasonList = this.readWithDefault<string[]>('reportReasonList', [])
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
            this.addTextareaSetting('自定义评分理由<small> 评分时可供选择的理由，一行一个</small>', rateReasonList.join('\n'), (el: HTMLTextAreaElement, e: Event) => {
                this.write('rateReasonList', this.formatToStringArray(el.value))
            }, '自定义评分理由')
            // 举报理由设置项
            /**举报理由列表 */
            let reportReasonList = this.readWithDefault<string[]>('reportReasonList', [])
            this.addTextareaSetting('自定义举报理由<small> 举报时可供选择的理由，一行一个</small>', reportReasonList.join('\n'), (el: HTMLTextAreaElement, e: Event) => {
                this.write('reportReasonList', this.formatToStringArray(el.value))
            }, '自定义举报理由')
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
            this.saltQuery('p.md_ctrl', (i, el) => { // 添加展开/关闭按钮
                if (!(el instanceof HTMLElement)) { return }
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
            this.addInputSetting('勋章栏高度<br><small> (会被MCBBS Extender覆盖)可以输入小数</small>', this.readWithDefault<number>('medalLine', 3) + '', (el, e) => {
                let line = parseFloat(el.value)
                if (isNaN(line)) { return }
                if (line < 0.5) { line = 0.5 }
                if (line > 25) { line = 25 }
                this.write('medalLine', el.value)
                sub()
            }, '勋章栏高度')
            sub()
            async function sub() { // 因为只涉及部分元素的class操作，所以放在异步
                let line = obj.readWithDefault<number>('medalLine', 3)
                let style = 'p.md_ctrl,p.md_ctrl:hover{--maxHeight:calc(64px * ' + line + ');}'
                window.saltMCBBSCSS.putStyle(style, 'medalLine')
                heightCheck()
                setTimeout(heightCheck, 500)
                function heightCheck() {
                    obj.saltQuery('p.md_ctrl', (i, el) => {
                        if (!(el instanceof HTMLElement)) { return }
                        if (el.scrollHeight > el.offsetHeight + 3) { // 有2px的边框误差
                            obj.log(el.scrollHeight + '||' + el.offsetHeight)
                            el.addClass('expandable')
                        } else {
                            el.removeClass('expandable')
                        }
                    })
                }
            }
        }
        /**动画效果 */
        animationOP() {
            this.assert(autoRunLock, '不在页面初始运行状态')
            // 帖子页面左侧层主信息跟随页面滚动
            window.saltMCBBSCSS.setStyle(`.plhin td.pls{overflow:visible;}.plhin td.pls > div.favatar{position:sticky;top:0;}`, 'userInfoSticky')
            userInfoSticky(this.readWithDefault('userInfoSticky', true))
            this.addCheckSetting('层主信息栏跟随页面<br><small>帖子页面左侧层主信息跟随页面滚动</small>', this.readWithDefault('userInfoSticky', true), (ck, ev) => {
                this.write('userInfoSticky', ck)
                userInfoSticky(ck)
            }, '左侧用户信息跟随')
            function userInfoSticky(b: boolean) {
                if (b) {
                    window.saltMCBBSCSS.putStyle('', 'userInfoSticky')
                } else {
                    window.saltMCBBSCSS.delStyle('userInfoSticky')
                }
            }
        }
        /**MCBBS Extender冲突修复 */
        confiectFixOP() {
            this.assert(autoRunLock, '不在页面初始运行状态')
            let obj = this
            let enabled = this.readWithDefault<boolean>('saltMCBBSconfiectFix', true)
            this.addCheckSetting('冲突修复功能<br><small>尝试修复与其他脚本的冲突</small>', enabled, (ck, ev) => {
                this.write('saltMCBBSconfiectFix', ck)
                sub(ck)
            }, '冲突修复功能')
            sub(enabled)
            function sub(enabled: boolean) {
                if (!enabled) { return }
                let links = obj.links
                let ul = document.querySelector('.user_info_menu_btn'); if (!ul || !(ul instanceof HTMLElement)) { return }
                let a = ul.querySelectorAll('a'), othersArchor: HTMLElement[] = []
                obj.log(a)
                for (let i = 4; i < a.length; i++) {
                    othersArchor.push(a[i])
                }
                obj.addChildren(links, othersArchor)
            }
            window.addEventListener('load', () => { sub(enabled) })
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
                    body{--bodyimg-day:url('${link}');}
                    #body_fixed_bg{opacity:0}
                    body:not(.night-style) .mc_map_wp,
                    body:not(.night-style) #scrolltop
                    {opacity:var(--mcmapwpOpacity,0.5)}
                    body:not(.night-style):hover .mc_map_wp,
                    body:not(.night-style):hover #scrolltop
                    {opacity:1}`, 'setBackgroundImage-day')
                } else {
                    window.saltMCBBSCSS.delStyle('setBackgroundImage-day')
                }
            }
            function putNightImg(link: string | null) {
                if (typeof link == 'string' && link.length > 0) {
                    window.saltMCBBSCSS.putStyle(`
                    body{--bodyimg-night:url('${link}');}
                    #body_fixed_bg{opacity:0}
                    body.night-style .mc_map_wp,
                    body.night-style #scrolltop
                    {opacity:var(--mcmapwpOpacity,0.5)}
                    body.night-style:hover .mc_map_wp,
                    body.night-style:hover #scrolltop
                    {opacity:1}`, 'setBackgroundImage-night')
                } else {
                    window.saltMCBBSCSS.delStyle('setBackgroundImage-night')
                }
            }
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
         * @param div 一个元素，里面的东西自己写
         * @param id 元素的名字，删除的时候用
         */
        addSetting(div: Element, id?: string) {
            if (typeof id == 'string' && id.length > 0) {
                div.setAttribute('name', id)
            }
            this.settingPanel.appendChild(div)
        }
        /**
         * 一种快速生成配置项的预设，结构是一个 h3 加一个 textarea
         * @param h3 配置项标题
         * @param textarea 默认配置
         * @param callback textarea触发change事件的回调函数，参数：el: textarea元素, ev: 事件
         * @param id 配置项的id，不填则默认为h3
         */
        addTextareaSetting(h3: string, textarea: string, callback: (el: HTMLTextAreaElement, ev: Event) => void, id?: string) {
            let newsetting = document.createElement('div')
            newsetting.innerHTML = '<h3>' + h3 + '</h3>'
            let textareaEl = document.createElement('textarea')
            textareaEl.value = textarea
            textareaEl.addEventListener('change', function (this: HTMLTextAreaElement, e: Event) { callback(this, e) })
            newsetting.appendChild(textareaEl)
            this.addSetting(newsetting, id || h3)
        }
        /**
         * 一种快速生成配置项的预设，结构是一个 h3 加一个 input
         * @param h3 配置项标题
         * @param text 默认配置
         * @param callback input触发change事件的回调函数，参数：el: textarea元素, ev: 事件
         * @param id 配置项的id，不填则默认为h3
         */
        addInputSetting(h3: string, text: string, callback: (el: HTMLInputElement, ev: Event) => void, id?: string) {
            let newsetting = document.createElement('div')
            newsetting.innerHTML = '<h3 class="half-h3">' + h3 + '</h3>'
            let inputEl = document.createElement('input')
            inputEl.value = text
            inputEl.addEventListener('change', function (this: HTMLInputElement, e: Event) { callback(this, e) })
            newsetting.appendChild(inputEl)
            this.addSetting(newsetting, id || h3)
        }
        /**
         * 一种快速生成配置项的预设，结构是一个 h3 加一个 input
         * @param h3 配置项标题
         * @param text 默认配置
         * @param callback input触发click事件的回调函数，参数：ck: 勾选与否, ev: 事件
         * @param id 配置项的id，不填则默认为h3
         */
        addCheckSetting(h3: string, checked: boolean, callback: (ck: boolean, ev: Event) => void, id?: string) {
            let newsetting = document.createElement('div')
            newsetting.innerHTML = '<h3 class="half-h3">' + h3 + '</h3>'
            let inputEl = document.createElement('input')
            // inputEl.value = text
            inputEl.type = 'checkbox'
            inputEl.checked = checked
            inputEl.addEventListener('click', function (this: HTMLInputElement, e: Event) { callback(this.checked, e) })
            newsetting.appendChild(inputEl)
            this.addSetting(newsetting, id || h3)
        }
        /**
         * 一种快速生成配置项的预设，结构是一个 h3 加一个滑动条 input
         * @param h3 配置项标题
         * @param value 默认值
         * @param range [最小值,最大值,步长]或{min:最小值,max:最大值,step:步长}
         * @param callback input触发change事件的回调函数，参数：vl: 数字, ev: 事件
         * @param id 配置项的id，不填则默认为h3
         */
        addRangeSetting(h3: string, value: number, range: [number, number, number] | { max: number, min: number, step: number },
            callback: (vl: number, ev: Event) => void, id?: string) {
            /**范围控制: 最小值, 最大值, 步长 */
            let rg: [number, number, number] = [0, 0, 0]
            if (range instanceof Array) {
                rg[0] = range[0] || 0
                rg[1] = range[1] || 100
                rg[2] = range[2] || 1
            } else {
                rg[0] = range.min || 0
                rg[1] = range.max || 100
                rg[2] = range.step || 1
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
            this.addSetting(newsetting, id || h3)
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
                document.body.classList.add('night-style')
            } else {
                document.body.classList.remove('night-style')
            }
            if (log) {
                this.write('isNightStyle', night)
            }
        }
        /**转换夜间模式 */
        toggleNightStyle() {
            let isnight: boolean = this.readWithDefault<boolean>('isNightStyle', false)
            this.nightStyle(!isnight, true)
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
            return parseInt((window.tid ? window.tid + '' : null) || (window.location.href.match(/thread-([\d]+)/) || window.location.href.match(/tid\=([\d]+)/) || ['0', '0'])[1])
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
    // 开始给HTMLElement添加奇怪的方法
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
            var win = this.ownerDocument.defaultView || { pageYOffset: 0, pageXOffset: 0 };
            return {
                top: rect.top + win.pageYOffset,
                left: rect.left + win.pageXOffset
            }
        }
    }
    // ??????
    window['saltMCBBSCSS'] = new saltMCBBSCSS(); // saltMCBBSCSS 实例
    window['saltMCBBS'] = new saltMCBBS(true); // saltMCBBS 实例
    window['saltMCBBSOriginClass'] = saltMCBBSOriginClass; // saltMCBBSOriginClass 类
})()