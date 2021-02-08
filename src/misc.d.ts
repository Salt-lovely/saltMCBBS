/**可以转换为&lt;a>的obj */
interface AnchorObj {
    url: string,
    text: string,
    img?: string,
    target?: string,
    class?: string,
    title?: string,
}
/**使用JSON来生成配置项 */
type settingOptions = settingOptionsCheck | settingOptionsNormal | settingOptionsInput | settingOptionsTextarea | settingOptionsRange
interface settingOptionsNormal {
    type: 'normal',
    element: Element,
    name?: string,
    priority?: number,
}
interface settingOptionsCheck {
    type: 'check',
    title: string,
    subtitle?: string,
    checked: boolean,
    callback: (ck: boolean, ev: Event) => void,
    name?: string,
    priority?: number,
}
interface settingOptionsInput {
    type: 'input',
    title: string,
    subtitle?: string,
    text: string,
    callback: (el: HTMLInputElement, ev: Event) => void,
    name?: string,
    priority?: number,
}
interface settingOptionsTextarea {
    type: 'textarea',
    title: string,
    subtitle?: string,
    text: string,
    callback: (el: HTMLTextAreaElement, ev: Event) => void,
    name?: string,
    priority?: number,
}
interface settingOptionsRange {
    type: 'range',
    title: string,
    subtitle?: string,
    value: number,
    range: [number, number, number] | { max: number, min: number, step: number },
    callback: (vl: number, ev: Event) => void,
    name?: string,
    priority?: number,
}
//type supportDataType = 'string' | 'number' | 'boolean' | ''
/**表情包 */
interface MemePack {
    /**表情包名 */
    name: string,
    /**表情 */
    memes: Meme[]
    /**作者 */
    author?: string,
    /**版本 */
    version?: string,
    /**版权信息 */
    license?: string,
    /**是否启用 */
    // enable?: boolean,
    /**其他信息 */
    others?: string,
}
/**单个表情 */
type Meme = Meme1 | Meme2
interface Meme1 {
    /**表情的URL */
    url: string,
    /**表情的名字（描述） */
    name: string,
}
interface Meme2 {
    /**表情的URL */
    url: string,
    /**表情的名字（描述） */
    name: string,
    /**图片限宽 */
    width: string,
    /**图片限高 */
    height: string,
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
 * 
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

/**MCBBS的TIDAPI返回中.data的部分内容 */
interface TIDAPIResponceData { Variables: TIDAPIResponceDataVariables, }
/**MCBBS的TIDAPI返回中.data.Variables的部分内容 */
interface TIDAPIResponceDataVariables {
    auth: string,
    /**版块ID */
    fid: string,
    /**帖子列表 */
    postlist: TIDAPIResponceDataVariablesPost[],
    thread: TIDAPIResponceDataVariablesThread,
}
/**MCBBS的TIDAPI返回中.data.Variables.postlist列表的单项 */
interface TIDAPIResponceDataVariablesPost {
    /**用户名 “匿名”代表匿名 */
    author: string,
    /**用户UID */
    authorid: string,
    /**附件数 */
    attachment: string,
    /**附件列表 */
    attachments: TIDAPIResponceDataVariablesPostAttachment[],
    /**时间戳 年-月-日 时:分:秒*/
    dateline: string,
    /**时间戳 毫秒制 */
    dbdateline: string,
    /**论坛图床的图片 */
    imagelist?: string[]
    /**内容 HTML文本 */
    message: string,
    /**楼层数 一楼为1 二楼为2 ... */
    number: string,
    /**PID */
    pid: string,
    /**楼层位置 可能不按实际楼层数来 ... */
    position: string,
    /**帖子TID 不知道为啥会在这里*/
    tid: string,
    /**用户名 “匿名”代表匿名 */
    username: string,
}
/**MCBBS的TIDAPI返回中.data.Variables.postlist[].attachments列表的单项 */
interface TIDAPIResponceDataVariablesPostAttachment {
    aid: string,
    tid: string,
    /**是否是图片 */
    isimage: '0' | '1',
    /**是否付款 */
    payed: '0' | '1',
    pid: string,
    /**附件售价 */
    price: string,
    uid: string,
    /**URL前缀 */
    url: string,
}
/**MCBBS的TIDAPI返回中.data.Variables.thread */
interface TIDAPIResponceDataVariablesThread {
    /**共计回复数 */
    allreplies: string,
    /**是否关闭 */
    closed: '0' | '1',
    /**热度 */
    heats: string,
    /**是否神隐 */
    hidden: string,
    /**高亮类型 */
    highlight: string,
    /**最后回复 */
    lastpost: string,
    /**最后回复者 */
    lastposter: string,
    /**总楼层数 */
    maxposition: string,
    /**短标题 */
    short_subject: string,
    /**标题 */
    subject: string,
    /**标题转码 */
    subjectenc: string,
}
