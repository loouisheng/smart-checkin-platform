import { CheckCircle2, RotateCcw, Sparkles, Trophy, Users } from "lucide-react";
import { drawWinners } from "../domain/eventManagementV2.js";
import { getRecord } from "../domain/checkinEngine.js";

const eligibilityLabels = {
  checkedIn: "限已完成 Check-in 的人員",
  allRegistered: "所有正取報名者",
  earlyBird: "限已報到且符合早鳥順位者",
};

export default function LotteryPageV2({ event, people, records, lotteryState, onDraw, onReset, onSimulate, language }) {
  const isZh = language === "zh";
  const previousWinnerIds = lotteryState.winners.map((winner) => winner.id);
  const preview = drawWinners({
    people,
    records,
    previousWinnerIds,
    count: event.lottery?.winnerCount || 1,
    eligibility: event.lottery?.eligibility || "checkedIn",
    earlyBirdQuota: event.earlyBirdQuota || 50,
    random: () => 0,
  });
  const checkedInCount = people.filter((person) => getRecord(records, person.id).checkins.length > 0).length;

  return <div className="page-stack lottery-page">
    <div className="page-intro"><span>LIVE LOTTERY</span><h1>{isZh ? "現場抽獎" : "Live lottery"}</h1><p>{isZh ? "依活動設定自動建立抽獎池，排除不符資格與已中獎人員。" : "Build the pool from event rules and exclude ineligible or previous winners."}</p></div>
    <section className="lottery-hero">
      <div className="lottery-prize-icon"><Trophy size={28} /></div>
      <div className="lottery-prize-copy"><span>{isZh ? "本輪獎項" : "Prize"}</span><h2>{event.lottery?.prizeName}</h2><p>{eligibilityLabels[event.lottery?.eligibility] || eligibilityLabels.checkedIn} · 每輪 {event.lottery?.winnerCount || 1} 位 · 不重複中獎</p></div>
      <div className="lottery-actions"><button className="outline-button" type="button" onClick={onSimulate}><Users size={15} /> 模擬 6 人報到</button><button className="lottery-draw-button" type="button" disabled={preview.eligibleCount === 0} onClick={onDraw}><Sparkles size={17} /> 開始抽獎</button></div>
    </section>
    <div className="lottery-metrics">
      <article><span>活動名單</span><strong>{people.length}</strong><small>正取與候補合計</small></article>
      <article><span>已報到</span><strong>{checkedInCount}</strong><small>依即時報到紀錄更新</small></article>
      <article><span>本輪可抽</span><strong>{preview.eligibleCount}</strong><small>已排除過往得獎者</small></article>
      <article><span>累計得獎</span><strong>{lotteryState.winners.length}</strong><small>保留抽獎批次與時間</small></article>
    </div>
    <section className="winner-panel">
      <div className="data-panel-header"><div><span className="section-kicker">WINNER HISTORY</span><h2>{isZh ? "中獎紀錄" : "Winner history"}</h2></div>{lotteryState.winners.length > 0 && <button className="text-button compact-button" type="button" onClick={onReset}><RotateCcw size={14} /> 清除模擬結果</button>}</div>
      {lotteryState.lastDraw.length > 0 && <div className="latest-winners"><span>本輪中獎</span>{lotteryState.lastDraw.map((winner) => <article key={winner.id}><div className="winner-avatar">{winner.name[language].slice(0, 1)}</div><div><strong>{winner.name[language]}</strong><small>{winner.department[language]} · {winner.id}</small></div><CheckCircle2 size={19} /></article>)}</div>}
      {lotteryState.winners.length === 0 ? <div className="empty-lottery"><Sparkles size={24} /><strong>尚未產生中獎名單</strong><span>可先按「模擬 6 人報到」，再執行抽獎展示完整流程。</span></div> : <div className="table-scroll"><table><thead><tr><th>批次</th><th>中獎者</th><th>部門</th><th>識別碼</th><th>獎項</th></tr></thead><tbody>{lotteryState.winners.map((winner) => <tr key={`${winner.drawNumber}-${winner.id}`}><td>第 {winner.drawNumber} 輪</td><td><strong>{winner.name[language]}</strong></td><td>{winner.department[language]}</td><td>{winner.id}</td><td>{event.lottery?.prizeName}</td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
