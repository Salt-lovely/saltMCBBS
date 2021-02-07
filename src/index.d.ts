/// <reference path="sm.d.ts"/>

interface Window {
    /**saltMCBBSCSS 实例 */
    saltMCBBSCSS: saltMCBBScss,
    /**saltMCBBS 实例 */
    saltMCBBS: saltMCBBS,
    /**saltMCBBSOriginClass 类 */
    saltMCBBSOriginClass: saltMCBBSOriginClass,
    /**saltMCBBSDataBaseHandler 类 */
    saltMCBBSDataBaseHandler: saltMCBBSDataBaseHandler,
    /**saltMCBBSConsole 实例 */
    saltMCBBSConsole: any,
    // jQuery: any, // 有需要的话请自行导入jQuery的定义文件
    /**用户的uid，未登录则为0 */
    discuz_uid: string,
    /**切换编辑器模式( 0纯文本 1所见即所得 )仅在编辑器页面启用*/
    switchEditor?: (type: 0 | 1) => void,
    /**当前帖子的tid */
    tid?: string,
    /**当前版块的fid */
    uid?: string,
    /**切换页面主题 冬季、默认、下界 */
    extstyle: (
        styleType: './template/mcbbs/style/winter' | './template/mcbbs/style/default' | './template/mcbbs/style/nether'
    ) => void,
    /**
     * 调整img大小以适应页面
     * @param obj 传入一个img
     */
    thumbImg: (obj: Element, method?: any) => void,
    /**BBS自带的懒加载 */
    lazyload?: { imgs?: HTMLImageElement[] },
    /**所见即所得编辑器所给出的接口 */
    insertText?: (text: string, movestart?, moveend?, select?, sel?) => void,
    /**MCBBS Extender instance */
    MExt?: any,
}
interface HTMLElement {
    /**
     * 批量添加class到元素
     * @param classes 要添加的class用空格隔开
     */
    addClass(classes: string): void,
    /**
     * 切换元素的class，没有switch开关
     * @param classes 
     */
    toggleClass(classes: string): void,
    /**
     * 检查是否包含某个元素
     * @param classes 
     */
    hasClass(OneClass: string): boolean,
    /**
     * 批量移除元素的class
     * @param classes 
     */
    removeClass(classes: string): void,
    /**
     * 返回元素到页面顶部和左边的距离
     * @returns top: 顶部距离; left: 左边距离
     */
    offset(): { top: number, left: number },
    /**将元素的某个属性以数值形式返回 */
    numAttribute(key: string): numAttrReturn,
    /**元素是否部分在可视区域中 */
    inViewport(): boolean,
    /**元素是否全部出现在可视区域中 */
    allInViewport(): boolean,
}
interface numAttrReturn {
    /**值, 整数 */
    value: value,
    /**
     * 将这个属性值设置为
     * @param num 数值
     */
    set: (num: number) => numAttrReturn,
    /**
     * 加减这个属性值
     * @param num 数值
     */
    add: (num: number) => numAttrReturn
}