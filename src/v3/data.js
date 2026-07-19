const l = (tw, cn, en, ja = tw) => ({ "zh-TW": tw, "zh-CN": cn, en, ja });

const peopleSeed = [
  ["T001", "陳怡君", "陈怡君", "Alice Chen", "人力資源", "人力资源", "People", "2181"],
  ["T002", "林柏宇", "林柏宇", "Brian Lin", "產品部", "产品部", "Product", "2264"],
  ["T003", "吳佳穎", "吴佳颖", "Cathy Wu", "業務部", "业务部", "Sales", "2317"],
  ["T004", "高志明", "高志明", "Daniel Kao", "工程部", "工程部", "Engineering", "2406"],
  ["T005", "黃雅婷", "黄雅婷", "Eva Huang", "財務部", "财务部", "Finance", "2355"],
  ["T006", "蔡承翰", "蔡承翰", "Frank Tsai", "行銷部", "市场部", "Marketing", "2249"],
  ["T007", "李欣怡", "李欣怡", "Grace Li", "法務部", "法务部", "Legal", "2193"],
  ["T008", "王俊傑", "王俊杰", "Jason Wang", "資訊部", "信息部", "IT", "2451"],
  ["T009", "張語涵", "张语涵", "Iris Chang", "設計部", "设计部", "Design", "2328"],
  ["T010", "周冠廷", "周冠廷", "Kevin Chou", "採購部", "采购部", "Procurement", "2216"],
  ["T011", "徐婉婷", "徐婉婷", "Mina Hsu", "營運部", "运营部", "Operations", "2287"],
  ["T012", "鄭凱文", "郑凯文", "Oscar Cheng", "學習發展", "学习发展", "L&D", "2298"],
];

export const roster = peopleSeed.map(([id, tw, cn, en, deptTw, deptCn, deptEn, extension], index) => {
  const email = `${id.toLowerCase()}@eventcheckin.example`;
  return {
    id, name: l(tw, cn, en), department: l(deptTw, deptCn, deptEn), email, extension,
    teamsUrl: `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(email)}`,
    group: null, registered: true, leaveStatus: index === 8,
  };
});

const modules = (values = {}) => ({ materials: false, survey: false, earlyBird: false, lottery: false, ...values });

export const events = [
  {
    id: "LMS-2026-0717", lmsId: "LRN-8842", source: "lms", lifecycle: "activated", status: "live",
    title: l("跨部門領導力工作坊", "跨部门领导力工作坊", "Cross-functional Leadership Workshop", "部門横断リーダーシップ研修"),
    organizer: l("學習發展部", "学习发展部", "Learning & Development", "人材開発部"),
    date: "2026-07-17", startTime: "09:00", endTime: "17:00",
    location: l("台北總部 12F 學習中心", "台北总部 12F 学习中心", "Taipei HQ · 12F Learning Hub", "台北本社 12F ラーニングハブ"),
    category: "leadership", learningMode: "inPerson", audience: "manager", capacity: 48,
    grouping: { enabled: true, targetSize: 4 }, modules: modules({ materials: true, survey: true, earlyBird: true, lottery: true }),
    materials: { name: l("領導力工作坊手冊", "领导力工作坊手册", "Leadership workshop handbook", "リーダーシップ研修資料"), url: "https://learning.example/materials/leadership" },
    survey: { url: "https://forms.example/leadership-2026", autoSend: true },
    earlyBird: { quota: 3, reward: l("NT$200 電子禮券", "NT$200 电子礼券", "NT$200 e-voucher", "NT$200 電子ギフト券") },
    lottery: { prizes: [
      { id: "p1", name: l("學習金 3,000 元", "学习金 3,000 元", "NT$3,000 learning fund", "学習補助 NT$3,000"), quantity: 1 },
      { id: "p2", name: l("書券 500 元", "书券 500 元", "NT$500 book voucher", "図書券 NT$500"), quantity: 2 },
    ] },
    rules: { lateAfterMin: 15, absentAfterMin: 30 },
  },
  {
    id: "LMS-2026-0718", lmsId: "LRN-9017", source: "lms", lifecycle: "activated", status: "upcoming",
    title: l("生成式 AI 產品策略", "生成式 AI 产品策略", "Generative AI Product Strategy", "生成 AI プロダクト戦略"),
    organizer: l("數位轉型辦公室", "数字化转型办公室", "Digital Transformation Office", "DX 推進室"),
    date: "2026-07-18", startTime: "14:00", endTime: "16:00",
    location: l("台北總部 6F 演講廳", "台北总部 6F 演讲厅", "Taipei HQ · 6F Auditorium", "台北本社 6F 講堂"),
    category: "digital", learningMode: "hybrid", audience: "all", capacity: 120,
    grouping: { enabled: false, targetSize: null }, modules: modules({ materials: true, survey: true }),
    materials: { name: l("簡報與課程錄影", "简报与课程录像", "Slides and recording", "資料と録画"), url: "https://learning.example/materials/genai" },
    survey: { url: "https://forms.example/genai-2026", autoSend: true }, earlyBird: null, lottery: null,
    rules: { lateAfterMin: 20, absentAfterMin: 45 },
  },
  {
    id: "SELF-2026-0725", source: "self", lifecycle: "activated", status: "upcoming",
    title: l("新任主管教練實驗室", "新任主管教练实验室", "New Manager Coaching Lab", "新任管理職コーチングラボ"),
    organizer: l("人力資源部", "人力资源部", "People Team", "人事部"), date: "2026-07-25", startTime: "10:00", endTime: "15:00",
    location: l("新竹訓練中心 A201", "新竹培训中心 A201", "Hsinchu Training Center · A201", "新竹研修センター A201"),
    category: "leadership", learningMode: "inPerson", audience: "manager", capacity: 36,
    grouping: { enabled: true, targetSize: 4 }, modules: modules({ survey: true, earlyBird: true }),
    materials: null, survey: { url: "https://forms.example/new-manager", autoSend: true },
    earlyBird: { quota: 5, reward: l("咖啡兌換券", "咖啡兑换券", "Coffee voucher", "コーヒーチケット") }, lottery: null,
    rules: { lateAfterMin: 10, absentAfterMin: 30 },
  },
  {
    id: "LMS-2026-0710", lmsId: "LRN-8712", source: "lms", lifecycle: "activated", status: "completed",
    title: l("年度資訊安全訓練", "年度信息安全培训", "Annual Information Security", "年次情報セキュリティ研修"),
    organizer: l("資訊安全部", "信息安全部", "Information Security", "情報セキュリティ部"),
    date: "2026-07-10", startTime: "13:30", endTime: "15:30",
    location: l("台北總部 8F", "台北总部 8F", "Taipei HQ · 8F", "台北本社 8F"),
    category: "compliance", learningMode: "inPerson", audience: "all", capacity: 80,
    grouping: { enabled: false, targetSize: null }, modules: modules({ materials: true, survey: true }),
    materials: { name: l("資安行動指南", "信息安全行动指南", "Security action guide", "セキュリティ行動ガイド"), url: "https://learning.example/materials/security" },
    survey: { url: "https://forms.example/security", autoSend: true }, earlyBird: null, lottery: null, rules: { lateAfterMin: 10, absentAfterMin: 20 },
  },
  {
    id: "SELF-2026-0719", source: "self", lifecycle: "cancelled", status: "cancelled",
    title: l("戶外團隊共識日", "户外团队共识日", "Outdoor Team Alignment Day", "チームビルディングデー"),
    organizer: l("企業文化委員會", "企业文化委员会", "Culture Committee", "企業文化委員会"),
    date: "2026-07-19", startTime: "09:00", endTime: "16:00",
    location: l("陽明山會議中心", "阳明山会议中心", "Yangmingshan Conference Center", "陽明山カンファレンスセンター"),
    category: "teamwork", learningMode: "inPerson", audience: "all", capacity: 60,
    grouping: { enabled: true, targetSize: 6 }, modules: modules({ materials: true }),
    materials: { name: l("行前指南", "行前指南", "Pre-event guide", "事前ガイド"), url: "https://learning.example/materials/outdoor" },
    survey: null, earlyBird: null, lottery: null, rules: { lateAfterMin: 15, absentAfterMin: 30 },
    cancelledAt: "2026-07-16T10:20:00+08:00",
    cancellationReason: l("因颱風影響延期", "因台风影响延期", "Postponed due to typhoon", "台風のため延期"),
  },
];

function assignRoster(event, count = 12) {
  const people = roster.slice(0, count);
  if (!event.grouping.enabled) return people.map((person) => ({ ...person, group: null }));
  const groups = Math.ceil(people.length / event.grouping.targetSize);
  return people.map((person, index) => ({ ...person, group: String.fromCharCode(65 + (index % groups)) }));
}

export const rostersByEvent = Object.fromEntries(events.map((event, index) => [event.id, assignRoster(event, index === 1 ? 10 : 12)]));

export const initialAttendance = {
  "LMS-2026-0717": {
    T001: { checkin: { at: "2026-07-17T09:01:00+08:00", method: "card", operator: "Front Desk A" }, checkout: null, leave: false, audit: [] },
    T002: { checkin: { at: "2026-07-17T09:04:00+08:00", method: "card", operator: "Front Desk A" }, checkout: null, leave: false, audit: [] },
    T003: { checkin: { at: "2026-07-17T09:18:00+08:00", method: "manual", operator: "Louis Chen" }, checkout: null, leave: false, audit: [] },
    T009: { checkin: null, checkout: null, leave: true, leaveSource: "lms", audit: [] },
  },
  "LMS-2026-0710": Object.fromEntries(roster.slice(0, 9).map((person, index) => [person.id, {
    checkin: { at: `2026-07-10T13:${String(31 + index).padStart(2, "0")}:00+08:00`, method: index % 2 ? "manual" : "card" },
    checkout: { at: "2026-07-10T15:30:00+08:00", method: "card" }, leave: false, audit: [],
  }])),
};

export const lmsCatalog = [
  {
    ...events[1], id: "LMS-CATALOG-2204", lmsId: "LRN-9204", lifecycle: "available", status: "upcoming", date: "2026-08-06",
    title: l("設計思考實務工作坊", "设计思考实务工作坊", "Design Thinking in Practice", "デザイン思考実践ワークショップ"),
    category: "innovation", audience: "all", grouping: { enabled: true, targetSize: 5 },
    modules: modules({ materials: true, survey: true, lottery: true }),
    lottery: { prizes: [{ id: "p1", name: l("創新實踐獎", "创新实践奖", "Innovation award", "イノベーション賞"), quantity: 3 }] },
  },
  {
    ...events[1], id: "LMS-CATALOG-2231", lmsId: "LRN-9231", lifecycle: "available", status: "upcoming", date: "2026-08-14",
    title: l("企業 ESG 與永續經營", "企业 ESG 与可持续经营", "ESG & Sustainable Business", "ESG とサステナブル経営"),
    category: "compliance", learningMode: "online", audience: "all",
    grouping: { enabled: false, targetSize: null }, modules: modules({ materials: true, survey: true }), lottery: null,
  },
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
