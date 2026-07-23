import { assignGroups, normalizeEvent, shiftIsoDate, todayIso } from "./domain.js";

const l = (tw, cn, en, ja = tw) => ({ "zh-TW": tw, "zh-CN": cn, en, ja });

export const currentUser = {
  id: "U-LOUIS",
  initials: "LC",
  name: l("陳冠廷", "陈冠廷", "Louis Chen", "ルイス・チェン"),
  extension: "2043",
};

const otherUser = { id: "U-MEIWEN", name: l("林美文", "林美文", "Mei-Wen Lin", "リン・メイウェン"), extension: "2777" };

const today = todayIso();
const day = (offset) => shiftIsoDate(today, offset);

const peopleSeed = [
  ["181201", "陳怡君", "陈怡君", "Alice Chen", "人力資源", "人力资源", "People", "2181"],
  ["181202", "林柏宇", "林柏宇", "Brian Lin", "產品部", "产品部", "Product", "2264"],
  ["181203", "吳佳穎", "吴佳颖", "Cathy Wu", "業務部", "业务部", "Sales", "2317"],
  ["181204", "高志明", "高志明", "Daniel Kao", "工程部", "工程部", "Engineering", "2406"],
  ["181205", "黃雅婷", "黄雅婷", "Eva Huang", "財務部", "财务部", "Finance", "2355"],
  ["181206", "蔡承翰", "蔡承翰", "Frank Tsai", "行銷部", "市场部", "Marketing", "2249"],
  ["181207", "李欣怡", "李欣怡", "Grace Li", "法務部", "法务部", "Legal", "2193"],
  ["181208", "王俊傑", "王俊杰", "Jason Wang", "資訊部", "信息部", "IT", "2451"],
  ["181209", "張語涵", "张语涵", "Iris Chang", "設計部", "设计部", "Design", "2328"],
  ["181210", "周冠廷", "周冠廷", "Kevin Chou", "採購部", "采购部", "Procurement", "2216"],
  ["181211", "徐婉婷", "徐婉婷", "Mina Hsu", "營運部", "运营部", "Operations", "2287"],
  ["181212", "鄭凱文", "郑凯文", "Oscar Cheng", "學習發展", "学习发展", "L&D", "2298"],
];

export const roster = peopleSeed.map(([id, tw, cn, en, deptTw, deptCn, deptEn, extension], index) => {
  const email = `${id.toLowerCase()}@eventcheckin.example`;
  return {
    id, name: l(tw, cn, en), department: l(deptTw, deptCn, deptEn), email, extension,
    teamsUrl: `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(email)}`,
    group: null, registered: true, leaveStatus: index === 8,
  };
});

export function buildDemoRoster(count = 12, grouped = false) {
  const people = roster.slice(0, count).map((person) => ({ ...person, group: null }));
  return grouped ? assignGroups(people, 4) : people;
}

// People who register after an event is created; the LMS roster refresh pulls them in.
const lateRegistrantSeed = [
  ["181213", "許雅琪", "许雅琪", "Penny Hsu", "客服中心", "客服中心", "Customer Care", "2374"],
  ["181214", "劉建志", "刘建志", "Roger Liu", "製造部", "制造部", "Manufacturing", "2411"],
  ["181215", "楊淑芳", "杨淑芳", "Sandy Yang", "品保部", "品保部", "Quality", "2265"],
  ["181216", "簡宏毅", "简宏毅", "Tony Chien", "研發中心", "研发中心", "R&D", "2503"],
  ["181217", "馮怡如", "冯怡如", "Vicky Feng", "公關部", "公关部", "Public Relations", "2158"],
  ["181218", "宋柏翰", "宋柏翰", "Wayne Sung", "稽核室", "稽核室", "Audit", "2092"],
];

export const lateRegistrants = lateRegistrantSeed.map(([id, tw, cn, en, deptTw, deptCn, deptEn, extension]) => {
  const email = `${id.toLowerCase()}@eventcheckin.example`;
  return {
    id, name: l(tw, cn, en), department: l(deptTw, deptCn, deptEn), email, extension,
    teamsUrl: `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(email)}`,
    group: null, registered: true, leaveStatus: false,
  };
});

/**
 * Simulates asking LMS for the newest roster: returns the current people plus any
 * colleagues who registered since the last sync, grouped the way LMS grouped them.
 */
export function fetchLmsRosterUpdate(currentPeople = [], grouped = false, batchSize = 2) {
  const existing = new Set(currentPeople.map((person) => person.id));
  const groups = [...new Set(currentPeople.map((person) => person.group).filter(Boolean))];
  const additions = lateRegistrants.filter((person) => !existing.has(person.id)).slice(0, batchSize).map((person, index) => ({
    ...person,
    group: grouped ? groups[(currentPeople.length + index) % Math.max(1, groups.length)] || "A" : null,
  }));
  return { people: [...currentPeople.map((person) => ({ ...person })), ...additions], added: additions.length };
}

const modules = (values = {}) => ({ survey: false, earlyBird: false, lottery: false, ...values });

const rawEvents = [
  {
    id: "LMS-LRN-8842", lmsId: "LRN-8842", source: "lms", ownerId: currentUser.id, lifecycle: "activated", status: "live",
    title: l("跨部門領導力工作坊", "跨部门领导力工作坊", "Cross-functional Leadership Workshop", "部門横断リーダーシップ研修"),
    creator: currentUser.name, contactExtension: currentUser.extension,
    date: day(0), startTime: "09:00", endTime: "17:00",
    location: l("台北總部 12F 學習中心", "台北总部 12F 学习中心", "Taipei HQ · 12F Learning Hub", "台北本社 12F ラーニングハブ"),
    category: "leadership", learningMode: "inPerson", audience: "manager", capacity: 12, totalHours: 8, instructor: l("林志豪", "林志豪", "Howard Lin", "ホワード・リン"), deputy: l("王淑芬", "王淑芬", "Sophia Wang", "ソフィア・ワン"),
    grouping: { enabled: true }, modules: modules({ survey: true, earlyBird: true, lottery: true }),
    survey: { url: "https://forms.example/leadership-2026" },
    earlyBird: { quota: 3, reward: l("NT$200 電子禮券", "NT$200 电子礼券", "NT$200 e-voucher", "NT$200 電子ギフト券") },
    lottery: { prizes: [
      { id: "p1", name: l("學習金 3,000 元", "学习金 3,000 元", "NT$3,000 learning fund", "学習補助 NT$3,000"), quantity: 1 },
      { id: "p2", name: l("書券 500 元", "书券 500 元", "NT$500 book voucher", "図書券 NT$500"), quantity: 2 },
      { id: "p3", name: l("咖啡兌換券", "咖啡兑换券", "Coffee voucher", "コーヒーチケット"), quantity: 3 },
    ] },
    rules: { lateAfterMin: 15, absentAfterMin: 30 },
  },
  {
    id: "LMS-LRN-9017", lmsId: "LRN-9017", source: "lms", ownerId: currentUser.id, lifecycle: "activated", status: "upcoming",
    title: l("生成式 AI 產品策略", "生成式 AI 产品策略", "Generative AI Product Strategy", "生成 AI プロダクト戦略"),
    creator: currentUser.name, contactExtension: currentUser.extension,
    date: day(0), startTime: "14:00", endTime: "16:00",
    location: l("台北總部 6F 演講廳", "台北总部 6F 演讲厅", "Taipei HQ · 6F Auditorium", "台北本社 6F 講堂"),
    category: "digital", learningMode: "hybrid", audience: "all", capacity: 10, totalHours: 2, instructor: l("陳品瑄", "陈品瑄", "Sabrina Chen", "サブリナ・チェン"), deputy: l("周立群", "周立群", "Leo Chou", "レオ・チョウ"),
    grouping: { enabled: false }, modules: modules({ survey: true }),
    survey: { url: "https://forms.example/genai-2026" }, earlyBird: null, lottery: null,
    rules: { lateAfterMin: 20, absentAfterMin: 45 },
  },
  {
    id: "SELF-COACHING-LAB", source: "self", ownerId: currentUser.id, lifecycle: "activated", status: "upcoming",
    title: l("新任主管教練實驗室", "新任主管教练实验室", "New Manager Coaching Lab", "新任管理職コーチングラボ"),
    creator: currentUser.name, contactExtension: currentUser.extension,
    date: day(4), startTime: "10:00", endTime: "15:00",
    location: l("新竹訓練中心 A201", "新竹培训中心 A201", "Hsinchu Training Center · A201", "新竹研修センター A201"),
    category: "leadership", learningMode: "inPerson", audience: "manager", capacity: 12, totalHours: 5, instructor: l("黃振宇", "黄振宇", "Marcus Huang", "マーカス・ホァン"), deputy: l("李佳蓉", "李佳蓉", "Karen Lee", "カレン・リー"),
    grouping: { enabled: true }, modules: modules({ survey: true, earlyBird: true }),
    survey: { url: "https://forms.example/new-manager" },
    earlyBird: { quota: 5, reward: l("咖啡兌換券", "咖啡兑换券", "Coffee voucher", "コーヒーチケット") }, lottery: null,
    rules: { lateAfterMin: 10, absentAfterMin: 30 },
  },
  {
    id: "LMS-LRN-8712", lmsId: "LRN-8712", source: "lms", ownerId: currentUser.id, lifecycle: "activated", status: "completed",
    title: l("年度資訊安全訓練", "年度信息安全培训", "Annual Information Security", "年次情報セキュリティ研修"),
    creator: currentUser.name, contactExtension: currentUser.extension,
    date: day(-7), startTime: "13:30", endTime: "15:30",
    location: l("台北總部 8F", "台北总部 8F", "Taipei HQ · 8F", "台北本社 8F"),
    category: "compliance", learningMode: "inPerson", audience: "all", capacity: 12, totalHours: 2, instructor: l("張哲瑋", "张哲玮", "Victor Chang", "ビクター・チャン"), deputy: l("蔡孟儒", "蔡孟儒", "Miles Tsai", "マイルズ・ツァイ"),
    grouping: { enabled: false }, modules: modules({ survey: true }),
    survey: { url: "https://forms.example/security" }, earlyBird: null, lottery: null,
    rules: { lateAfterMin: 10, absentAfterMin: 20 },
  },
  {
    id: "SELF-OUTDOOR-DAY", source: "self", ownerId: currentUser.id, lifecycle: "cancelled", status: "cancelled",
    title: l("戶外團隊共識日", "户外团队共识日", "Outdoor Team Alignment Day", "チームビルディングデー"),
    creator: currentUser.name, contactExtension: currentUser.extension,
    date: day(2), startTime: "09:00", endTime: "16:00",
    location: l("陽明山會議中心", "阳明山会议中心", "Yangmingshan Conference Center", "陽明山カンファレンスセンター"),
    category: "teamwork", learningMode: "inPerson", audience: "all", capacity: 12, totalHours: 7, instructor: l("趙芷若", "赵芷若", "Joyce Chao", "ジョイス・チャオ"), deputy: l("黃郁文", "黄郁文", "Wendy Huang", "ウェンディ・ホァン"),
    grouping: { enabled: true }, modules: modules({ survey: true }),
    survey: { url: "https://forms.example/outdoor" }, earlyBird: null, lottery: null,
    rules: { lateAfterMin: 15, absentAfterMin: 30 },
    cancelledAt: `${day(-1)}T10:20:00+08:00`,
    cancellationReason: l("因颱風影響延期", "因台风影响延期", "Postponed due to typhoon", "台風のため延期"),
  },
  {
    id: "SELF-SUPPLIER-SUMMIT", source: "self", ownerId: otherUser.id, lifecycle: "activated", status: "live",
    title: l("供應商年度大會", "供应商年度大会", "Annual Supplier Summit", "サプライヤー年次大会"),
    creator: otherUser.name, contactExtension: otherUser.extension,
    date: day(0), startTime: "10:00", endTime: "16:00",
    location: l("台中辦公室 3F", "台中办公室 3F", "Taichung Office · 3F", "台中オフィス 3F"),
    category: "teamwork", learningMode: "inPerson", audience: "all", capacity: 12, totalHours: 6, instructor: l("林美文", "林美文", "Mei-Wen Lin", "リン・メイウェン"), deputy: l("吳承恩", "吴承恩", "Ethan Wu", "イーサン・ウー"),
    grouping: { enabled: false }, modules: modules({ survey: true }),
    survey: { url: "https://forms.example/supplier" }, earlyBird: null, lottery: null,
    rules: { lateAfterMin: 15, absentAfterMin: 30 },
  },
];

export const events = rawEvents.map((event) => normalizeEvent({
  ...event,
  description: event.description || (event.source === "lms"
    ? l("活動資訊由 LMS 同步提供。", "活动信息由 LMS 同步提供。", "Event information is synchronized from LMS.", "イベント情報は LMS から同期されます。")
    : l("由活動管理者建立的內部活動。", "由活动管理员创建的内部活动。", "An internal event created by the event manager.", "イベント管理者が作成した社内イベントです。")),
}));

export const rostersByEvent = Object.fromEntries(events.map((event) => [event.id, buildDemoRoster(event.capacity, event.grouping.enabled)]));

const liveEvent = events[0];
const completedEvent = events[3];

export const initialAttendance = {
  // Today's event starts with nobody checked in, so a demo can run the whole flow live.
  [liveEvent.id]: {},
  // The last two left early, so they fall under the 80% completion threshold.
  [completedEvent.id]: Object.fromEntries(roster.slice(0, 9).map((person, index) => [person.id, {
    checkin: { at: `${completedEvent.date}T13:${String(31 + index).padStart(2, "0")}:00+08:00`, method: index % 2 ? "manual" : "card" },
    checkout: { at: `${completedEvent.date}T${index >= 7 ? "14:20" : "15:30"}:00+08:00`, method: "card" },
    leave: false, awarded: index === 0, audit: [],
  }])),
};

export const lmsCatalog = [
  normalizeEvent({
    id: "LMS-CATALOG-9204", lmsId: "LRN-9204", source: "lms", lifecycle: "available", status: "upcoming",
    title: l("設計思考實務工作坊", "设计思考实务工作坊", "Design Thinking in Practice", "デザイン思考実践ワークショップ"),
    creator: l("學習發展部", "学习发展部", "Learning & Development", "人材開発部"),
    description: l("以設計思考流程帶領跨部門團隊完成一次完整的問題解決演練。", "以设计思考流程带领跨部门团队完成一次完整的问题解决演练。", "Guide cross-functional teams through a full design thinking sprint.", "デザイン思考のプロセスで部門横断チームの課題解決演習を行います。"),
    date: day(16), startTime: "09:30", endTime: "16:30",
    location: l("台北總部 12F 學習中心", "台北总部 12F 学习中心", "Taipei HQ · 12F Learning Hub", "台北本社 12F ラーニングハブ"),
    category: "innovation", learningMode: "inPerson", audience: "all", capacity: 12, totalHours: 7, instructor: l("鄭又寧", "郑又宁", "Yuning Cheng", "ユニン・チェン"), deputy: l("吳建宏", "吴建宏", "Ken Wu", "ケン・ウー"),
    grouping: { enabled: true }, modules: modules({ survey: true, lottery: true }),
    survey: { url: "https://forms.example/design-thinking" },
    lottery: { prizes: [{ id: "p1", name: l("創新實踐獎", "创新实践奖", "Innovation award", "イノベーション賞"), quantity: 3 }] },
    rules: { lateAfterMin: 15, absentAfterMin: 30 },
    roster: buildDemoRoster(12, true),
  }),
  normalizeEvent({
    id: "LMS-CATALOG-9231", lmsId: "LRN-9231", source: "lms", lifecycle: "available", status: "upcoming",
    title: l("企業 ESG 與永續經營", "企业 ESG 与可持续经营", "ESG & Sustainable Business", "ESG とサステナブル経営"),
    creator: l("永續發展辦公室", "可持续发展办公室", "Sustainability Office", "サステナビリティ推進室"),
    description: l("說明企業 ESG 揭露要求與各部門的行動重點。", "说明企业 ESG 披露要求与各部门的行动重点。", "Company ESG disclosure requirements and department-level actions.", "ESG 開示要件と各部門のアクションを解説します。"),
    date: day(24), startTime: "14:00", endTime: "16:00",
    location: l("線上活動（Teams）", "线上活动（Teams）", "Online (Teams)", "オンライン（Teams）"),
    category: "compliance", learningMode: "online", audience: "all", capacity: 10, totalHours: 2, instructor: l("謝明德", "谢明德", "Ming-Te Hsieh", "ミンテ・シェ"), deputy: l("蘇怡如", "苏怡如", "Ruby Su", "ルビー・スー"),
    grouping: { enabled: false }, modules: modules({ survey: true }),
    survey: { url: "https://forms.example/esg" }, lottery: null,
    rules: { lateAfterMin: 15, absentAfterMin: 30 },
    roster: buildDemoRoster(10, false),
  }),
];

export const categoryLabels = {
  leadership: l("領導管理", "领导管理", "Leadership", "リーダーシップ"),
  digital: l("數位技能", "数字技能", "Digital skills", "デジタルスキル"),
  compliance: l("法規遵循", "合规管理", "Compliance", "コンプライアンス"),
  teamwork: l("團隊文化", "团队文化", "Team culture", "チーム文化"),
  innovation: l("創新思維", "创新思维", "Innovation", "イノベーション"),
};

export const modeLabels = {
  inPerson: l("實體", "线下", "In person", "対面"),
  hybrid: l("混合", "混合", "Hybrid", "ハイブリッド"),
  online: l("線上", "线上", "Online", "オンライン"),
};
