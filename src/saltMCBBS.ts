"use strict";
// ==UserScript==
// @name         saltMCBBS
// @namespace    http://salt.is.lovely/
// @description  salt's MCBBS 拓展
// @author       salt
// @match        https://*.mcbbs.net/*
// @grant        none
// @license      CC BY-NC-SA 4.0
// ==/UserScript==
// var __window = window;
// window.a = 123;
(function () {
    /**版本 */
    let myversion = '0.1.1'
    /**历史 */
    let myhistory = ``
    /**前缀 */
    let myprefix = '[saltMCBBS]'
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
    /**原始类，包含各种基础方法*/
    class saltMCBBSOriginClass {
        /**
         * 根据选择器遍历元素
         * @param selector 字符串，选择器
         * @param callback 回调函数(index: number, el: Element): void
         */
        saltQuery(selector: string, callback: saltQueryCallback) {
            let elems = document.querySelectorAll(selector)
            for (let i = 0; i < elems.length; i++) {
                callback(i, elems[i])
            }
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
         *  */
        readWithDefault<T>(key: string, defaultValue: T): T {
            let value: string | null = localStorage.getItem(techprefix + key);
            if (value && value != "undefined" && value != "null") {
                return <T>JSON.parse(value);
            }
            this.write(key, defaultValue)
            return defaultValue;
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
    class saltMCBBS extends saltMCBBSOriginClass {
        constructor(autorun = false) {
            super()
            window.saltMCBBSCSS.setStyle( // 主要更改
                `body>.mc_map_wp{padding-top:0;margin-top:0}body>.mc_map_wp>.new_wp{padding-top:0 !important;padding-bottom:0 !important}body>.mc_map_wp>.new_wp h2 img{max-height:74px}.pmwarn{width:auto !important;background-size:16px !important}ul.xl.xl2.o.cl .pmwarn{background:url(template/mcbbs/image/warning.gif) no-repeat 0px 2px}#uhd>.mn>ul .pmwarn a{background:url(template/mcbbs/image/warning.gif) no-repeat 0px 2px !important;background-size:16px !important}.warned{opacity:0.2}.warned:hover{opacity:0.9}#scrolltop{visibility:visible !important;opacity:1;transition:0.3s ease}#scrolltop :not([style]){display:none}#scrolltop[style*="hidden"]{margin-left:-10px;opacity:0}.pl .blockcode>em{top:2px;right:2px;position:absolute;margin:0 0 0 0}.pl .blockcode>em:hover{outline:1px dashed}.pl .blockcode ol{overflow-x:scroll}.pl .blockcode ol li{color:#444;margin-left:29px;line-height:1.8em;height:1.8em;white-space:pre}
                `
                , 'main'
            )
            window.saltMCBBSCSS.setStyle( // movePageHead 所需CSS
                `body.night-style #saltNewPageHead{--saltNewPageHeadbgcolor-l-t:rgba(68,68,68,0.5);--saltNewPageHeadbgcolor-l:#444;--saltNewPageHeadbgcolor:#333}body.night-style #saltNewPageHead,body.night-style #saltNewPageHead a{color:#f0f0f0}body.night-style #saltNewPageHead a:hover{color:#6cf}#toptb{display:none}#saltNewPageHead{position:fixed;width:310px;height:100vh;top:0;left:-340px;padding:30px;background-color:var(--saltNewPageHeadbgcolor-l-t, #fdf6e699);color:#111;transition:0.4s ease;transition-delay:0.4s;opacity:0.35;z-index:999999}#saltNewPageHead:hover{left:0;background-color:var(--saltNewPageHeadbgcolor-l, #fdf6e6);opacity:1;transition:0.4s ease}#saltNewPageHead::after{content:"saltMCBBS脚本，开发语言: Typescript + SCSS";position:absolute;top:90vh;right:0;color:var(--saltNewPageHeadbgcolor, #fbf2dc)}#saltNewPageHead .userinfo,#saltNewPageHead .links,#saltNewPageHead .addons{width:100%;margin-bottom:0.75rem;overflow:auto;border-bottom:#ccc;font-size:1rem}#saltNewPageHead .userinfo{overflow-x:hidden}#saltNewPageHead .userinfo>div,#saltNewPageHead .userinfo>span{margin-bottom:0.5rem}#saltNewPageHead .userinfo .username{width:100%;height:100px;font-weight:bold;position:relative}#saltNewPageHead .userinfo .username a{top:2px;position:absolute;font-size:1.75rem}#saltNewPageHead .userinfo .username div{top:calc(8px + 2rem);width:10.2em;position:absolute;color:#999}#saltNewPageHead .userinfo .username img{right:7px;top:4px;position:absolute;border-radius:10%;-webkit-filter:drop-shadow(0 3px 4px #222);filter:drop-shadow(0 3px 4px #222)}#saltNewPageHead .userinfo .thread{width:100%;display:flex;font-size:0.875rem;text-align:center}#saltNewPageHead .userinfo .thread span,#saltNewPageHead .userinfo .thread a{width:100%;display:inline-block}#saltNewPageHead .userinfo .progress{width:95%;height:0.75rem;margin-left:auto;margin-right:auto;outline:1px solid #ccc;background-color:var(--saltNewPageHeadbgcolor, #fbf2dc);position:relative;display:block;transition:0.3s ease}#saltNewPageHead .userinfo .progress>span{height:100%;background-color:var(--progresscolor, #6cf);display:block}#saltNewPageHead .userinfo .progress::after{content:attr(tooltip);display:block;width:140%;left:-20%;top:0;position:absolute;font-size:0.7rem;color:transparent;text-align:center;transition:0.3s ease}#saltNewPageHead .userinfo .progress:hover{transform:translateY(0.5rem)}#saltNewPageHead .userinfo .progress:hover::after{top:-1rem;color:inherit}#saltNewPageHead .userinfo .credit{position:relative;font-size:0.875rem}#saltNewPageHead .userinfo .credit span{width:calc(50% - 4px);display:inline-block;height:1.2rem;line-height:1.2rem;padding-left:1rem;position:relative;box-sizing:border-box}#saltNewPageHead .userinfo .credit span img{left:1px;top:2px;position:absolute}#saltNewPageHead .links a{width:100%;height:1.75rem;line-height:1.75rem;display:inline-block;background-color:#fff0;text-align:center;font-size:1rem;border-bottom:1px solid #eee}#saltNewPageHead .links a:hover{background-color:var(--saltNewPageHeadbgcolor, #fbf2dc)}#saltNewPageHead .links a:last-child{border-bottom:none}#saltNewPageHead .links .showmenu{padding-right:0;background-image:none}#saltNewPageHead .addons a{width:calc(50% - 4px);display:inline-block;height:1.6rem;line-height:1.6rem;text-align:center;font-size:1rem;background-color:#fff0;border:1px solid transparent}#saltNewPageHead .addons a:hover{background-color:var(--saltNewPageHeadbgcolor, #fbf2dc);border-color:#efefef}#saltNewPageHead .addons a img{display:inline-block;vertical-align:middle;max-width:1.5rem;max-height:1.5rem;margin-right:0.5rem}
`
                , 'pagehead'
            )
            window.saltMCBBSCSS.setStyle( // 夜间模式样式
                `body.night-style,body.night-style input,body.night-style button,body.night-style select,body.night-style textarea,body.night-style ntc_body{background-color:#313131;border-color:#837c73;color:#ededed}body.night-style{background-color:#222}body.night-style .mc_map_wp{box-shadow:0 0 20px 1px #000}body.night-style .mc_map_border_right,body.night-style .mc_map_border_left,body.night-style .mc_map_border_top,body.night-style .mc_map_border_foot{background-color:#313131;background-image:none;color:#ededed}body.night-style #body_fixed_bg{opacity:0}body.night-style .fl .forum_index_title,body.night-style .mn .bm_h{background-color:#434343;padding-left:16px}body.night-style .p_pop,body.night-style .p_pof,body.night-style .sllt{background-color:#434343;border-color:#837c73;background-image:none}body.night-style .p_pop a:hover,body.night-style .p_pof a:hover,body.night-style .sllt a:hover{background-color:#837c73}body.night-style #pt .z a,body.night-style #pt .z em,body.night-style #pt .z span{color:#ededed}body.night-style #nv_right{background-color:#434343;background-image:none}body.night-style #nv_right a{color:#ededed}body.night-style #nv_right a:hover{color:#6cf}body.night-style .m_c,body.night-style .tm_c{background-color:#313131;color:#ededed}body.night-style .m_c .dt th,body.night-style .tm_c .dt th{background-color:#313131}body.night-style .m_c .px,body.night-style .m_c .pt,body.night-style .m_c .ps,body.night-style .m_c select,body.night-style .tm_c .px,body.night-style .tm_c .pt,body.night-style .tm_c .ps,body.night-style .tm_c select{background-color:#313131;border-top:none;border-bottom:none;border-left:none;border-right:none;border-width:0px}body.night-style .m_c .o,body.night-style .tm_c .o{background-color:#434343}body.night-style .m_c a,body.night-style .tm_c a{color:#ededed}body.night-style .m_c a:hover,body.night-style .tm_c a:hover{color:#6cf}body.night-style .xi2,body.night-style .xi2 a,body.night-style .xi3 a{color:#69f}body.night-style .nfl .f_c{background-color:#444;border:none}body.night-style #diy_chart #frame48dS31{border-color:transparent !important}body.night-style #diy_chart .frame{background-color:#434343;border-color:transparent}body.night-style #diy_chart .frame .column{color:#ededed}body.night-style #diy_chart .frame .column a{color:#ededed}body.night-style #diy_chart .frame .column a:hover{color:#6cf}body.night-style #diy_chart .frame .column .tab-title.title{background-color:#313131 !important}body.night-style #diy_chart .frame .column .tab-title.title ul{background-color:#434343 !important}body.night-style #diy_chart .frame .column .tab-title.title ul li a{border-color:transparent !important}body.night-style #diy_chart .frame .column .tab-title.title ul li:not(.a) a{background-color:#585858}body.night-style #diy_chart .frame .column .tab-title.title ul li.a a{background-color:#6c6c6c}body.night-style #diy_chart .frame .column .tb-c>div{background-color:#434343}body.night-style #diy_chart #tabVpFJkk{background-color:#434343 !important;border-color:transparent !important}body.night-style .mn>.bm>.bm{background-color:#434343;border-color:transparent}body.night-style .mn>.bm>.bm .bm_h{background-color:#222;background-image:none}body.night-style .mn>.bm>.bm .bm_c{background-color:#434343;border-color:transparent}body.night-style .portal_left_dev{border:none}body.night-style .portal_left_dev .portal_left_title{background-color:#222;background-image:none}body.night-style .portal_left_dev .portal_left_title[style*="background"]{background-color:#222 !important;background-image:none !important}body.night-style .portal_left_dev .portal_left_content{border-color:transparent;background-color:#434343}body.night-style .portal_left_dev a{color:#ededed}body.night-style .portal_left_dev a:hover{color:#6cf}body.night-style #ct .mn .bm,body.night-style #group_sd .bm{border:none}body.night-style #ct .mn .bm .bm_h,body.night-style #group_sd .bm .bm_h{background-color:#222;background-image:none}body.night-style #ct .mn .bm .area,body.night-style #ct .mn .bm .bm_c,body.night-style #group_sd .bm .area,body.night-style #group_sd .bm .bm_c{background-color:#434343;border-color:transparent}body.night-style #ct .mn .bm .area .frame,body.night-style #ct .mn .bm .bm_c .frame,body.night-style #group_sd .bm .area .frame,body.night-style #group_sd .bm .bm_c .frame{background-color:transparent}body.night-style #ct .mn a,body.night-style #group_sd a{color:#ededed}body.night-style #ct .mn a:hover,body.night-style #group_sd a:hover{color:#6cf}body.night-style #diy_right .frame{background-color:transparent}body.night-style #diy_right .block{background-color:#434343 !important;border-color:transparent !important}body.night-style #diy_right .block .title{background-color:#222;background-image:none}body.night-style #diy_right .block a{color:#ededed}body.night-style #diy_right .block a:hover{color:#6cf}body.night-style #diy_right .portal_news,body.night-style #diy_right .portal_game,body.night-style #diy_right .modpack,body.night-style #diy_right .portal_zb,body.night-style #diy_right .portal_note{border-color:transparent}body.night-style .special_user_info{background-color:#434343;background-image:none}body.night-style .special_user_info .special_info{background-color:transparent;background-image:none}body.night-style .special_user_info .special_info>div{background-color:#585858}body.night-style .special_user_info a{color:#ededed}body.night-style .special_user_info a:hover{color:#6cf}body.night-style .portal_block_summary iframe{filter:brightness(0.5)}body.night-style .pgb a{background-color:transparent}body.night-style .pgt .pg a,body.night-style .pgt .pg strong,body.night-style .pgt .pg label,body.night-style .pgs .pg a,body.night-style .pgs .pg strong,body.night-style .pgs .pg label{color:#ededed;background-color:transparent}body.night-style .pgt .pg strong,body.night-style .pgs .pg strong{background-color:#434343}body.night-style .pgbtn,body.night-style .pgbtn a{border:none;box-shadow:none}body.night-style .pgbtn a{background-color:#434343;color:#ededed;border:none}body.night-style #wp .wp{background-color:#313131;color:#ededed}body.night-style #wp .wp table,body.night-style #wp .wp tr,body.night-style #wp .wp td{border-color:#837c73}body.night-style #wp .wp table a,body.night-style #wp .wp tr a,body.night-style #wp .wp td a{color:#ededed}body.night-style #wp .wp table a:hover,body.night-style #wp .wp tr a:hover,body.night-style #wp .wp td a:hover{color:#6cf}body.night-style #postlist{background-color:transparent;border:none}body.night-style #postlist>table,body.night-style .plhin,body.night-style #f_pst{border:none;box-shadow:none}body.night-style #postlist>table tr,body.night-style #postlist>table td,body.night-style #postlist>table div,body.night-style .plhin tr,body.night-style .plhin td,body.night-style .plhin div,body.night-style #f_pst tr,body.night-style #f_pst td,body.night-style #f_pst div{border-color:#837c73}body.night-style #postlist>table .ad,body.night-style .plhin .ad,body.night-style #f_pst .ad{background-color:#434343}body.night-style #postlist>table td.pls,body.night-style .plhin td.pls,body.night-style #f_pst td.pls{background-color:#313131;border:none}body.night-style #postlist>table td.plc,body.night-style .plhin td.plc,body.night-style #f_pst td.plc{background-color:#434343;border:none}body.night-style #postlist>table .pls .avatar img,body.night-style .plhin .pls .avatar img,body.night-style #f_pst .pls .avatar img{background-color:#434343;background-image:none}body.night-style #postlist>table a,body.night-style .plhin a,body.night-style #f_pst a{color:#ededed}body.night-style #postlist>table a:hover,body.night-style .plhin a:hover,body.night-style #f_pst a:hover{color:#6cf}body.night-style .plhin .quote{background-color:#585858;color:#ededed}body.night-style .plhin .pcb .t_fsz>table table{color:#444;text-shadow:0 0 1px #fff, 0 0 1px #fff, 0 0 1px #fff, 0 0 1px #fff}body.night-style .plhin .pcb .t_fsz>table .spoilerbutton{border:1px solid #434343}body.night-style .plhin .pcb .t_fsz>table .spoilerbody>table{color:#ededed;text-shadow:none}body.night-style .plhin.warned{opacity:0.1}body.night-style .plhin.warned:hover{opacity:0.9}body.night-style #vfastpost{background-color:transparent;background-image:none}body.night-style #vfastpost #vf_l,body.night-style #vfastpost #vf_m,body.night-style #vfastpost #vf_r,body.night-style #vfastpost #vf_b{background-color:#313131;background-image:none}body.night-style #vfastpost #vf_m input{border-color:transparent;color:#ededed !important}body.night-style #vfastpost #vf_l{border-radius:5px 0 0 5px}body.night-style #vfastpost #vf_r{border-radius:0 5px 5px 0}body.night-style #vfastpost #vreplysubmit{background-color:#313131;background-image:none;box-shadow:none;position:relative}body.night-style #vfastpost #vreplysubmit:after{content:"快速回复";position:absolute;top:0;left:0;width:100%;height:38px;line-height:38px;font-size:1rem}body.night-style #p_btn a,body.night-style #p_btn a i{background-color:#585858;background-image:none}body.night-style .psth{background-color:#585858;background-image:none}body.night-style #postlist.bm{border-color:#837c73}body.night-style #mymodannouncement,body.night-style #myskinannouncement,body.night-style #mytextureannouncement,body.night-style #my16modannouncement,body.night-style .cgtl caption,body.night-style .locked{background-color:#313131;border:none}body.night-style #fastpostform .pls,body.night-style #fastpostform .plc{border:none}body.night-style #fastposteditor,body.night-style #fastposteditor .bar,body.night-style #fastposteditor .area,body.night-style #fastposteditor .pt{background-color:#313131;border:none}body.night-style #fastposteditor .fpd a{filter:drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff)}body.night-style .pi strong a{border-color:transparent}body.night-style #threadstamp img{filter:drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff)}body.night-style .blockcode{filter:invert(0.8) hue-rotate(170deg)}body.night-style .blockcode ol li{color:#222}body.night-style #ct .bm.bml.pbn .bm_c,body.night-style #ct .bm.bmw.fl .bm_c{background-color:#434343 !important}body.night-style #ct #pgt,body.night-style #ct #thread_types>li a,body.night-style #ct #separatorline th,body.night-style #ct #separatorline td,body.night-style #ct #forumnewshow,body.night-style #ct #f_pst .bm_c{background-color:#434343 !important}body.night-style #ct #threadlist .th,body.night-style #ct #threadlisttableid{background-color:transparent}body.night-style #ct #threadlist .th tr th,body.night-style #ct #threadlist .th tr td,body.night-style #ct #threadlisttableid tr th,body.night-style #ct #threadlisttableid tr td{background-color:transparent;border:none}body.night-style #ct #threadlist .th tr:hover th,body.night-style #ct #threadlist .th tr:hover td,body.night-style #ct #threadlisttableid tr:hover th,body.night-style #ct #threadlisttableid tr:hover td{background-color:#585858}body.night-style #ct .mn a.bm_h{background-color:#434343 !important;border:none;color:#ededed}body.night-style #ct .mn a.bm_h:hover{color:#6cf}body.night-style #ct #waterfall li{background-image:none;background-color:#434343;transition:0.3 ease}body.night-style #ct #waterfall li:hover{background-color:#585858}body.night-style #ct #waterfall li>*{background-image:none;background-color:transparent}body.night-style #ct .appl{border-color:transparent !important}body.night-style #ct .appl .tbn h2{background-color:#222;background-image:none}body.night-style #ct .appl .tbn ul{border:none}body.night-style #ct .appl .tbn ul li:hover{background-color:#434343}body.night-style #ct .appl .tbn a{color:#ededed}body.night-style #ct .appl .tbn a:hover{color:#6cf}body.night-style #ct .mn .bm{background-color:transparent}body.night-style #ct .mn .bm .tb.cl,body.night-style #ct .mn .bm .bm_h{background-color:#222;background-image:none}body.night-style #ct .mn .bm .tb.cl h3,body.night-style #ct .mn .bm .bm_h h3{color:#ededed !important}body.night-style #ct .mn .bm .bm.mtm,body.night-style #ct .mn .bm .bm_c{background-color:#434343;border-color:transparent}body.night-style #ct .mn .bm ul li{color:#ededed}body.night-style #ct .mn .bm ul.buddy li{background-color:#434343;border:none}body.night-style #ct .mn .bm a{color:#ededed}body.night-style #ct .mn .bm a:hover{color:#6cf}body.night-style #ct .mn .bm .bm.bmn.mtm.cl{background-color:transparent !important}body.night-style #ct .mn .bm input,body.night-style #ct .mn .bm select,body.night-style #ct .mn .bm option{background-color:#434343;background-image:none;border-top:none;border-bottom:none;border-left:none;border-right:none;border-width:0px}body.night-style #nv>ul{background-color:#313131;background-image:none;border:none}body.night-style #nv>ul li:first-child>a,body.night-style #nv>ul li:first-child>a:hover{border-left:none}body.night-style #nv>ul li:last-child>a,body.night-style #nv>ul li:last-child>a:hover{border-right:none}body.night-style #nv>ul li>a{background-color:#434343}body.night-style #nv>ul li>a,body.night-style #nv>ul li>a:hover{border-color:#434343}body.night-style #nv>ul li>a:hover{background-color:#585858}body.night-style #uhd{background-color:#434343;border-color:#313131}body.night-style #uhd ul.tb.cl{border-bottom-color:#313131}body.night-style #uhd ul.tb.cl li a{background-color:#313131;border:none;color:#ededed}body.night-style #uhd ul.tb.cl li a:hover{color:#6cf}body.night-style #ct{border-color:#313131}body.night-style .tl{background-color:transparent}body.night-style .tl tr{background-color:transparent}body.night-style .tl tr th,body.night-style .tl tr td{background-color:transparent;border:none}body.night-style .tl tr:hover th,body.night-style .tl tr:hover td{background-color:#585858}body.night-style .xl label,body.night-style .xl label a{color:#f99}body.night-style a[style*="color"][style*="#333333"],body.night-style font[style*="color"][style*="#333333"]{color:#e0e0e0 !important}body.night-style a[style*="color"][style*="#663399"],body.night-style font[style*="color"][style*="#663399"]{color:#de90df !important}body.night-style a[style*="color"][style*="#8f2a90"],body.night-style font[style*="color"][style*="#8f2a90"]{color:#de90df !important}body.night-style a[style*="color"][style*="#660099"],body.night-style font[style*="color"][style*="#660099"]{color:#bf8cd9 !important}body.night-style a[style*="color"][style*="#660000"],body.night-style font[style*="color"][style*="#660000"]{color:#c66 !important}body.night-style a[style*="color"][style*="#993333"],body.night-style font[style*="color"][style*="#993333"]{color:#f99 !important}body.night-style a[style*="color"][style*="#EE1B2E"],body.night-style font[style*="color"][style*="#EE1B2E"]{color:#f99 !important}body.night-style a[style*="color"][style*="#ff0000"],body.night-style font[style*="color"][style*="#ff0000"]{color:#f99 !important}body.night-style a[style*="color"][style*="#FF0000"],body.night-style font[style*="color"][style*="#FF0000"]{color:#f99 !important}body.night-style a[style*="color"][style*="#EE5023"],body.night-style font[style*="color"][style*="#EE5023"]{color:#d97f26 !important}body.night-style a[style*="color"][style*="#996600"],body.night-style font[style*="color"][style*="#996600"]{color:#e6a219 !important}body.night-style a[style*="color"][style*="#663300"],body.night-style font[style*="color"][style*="#663300"]{color:#d97f26 !important}body.night-style a[style*="color"][style*="#006666"],body.night-style font[style*="color"][style*="#006666"]{color:#6cc !important}body.night-style a[style*="color"][style*="#3C9D40"],body.night-style font[style*="color"][style*="#3C9D40"]{color:#8f8 !important}body.night-style a[style*="color"][style*="#009900"],body.night-style font[style*="color"][style*="#009900"]{color:#9f9 !important}body.night-style a[style*="color"][style*="#3366ff"],body.night-style font[style*="color"][style*="#3366ff"]{color:#6af !important}body.night-style a[style*="color"][style*="#2b65b7"],body.night-style font[style*="color"][style*="#2b65b7"]{color:#6af !important}body.night-style a[style*="color"][style*="#003399"],body.night-style font[style*="color"][style*="#003399"]{color:#6af !important}body.night-style a[style*="color"][style*="#2B65B7"],body.night-style font[style*="color"][style*="#2B65B7"]{color:#6af !important}body.night-style a[style*="color"][style*="#330066"],body.night-style font[style*="color"][style*="#330066"]{color:#b28cd9 !important}body.night-style a[style*="color"][style*="#8F2A90"],body.night-style font[style*="color"][style*="#8F2A90"]{color:#cf61d1 !important}body.night-style a[style*="background-color"][style*="#FFFFFF"],body.night-style font[style*="background-color"][style*="#FFFFFF"]{background-color:transparent !important}body.night-style font[color*="#660000"]{color:#c66 !important}body.night-style font[color*="red"]{color:#f99 !important}body.night-style font[color*="Red"]{color:#f99 !important}body.night-style font[color*="#000080"]{color:#8af !important}body.night-style font[color*="#3366ff"]{color:#8af !important}body.night-style font[color*="#003399"]{color:#8af !important}body.night-style font[color*="blue"]{color:#8af !important}body.night-style font[color*="Blue"]{color:#8af !important}body.night-style font[color*="#339933"]{color:#9f9 !important}body.night-style font[color*="#009900"]{color:#9f9 !important}body.night-style font[color*="green"]{color:#9f9 !important}body.night-style font[color*="Green"]{color:#9f9 !important}body.night-style font[color*="black"]{color:#fff !important}body.night-style font[color*="Black"]{color:#fff !important}body.night-style font[color*="#660099"]{color:#bf8cd9 !important}
`
                , 'night-style'
            )
            if (autorun) {
                this.log('运行saltMCBBS主过程')
                this.version()
                this.history()
                // await this.waitLoad()
                // 使用主要CSS
                window.saltMCBBSCSS.putStyle('', 'main')
                // 启用夜间模式
                this.nightStyle(this.readWithDefault<boolean>('isNightStyle', false), false)
                // 移动顶部栏到左侧
                this.movePageHead()
                // 检查警告记录
                this.warnOP()
            }
        }
        /**movePageHead 移动顶栏到页面左侧*/
        movePageHead() {
            let obj = this
            /**左侧栏，分三个部分*/
            let leftdiv = document.createElement('div') // 准备放到页面最左边
            leftdiv.id = 'saltNewPageHead'

            /**userinfo 用户信息 */
            let userinfo = document.createElement('div')
            /**links 一大堆链接 */
            let links = document.createElement('div')
            /**addons 添加的额外按钮 */
            let addons = document.createElement('div')

            // links 一大堆链接
            let headlinks = document.querySelectorAll('#toptb .z a') // 顶部左侧4个链接
            this.addChildren(links, headlinks)
            links.className = 'links'

            // addons 添加的额外按钮
            let myaddon: AnchorObj[] = [ // { text: '', url: '', target: '', img:'' }, // _self _blank
                { text: '签到', url: 'plugin.php?id=dc_signin', img: 'https://patchwiki.biligame.com/images/mc/3/3f/23qf12ycegf4vgfbj7gehffrur6snkv.png' },
                { text: '收藏', url: 'home.php?mod=space&do=favorite&view=me', img: 'https://patchwiki.biligame.com/images/mc/d/dd/hnrqjfj0x2wl46284js23m26fgl3q8l.png' },
                { text: '消息', url: 'home.php?mod=space&do=pm', class: 'saltmessage', img: noticimgurl[0] },
                // { text: '粉丝', url: 'home.php?mod=follow&do=follower', target: '_self' },
                { text: '任务', url: 'home.php?mod=task', img: 'https://patchwiki.biligame.com/images/mc/9/98/kbezikk5l83s2l2ewht1mhr8fltn0dv.png' },
                { text: '勋章', url: 'home.php?mod=medal', img: 'https://patchwiki.biligame.com/images/mc/2/26/85hl535hwws6snk4dt430lh3k7nyknr.png' },
                { text: '好友', url: 'home.php?mod=space&do=friend', img: 'https://www.mcbbs.net/template/mcbbs/image/friends.png' },
                { text: '挖矿', url: 'plugin.php?id=mcbbs_lucky_card:prize_pool', img: 'https://www.mcbbs.net/source/plugin/mcbbs_lucky_card/magic/magic_lucky_card.gif' },
                { text: '道具', url: 'home.php?mod=magic', img: 'https://www.mcbbs.net/template/mcbbs/image/tools.png' },
                { text: '宣传', url: 'plugin.php?id=mcbbs_ad:ad_manage', img: 'https://patchwiki.biligame.com/images/mc/4/43/pfmuw066q7ugi0wv4eyfjbeu3sxd3a4.png' },
                { text: '设置', url: 'home.php?mod=spacecp', img: 'https://patchwiki.biligame.com/images/mc/9/90/dr8rvwsbxfgr79liq91icuxkj6nprve.png' },
            ]
            this.addChildren(addons, this.obj2a(myaddon))
            addons.className = 'addons'

            // userinfo 用户信息
            this.movePageHeadGetUserInfo(userinfo)
            userinfo.className = 'userinfo'

            // 添加节点
            leftdiv.appendChild(userinfo); leftdiv.appendChild(addons); leftdiv.appendChild(links)
            leftdiv.addEventListener('dblclick', () => { obj.toggleNightStyle() })
            document.body.appendChild(leftdiv)

            // 添加CSS
            window.saltMCBBSCSS.putStyle('', 'pagehead')
        }
        movePageHeadGetUserInfo(el: Element) {
            let safe = 0
            let uid = this.getUID()
            if (uid < 1) { return } // 为零则说明没有登录
            this.fetchUID(uid, (data: { Variables: BBSAPIResponceDataVariables; }) => {
                console.log(data)
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
<img src="https://www.mcbbs.net/uc_server/avatar.php?uid=${uid}&size=middle" height=100 />
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
                let uid: string = window.discuz_uid
                let uname = el.querySelector('.authi .xw1')
                if (uname) {
                    uid = (/uid=(\d+)/.exec(uname.getAttribute('href') || '') || ['', '0'])[1]
                }
                // 添加按钮
                let a = el.querySelector('.favatar ul.xl')
                let li = document.createElement('li')
                li.className = 'pmwarn'; li.appendChild(this.addWarnBtn(uid))
                if (a) { a.appendChild(li) }
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
                li.className = 'pmwarn'; li.appendChild(this.addWarnBtn(uid))
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
        }
        addWarnBtn(uid: number | string, text: string = '查看警告记录') {
            let a = document.createElement('a')
            a.href = 'forum.php?mod=misc&action=viewwarning&tid=19&uid=' + uid
            a.title = text; a.textContent = text
            a.className = 'xi2'
            a.setAttribute('onclick', 'showWindow(\'viewwarning\', this.href)')
            return a
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
        /**根据UID获取信息*/
        fetchUID(uid: number | string, callback: Function, retry = 2, retryTime = 1500) {
            if (uid < 1) { return } // 为零则说明没有登录
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
                    if (retry > 0) { setTimeout(() => { obj.fetchUID(uid, callback, retry - 1) }, retryTime); }
                });
        }
        /**获取UID*/
        getUID() {
            return typeof window.discuz_uid == 'string' ? parseInt(window.discuz_uid) : window.discuz_uid
        }
        // 等待加载完毕
        // async waitLoad() {
        //     let safe = 0
        //     if (document.readyState == 'loading') {
        //         this.log('等待 Discuz! 加载...')
        //     }
        //     while (document.readyState == 'loading') {
        //         await this.sleep(100);
        //         this.assert(safe++ < 300, '未检测到 discuz ！')
        //     }
        // }
    }
    /**CSS相关操作的类*/
    class saltMCBBSCSS implements saltMCBBScss {
        constructor() {
            // null
        }
        private styles: styleMap = {}
        // key: 标记style
        setStyle(css: string, key: string): boolean {
            if (typeof css != 'string' || typeof key != 'string') { return false }
            this.styles[key] = css
            return true
        }
        getStyle(key: string): string {
            if (typeof key != 'string') { return '' }
            if (this.styles[key])
                return this.styles[key]
            else
                return ''
        }
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
                        x.textContent = css
                    }
                    break
            }
            /**
            if (typeof css == 'string' && css.length > 2) { // 两个字节的css能干嘛
                // css 和 key 均有参数
                if (typeof key == 'string' && key.length > 0) {
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
                        x.textContent = css
                    }
                }
                // css 有 key 无
                else {
                    let s = document.createElement('style')
                    s.textContent = css
                    document.head.appendChild(s)
                }
            }
            // 如果css参数没有输入 
            else if (typeof key == 'string' && key.length > 0) {
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
                        x.textContent = c
                    }
                } else { return false }
            }
            // 如果没有有效输入
            else {
                return false
            }
            // 默认返回true
            */
            return true
        }
        /**根据key删除已有的css */
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
         * 根据key替换已有的style
         * 
         * 替换成功返回true
         * 
         * 非法输入/没有此元素返回false
         *  */
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
        /**
         * 根据key获取style元素
         * 
         * 没找到的话返回null
         */
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
    // ??????
    window['saltMCBBSCSS'] = new saltMCBBSCSS(); // saltMCBBSCSS 实例
    window['saltMCBBS'] = new saltMCBBS(true); // saltMCBBS 实例
    window['saltMCBBSOriginClass'] = saltMCBBSOriginClass; // saltMCBBSOriginClass 类
})()