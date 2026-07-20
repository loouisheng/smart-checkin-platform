# Event Check-In 活動管理與寄送功能增強實作計畫

> **For Codex:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Follow `superpowers:test-driven-development` for every production-code change and `superpowers:verification-before-completion` before reporting completion.

**Goal:** 在既有 React 18 + Vite 專案中，加入共用活動搜尋器、自建活動分組模式、LMS 外部名單、教材勾選批次寄送、問卷前後時機，以及課程建立人、描述與日期搜尋。

**Architecture:** 保留 React Context 作為單一狀態來源。純業務規則放入 `src/v3/domain.js` 並以既有 Node 測試覆蓋；共用活動搜尋介面抽成 `src/v3/EventPicker.jsx`。活動建立與 LMS 邊界由 `EventManagementPage.jsx` 處理，寄送流程由 `OperationsPages.jsx` 呈現並透過 `context.jsx` 驗證後寫入。

**Tech Stack:** React 18、Vite、JSX、React Context、lucide-react、Node `assert` 測試。

**Design spec:** `docs/superpowers/specs/2026-07-20-event-management-delivery-enhancements-design.md`

---

## Task 1：建立活動篩選與日期規則

**Files:**

- Modify: `tests/v3-tests.mjs`
- Modify: `src/v3/domain.js`

### Step 1：寫活動篩選失敗測試

在 `tests/v3-tests.mjs` 匯入 `filterEvents`，加入同時涵蓋名稱、來源、類型、狀態、月份、日期區間、模組及歷史限制的 fixture：

```js
const filterFixtures = [
  { id: "E1", title: { en: "July Leadership" }, source: "lms", category: "leadership", status: "completed", date: "2026-07-12", modules: { survey: true } },
  { id: "E2", title: { en: "August AI" }, source: "self", category: "digital", status: "upcoming", date: "2026-08-03", modules: { survey: false } },
];

assert.deepEqual(filterEvents(filterFixtures, { query: "leadership" }).map(({ id }) => id), ["E1"]);
assert.deepEqual(filterEvents(filterFixtures, { month: "2026-07" }).map(({ id }) => id), ["E1"]);
assert.deepEqual(filterEvents(filterFixtures, { dateFrom: "2026-08-01", dateTo: "2026-08-31" }).map(({ id }) => id), ["E2"]);
assert.deepEqual(filterEvents(filterFixtures, { module: "survey" }).map(({ id }) => id), ["E1"]);
assert.deepEqual(filterEvents(filterFixtures, { includeHistory: true }).map(({ id }) => id), ["E1"]);
assert.throws(() => filterEvents(filterFixtures, { dateFrom: "2026-08-31", dateTo: "2026-08-01" }), /INVALID_DATE_RANGE/);
```

### Step 2：確認測試因缺少函式而失敗

Run: `npm test`

Expected: FAIL，指出 `filterEvents` 尚未匯出。

### Step 3：實作最小篩選函式

在 `src/v3/domain.js` 新增：

```js
export function filterEvents(events, filters = {}) {
  // Normalize query once, reject reversed ranges, filter without mutating input,
  // then sort by date and startTime.
}
```

規則：

- 搜尋所有語言的活動名稱。
- `all`、空字串與未提供條件視為不限。
- `module` 只保留相應模組啟用的活動。
- `includeHistory` 只保留 `completed`／`cancelled`；一般選擇器排除 `cancelled`。
- 日期包含邊界，結果按日期與開始時間排序。

### Step 4：確認測試通過

Run: `npm test`

Expected: PASS。

### Step 5：提交

```bash
git add tests/v3-tests.mjs src/v3/domain.js
git commit -m "feat: add shared event filtering rules"
```

## Task 2：擴充標準 Event 與 LMS mock payload

**Files:**

- Modify: `tests/v3-tests.mjs`
- Modify: `src/v3/data.js`
- Modify: `src/v3/context.jsx`

### Step 1：寫模型正規化失敗測試

先在 `tests/v3-tests.mjs` 為 `normalizeEvent` 建立測試，驗證舊資料可安全取得預設值，LMS payload 則保留來源設定：

```js
const normalized = normalizeEvent({ id: "SELF-1", source: "self", grouping: { enabled: true, targetSize: 4 }, survey: { url: "https://forms.example/x" } });
assert.equal(normalized.grouping.mode, "automatic");
assert.equal(normalized.survey.timing, "after");
assert.equal(normalized.rosterUrl, null);
```

### Step 2：確認測試失敗

Run: `npm test`

Expected: FAIL，`normalizeEvent` 不存在。

### Step 3：實作 `normalizeEvent`

在 `src/v3/domain.js` 新增不改動輸入物件的正規化函式，將舊 `grouping.enabled` 相容轉換為 `grouping.mode`，並補上 `creator`、`description`、`rosterUrl`、`grouping.assignments` 與 `survey.timing` 預設值。

### Step 4：更新 seed 與 LMS catalog

在 `src/v3/data.js`：

- 每個活動補上四語 `creator` 與 `description`。
- LMS 活動與 catalog 補上合法 `rosterUrl`。
- 分組改為 `{ mode, targetSize, assignments }`。
- 問卷補上 `timing: "before" | "after"`。
- `assignRoster` 只在 `mode === "automatic"` 時執行平均分組；LMS mock 可直接提供既有 `group`。

### Step 5：讓 Context 寫入新模型

在 `src/v3/context.jsx`：

- 初始化 events 時呼叫 `normalizeEvent`。
- `saveSelfEvent` 寫入 `creator`、多語 `description`、新 grouping 結構及 `survey.timing`。
- LMS 建立流程保留 catalog 的 `rosterUrl` 與 LMS grouping，不覆寫成自建分組。

### Step 6：測試

Run: `npm test`

Expected: PASS。

### Step 7：提交

```bash
git add tests/v3-tests.mjs src/v3/domain.js src/v3/data.js src/v3/context.jsx
git commit -m "feat: extend event and LMS models"
```

## Task 3：建立共用 EventPicker

**Files:**

- Create: `src/v3/EventPicker.jsx`
- Modify: `src/v3/OperationsPages.jsx`
- Modify: `src/v3/features.css`
- Modify: `src/v3/i18n.js`

### Step 1：先以 build 建立基準

Run: `npm run build`

Expected: PASS，記錄目前 build 狀態。

### Step 2：建立 `EventPicker` 元件

元件介面：

```jsx
<EventPicker
  module="survey"
  includeHistory={false}
  value={activeEventId}
  onChange={selectActiveEvent}
/>
```

內部狀態包含 `query`、`source`、`category`、`status`、`month`、`dateFrom` 與 `dateTo`，並以 `useMemo` 呼叫 `filterEvents`。介面包含搜尋框、篩選展開／收合、結果清單、清除條件、無結果與日期錯誤。不得自動選取第一筆活動。

### Step 3：取代 OperationsPages 的活動下拉選單

在 `src/v3/OperationsPages.jsx`：

- 刪除舊 `EventSelect`。
- Reports、History、Materials、Survey、EarlyBird、Lottery 全部使用 `EventPicker`。
- 未選活動時一律顯示選擇提示，不得從其他頁面的舊 `activeEventId` 誤載不符合模組的活動。

### Step 4：加入四語文字與藍白樣式

在 `src/v3/i18n.js` 補齊搜尋、來源、狀態、月份、日期區間、清除與無結果文字。於 `features.css` 建立一致的藍白色 picker、可見焦點、手機單欄及 `prefers-reduced-motion` 規則。

### Step 5：編譯驗證

Run: `npm run build`

Expected: PASS，沒有 missing export、JSX 或 CSS 錯誤。

### Step 6：提交

```bash
git add src/v3/EventPicker.jsx src/v3/OperationsPages.jsx src/v3/features.css src/v3/i18n.js
git commit -m "feat: add shared searchable event picker"
```

## Task 4：活動基本資料與活動管理日期搜尋

**Files:**

- Modify: `src/v3/EventManagementPage.jsx`
- Modify: `src/v3/i18n.js`
- Modify: `src/v3/features.css`

### Step 1：擴充活動表單狀態

在 `emptyForm` 與 `createLmsForm` 加入：

```js
creator: "",
description: "",
groupingMode: "none",
manualAssignments: {},
surveyTiming: "after",
```

自建活動的建立人與描述必填；LMS 活動從 payload 自動帶入且與其他基本資料一樣唯讀。

### Step 2：更新基本資料與詳細資訊 UI

在 `EventForm`：

- 加入建立人 input 與描述 textarea。
- LMS 欄位全部使用一致 readonly 視覺與語意。

在 `EventDetails`：

- 顯示建立人與描述。
- 自建活動顯示本機名單人數。
- LMS 活動改顯示外部名單連結狀態，不顯示可編輯名單資訊。

### Step 3：活動瀏覽加入日期條件

`ManagedEvents` 改用 `filterEvents`，在既有名稱、來源、類型、狀態之外加入月份、起日與迄日，並提供清除按鈕與日期錯誤。

### Step 4：LMS catalog 補齊搜尋條件

`LmsCatalog` 使用相同篩選核心，支援活動名稱、類型、授課形式、月份及日期區間。選擇結果後仍進入 `EventForm`，不直接匯入。

### Step 5：四語與 build

補齊四語 `courseCreator`、`courseDescription`、日期條件及唯讀提示。

Run: `npm run build`

Expected: PASS。

### Step 6：提交

```bash
git add src/v3/EventManagementPage.jsx src/v3/i18n.js src/v3/features.css
git commit -m "feat: expand event details and date search"
```

## Task 5：自建活動自動／手動分組與 LMS 邊界

**Files:**

- Modify: `tests/v3-tests.mjs`
- Modify: `src/v3/domain.js`
- Modify: `src/v3/EventManagementPage.jsx`
- Modify: `src/v3/context.jsx`
- Modify: `src/v3/i18n.js`
- Modify: `src/v3/features.css`

### Step 1：寫手動分組失敗測試

新增並匯入 `validateManualAssignments` 與 `applyManualAssignments`：

```js
assert.deepEqual(validateManualAssignments(people.slice(0, 2), { T1: "A", T2: " " }), { ok: false, unassignedIds: ["T2"] });
assert.deepEqual(applyManualAssignments(people.slice(0, 2), { T1: "A", T2: "B" }).map((person) => person.group), ["A", "B"]);
```

再加入同一人只有一個結果、空名單及自動分組相容測試。

### Step 2：確認測試失敗

Run: `npm test`

Expected: FAIL，兩個函式尚不存在。

### Step 3：實作純函式

在 `src/v3/domain.js` 實作：

```js
export function validateManualAssignments(people, assignments) { /* return { ok, unassignedIds } */ }
export function applyManualAssignments(people, assignments) { /* trim group names and preserve people order */ }
```

### Step 4：完成自建活動分組 UI

在 `EventForm` 將單一 toggle 改成三個互斥選項：不分組、自動平均、手動分組。

- 自動：顯示每組人數。
- 手動：名單載入後顯示每位人員及組別 input/select。
- 名單變更時保留仍存在人員的 assignment，移除不存在的人員，新增者標記待分組。
- 驗證未完成時聚焦第一位未分組人員並顯示錯誤。

### Step 5：完成 LMS 外部名單 UI

LMS 的 `RosterPicker` 改為：

- 有效 `rosterUrl`：顯示「前往 LMS 查看／管理名單」，新分頁開啟。
- 缺少或無效 URL：停用按鈕並顯示原因。
- 不顯示 Event Check-In 內的名單選擇、上傳或手動分組。

LMS grouping 只顯示同步結果摘要；修改提示導向 LMS。

### Step 6：Context 寫入正確分組

`saveSelfEvent` 根據 `groupingMode` 選擇不分組、`assignGroups` 或 `applyManualAssignments`。LMS 流程不得套用自建活動分組函式。

### Step 7：測試與 build

Run: `npm test`

Expected: PASS。

Run: `npm run build`

Expected: PASS。

### Step 8：提交

```bash
git add tests/v3-tests.mjs src/v3/domain.js src/v3/EventManagementPage.jsx src/v3/context.jsx src/v3/i18n.js src/v3/features.css
git commit -m "feat: support manual grouping and LMS roster links"
```

## Task 6：教材勾選與部分失敗保留

**Files:**

- Modify: `tests/v3-tests.mjs`
- Modify: `src/v3/domain.js`
- Modify: `src/v3/context.jsx`
- Modify: `src/v3/OperationsPages.jsx`
- Modify: `src/v3/i18n.js`
- Modify: `src/v3/features.css`

### Step 1：寫選取集合失敗測試

加入 `toggleRecipientSelection`、`toggleFilteredRecipients` 與 `retainFailedRecipients` 測試：

```js
assert.deepEqual([...toggleFilteredRecipients(new Set(["T3"]), ["T1", "T2"], true)].sort(), ["T1", "T2", "T3"]);
assert.deepEqual([...toggleFilteredRecipients(new Set(["T1", "T2", "T3"]), ["T1", "T2"], false)], ["T3"]);
assert.deepEqual([...retainFailedRecipients(new Set(["T1", "T2"]), [{ personId: "T1", status: "sent" }, { personId: "T2", status: "failed" }])], ["T2"]);
```

### Step 2：確認測試失敗

Run: `npm test`

Expected: FAIL，選取 helper 尚不存在。

### Step 3：實作 selection helpers

函式一律回傳新的 `Set`，不得修改傳入集合。表頭 checkbox 的 checked／indeterminate 狀態由目前 filtered IDs 與 selected IDs 計算。

### Step 4：讓寄送 service 支援逐筆結果

調整 `context.jsx` 的 `sendDelivery`：

- 回傳 `{ results, successCount, failureCount }`。
- Email 無效者回傳 failed，不寫入 sent。
- mock 服務可用明確 fixture 產生部分失敗，不使用不穩定隨機值。
- `finally` 中清除 busy，離線或缺少連結時也不會永久卡住。

### Step 5：更新 MaterialsPage

- 使用 `selectedIds` state。
- 每列及表頭加入 checkbox。
- 全選只處理 `filtered`。
- 顯示選取數量與「發送給已選人員」。
- 成功後清除成功者，部分失敗只保留失敗者。
- 切換活動時清除上一活動的 selection。
- 保留個別重寄及全部人員重寄。

### Step 6：四語、樣式與驗證

補齊四語的選取、全選、已選數、部分成功與重試訊息；加入鍵盤可操作 checkbox、三態樣式及手機版排列。

Run: `npm test`

Expected: PASS。

Run: `npm run build`

Expected: PASS。

### Step 7：提交

```bash
git add tests/v3-tests.mjs src/v3/domain.js src/v3/context.jsx src/v3/OperationsPages.jsx src/v3/i18n.js src/v3/features.css
git commit -m "feat: add selected material batch delivery"
```

## Task 7：問卷活動前／後規則與時間鎖定

**Files:**

- Modify: `tests/v3-tests.mjs`
- Modify: `src/v3/domain.js`
- Modify: `src/v3/context.jsx`
- Modify: `src/v3/EventManagementPage.jsx`
- Modify: `src/v3/OperationsPages.jsx`
- Modify: `src/v3/i18n.js`

### Step 1：寫時間與收件人失敗測試

加入：

```js
const afterEvent = { ...event, endTime: "17:00", survey: { timing: "after", url: "https://forms.example/x" } };
assert.equal(canSendSurvey(afterEvent, new Date("2026-07-17T16:59:59+08:00")).ok, false);
assert.equal(canSendSurvey(afterEvent, new Date("2026-07-17T17:00:00+08:00")).ok, true);
assert.deepEqual(getSurveyRecipients(afterEvent, people.slice(0, 2), records).map(({ id }) => id), ["T1", "T2"]);

const beforeEvent = { ...afterEvent, survey: { ...afterEvent.survey, timing: "before" } };
assert.deepEqual(getSurveyRecipients(beforeEvent, people.slice(0, 3), {}).map(({ id }) => id), ["T1", "T2", "T3"]);
```

另測缺少 URL、無收件人與 cancelled 活動。

### Step 2：確認測試失敗

Run: `npm test`

Expected: FAIL，問卷規則 helper 尚不存在。

### Step 3：實作問卷 domain functions

在 `src/v3/domain.js` 新增：

```js
export function getEventEndAt(event) { /* +08:00 event-local timestamp */ }
export function canSendSurvey(event, now = new Date()) { /* { ok, code, unlockAt } */ }
export function getSurveyRecipients(event, people, records) { /* before: registered; after: successful check-in */ }
```

### Step 4：更新活動表單

問卷模組啟用時，除 URL 外加入活動前／活動後 radio 或 segmented control。LMS 基本資料仍唯讀，但問卷模組設定依既有產品規則可選；儲存到 `survey.timing`。

### Step 5：在 Context 強制驗證

`sendDelivery` 收到 `type === "survey"` 時再次呼叫 `canSendSurvey`，並以 `getSurveyRecipients` 限制傳入 IDs。即使 UI 被繞過，結束時間前也不能寫入成功紀錄。

### Step 6：更新 SurveyPage

- 活動前：列表顯示全部報名者。
- 活動後：列表只顯示成功 Check-in 人員。
- 尚未解鎖時，個別與批次按鈕全部停用，顯示格式化的解鎖日期時間及原因。
- 已解鎖但無合資格人員時顯示空狀態。
- 使用逐筆寄送結果顯示成功、失敗、次數與最近時間。

### Step 7：測試與 build

Run: `npm test`

Expected: PASS。

Run: `npm run build`

Expected: PASS。

### Step 8：提交

```bash
git add tests/v3-tests.mjs src/v3/domain.js src/v3/context.jsx src/v3/EventManagementPage.jsx src/v3/OperationsPages.jsx src/v3/i18n.js
git commit -m "feat: enforce survey delivery timing"
```

## Task 8：四語完整性、錯誤狀態與視覺整合

**Files:**

- Modify: `src/v3/i18n.js`
- Modify: `src/v3/features.css`
- Modify: `src/v3/styles.css`
- Modify: `src/v3/EventPicker.jsx`
- Modify: `src/v3/EventManagementPage.jsx`
- Modify: `src/v3/OperationsPages.jsx`

### Step 1：盤點新增翻譯鍵

用 `rg 't\("' src/v3` 對照 `i18n.js`，確保以下概念四語都有值且不是 `?`：

- 課程建立人、課程描述。
- 自動／手動／不分組與待分組。
- 前往 LMS、網址缺少／無效。
- 活動前／後問卷、可發送時間、尚未解鎖。
- 已選收件人、篩選結果全選、部分成功。
- 月份、起日、迄日、清除條件、日期錯誤。

### Step 2：統一錯誤與 loading 行為

- 搜尋結果區顯示區塊級 empty/error，不使用永久全域 notice。
- 寄送 notice 於既有導覽／定時邏輯內消失。
- 所有 async handler 使用 `try/catch/finally`，失敗不寫 success。
- 無效 URL 使用安全解析，不直接開啟。

### Step 3：藍白色與響應式 QA 修正

- 新增介面只使用現有藍白 tokens。
- 控制寬度、overflow、table/list 對齊及手機斷點。
- focus ring 清楚但不形成窄小破圖。
- 動畫 150–250ms 並尊重 `prefers-reduced-motion`。

### Step 4：執行靜態搜尋與 build

Run: `rg -n '>[?]+<|"[?]{2,}"' src/v3`

Expected: 不存在新增或既有可見的問號亂碼；若有命中，逐筆修正後重跑。

Run: `npm run build`

Expected: PASS。

### Step 5：提交

```bash
git add src/v3/i18n.js src/v3/features.css src/v3/styles.css src/v3/EventPicker.jsx src/v3/EventManagementPage.jsx src/v3/OperationsPages.jsx
git commit -m "fix: polish localized enhancement states"
```

## Task 9：完整回歸與瀏覽器驗收

**Files:**

- Modify only if verification finds a defect: files implicated by the defect

### Step 1：執行完整自動驗證

Run: `npm test`

Expected: PASS，包含原有報到、早鳥、抽獎、CSV、請假與所有新增 domain 測試。

Run: `npm run build`

Expected: PASS，產生 Vite production bundle。

### Step 2：啟動 production preview

Run: `npm run preview -- --host 127.0.0.1`

Expected: preview server 提供可開啟的 localhost URL。

### Step 3：依驗收矩陣操作瀏覽器

逐項驗證：

1. 四種語言下，活動管理可依名稱及日期找到活動。
2. 所有模組頁面活動選擇器的搜尋及篩選一致，且不自動選第一筆。
3. 自建活動三種分組模式與手動缺漏驗證正確。
4. LMS 活動基本資料唯讀、外部名單按鈕正確，無網址時停用。
5. 教材搜尋後全選只勾目前結果，部分失敗者保留。
6. 活動前問卷涵蓋所有報名者；活動後問卷在時間前鎖定，時間後只含已 Check-in 人員。
7. 切換頁面／活動後沒有殘留錯誤選取或不相干通知。
8. 1440px、1024px、390px 寬度下沒有溢位或白色區塊破版。
9. 鍵盤 Tab、Enter、Space 可操作搜尋、filter、radio、checkbox 與外部連結。

### Step 4：若發現缺陷，遵守 debugging 與 TDD

先用 `superpowers:systematic-debugging` 找到根因；能以 domain test 重現者先補失敗測試，再修正。修正後重跑本 Task 的完整驗證。

### Step 5：最終狀態檢查

Run: `git status --short`

Expected: 只剩使用者原本的無關未追蹤檔案；本功能所有追蹤變更均已提交。

### Step 6：提交驗收修正（僅有修正時）

```bash
git add <only-files-changed-for-verification>
git commit -m "fix: resolve enhancement verification findings"
```

完成後使用 `superpowers:requesting-code-review` 檢查需求覆蓋，再使用 `superpowers:finishing-a-development-branch` 進行交付選擇。未經使用者要求，不自行 push 或部署。
