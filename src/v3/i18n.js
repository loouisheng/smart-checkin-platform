export const languages = [
  { id: "zh-TW", label: "繁體中文", short: "繁中" },
  { id: "zh-CN", label: "简体中文", short: "简中" },
  { id: "en", label: "English", short: "EN" },
  { id: "ja", label: "日本語", short: "日本語" },
];

const zhTW = {
  product: "Event Check-In", caption: "??????????", functionality: "FUNCTIONALITY", management: "MANAGEMENT",
  navCheckin: "????", navHistory: "????", navEvents: "????", navMaterials: "????", navReports: "????",
  navSurvey: "????", navEarlyBird: "????", navLottery: "????", operator: "?????",
  checkinTitle: "??????????", checkinDesc: "?????????????????????????",
  searchEvent: "??????", searchPerson: "???????", allSources: "????", allTypes: "????", allStatuses: "????",
  sourceLms: "LMS ??", sourceSelf: "????", live: "???", upcoming: "????", completed: "???", cancelled: "???", draft: "??",
  eventTime: "????", location: "????", organizer: "????", capacity: "????", startCheckin: "????", noEvent: "?????????",
  back: "??????", checkin: "Check-in ??", checkout: "Check-out ??", card: "???????", manual: "???????",
  readerReady: "???????", waitingCard: "?????????", cardHint: "??????????????????",
  recent: "????", time: "??", person: "??", method: "??", result: "??", cardMethod: "??", manualMethod: "??",
  name: "??", employeeId: "??", department: "??", group: "??", attendance: "????", checkinAt: "????", checkoutAt: "????",
  teams: "Teams", extension: "??", action: "??", pending: "???", checkedIn: "???", checkedOut: "???", late: "??", absent: "??", leave: "??",
  expected: "??", arrived: "???", needsAction: "???", attendanceRate: "???", exportCsv: "?? CSV", empty: "?????????",
  eventsTitle: "????", eventsDesc: "???????? LMS ??????????????????", newEvent: "????", browseEvents: "??????",
  selfEvent: "????", selfEventDesc: "??????????????????????", lmsEvent: "? LMS ??", lmsEventDesc: "?????????????????????",
  basicInfo: "????", modules: "????", grouping: "????", groupSize: "????", materials: "??", survey: "??", earlyBird: "????", lottery: "??",
  eventName: "????", date: "????", startTime: "????", endTime: "????", category: "????", learningMode: "????", audience: "????",
  materialName: "????", materialUrl: "????", surveyUrl: "????", earlyQuota: "????", earlyReward: "????", prizeName: "????", prizeQty: "??",
  saveEvent: "?????", importEvent: "??? LMS ??", readonly: "??? LMS ??????????", cancelEvent: "????", cancelReason: "???????",
  materialsTitle: "????", materialsDesc: "??????????????????????????", resend: "??", resendAll: "??????", sent: "???", notSent: "????", failed: "????",
  surveyTitle: "????", surveyDesc: "???????????????????????????", send: "??", sendAll: "????", autoScheduled: "????????????",
  earlyTitle: "????", earlyDesc: "????????????????????????", eligible: "????", issued: "???", issue: "??", issueAll: "????",
  lotteryTitle: "????", lotteryDesc: "??????????????????", draw: "????", winners: "????", unassigned: "?????",
  reportsTitle: "????", reportsDesc: "??????????????????????", liveRoster: "????", markLeave: "????", clearLeave: "????",
  historyTitle: "????", historyDesc: "??????????????????????????", selectHistory: "??????",
  confirm: "??", cancel: "??", save: "??", close: "??", retry: "??", language: "??", systemOnline: "??????",
  successCheckin: "????", successCheckout: "????", duplicateCheckin: "????????", duplicateCheckout: "????????",
  withoutCheckin: "?????????", personNotFound: "????????", eventUnavailable: "?????????", leaveOverride: "???????????????????",
  networkOffline: "????????????????", missingLink: "??????????????", batchComplete: "??????", teamsUnavailable: "??? Teams ??",
};

const zhCN = {
  ...zhTW, caption: "??????????", navCheckin: "????", navHistory: "????", navEvents: "????", navReports: "????",
  navSurvey: "????", navLottery: "????", operator: "?????", checkinTitle: "??????????", checkinDesc: "?????????????????????????",
  searchEvent: "??????", searchPerson: "???????", allSources: "????", allTypes: "????", allStatuses: "????",
  sourceSelf: "????", live: "???", upcoming: "????", completed: "???", cancelled: "???", startCheckin: "????", noEvent: "?????????",
  back: "??????", checkin: "Check-in ??", checkout: "Check-out ??", card: "???????", manual: "???????",
  readerReady: "???????", waitingCard: "?????????", cardHint: "??????????????????", recent: "????",
  name: "??", employeeId: "??", department: "??", group: "??", attendance: "????", checkinAt: "????", checkoutAt: "????",
  pending: "???", checkedIn: "???", checkedOut: "???", late: "??", absent: "??", leave: "??", expected: "??", arrived: "???", needsAction: "???", attendanceRate: "???",
  eventsTitle: "????", eventsDesc: "???????? LMS ??????????????????", newEvent: "????", browseEvents: "??????",
  selfEventDesc: "??????????????????????", lmsEvent: "? LMS ??", lmsEventDesc: "?????????????????????",
  basicInfo: "????", modules: "????", grouping: "????", groupSize: "????", eventName: "????", eventTime: "????", location: "????",
  saveEvent: "?????", importEvent: "??? LMS ??", readonly: "??? LMS ??????????", cancelEvent: "????", cancelReason: "???????",
  materialsDesc: "??????????????????????????", resend: "??", resendAll: "??????", sent: "???", notSent: "????", failed: "????",
  surveyTitle: "????", surveyDesc: "???????????????????????????", send: "??", sendAll: "????", autoScheduled: "????????????",
  earlyDesc: "????????????????????????", eligible: "????", issued: "???", issueAll: "????",
  lotteryTitle: "????", lotteryDesc: "??????????????????", draw: "????", winners: "????", unassigned: "?????",
  reportsDesc: "??????????????????????", liveRoster: "????", markLeave: "????", clearLeave: "????",
  historyTitle: "????", historyDesc: "??????????????????????????", selectHistory: "??????",
  systemOnline: "??????", successCheckin: "????", successCheckout: "????", duplicateCheckin: "????????", duplicateCheckout: "????????",
  withoutCheckin: "?????????", personNotFound: "????????", eventUnavailable: "?????????", leaveOverride: "???????????????????",
  networkOffline: "????????????????", missingLink: "??????????????", batchComplete: "??????",
};

const en = {
  ...zhTW, caption: "Enterprise event attendance", navCheckin: "Smart check-in", navHistory: "History", navEvents: "Event management", navMaterials: "Materials", navReports: "Reports",
  navSurvey: "Survey delivery", navEarlyBird: "Early-bird rewards", navLottery: "Event lottery", operator: "Event operator",
  checkinTitle: "Choose an event to start check-in", checkinDesc: "Use search and filters to find your event, then open the on-site workspace.",
  searchEvent: "Search event name", searchPerson: "Employee ID or name", allSources: "All sources", allTypes: "All types", allStatuses: "All statuses",
  sourceLms: "LMS event", sourceSelf: "Self-created", live: "Live", upcoming: "Upcoming", completed: "Completed", cancelled: "Cancelled", draft: "Draft",
  eventTime: "Event time", location: "Location", organizer: "Organizer", capacity: "Capacity", startCheckin: "Start check-in", noEvent: "No matching events",
  back: "Back to events", checkin: "Check in", checkout: "Check out", card: "Card check-in / out", manual: "Manual check-in / out",
  readerReady: "Card reader connected", waitingCard: "Waiting for an employee card", cardHint: "The result and group assignment will appear immediately.",
  recent: "Recent activity", time: "Time", person: "Person", method: "Method", result: "Result", cardMethod: "Card", manualMethod: "Manual",
  name: "Name", employeeId: "Employee ID", department: "Department", group: "Group", attendance: "Attendance", checkinAt: "Check-in", checkoutAt: "Check-out",
  pending: "Pending", checkedIn: "Checked in", checkedOut: "Checked out", late: "Late", absent: "Absent", leave: "On leave",
  expected: "Expected", arrived: "Arrived", needsAction: "Needs action", attendanceRate: "Attendance rate", exportCsv: "Download CSV", empty: "No matching data",
  eventsTitle: "Event management", eventsDesc: "LMS events sync in automatically; create your own events and set the capabilities each one needs.", newEvent: "New event", browseEvents: "Browse existing",
  selfEvent: "Self-created event", selfEventDesc: "Enter event details, import a roster, and configure capabilities.", lmsEvent: "Choose from LMS", lmsEventDesc: "Search company learning events and import their read-only configuration.",
  basicInfo: "Basic information", modules: "Capability modules", grouping: "Enable grouping", groupSize: "People per group", materials: "Materials", survey: "Survey", earlyBird: "Early-bird", lottery: "Lottery",
  eventName: "Event name", date: "Date", startTime: "Start time", endTime: "End time", category: "Event type", learningMode: "Learning mode", audience: "Audience",
  materialName: "Material name", materialUrl: "Material link", surveyUrl: "Survey link", earlyQuota: "Reward quota", earlyReward: "Reward", prizeName: "Prize", prizeQty: "Quantity",
  saveEvent: "Save and activate", importEvent: "Add this LMS event", readonly: "This data is provided by LMS and cannot be edited.", cancelEvent: "Cancel event", cancelReason: "Enter a cancellation reason",
  materialsTitle: "Materials", materialsDesc: "Materials are sent when the roster is created. Search and resend when needed.", resend: "Resend", resendAll: "Resend to all", sent: "Sent", notSent: "Not sent", failed: "Failed",
  surveyTitle: "Survey delivery", surveyDesc: "Surveys are sent to attendees after the scheduled end time, with manual delivery available.", send: "Send", sendAll: "Send to all", autoScheduled: "Automatic delivery scheduled after event end",
  earlyTitle: "Early-bird rewards", earlyDesc: "Eligibility is based only on successful check-in time.", eligible: "Eligible", issued: "Issued", issue: "Issue", issueAll: "Issue all",
  lotteryTitle: "Event lottery", lotteryDesc: "Assign every configured prize to checked-in attendees in one draw.", draw: "Start draw", winners: "Winners", unassigned: "Unassigned prizes",
  reportsTitle: "Reports", reportsDesc: "See live attendance and contact colleagues who have not arrived.", liveRoster: "Live roster", markLeave: "Mark leave", clearLeave: "Clear leave",
  historyTitle: "History", historyDesc: "Review completed and cancelled events with person-level attendance records.", selectHistory: "Choose a historical event",
  confirm: "Confirm", cancel: "Cancel", save: "Save", close: "Close", retry: "Retry", language: "Language", systemOnline: "System online",
  successCheckin: "Check-in successful", successCheckout: "Check-out successful", duplicateCheckin: "This person is already checked in", duplicateCheckout: "This person is already checked out",
  withoutCheckin: "Check in is required before check-out", personNotFound: "No matching person found", eventUnavailable: "This event is unavailable or cancelled", leaveOverride: "This person is on leave. Change the status to checked in?",
  networkOffline: "Unable to connect. Check the network and try again.", missingLink: "A valid link has not been configured.", batchComplete: "Batch action complete", teamsUnavailable: "Teams account unavailable",
};

const ja = {
  ...en, caption: "??????????", navCheckin: "??????", navHistory: "??", navEvents: "??????", navMaterials: "????", navReports: "???????",
  navSurvey: "???????", navEarlyBird: "????", navLottery: "??????", operator: "???????",
  checkinTitle: "??????????????", checkinDesc: "?????????????????????????????????",
  searchEvent: "????????", searchPerson: "?????????", allSources: "???", allTypes: "??????", allStatuses: "??????",
  sourceLms: "LMS????", sourceSelf: "????", live: "???", upcoming: "????", completed: "??", cancelled: "??", draft: "???",
  eventTime: "????", location: "??", organizer: "??", capacity: "??", startCheckin: "?????", noEvent: "??????????????",
  back: "?????????", checkin: "??????", checkout: "???????", card: "????????", manual: "???????",
  readerReady: "???????????", waitingCard: "????????????", cardHint: "????????????????????",
  recent: "?????", time: "??", person: "???", method: "??", result: "??", cardMethod: "???", manualMethod: "??",
  name: "??", employeeId: "????", department: "??", group: "????", attendance: "????", checkinAt: "????", checkoutAt: "????",
  pending: "????", checkedIn: "????", checkedOut: "????", late: "??", absent: "??", leave: "??",
  expected: "????", arrived: "????", needsAction: "???", attendanceRate: "???", exportCsv: "CSV???????", empty: "?????????????",
  eventsTitle: "??????", eventsDesc: "??????????LMS????????????????", newEvent: "??????", browseEvents: "??????",
  selfEvent: "??????", selfEventDesc: "????????????????????????", lmsEvent: "LMS????", lmsEventDesc: "??????????????????????????",
  basicInfo: "????", modules: "???????", grouping: "??????", groupSize: "1??????", materials: "??", survey: "?????", earlyBird: "????", lottery: "??",
  eventName: "?????", date: "???", startTime: "????", endTime: "????", category: "??", learningMode: "??", audience: "???",
  materialName: "???", materialUrl: "?????", surveyUrl: "????????", earlyQuota: "????", earlyReward: "????", prizeName: "??", prizeQty: "??",
  saveEvent: "???????", importEvent: "LMS???????", readonly: "??????LMS?????????????", cancelEvent: "???????", cancelReason: "???????",
  materialsTitle: "????", materialsDesc: "??????????????????????????", resend: "??", resendAll: "?????", sent: "????", notSent: "???", failed: "????",
  surveyTitle: "???????", surveyDesc: "???????????????????????????", send: "??", sendAll: "????", autoScheduled: "???????????????",
  earlyTitle: "????", earlyDesc: "?????????????????????", eligible: "??", issued: "????", issue: "??", issueAll: "????",
  lotteryTitle: "??????", lotteryDesc: "??????????????????????", draw: "????", winners: "????", unassigned: "?????",
  reportsTitle: "???????", reportsDesc: "?????????????????????", liveRoster: "????????", markLeave: "?????", clearLeave: "?????",
  historyTitle: "??", historyDesc: "????????????????????????", selectHistory: "?????????",
  confirm: "??", cancel: "?????", save: "??", close: "???", retry: "???", language: "??", systemOnline: "??????",
  successCheckin: "??????????", successCheckout: "???????????", duplicateCheckin: "?????????????", duplicateCheckout: "??????????????",
  withoutCheckin: "???????????????", personNotFound: "???????????", eventUnavailable: "????????????????????", leaveOverride: "????????????????????",
  networkOffline: "????????????????????????", missingLink: "?????????????????", batchComplete: "???????????", teamsUnavailable: "Teams???????????",
};


Object.assign(zhTW, {
  caption: "企業活動智慧報到平台", functionality: "相關功能", management: "活動管理",
  navCheckin: "智慧報到", navHistory: "歷史紀錄", navEvents: "活動管理", navMaterials: "教材管理", navReports: "數據報表",
  navSurvey: "問卷發送", navEarlyBird: "早鳥福利", navLottery: "活動抽獎", operator: "活動管理員",
  checkinTitle: "選擇活動並開始報到", checkinDesc: "透過搜尋與篩選快速找到活動，再進入現場報到工作台。",
  searchEvent: "搜尋活動名稱", searchPerson: "輸入工號或姓名", allSources: "所有來源", allTypes: "所有類型", allStatuses: "所有狀態",
  sourceLms: "LMS 活動", sourceSelf: "自建活動", live: "進行中", upcoming: "即將開始", completed: "已結束", cancelled: "已取消", draft: "草稿",
  eventTime: "活動時間", location: "活動地點", organizer: "主辦單位", capacity: "人數上限", startCheckin: "開始報到", noEvent: "找不到符合條件的活動",
  back: "返回活動選擇", checkin: "Check-in 報到", checkout: "Check-out 簽退", card: "刷卡報到／簽退", manual: "人工報到／簽退",
  readerReady: "讀卡機已連線", waitingCard: "等待感應員工識別卡", cardHint: "完成感應後會立即顯示結果與組別資訊。",
  recent: "最近記錄", time: "時間", person: "人員", method: "方式", result: "結果", cardMethod: "刷卡", manualMethod: "人工",
  name: "姓名", employeeId: "工號", department: "部門", group: "組別", attendance: "出勤狀態", checkinAt: "報到時間", checkoutAt: "簽退時間",
  teams: "Teams", extension: "分機", action: "操作", pending: "待報到", checkedIn: "已報到", checkedOut: "已簽退", late: "遲到", absent: "未到", leave: "請假",
  expected: "應到", arrived: "已報到", needsAction: "需處理", attendanceRate: "出席率", exportCsv: "下載 CSV", empty: "目前沒有符合條件的資料",
  eventsTitle: "活動管理", eventsDesc: "LMS 活動會自動同步進來，你也可以新增自建活動，並彈性設定每場活動所需功能。", newEvent: "新增活動", browseEvents: "瀏覽現有活動",
  selfEvent: "自建活動", selfEventDesc: "自行填寫活動資料、匯入名單並設定需要的功能。", lmsEvent: "從 LMS 選擇", lmsEventDesc: "搜尋公司既有學習活動並帶入唯讀設定。",
  basicInfo: "基本資料", modules: "模組化功能", grouping: "需要分組", groupSize: "每組人數", materials: "教材", survey: "問卷", earlyBird: "早鳥福利", lottery: "抽獎",
  eventName: "活動名稱", date: "活動日期", startTime: "開始時間", endTime: "結束時間", category: "活動類型", learningMode: "授課形式", audience: "適用對象",
  materialName: "教材名稱", materialUrl: "教材連結", surveyUrl: "問卷連結", earlyQuota: "早鳥名額", earlyReward: "早鳥獎勵", prizeName: "獎項名稱", prizeQty: "數量",
  saveEvent: "儲存並啟用", importEvent: "加入此 LMS 活動", readonly: "此資料由 LMS 提供，無法在此編輯。", cancelEvent: "取消活動", cancelReason: "請填寫取消原因",
  materialsTitle: "教材管理", materialsDesc: "名單建立後即寄送教材；如有同仁未收到，可個別或批次重寄。", resend: "重寄", resendAll: "批次重寄全部", sent: "已寄送", notSent: "尚未寄送", failed: "寄送失敗",
  surveyTitle: "問卷發送", surveyDesc: "活動結束後自動寄送問卷給曾成功報到的同仁，也可手動發送。", send: "發送", sendAll: "全部發送", autoScheduled: "已排程於活動結束後自動發送",
  earlyTitle: "早鳥福利", earlyDesc: "資格僅依成功報到時間排序，不採用報名順序。", eligible: "符合資格", issued: "已發放", issue: "發放", issueAll: "全部發放",
  lotteryTitle: "活動抽獎", lotteryDesc: "一次完成所有獎項分配，且同一位參加者不會重複中獎。", draw: "開始抽獎", winners: "中獎名單", unassigned: "未分配獎項",
  reportsTitle: "數據報表", reportsDesc: "即時掌握出勤狀況，並快速聯絡尚未到場的同仁。", liveRoster: "即時名單", markLeave: "標記請假", clearLeave: "取消請假",
  historyTitle: "歷史紀錄", historyDesc: "查看已結束與已取消活動的人員報到、簽退及請假紀錄。", selectHistory: "選擇歷史活動",
  confirm: "確認", cancel: "取消", save: "儲存", close: "關閉", retry: "重試", language: "語言", systemOnline: "系統連線正常",
  successCheckin: "報到成功", successCheckout: "簽退成功", duplicateCheckin: "此人員已完成報到", duplicateCheckout: "此人員已完成簽退",
  withoutCheckin: "必須先報到才能簽退", personNotFound: "找不到符合的人員", eventUnavailable: "此活動無法使用或已取消", leaveOverride: "此人員目前為請假狀態，是否改為已報到？",
  networkOffline: "連線異常，請檢查網路後重試。", missingLink: "尚未設定有效連結。", batchComplete: "批次作業完成", teamsUnavailable: "沒有可用的 Teams 帳號"
});

Object.assign(zhCN, {
  ...zhTW, caption: "企业活动智能签到平台", functionality: "相关功能", management: "活动管理",
  navCheckin: "智能签到", navHistory: "历史记录", navEvents: "活动管理", navMaterials: "教材管理", navReports: "数据报表",
  navSurvey: "问卷发送", navEarlyBird: "早鸟福利", navLottery: "活动抽奖", operator: "活动管理员",
  checkinTitle: "选择活动并开始签到", checkinDesc: "通过搜索与筛选快速找到活动，再进入现场签到工作台。",
  searchEvent: "搜索活动名称", searchPerson: "输入工号或姓名", allSources: "所有来源", allTypes: "所有类型", allStatuses: "所有状态",
  sourceSelf: "自建活动", live: "进行中", upcoming: "即将开始", completed: "已结束", cancelled: "已取消",
  eventTime: "活动时间", location: "活动地点", organizer: "主办单位", capacity: "人数上限", startCheckin: "开始签到", noEvent: "找不到符合条件的活动",
  back: "返回活动选择", checkin: "Check-in 签到", checkout: "Check-out 签退", card: "刷卡签到／签退", manual: "人工签到／签退",
  readerReady: "读卡器已连接", waitingCard: "等待感应员工识别卡", cardHint: "完成感应后会立即显示结果与分组信息。",
  recent: "最近记录", department: "部门", group: "组别", attendance: "出勤状态", checkinAt: "签到时间", checkoutAt: "签退时间",
  pending: "待签到", checkedIn: "已签到", checkedOut: "已签退", expected: "应到", arrived: "已签到", needsAction: "需处理", exportCsv: "下载 CSV", empty: "目前没有符合条件的数据",
  eventsTitle: "活动管理", eventsDesc: "LMS 活动会自动同步进来，你也可以新增自建活动，并灵活设置每场活动所需功能。", newEvent: "新增活动", browseEvents: "浏览现有活动",
  selfEvent: "自建活动", selfEventDesc: "自行填写活动资料、导入名单并设置需要的功能。", lmsEvent: "从 LMS 选择", lmsEventDesc: "搜索公司现有学习活动并带入只读设置。",
  basicInfo: "基本资料", modules: "模块化功能", grouping: "需要分组", groupSize: "每组人数", eventName: "活动名称", date: "活动日期", startTime: "开始时间", endTime: "结束时间",
  saveEvent: "保存并启用", readonly: "此资料由 LMS 提供，无法在此编辑。", cancelEvent: "取消活动", cancelReason: "请填写取消原因",
  materialsTitle: "教材管理", materialsDesc: "名单建立后即发送教材；如有同事未收到，可单独或批量重发。", resend: "重发", resendAll: "批量重发全部", sent: "已发送", notSent: "尚未发送", failed: "发送失败",
  surveyTitle: "问卷发送", surveyDesc: "活动结束后自动发送问卷给曾成功签到的同事，也可手动发送。", send: "发送", sendAll: "全部发送",
  reportsTitle: "数据报表", reportsDesc: "实时掌握出勤情况，并快速联系尚未到场的同事。", liveRoster: "实时名单", markLeave: "标记请假", clearLeave: "取消请假",
  historyTitle: "历史记录", historyDesc: "查看已结束与已取消活动的签到、签退及请假记录。", selectHistory: "选择历史活动",
  systemOnline: "系统连接正常", successCheckin: "签到成功", successCheckout: "签退成功", duplicateCheckin: "此人员已完成签到", duplicateCheckout: "此人员已完成签退",
  withoutCheckin: "必须先签到才能签退", personNotFound: "找不到符合的人员", eventUnavailable: "此活动不可用或已取消", networkOffline: "连接异常，请检查网络后重试。", batchComplete: "批量操作完成"
});

Object.assign(ja, {
  caption: "企業イベント受付プラットフォーム", functionality: "機能", management: "管理",
  navCheckin: "スマート受付", navHistory: "履歴", navEvents: "イベント管理", navMaterials: "教材管理", navReports: "データレポート",
  navSurvey: "アンケート送信", navEarlyBird: "早期特典", navLottery: "抽選", operator: "イベント管理者",
  checkinTitle: "イベントを選択して受付を開始", checkinDesc: "検索とフィルターでイベントを見つけ、当日の受付画面を開きます。",
  searchEvent: "イベント名を検索", searchPerson: "社員番号または氏名", allSources: "すべてのソース", allTypes: "すべての種類", allStatuses: "すべての状態",
  sourceLms: "LMS イベント", sourceSelf: "自主作成", live: "開催中", upcoming: "開催予定", completed: "終了", cancelled: "中止", draft: "下書き",
  eventTime: "開催時間", location: "会場", organizer: "主催者", capacity: "定員", startCheckin: "受付を開始", noEvent: "該当するイベントがありません",
  back: "イベント選択に戻る", checkin: "チェックイン", checkout: "チェックアウト", card: "カード受付／退出", manual: "手動受付／退出",
  readerReady: "カードリーダー接続済み", waitingCard: "社員証をかざしてください", cardHint: "読み取り後、結果とグループをすぐに表示します。",
  recent: "最近の記録", time: "時刻", person: "参加者", method: "方法", result: "結果", cardMethod: "カード", manualMethod: "手動",
  name: "氏名", employeeId: "社員番号", department: "部署", group: "グループ", attendance: "出席状況", checkinAt: "受付時刻", checkoutAt: "退出時刻", extension: "内線", action: "操作",
  pending: "未受付", checkedIn: "受付済み", checkedOut: "退出済み", late: "遅刻", absent: "欠席", leave: "休暇", expected: "予定人数", arrived: "受付済み", needsAction: "要対応", attendanceRate: "出席率", exportCsv: "CSV をダウンロード", empty: "該当するデータがありません",
  eventsTitle: "イベント管理", eventsDesc: "LMS イベントは自動で同期され、自主作成イベントの追加と機能設定も行えます。", newEvent: "イベントを追加", browseEvents: "既存イベントを見る",
  selfEvent: "自主作成イベント", selfEventDesc: "イベント情報と参加者名簿を入力し、必要な機能を設定します。", lmsEvent: "LMS から選択", lmsEventDesc: "社内学習イベントを検索し、読み取り専用の設定を取り込みます。",
  basicInfo: "基本情報", modules: "機能モジュール", grouping: "グループ分け", groupSize: "1 グループの人数", materials: "教材", survey: "アンケート", earlyBird: "早期特典", lottery: "抽選",
  eventName: "イベント名", date: "開催日", startTime: "開始時刻", endTime: "終了時刻", category: "イベント種類", learningMode: "受講形式", audience: "対象者",
  saveEvent: "保存して有効化", readonly: "このデータは LMS 提供のため編集できません。", cancelEvent: "イベントを中止", cancelReason: "中止理由を入力してください",
  materialsTitle: "教材管理", materialsDesc: "必要に応じて教材を個別または一括で再送できます。", resend: "再送", resendAll: "全員に再送", sent: "送信済み", notSent: "未送信", failed: "送信失敗",
  surveyTitle: "アンケート送信", surveyDesc: "終了時刻後、チェックイン済みの参加者に自動送信します。", send: "送信", sendAll: "全員に送信", autoScheduled: "イベント終了後の自動送信を予約済み",
  earlyTitle: "早期特典", earlyDesc: "チェックイン成功時刻の早い順に対象者を決定します。", eligible: "対象", issued: "配布済み", issue: "配布", issueAll: "すべて配布",
  lotteryTitle: "イベント抽選", lotteryDesc: "チェックイン済み参加者に賞品を重複なしで割り当てます。", draw: "抽選開始", winners: "当選者", unassigned: "未割当の賞品",
  reportsTitle: "データレポート", reportsDesc: "出席状況をリアルタイムで確認し、未到着の参加者へ連絡できます。", liveRoster: "リアルタイム名簿", markLeave: "休暇に設定", clearLeave: "休暇を解除",
  historyTitle: "履歴", historyDesc: "終了・中止イベントの受付、退出、休暇記録を確認します。", selectHistory: "履歴イベントを選択",
  confirm: "確認", cancel: "キャンセル", save: "保存", close: "閉じる", retry: "再試行", language: "言語", systemOnline: "システム接続中",
  successCheckin: "チェックインしました", successCheckout: "チェックアウトしました", duplicateCheckin: "すでにチェックイン済みです", duplicateCheckout: "すでにチェックアウト済みです",
  withoutCheckin: "先にチェックインしてください", personNotFound: "該当する参加者がいません", eventUnavailable: "このイベントは利用できないか中止されています", networkOffline: "接続できません。ネットワークを確認してください。", batchComplete: "一括処理が完了しました"
});


Object.assign(en, {
  rosterTitle: "Participant roster", rosterDesc: "Choose a demo roster or upload a CSV file.", lmsRosterDesc: "The participant roster will be provided automatically by LMS.",
  lmsRosterReady: "LMS roster ready", peopleUnit: "people", demoRosterFull: "Demo roster · Full", demoRosterSmall: "Demo roster · Small", uploadCsv: "Upload CSV",
  rosterFormatError: "CSV must include employee_id and name columns.", rosterEmpty: "The CSV contains no participants.", rosterReadError: "Unable to read this roster file.",
  requiredFields: "Please complete all required event information.", lmsBasicReadonly: "Basic event information is supplied by LMS and is read-only.",
  lmsBasicDesc: "Review the LMS event information, then configure grouping and capability modules.", groupingDesc: "Create balanced groups from the selected participant roster.",
  modulesDesc: "Select only the capabilities required for this event.", createEvent: "Create event", lmsSelectHint: "Select this event to continue configuring it.",
  lmsProvidedInfo: "Provided by LMS", alreadyManaged: "Already added", viewEvent: "View event details", sourceLabel: "Source",
  enabled: "Enabled", disabled: "Not enabled", noModules: "No modules enabled", noRecords: "No recent activity"
});
Object.assign(zhTW, {
  rosterTitle: "參加者名單", rosterDesc: "選擇模擬名單，或上傳 CSV 名單檔案。", lmsRosterDesc: "此活動的參加者名單將由 LMS 自動提供。",
  lmsRosterReady: "LMS 名單已準備", peopleUnit: "人", demoRosterFull: "模擬名單（完整）", demoRosterSmall: "模擬名單（精簡）", uploadCsv: "上傳 CSV 名單",
  rosterFormatError: "CSV 必須包含 employee_id 與 name 欄位。", rosterEmpty: "CSV 中沒有可用的參加者資料。", rosterReadError: "無法讀取此名單檔案。",
  requiredFields: "請完整填寫所有必填活動資訊。", lmsBasicReadonly: "活動基本資料由 LMS 提供，此區僅供檢視。",
  lmsBasicDesc: "確認 LMS 活動資訊後，再設定分組與模組功能。", groupingDesc: "依所選名單自動平均分組，避免各組人數差距過大。",
  modulesDesc: "依活動需求選擇需要啟用的功能。", createEvent: "新增活動", lmsSelectHint: "選擇此活動後，繼續設定分組與模組功能。",
  lmsProvidedInfo: "LMS 將提供", alreadyManaged: "已新增", viewEvent: "檢視活動資訊", sourceLabel: "活動來源",
  enabled: "已啟用", disabled: "未啟用", noModules: "未啟用任何模組", noRecords: "目前沒有最近記錄"
});
Object.assign(zhCN, {
  rosterTitle: "参与者名单", rosterDesc: "选择模拟名单，或上传 CSV 名单文件。", lmsRosterDesc: "此活动的参与者名单将由 LMS 自动提供。",
  lmsRosterReady: "LMS 名单已准备", peopleUnit: "人", demoRosterFull: "模拟名单（完整）", demoRosterSmall: "模拟名单（精简）", uploadCsv: "上传 CSV 名单",
  rosterFormatError: "CSV 必须包含 employee_id 与 name 字段。", rosterEmpty: "CSV 中没有可用的参与者数据。", rosterReadError: "无法读取此名单文件。",
  requiredFields: "请完整填写所有必填活动信息。", lmsBasicReadonly: "活动基本资料由 LMS 提供，此区域仅供查看。",
  lmsBasicDesc: "确认 LMS 活动信息后，再设置分组与模块功能。", groupingDesc: "根据所选名单自动平均分组。",
  modulesDesc: "根据活动需求选择需要启用的功能。", createEvent: "新增活动", lmsSelectHint: "选择此活动后，继续设置分组与模块功能。",
  lmsProvidedInfo: "LMS 将提供", alreadyManaged: "已新增", viewEvent: "查看活动信息", sourceLabel: "活动来源",
  enabled: "已启用", disabled: "未启用", noModules: "未启用任何模块", noRecords: "目前没有最近记录"
});
Object.assign(ja, {
  rosterTitle: "参加者名簿", rosterDesc: "デモ名簿を選択するか、CSV ファイルをアップロードします。", lmsRosterDesc: "参加者名簿は LMS から自動的に提供されます。",
  lmsRosterReady: "LMS 名簿準備完了", peopleUnit: "名", demoRosterFull: "デモ名簿（全員）", demoRosterSmall: "デモ名簿（少人数）", uploadCsv: "CSV をアップロード",
  rosterFormatError: "CSV には employee_id と name 列が必要です。", rosterEmpty: "CSV に参加者データがありません。", rosterReadError: "名簿ファイルを読み取れません。",
  requiredFields: "必須のイベント情報を入力してください。", lmsBasicReadonly: "イベント基本情報は LMS 提供のため閲覧のみです。",
  lmsBasicDesc: "LMS 情報を確認し、グループ分けと機能を設定します。", groupingDesc: "選択した名簿から均等にグループを作成します。",
  modulesDesc: "このイベントで必要な機能のみ選択します。", createEvent: "イベントを追加", lmsSelectHint: "このイベントを選択して設定を続けます。",
  lmsProvidedInfo: "LMS 提供", alreadyManaged: "追加済み", viewEvent: "イベント情報を見る", sourceLabel: "ソース",
  enabled: "有効", disabled: "無効", noModules: "有効な機能はありません", noRecords: "最近の記録はありません"
});


Object.assign(en, {
  selectEventPrompt: "Select an event",
  downloadRosterTemplate: "Download roster template"
});
Object.assign(zhTW, {
  selectEventPrompt: "請先選擇活動",
  downloadRosterTemplate: "下載名單範本"
});
Object.assign(zhCN, {
  selectEventPrompt: "请先选择活动",
  downloadRosterTemplate: "下载名单模板"
});
Object.assign(ja, {
  selectEventPrompt: "イベントを選択してください",
  downloadRosterTemplate: "名簿テンプレートをダウンロード"
});

Object.assign(en, { cancelEvent: "Delete event" });
Object.assign(zhTW, { cancelEvent: "刪除活動" });
Object.assign(zhCN, { cancelEvent: "删除活动" });
Object.assign(ja, { cancelEvent: "イベントを削除" });

Object.assign(en, { filters: "Filters", eventMonth: "Event month", allMonths: "All months", dateFrom: "From", dateTo: "To", eventsUnit: "events", clearFilters: "Clear", invalidDateRange: "The start date must not be later than the end date." });
Object.assign(zhTW, { filters: "篩選", eventMonth: "活動月份", allMonths: "所有月份", dateFrom: "開始日期", dateTo: "結束日期", eventsUnit: "個活動", clearFilters: "清除條件", invalidDateRange: "開始日期不可晚於結束日期。" });
Object.assign(zhCN, { filters: "筛选", eventMonth: "活动月份", allMonths: "所有月份", dateFrom: "开始日期", dateTo: "结束日期", eventsUnit: "个活动", clearFilters: "清除条件", invalidDateRange: "开始日期不能晚于结束日期。" });
Object.assign(ja, { filters: "絞り込み", eventMonth: "開催月", allMonths: "すべての月", dateFrom: "開始日", dateTo: "終了日", eventsUnit: "件", clearFilters: "条件をクリア", invalidDateRange: "開始日は終了日より前にしてください。" });

Object.assign(en, { selectFiltered: "Select filtered results", sendSelected: "Send to selected", selectRecipient: "Select", partialDelivery: "Partially completed", invalidEmail: "Invalid email", missingEmail: "No email" });
Object.assign(zhTW, { selectFiltered: "勾選篩選結果", sendSelected: "發送給已選人員", selectRecipient: "選取", partialDelivery: "部分發送完成", invalidEmail: "Email 格式無效", missingEmail: "沒有 Email" });
Object.assign(zhCN, { selectFiltered: "勾选筛选结果", sendSelected: "发送给已选人员", selectRecipient: "选择", partialDelivery: "部分发送完成", invalidEmail: "Email 格式无效", missingEmail: "没有 Email" });
Object.assign(ja, { selectFiltered: "絞り込み結果を選択", sendSelected: "選択した人に送信", selectRecipient: "選択", partialDelivery: "一部送信完了", invalidEmail: "メールアドレスが無効です", missingEmail: "メールなし" });
Object.assign(en, { surveyLocked: "Survey delivery is not available yet", surveyReady: "Survey delivery is available", surveyUnlockAt: "Available at", noSurveyRecipients: "No eligible survey recipients", deliveryFailed: "Delivery failed" });
Object.assign(zhTW, { surveyLocked: "問卷尚未開放發送", surveyReady: "問卷可以發送", surveyUnlockAt: "開放時間", noSurveyRecipients: "目前沒有符合資格的問卷收件人", deliveryFailed: "發送失敗" });
Object.assign(zhCN, { surveyLocked: "问卷尚未开放发送", surveyReady: "问卷可以发送", surveyUnlockAt: "开放时间", noSurveyRecipients: "目前没有符合资格的问卷收件人", deliveryFailed: "发送失败" });
Object.assign(ja, { surveyLocked: "アンケート送信はまだ利用できません", surveyReady: "アンケートを送信できます", surveyUnlockAt: "利用開始", noSurveyRecipients: "対象となる回答者がいません", deliveryFailed: "送信に失敗しました" });
Object.assign(en, { extension: "Extension", action: "Action" });
Object.assign(zhCN, { language: "语言" });

/* wording, ownership, single-date filtering, roster preview, modular prizes */
Object.assign(en, {
  capacity: "Participants", organizer: "Contact person", eventCreator: "Event creator", eventDescription: "Event description",
  grouping: "Event grouping", groupingToggle: "Group participants", groupingToggleDesc: "When enabled, the participant roster must include a group column and be grouped before upload.",
  groupingOn: "Grouping enabled", groupingOff: "No grouping",
  filterDate: "Event date", allDates: "All dates", today: "Today",
  rosterDesc: "Use the demo roster or upload a CSV. Uploaded data can be previewed and downloaded.",
  lmsRosterDesc: "The LMS roster is loaded into this system. Preview it, download it, or upload a replacement.",
  lmsRosterLoaded: "LMS roster loaded", demoRosterFull: "Demo roster (12 people)", replaceRoster: "Upload another roster",
  downloadRoster: "Download roster", rosterPreview: "Roster preview", rosterEmptyPreview: "No participants yet",
  rosterGroupColumnRequired: "Grouping is enabled, so the CSV must include a group column.",
  rosterGroupValueRequired: "Grouping is enabled, so every participant needs a group value.",
  rosterGroupMissing: "Some participants have no group yet. Complete the roster before creating the event.",
  ungrouped: "Ungrouped",
  prizeCount: "Number of prizes", addPrize: "Add prize", removePrize: "Remove prize", prizeQty: "Winners to draw",
  prizeSetupDesc: "Decide how many prizes this event has, then name each prize and set how many winners to draw.",
  prizeRequired: "Enter a name and a winner count for every prize.",
  drawAgain: "Draw again", lotteryReady: "Ready to draw",
  attendanceMode: "Attendance mode", modeCheckinActive: "Check-in mode", modeCheckoutActive: "Check-out mode",
  checkinModeHint: "Tap a card or search a person to check them in.", checkoutModeHint: "Tap a card or search a person to check them out.",
  surveyAfterOnly: "Sent after the event ends",
});
Object.assign(zhTW, {
  capacity: "參加人數", organizer: "聯絡人", eventCreator: "活動建立人", eventDescription: "活動說明",
  grouping: "活動分組", groupingToggle: "是否需要分組", groupingToggleDesc: "啟用後，參加者名單需包含「組別」欄位，請於上傳前先分好組。",
  groupingOn: "需要分組", groupingOff: "不分組",
  filterDate: "活動日期", allDates: "所有日期", today: "今天",
  rosterDesc: "使用模擬名單或上傳 CSV 名單，上傳後可預覽與下載。",
  lmsRosterDesc: "LMS 名單已載入系統，可預覽、下載，也可上傳新名單覆蓋。",
  lmsRosterLoaded: "已載入 LMS 名單", demoRosterFull: "模擬名單（12 人）", replaceRoster: "重新上傳名單",
  downloadRoster: "下載名單", rosterPreview: "名單預覽", rosterEmptyPreview: "目前沒有參加者資料",
  rosterGroupColumnRequired: "已啟用分組，CSV 必須包含 group 欄位。",
  rosterGroupValueRequired: "已啟用分組，每位參加者都必須填寫組別。",
  rosterGroupMissing: "尚有參加者未填寫組別，請補齊後再建立活動。",
  ungrouped: "未分組",
  prizeCount: "獎項數量", addPrize: "新增獎項", removePrize: "移除獎項", prizeQty: "抽出人數",
  prizeSetupDesc: "自行決定本場活動要有幾個獎項，再填寫每個獎項的名稱與抽出人數。",
  prizeRequired: "請填寫每個獎項的名稱與抽出人數。",
  drawAgain: "重新抽獎", lotteryReady: "準備抽獎",
  attendanceMode: "報到模式", modeCheckinActive: "目前為報到模式", modeCheckoutActive: "目前為簽退模式",
  checkinModeHint: "感應識別卡或搜尋人員即可完成報到。", checkoutModeHint: "感應識別卡或搜尋人員即可完成簽退。",
  surveyAfterOnly: "活動結束後發送",
});
Object.assign(zhCN, {
  capacity: "参加人数", organizer: "联系人", eventCreator: "活动创建人", eventDescription: "活动说明",
  grouping: "活动分组", groupingToggle: "是否需要分组", groupingToggleDesc: "启用后，参与者名单需包含「组别」字段，请于上传前先分好组。",
  groupingOn: "需要分组", groupingOff: "不分组",
  filterDate: "活动日期", allDates: "所有日期", today: "今天",
  rosterDesc: "使用模拟名单或上传 CSV 名单，上传后可预览与下载。",
  lmsRosterDesc: "LMS 名单已载入系统，可预览、下载，也可上传新名单覆盖。",
  lmsRosterLoaded: "已载入 LMS 名单", demoRosterFull: "模拟名单（12 人）", replaceRoster: "重新上传名单",
  downloadRoster: "下载名单", rosterPreview: "名单预览", rosterEmptyPreview: "目前没有参与者数据",
  rosterGroupColumnRequired: "已启用分组，CSV 必须包含 group 字段。",
  rosterGroupValueRequired: "已启用分组，每位参与者都必须填写组别。",
  rosterGroupMissing: "尚有参与者未填写组别，请补齐后再创建活动。",
  ungrouped: "未分组",
  prizeCount: "奖项数量", addPrize: "新增奖项", removePrize: "移除奖项", prizeQty: "抽出人数",
  prizeSetupDesc: "自行决定本场活动要有几个奖项，再填写每个奖项的名称与抽出人数。",
  prizeRequired: "请填写每个奖项的名称与抽出人数。",
  drawAgain: "重新抽奖", lotteryReady: "准备抽奖",
  attendanceMode: "签到模式", modeCheckinActive: "目前为签到模式", modeCheckoutActive: "目前为签退模式",
  checkinModeHint: "感应识别卡或搜索人员即可完成签到。", checkoutModeHint: "感应识别卡或搜索人员即可完成签退。",
  surveyAfterOnly: "活动结束后发送",
});
Object.assign(ja, {
  capacity: "参加人数", organizer: "連絡担当者", eventCreator: "イベント作成者", eventDescription: "イベント説明",
  grouping: "グループ分け", groupingToggle: "グループ分けの要否", groupingToggleDesc: "有効にすると、参加者名簿に「group」列が必要です。アップロード前にグループを決めてください。",
  groupingOn: "グループあり", groupingOff: "グループなし",
  filterDate: "開催日", allDates: "すべての日付", today: "今日",
  rosterDesc: "デモ名簿を使うか、CSV をアップロードします。アップロード後にプレビューとダウンロードができます。",
  lmsRosterDesc: "LMS 名簿をシステムに取り込みました。プレビュー・ダウンロード・再アップロードができます。",
  lmsRosterLoaded: "LMS 名簿を読み込み済み", demoRosterFull: "デモ名簿（12 名）", replaceRoster: "名簿を再アップロード",
  downloadRoster: "名簿をダウンロード", rosterPreview: "名簿プレビュー", rosterEmptyPreview: "参加者データがありません",
  rosterGroupColumnRequired: "グループ分けが有効です。CSV に group 列が必要です。",
  rosterGroupValueRequired: "グループ分けが有効です。全参加者にグループを入力してください。",
  rosterGroupMissing: "グループ未設定の参加者がいます。入力してからイベントを作成してください。",
  ungrouped: "未設定",
  prizeCount: "賞品の数", addPrize: "賞品を追加", removePrize: "削除", prizeQty: "当選人数",
  prizeSetupDesc: "賞品の数を決めてから、各賞品の名称と当選人数を入力します。",
  prizeRequired: "各賞品の名称と当選人数を入力してください。",
  drawAgain: "もう一度抽選", lotteryReady: "抽選の準備完了",
  attendanceMode: "受付モード", modeCheckinActive: "現在チェックインモード", modeCheckoutActive: "現在チェックアウトモード",
  checkinModeHint: "カードをかざすか参加者を検索してチェックインします。", checkoutModeHint: "カードをかざすか参加者を検索してチェックアウトします。",
  surveyAfterOnly: "イベント終了後に送信",
});

/* contact = creator, module names aligned with the navigation, survey attendance summary */
Object.assign(en, {
  notIssued: "Not issued yet",
  contactExtension: "Contact extension", contactExtensionHint: "Filled in automatically from the event creator's extension.",
  survey: "Survey delivery", lottery: "Event lottery", surveyRecipients: "Survey recipients",
});
Object.assign(zhTW, {
  notIssued: "尚未發放",
  contactExtension: "聯絡分機", contactExtensionHint: "自動帶入活動建立人的分機號碼。",
  survey: "問卷發送", lottery: "活動抽獎", surveyRecipients: "可發送人數",
});
Object.assign(zhCN, {
  notIssued: "尚未发放",
  contactExtension: "联系分机", contactExtensionHint: "自动带入活动创建人的分机号码。",
  survey: "问卷发送", lottery: "活动抽奖", surveyRecipients: "可发送人数",
});
/* instructor details, roster sync, completion tracking and range exports */
Object.assign(en, {
  currentRoster: "Current roster",
  editEvent: "Edit event", saveChanges: "Save changes", eventUpdated: "Event updated", selectedCount: "selected", selectAllEvents: "Select every event listed",
  instructor: "Instructor", totalHours: "Total hours", deputy: "Deputy contact", hoursUnit: "h",
  registeredCount: "Registered participants", registeredCountHint: "Follows the roster, so it always matches the report KPIs.",
  refreshRoster: "Sync roster from LMS", rosterSynced: "Roster is up to date", rosterAdded: "new registrations added", rosterSyncedAt: "Last synced",
  completed: "Completed", incomplete: "Not completed", attendedHours: "Attended hours", requiredHours: "Required hours",
  completionRule: "Completion needs at least 80% of the total hours.",
  award: "Award", awardStatus: "Award", awarded: "Won", notAwarded: "Not won", markAward: "Mark as won", clearAward: "Clear award",
  rangeExport: "Download range as Excel", rangeExportHint: "One Excel file per event, named after the event. Several events download as a single ZIP.",
  rangeFrom: "From", rangeTo: "To", rangeExportEmpty: "No events in this date range", rangeExportDone: "Excel files generated",
  exportCsv: "Download Excel", newEventCta: "New event", backToEvents: "Back to the event list",
});
Object.assign(zhTW, {
  currentRoster: "目前名單",
  editEvent: "編輯活動", saveChanges: "儲存修改", eventUpdated: "活動已更新", selectedCount: "已選取", selectAllEvents: "選取列表中所有活動",
  instructor: "講師", totalHours: "課程總時數", deputy: "代理人", hoursUnit: "小時",
  registeredCount: "參加人數", registeredCountHint: "依名單人數自動計算，與數據報表的應到人數一致。",
  refreshRoster: "從 LMS 更新名單", rosterSynced: "名單已是最新", rosterAdded: "位新報名者", rosterSyncedAt: "最後更新",
  completed: "已完訓", incomplete: "未完訓", attendedHours: "實際時數", requiredHours: "應達時數",
  completionRule: "完訓標準為實際參與時數達課程總時數的 80%。",
  award: "中獎", awardStatus: "中獎狀態", awarded: "已中獎", notAwarded: "未中獎", markAward: "標記中獎", clearAward: "取消中獎",
  rangeExport: "下載區間報表（Excel）", rangeExportHint: "區間內每場活動各產生一個 Excel 檔，並以活動名稱命名；多場活動會打包成一個 ZIP 下載。",
  rangeFrom: "起始日期", rangeTo: "結束日期", rangeExportEmpty: "此日期區間沒有活動", rangeExportDone: "已產生 Excel 報表",
  exportCsv: "下載 Excel", newEventCta: "新增活動", backToEvents: "返回活動列表",
});
Object.assign(zhCN, {
  currentRoster: "当前名单",
  editEvent: "编辑活动", saveChanges: "保存修改", eventUpdated: "活动已更新", selectedCount: "已选取", selectAllEvents: "选取列表中所有活动",
  instructor: "讲师", totalHours: "课程总时数", deputy: "代理人", hoursUnit: "小时",
  registeredCount: "参加人数", registeredCountHint: "按名单人数自动计算，与数据报表的应到人数一致。",
  refreshRoster: "从 LMS 更新名单", rosterSynced: "名单已是最新", rosterAdded: "位新报名者", rosterSyncedAt: "最后更新",
  completed: "已完训", incomplete: "未完训", attendedHours: "实际时数", requiredHours: "应达时数",
  completionRule: "完训标准为实际参与时数达课程总时数的 80%。",
  award: "中奖", awardStatus: "中奖状态", awarded: "已中奖", notAwarded: "未中奖", markAward: "标记中奖", clearAward: "取消中奖",
  rangeExport: "下载区间报表（Excel）", rangeExportHint: "区间内每场活动各生成一个 Excel 文件，并以活动名称命名；多场活动会打包成一个 ZIP 下载。",
  rangeFrom: "起始日期", rangeTo: "结束日期", rangeExportEmpty: "此日期区间没有活动", rangeExportDone: "已生成 Excel 报表",
  exportCsv: "下载 Excel", newEventCta: "新增活动", backToEvents: "返回活动列表",
});
Object.assign(ja, {
  currentRoster: "現在の名簿",
  editEvent: "イベントを編集", saveChanges: "変更を保存", eventUpdated: "イベントを更新しました", selectedCount: "件選択", selectAllEvents: "表示中のイベントをすべて選択",
  instructor: "講師", totalHours: "総時間数", deputy: "代理担当者", hoursUnit: "時間",
  registeredCount: "参加人数", registeredCountHint: "名簿の人数から自動計算し、レポートの予定人数と一致します。",
  refreshRoster: "LMS から名簿を更新", rosterSynced: "名簿は最新です", rosterAdded: "名の新規申込", rosterSyncedAt: "最終更新",
  completed: "修了", incomplete: "未修了", attendedHours: "受講時間", requiredHours: "必要時間",
  completionRule: "総時間数の 80% 以上の受講で修了となります。",
  award: "当選", awardStatus: "当選状況", awarded: "当選", notAwarded: "未当選", markAward: "当選にする", clearAward: "当選を解除",
  rangeExport: "期間レポートを Excel で出力", rangeExportHint: "期間内のイベントごとにイベント名の Excel を作成し、複数件は ZIP でまとめてダウンロードします。",
  rangeFrom: "開始日", rangeTo: "終了日", rangeExportEmpty: "この期間にイベントはありません", rangeExportDone: "Excel レポートを作成しました",
  exportCsv: "Excel をダウンロード", newEventCta: "イベントを追加", backToEvents: "イベント一覧に戻る",
});

Object.assign(ja, {
  notIssued: "未配布",
  contactExtension: "連絡内線", contactExtensionHint: "イベント作成者の内線番号を自動で入力します。",
  survey: "アンケート送信", lottery: "イベント抽選", surveyRecipients: "送信対象",
});
Object.assign(ja, { teamsUnavailable: "Teams アカウントがありません", leaveOverride: "休暇登録済みです。チェックインで上書きしますか？", missingLink: "必要なリンクがありません。", materialName: "教材名", materialUrl: "教材リンク", earlyQuota: "早期特典枠", earlyReward: "早期特典", prizeName: "賞品名", prizeQty: "数量", surveyUrl: "アンケートリンク" });
for (const dictionary of [zhTW, zhCN, ja]) {
  for (const [key, value] of Object.entries(dictionary)) {
    if (typeof value === "string" && /\?{2,}/.test(value)) dictionary[key] = en[key] ?? key;
  }
}

const dictionaries = { "zh-TW": zhTW, "zh-CN": zhCN, en, ja };

export function applyDocumentLanguage(documentLike, language) {
  const supported = languages.some((item) => item.id === language) ? language : "zh-TW";
  if (documentLike?.documentElement) documentLike.documentElement.lang = supported;
}

export function createTranslator(language) {
  return (key) => dictionaries[language]?.[key] ?? zhTW[key] ?? key;
}

export function localize(value, language) {
  if (value == null) return "—";
  if (typeof value === "string" || typeof value === "number") return String(value);
  const candidates = [value[language], value["zh-TW"], value.en, value["zh-CN"], value.ja, ...Object.values(value)];
  return candidates.find((item) => item != null && !(typeof item === "string" && /\?{2,}/.test(item))) ?? "—";
}

export function formatDate(value, language, includeTime = true) {
  if (!value) return "—";
  const locale = { "zh-TW": "zh-TW", "zh-CN": "zh-CN", en: "en-US", ja: "ja-JP" }[language] || "zh-TW";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: includeTime ? "short" : undefined }).format(new Date(value));
}
