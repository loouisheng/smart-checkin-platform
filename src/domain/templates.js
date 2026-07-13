export const templates = [
  {
    id: "training",
    name: { zh: "企業內訓", en: "Training" },
    description: { zh: "學分、遲到、早退與教材派發", en: "Credits, attendance rules and materials" },
    requireCheckout: true,
    allowReentry: false,
    rules: { lateAfterMin: 15, absentAfterMin: 30, earlyLeaveMin: 30, waitlistReleaseMin: 30 },
    modules: ["attendance", "waitlist", "earlyBird", "materials", "seating", "grouping"],
  },
  {
    id: "lecture",
    name: { zh: "一般講座", en: "Lecture" },
    description: { zh: "快速入場與名單核對", en: "Fast entry and roster matching" },
    requireCheckout: false,
    allowReentry: false,
    rules: { lateAfterMin: 20, absentAfterMin: 60 },
    modules: ["attendance", "materials"],
  },
  {
    id: "expo",
    name: { zh: "展覽活動", en: "Expo" },
    description: { zh: "高流量掃碼與重複入場", en: "High-throughput scanning and re-entry" },
    requireCheckout: false,
    allowReentry: true,
    rules: {},
    modules: ["reentry", "multiGate"],
  },
  {
    id: "meeting",
    name: { zh: "會議簽到", en: "Meeting" },
    description: { zh: "貴賓辨識與座位指引", en: "Guest recognition and seating" },
    requireCheckout: false,
    allowReentry: false,
    rules: { lateAfterMin: 10 },
    modules: ["vip", "seating"],
  },
  {
    id: "exam",
    name: { zh: "考試場景", en: "Exam" },
    description: { zh: "身分核對與嚴格入場時間", en: "Identity check and strict cutoff" },
    requireCheckout: false,
    allowReentry: false,
    rules: { lateAfterMin: 0, hardCutoffMin: 20 },
    modules: ["identity", "seating"],
  },
  {
    id: "staff",
    name: { zh: "員工活動", en: "Staff event" },
    description: { zh: "福利領取與抽獎資格", en: "Benefit pickup and raffle eligibility" },
    requireCheckout: false,
    allowReentry: false,
    rules: { lateAfterMin: 30 },
    modules: ["benefits", "earlyBird"],
  },
  {
    id: "gate",
    name: { zh: "門禁入場", en: "Access control" },
    description: { zh: "權限判定與進出紀錄", en: "Permission checks and access logs" },
    requireCheckout: true,
    allowReentry: true,
    rules: {},
    modules: ["accessControl", "reentry"],
  },
];

export function getTemplate(id) {
  return templates.find((template) => template.id === id) || templates[0];
}
