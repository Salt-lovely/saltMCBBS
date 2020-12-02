interface Window {
    saltMCBBSCSS: saltMCBBScss,
    saltMCBBS: saltMCBBS,
    saltMCBBSOriginClass: saltMCBBSOriginClass,
    jQuery: any,
    discuz_uid: string,
}
interface saltQueryCallback {
    (index: number, el: Element): void
}
interface saltMCBBSOriginClass {
    new(): saltMCBBSOriginClassInstance
}
interface saltMCBBSOriginClassInstance {
    /**
     * 根据选择器遍历元素
     * @param selector 字符串，选择器
     * @param callback 回调函数(index: number, el: Element): void
     */
    saltQuery(selector: string, callback: saltQueryCallback)
    /**
     * 封装了MutationObserver的少许操作，自动开始监视
     * @param id 要监听的元素ID
     * @param callback 回调函数
     * @returns 成果则返回一个已经开始监听的MutationObserver对象，否则返回null
     */
    saltObserver(id: string, callback: MutationCallback, watchAttr: boolean = false, watchChildList: boolean = true): MutationObserver | null,
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
     * 断言
     * @param condition 为假时报错
     * @param msg 报错语句，默认为“发生错误”
     */
    assert(condition: any, msg: string = '发生错误'): void,
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
interface saltMCBBS {
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
    addSetting(div: Element, id?: string),
    /**
     * 删除配置项
     * @param id 元素的名字
     */
    delSetting(id: string),
    /**将格式正确的obj变成a元素 */
    obj2a(obj: AnchorObj[], targetDefault = '_self'): HTMLAnchorElement[],
    /**批量添加子节点 */
    addChildren(parent: Element, children: NodeListOf<Element> | Element[]): void,
    /**
     * 根据UID获取信息
     * @param uid 用户的UID
     * @param callback 回调函数
     * @param retry 失败后重试次数
     * @param retryTime 重试时间间隔
     */
    fetchUID(uid: number | string, callback: fetchUIDcallback, retry = 2, retryTime = 1500),
    /**获取当前用户的UID*/
    getUID(): number,
    /**
     * 将字符串分割成字符串数组，去掉空项与每一项的两侧空格
     * @param str 要分割的字符串
     * @param spliter 按什么划分，默认按换行划分
     */
    formatToStringArray(str: string, spliter: '\n'): string[],
    /**删除字符串两侧的空格 */
    Trim(x: string): string,
}
/**fetchUID的回调函数 */
interface fetchUIDcallback {
    (data: BBSAPIResponceData): void
}
/**saltMCBBSCSS接口 */
interface saltMCBBScss {
    setStyle(css: string, key: string): boolean,
    getStyle(key: string): string,
    putStyle(css?: string, key?: string): boolean,
    delStyle(key: string): boolean,
    replaceStyle(css: string, key: string): boolean,
}
/**saltMCBBScss里面存放的样式记录 */
interface styleMap {
    [index: string]: string,
}
/**可以转换为<a>的obj */
interface AnchorObj {
    url: string,
    text: string,
    img?: string,
    target?: string,
    class?: string,
    title?: string,
}
/**MCBBS的API返回中.data的部分内容 */
interface BBSAPIResponceData { Variables: BBSAPIResponceDataVariables; }
/**MCBBS的API返回中.data.Variables的部分内容 */
interface BBSAPIResponceDataVariables {
    extcredits: BBSAPIResponceDataVariablesExtcredits,
    space: BBSAPIResponceDataVariablesSpace,
    notice: BBSAPIResponceDataVariablesNotice,
}
/**MCBBS的API返回中.data.Variables.notice的内容 */
interface BBSAPIResponceDataVariablesNotice {
    newmypost: string,
    newpm: string,
    newprompt: string,
    newpush: string,
}
/**MCBBS的API返回中.data.Variables.extcredits的内容 */
interface BBSAPIResponceDataVariablesExtcredits {
    1: BBSAPIResponceDataVariablesExtcreditsInside,
    2: BBSAPIResponceDataVariablesExtcreditsInside,
    3: BBSAPIResponceDataVariablesExtcreditsInside,
    4: BBSAPIResponceDataVariablesExtcreditsInside,
    5: BBSAPIResponceDataVariablesExtcreditsInside,
    6: BBSAPIResponceDataVariablesExtcreditsInside,
    7: BBSAPIResponceDataVariablesExtcreditsInside,
    8: BBSAPIResponceDataVariablesExtcreditsInside,
}
/**
 * MCBBS的API返回中.data.Variables.extcredits.[数字]里的内容
 * 包含积分名称、单位等信息
 */
interface BBSAPIResponceDataVariablesExtcreditsInside {
    /**积分图片（HTML） */
    img: string,
    ratio: string,
    /**积分名字 */
    title: string,
    /**积分单位 */
    unit: string,
}
/**MCBBS的API返回中.data.Variables.space的部分内容 */
interface BBSAPIResponceDataVariablesSpace {
    birthcity: string,
    birthcommunity: string,
    /**出生日期*/
    birthday: string,
    birthdist: string,
    /** 出生月份 */
    birthmonth: string,
    /** 出生省份 */
    birthprovince: string,
    /** 出生年份 */
    birthyear: string,
    /** 总积分 */
    credits: string,
    /** 自定义头衔 */
    customstatus: string,
    /** 精华帖数 */
    digestposts: string,
    /**人气 */
    extcredits1: string,
    /**金粒 */
    extcredits2: string,
    /**金锭 */
    extcredits3: string,
    /**绿宝石 */
    extcredits4: string,
    /**下界之星 */
    extcredits5: string,
    /**贡献 */
    extcredits6: string,
    /**爱心 */
    extcredits7: string,
    /**钻石 */
    extcredits8: string,
    /** uid 以逗号隔断 */
    feedfriend: string,
    /** 好友数 */
    friends: string,
    /** 性别 1男 2女 0保密 3不男不女 */
    gender: string,
    /**用户组信息 */
    group: {
        /** 积分下限 */
        creditshigher: string,
        /** 积分上限 */
        creditslower: string,
        /** 用户组标签 */
        grouptitle: string,
        /** 用户组星数 */
        stars: string,
        /** 用户组类型 member普通 */
        type: string,
    }
    groupid: string,
    groups: string,
    groupterms: string,

    invisible: string,
    lastactivity: string,
    lastactivitydb: string,
    // lastipport: string,
    lastpost: string,
    // lastsendmail: string,
    lastvisit: string,
    /**勋章信息 */
    medals: [
        {
            /**勋章名 */
            name: string,
            /**勋章图片（需要 medalLinkPrefix 作前缀） */
            image: string,
            /**勋章ID */
            medalid: string,
        }
    ]
    /**回帖数 */
    posts: string,
    /** 最近帖子的标题 */
    recentnote: string,
    /** 注册时间 */
    regdate: string,
    /** 签名档 */
    sightml: string,
    /** 个人网站 */
    site: string,
    /** 界面主题（样式） */
    theme: string,
    /** 主题帖数 */
    threads: string,
    /** 时区 */
    timeoffset: string,
    // todayattachs: string,
    // todayattachsize: string, 
    /**uid */
    uid: string,
    /**用户名 */
    username: string,
    /**访客访问数 */
    views: string,
    /**体重 */
    weight: string,
    /**生肖 */
    zodiac: string,
}