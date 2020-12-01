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
/**
 * 可以转换为<a>的obj
 */
interface AnchorObj {
    url: string,
    text: string,
    img?: string,
    target?: string,
    class?: string,
}
/**
 * MCBBS的API返回中.data.Variables的部分内容
 */
interface BBSAPIResponceDataVariables {
    extcredits: BBSAPIResponceDataVariablesExtcredits,
    space: BBSAPIResponceDataVariablesSpace,
    notice: BBSAPIResponceDataVariablesNotice,
}
/**
 * MCBBS的API返回中.data.Variables.notice的内容
 */
interface BBSAPIResponceDataVariablesNotice {
    newmypost: string,
    newpm: string,
    newprompt: string,
    newpush: string,
}
/**
 * MCBBS的API返回中.data.Variables.extcredits的内容
 */
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
/**
 * MCBBS的API返回中.data.Variables.space的部分内容
 */
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