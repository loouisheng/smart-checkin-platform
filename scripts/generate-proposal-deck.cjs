const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "FlowIn Product Team";
pptx.company = "FlowIn";
pptx.subject = "?箸?勗蝟餌絞隞??像?啣???";
pptx.title = "FlowIn ?箸?勗擃??像?啣???";
pptx.lang = "zh-TW";
pptx.theme = {
  headFontFace: "Microsoft JhengHei",
  bodyFontFace: "Microsoft JhengHei",
  lang: "zh-TW",
};
pptx.defineLayout({ name: "CUSTOM_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "CUSTOM_WIDE";

const C = {
  navy: "172033", blue: "0F62FE", blueDark: "0846B9", blueSoft: "EDF4FF",
  ink: "172033", text: "344054", muted: "667085", faint: "98A2B3",
  line: "E3E8EF", canvas: "F7F9FC", white: "FFFFFF", surface: "FFFFFF",
  green: "14804A", greenSoft: "EAF8F0", amber: "B85C00", amberSoft: "FFF5E5",
  red: "C4342D", redSoft: "FFF0EF", cyan: "2787C8", cyanSoft: "EFF8FF",
};
const FONT = "Microsoft JhengHei";
const OUT = path.join(__dirname, "..", "deliverables", "FlowIn_?箸?勗蝟餌絞_?Ｗ???_20??pptx");
const DOC = path.join(__dirname, "..", "docs", "interface-optimization-and-20-slide-proposal.md");
const IMG_LIGHT = path.join(__dirname, "..", ".qa", "desktop-light.png");
const IMG_DARK = path.join(__dirname, "..", ".qa", "desktop.png");
const IMG_MOBILE = path.join(__dirname, "..", ".qa", "mobile-light.png");

function notesFromMarkdown() {
  const source = fs.readFileSync(DOC, "utf8");
  const result = {};
  const regex = /## 蝚?(\d+) ?\s\S]*?- \*\*PM ??雓阮\*\*嚗?[^\r\n]+)/g;
  let match;
  while ((match = regex.exec(source))) result[Number(match[1])] = match[2].trim();
  return result;
}
const speakerNotes = notesFromMarkdown();

function addBrand(slide) {
  slide.addShape(pptx.ShapeType.roundRect, { x: 0.42, y: 0.25, w: 0.34, h: 0.34, rectRadius: 0.05, fill: { color: C.blue }, line: { color: C.blue } });
  slide.addText("F", { x: 0.51, y: 0.305, w: 0.16, h: 0.16, fontFace: FONT, fontSize: 12, bold: true, color: C.white, margin: 0, align: "center" });
  slide.addText("FlowIn", { x: 0.84, y: 0.28, w: 0.75, h: 0.24, fontFace: FONT, fontSize: 11, bold: true, color: C.ink, margin: 0 });
}

function addFooter(slide, page, label = "?Ｗ?擃??像?啣???") {
  slide.addShape(pptx.ShapeType.line, { x: 0.42, y: 7.12, w: 12.47, h: 0, line: { color: C.line, width: 0.8 } });
  slide.addText(label, { x: 0.45, y: 7.2, w: 3.2, h: 0.16, fontFace: FONT, fontSize: 7.5, color: C.faint, margin: 0 });
  slide.addText(String(page).padStart(2, "0"), { x: 12.35, y: 7.18, w: 0.45, h: 0.18, fontFace: FONT, fontSize: 8, bold: true, color: C.muted, margin: 0, align: "right" });
  slide.addNotes(speakerNotes[page] || "");
}

function addTitle(slide, page, title, subtitle, section) {
  slide.background = { color: C.canvas };
  addBrand(slide);
  slide.addText(section.toUpperCase(), { x: 0.45, y: 0.78, w: 2.8, h: 0.2, fontFace: FONT, fontSize: 8.5, bold: true, color: C.blue, margin: 0, charSpacing: 1.1 });
  slide.addText(title, { x: 0.45, y: 1.04, w: 11.7, h: 0.52, fontFace: FONT, fontSize: 25, bold: true, color: C.ink, margin: 0, breakLine: false, fit: "shrink" });
  if (subtitle) slide.addText(subtitle, { x: 0.47, y: 1.62, w: 11.8, h: 0.34, fontFace: FONT, fontSize: 11.5, color: C.muted, margin: 0, fit: "shrink" });
  addFooter(slide, page);
}

function box(slide, x, y, w, h, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.05, fill: { color: opts.fill || C.white }, line: { color: opts.line || C.line, width: opts.lineWidth || 0.8 }, shadow: opts.shadow ? { type: "outer", color: "AAB4C0", opacity: 0.12, blur: 1, angle: 45, distance: 1 } : undefined });
}

function pill(slide, text, x, y, w, color = C.blue, fill = C.blueSoft) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h: 0.3, rectRadius: 0.08, fill: { color: fill }, line: { color: fill } });
  slide.addText(text, { x: x + 0.05, y: y + 0.07, w: w - 0.1, h: 0.14, fontFace: FONT, fontSize: 7.5, bold: true, color, align: "center", margin: 0, fit: "shrink" });
}

function bulletList(slide, items, x, y, w, opts = {}) {
  const fs = opts.fontSize || 12;
  const gap = opts.gap || 0.52;
  items.forEach((item, index) => {
    const yy = y + index * gap;
    slide.addShape(pptx.ShapeType.ellipse, { x, y: yy + 0.12, w: 0.08, h: 0.08, fill: { color: opts.dotColor || C.blue }, line: { color: opts.dotColor || C.blue } });
    slide.addText(item, { x: x + 0.18, y: yy, w: w - 0.18, h: gap - 0.06, fontFace: FONT, fontSize: fs, color: opts.color || C.text, margin: 0, breakLine: false, fit: "shrink", valign: "mid" });
  });
}

function labelValue(slide, label, value, x, y, w, color = C.blue) {
  slide.addText(label, { x, y, w, h: 0.18, fontFace: FONT, fontSize: 8, color: C.muted, margin: 0 });
  slide.addText(value, { x, y: y + 0.24, w, h: 0.38, fontFace: FONT, fontSize: 20, bold: true, color, margin: 0, fit: "shrink" });
}

function arrow(slide, x, y, w, color = C.blue) {
  slide.addShape(pptx.ShapeType.line, { x, y, w, h: 0, line: { color, width: 1.5, beginArrowType: "none", endArrowType: "triangle" } });
}

function addImageFrame(slide, imagePath, x, y, w, h) {
  box(slide, x, y, w, h, { fill: C.white, line: C.line });
  if (fs.existsSync(imagePath)) slide.addImage({ path: imagePath, x: x + 0.06, y: y + 0.06, w: w - 0.12, h: h - 0.12, transparency: 0 });
}

function addDecisionChip(slide, text) {
  pill(slide, text, 10.42, 0.76, 2.3, C.blueDark, C.blueSoft);
}

// 1 Cover
{
  const s = pptx.addSlide();
  s.background = { color: C.canvas };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 4.7, h: 7.5, fill: { color: C.white }, line: { color: C.white } });
  s.addShape(pptx.ShapeType.roundRect, { x: 0.55, y: 0.55, w: 0.55, h: 0.55, rectRadius: 0.08, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText("F", { x: 0.71, y: 0.67, w: 0.22, h: 0.24, fontFace: FONT, fontSize: 18, bold: true, color: C.white, margin: 0, align: "center" });
  s.addText("FLOWIN PRODUCT PROPOSAL", { x: 0.56, y: 1.48, w: 3.45, h: 0.24, fontFace: FONT, fontSize: 9, bold: true, color: C.blue, margin: 0, charSpacing: 1.2 });
  s.addText("?箸?勗擃?\n?像?啣???", { x: 0.55, y: 1.88, w: 3.55, h: 1.5, fontFace: FONT, fontSize: 30, bold: true, color: C.ink, margin: 0, breakLine: false, fit: "shrink" });
  s.addText("?游翰??游?瑯蝛拙???璆剜祥?n?游?游???B2B SaaS ?箇?", { x: 0.58, y: 3.58, w: 3.45, h: 0.72, fontFace: FONT, fontSize: 13, color: C.muted, margin: 0, breakLine: false, fit: "shrink" });
  pill(s, "隞?芸? ? Design System ? ?詨?瘚? ? ROI", 0.58, 4.65, 3.55, C.blueDark, C.blueSoft);
  s.addText("?Ｗ?蝬??蜓蝞∟?頝券?瘙箇???獢?, { x: 0.58, y: 6.55, w: 3.45, h: 0.25, fontFace: FONT, fontSize: 9, color: C.faint, margin: 0 });
  addImageFrame(s, IMG_LIGHT, 4.95, 0.62, 7.88, 5.95);
  s.addShape(pptx.ShapeType.rect, { x: 5.05, y: 5.7, w: 7.68, h: 0.78, fill: { color: C.navy, transparency: 5 }, line: { color: C.navy, transparency: 100 } });
  s.addText("敺?函???嚗粥??葫?蝬剛風?閬芋??撟喳", { x: 5.35, y: 5.95, w: 7.0, h: 0.25, fontFace: FONT, fontSize: 13, bold: true, color: C.white, margin: 0, align: "center" });
  addFooter(s, 1, "FlowIn Product Proposal");
}

// 2 Executive summary
{
  const s = pptx.addSlide(); addTitle(s, 2, "Executive Summary", "???? Phase 0??嚗??刻??捱摰?行憭?, "Decision first"); addDecisionChip(s, "撱箄降嚗??挾?詨?");
  const cards = [
    ["?暹?", "撌脫??Ｗ?撉冽嚗撩 baseline?身閮祥???航?璅∪?擃?", C.red, C.redSoft],
    ["?芸?銵?", "Light Shell?????敹?隞嗚?暺??弦", C.blue, C.blueSoft],
    ["瘙箇??孵?", "隞?TCR???隤扎恥??鈭支???雿?Gate", C.green, C.greenSoft],
  ];
  cards.forEach((c, i) => { const x = 0.55 + i * 4.2; box(s, x, 2.25, 3.82, 2.45, { fill: C.white, line: c[2], shadow: true }); s.addShape(pptx.ShapeType.rect, { x, y: 2.25, w: 0.08, h: 2.45, fill: { color: c[2] }, line: { color: c[2] } }); s.addText(c[0], { x: x + 0.3, y: 2.58, w: 3.1, h: 0.32, fontFace: FONT, fontSize: 16, bold: true, color: c[2], margin: 0 }); s.addText(c[1], { x: x + 0.3, y: 3.08, w: 3.1, h: 0.96, fontFace: FONT, fontSize: 12.5, color: C.text, margin: 0, breakLine: false, fit: "shrink", valign: "mid" }); });
  box(s, 0.55, 5.12, 12.2, 1.2, { fill: C.navy, line: C.navy });
  s.addText("Base Case ?思?閮?蝝??Phase 2 ?梯岫暺?Go / No-Go 瘙箏?", { x: 0.9, y: 5.52, w: 11.5, h: 0.35, fontFace: FONT, fontSize: 17, bold: true, color: C.white, margin: 0, align: "center" });
}

// 3 Why now
{
  const s = pptx.addSlide(); addTitle(s, 3, "Why Now嚗?撽??嗆??菜迤?冽憭?, "?Ｗ?敺銝?扯?韏啣?銝車?湔嚗?冽瘝餌??隞?抒?蝒", "Why now");
  const stages = [["??", "?桐?瘚?", C.faint], ["憭??, "7 蝔格芋??, C.blue], ["摰Ｘ??, "甈?嚗里?賂??游?", C.amber], ["撟喳??, "???璆剖?", C.green]];
  s.addShape(pptx.ShapeType.line, { x: 1.05, y: 3.15, w: 11.1, h: 0, line: { color: C.line, width: 3 } });
  stages.forEach((st, i) => { const x = 1.0 + i * 3.55; s.addShape(pptx.ShapeType.ellipse, { x, y: 2.9, w: 0.48, h: 0.48, fill: { color: st[2] }, line: { color: C.white, width: 2 } }); s.addText(st[0], { x: x - 0.35, y: 2.16, w: 1.2, h: 0.3, fontFace: FONT, fontSize: 15, bold: true, color: C.ink, align: "center", margin: 0 }); s.addText(st[1], { x: x - 0.7, y: 3.55, w: 1.9, h: 0.45, fontFace: FONT, fontSize: 10.5, color: C.muted, align: "center", margin: 0, fit: "shrink" }); });
  pill(s, "瘝餌?蝒嚗??, 3.55, 4.32, 2.2, C.blueDark, C.blueSoft);
  bulletList(s, ["??游撐雿輻???閫蝯?憓?", "瘝? Design System嚗?銴ˊ璅????隞?, "瘝? baseline嚗?蝥??瘜???, "頞??渡?嚗???甈?嚗?蝝?鞈渲?擃?], 6.25, 4.18, 5.8, { fontSize: 11.5, gap: 0.48 });
}

// 4 Business context
{
  const s = pptx.addSlide(); addTitle(s, 4, "敺甈∪?啗粥??璆剖?刻??, "銝??Check-in Core嚗???蝔桐犖?∪?氬??澆摰??曉?抒恣??", "Business context");
  s.addShape(pptx.ShapeType.ellipse, { x: 5.15, y: 2.45, w: 2.9, h: 2.0, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText("CHECK-IN\nCORE", { x: 5.55, y: 2.97, w: 2.1, h: 0.72, fontFace: FONT, fontSize: 22, bold: true, color: C.white, align: "center", margin: 0, fit: "shrink" });
  const hubs = [["隡平?扯?",1.0,2.0],["雓漣",1.25,4.2],["撅汗",3.5,5.25],["?岫",8.15,5.25],["?∪極瘣餃?",10.25,4.2],["?蝳?,10.25,2.0],["?降",3.55,1.4]];
  hubs.forEach((h, i) => { box(s, h[1], h[2], 1.55, 0.62, { fill: i % 2 ? C.white : C.blueSoft, line: i % 2 ? C.line : C.blueSoft }); s.addText(h[0], { x: h[1] + 0.1, y: h[2] + 0.19, w: 1.35, h: 0.18, fontFace: FONT, fontSize: 10.5, bold: true, color: C.text, align: "center", margin: 0, fit: "shrink" }); });
  s.addText("頨思遢颲刻?嚚??摰??單???嚚?雿???, { x: 3.2, y: 5.95, w: 7.0, h: 0.28, fontFace: FONT, fontSize: 12, bold: true, color: C.blueDark, align: "center", margin: 0 });
  s.addText("敺?嚗暑頨恥?嗚暑???CV??摮?雿輻瘛勗漲", { x: 3.2, y: 6.38, w: 7.0, h: 0.22, fontFace: FONT, fontSize: 9.5, color: C.faint, align: "center", margin: 0 });
}

// 5 Problems
{
  const s = pptx.addSlide(); addTitle(s, 5, "?詨???嚗?瑟??祈?瘝餌??", "擃?曉?閬??喋迤蝣箝閫??嚗??臬????唳憭?閮?, "Problem framing");
  const cols = [
    ["閬死", ["瘛梯 Sidebar 甈?擃?, "撠???撠?憸券"], C.blue, C.blueSoft],
    ["瘚?", ["???銝?甇亙???, "靘????頝典極??], C.amber, C.amberSoft],
    ["瘝餌?", ["閬??見撘??", "甈?嚗里?詨?敺???], C.red, C.redSoft],
    ["?葫", ["蝻箏?隞餃? baseline", "?⊥???????"], C.green, C.greenSoft],
  ];
  cols.forEach((c, i) => { const x = 0.55 + i * 3.12; box(s, x, 2.22, 2.82, 2.65, { fill: C.white, line: C.line }); s.addShape(pptx.ShapeType.ellipse, { x: x + 0.22, y: 2.48, w: 0.38, h: 0.38, fill: { color: c[3] }, line: { color: c[2] } }); s.addText(String(i + 1), { x: x + 0.32, y: 2.58, w: 0.18, h: 0.15, fontFace: FONT, fontSize: 9, bold: true, color: c[2], align: "center", margin: 0 }); s.addText(c[0], { x: x + 0.72, y: 2.5, w: 1.7, h: 0.28, fontFace: FONT, fontSize: 16, bold: true, color: C.ink, margin: 0 }); bulletList(s, c[1], x + 0.25, 3.22, 2.32, { fontSize: 10.5, gap: 0.62, dotColor: c[2] }); });
  box(s, 1.7, 5.35, 9.9, 0.9, { fill: C.navy, line: C.navy });
  s.addText("蝯?嚗?湧漲銝?嚚恥??閮毀憓?嚚??曉之蝬剛風?", { x: 2.0, y: 5.65, w: 9.3, h: 0.26, fontFace: FONT, fontSize: 15, bold: true, color: C.white, align: "center", margin: 0 });
}

// 6 Stakeholders
{
  const s = pptx.addSlide(); addTitle(s, 6, "?拙拿??鈭箏???車??摰儔", "?典??KPI ??畾菟??嚗?朣捱蝑?????鈭支?", "Stakeholders");
  s.addShape(pptx.ShapeType.line, { x: 2.0, y: 4.25, w: 8.55, h: 0, line: { color: C.line, width: 1.2 } });
  s.addShape(pptx.ShapeType.line, { x: 6.27, y: 2.05, w: 0, h: 4.25, line: { color: C.line, width: 1.2 } });
  s.addText("擃???, { x: 0.72, y: 2.15, w: 0.8, h: 0.2, fontFace: FONT, fontSize: 8.5, color: C.muted, margin: 0 });
  s.addText("擃?瘜?, { x: 10.7, y: 6.45, w: 0.8, h: 0.2, fontFace: FONT, fontSize: 8.5, color: C.muted, margin: 0 });
  const quads = [
    ["?勗?瘙箇?", ["銝餌恣嚗瓷??, "?Ｗ?嚗???, "鞈?嚗???], 6.55, 2.25, C.blueSoft, C.blueDark],
    ["蝬剜??舀?", ["?∟頃", "擃?蝞∠???], 2.3, 2.25, C.greenSoft, C.green],
    ["?勗?閮剛?", ["閮剛?嚗極蝔?QA", "璆剖?嚗S"], 6.55, 4.55, C.amberSoft, C.amber],
    ["??閫撖?, ["銝?砌蝙?刻?, "?曉?舀"], 2.3, 4.55, C.white, C.text],
  ];
  quads.forEach(q => { box(s, q[2], q[3], 3.65, 1.45, { fill: q[4], line: q[4] === C.white ? C.line : q[4] }); s.addText(q[0], { x: q[2] + 0.2, y: q[3] + 0.18, w: 2.9, h: 0.24, fontFace: FONT, fontSize: 13, bold: true, color: q[5], margin: 0 }); s.addText(q[1].join("\n"), { x: q[2] + 0.2, y: q[3] + 0.55, w: 3.15, h: 0.65, fontFace: FONT, fontSize: 10.5, color: C.text, margin: 0, breakLine: false, fit: "shrink" }); });
}

// 7 Empathy map
{
  const s = pptx.addSlide(); addTitle(s, 7, "Empathy Map嚗頂蝯望?憟賢????鈭?, "?詨?雿輻?撠陸?亙??游?唬犖?∴?隞乩?瘣?? Phase 0 撽?", "User insight");
  const cards = [
    ["SAYS", "??喟???賭??賡脯?, C.blueSoft, C.blueDark],
    ["THINKS", "????蔣?踹?斗?蝳嚗?, C.amberSoft, C.amber],
    ["DOES", "?瑕????銝餌恣?? Excel", C.white, C.text],
    ["FEELS", "????殷??航炊?撩銋???, C.redSoft, C.red],
    ["PAINS", "鞈???????銝??憭 owner", C.white, C.text],
    ["GAINS", "敹恍迤蝣箝閫????儔", C.greenSoft, C.green],
  ];
  cards.forEach((c, i) => { const col = i % 3; const row = Math.floor(i / 3); const x = 0.55 + col * 4.15; const y = 2.15 + row * 2.0; box(s, x, y, 3.78, 1.62, { fill: c[2], line: c[2] === C.white ? C.line : c[2] }); s.addText(c[0], { x: x + 0.22, y: y + 0.2, w: 1.0, h: 0.2, fontFace: FONT, fontSize: 8.5, bold: true, color: c[3], margin: 0, charSpacing: 1 }); s.addText(c[1], { x: x + 0.22, y: y + 0.58, w: 3.2, h: 0.66, fontFace: FONT, fontSize: 13, bold: true, color: C.ink, margin: 0, breakLine: false, fit: "shrink", valign: "mid" }); });
  pill(s, "敺?霅?5?? 雿赤隢??曉閫撖?隞餃?皜祈岫", 4.05, 6.38, 5.25, C.blueDark, C.blueSoft);
}

// 8 User stories
{
  const s = pptx.addSlide(); addTitle(s, 8, "User Stories嚗?閫?瘙? KPI", "瘥?瘙敹???隤啣??????雿?霅?, "Requirements");
  const stories = [
    ["?曉鈭箏", "蝡?仿??臬?亙??銝甇?, "TCR嚗ime嚗rror"],
    ["隡平蝞∠???, "?冽芋?踹翰?身摰?航?閬?", "Setup time嚗onfig error"],
    ["??銝餌恣", "?葉??靘?銝西蕭頩?SLA", "Cycle time嚗verdue"],
    ["摰Ｘ?嚗S", "?券隤斤Ⅳ????摰???", "FCR嚗andle time"],
    ["撌亦???", "隞亙?隞嗉? token ???飛", "Lead Time嚗I defect"],
  ];
  stories.forEach((st, i) => { const y = 2.05 + i * 0.86; box(s, 0.65, y, 12.0, 0.67, { fill: i % 2 ? C.white : C.surface, line: C.line }); pill(s, st[0], 0.88, y + 0.18, 1.55, i === 4 ? C.green : C.blueDark, i === 4 ? C.greenSoft : C.blueSoft); s.addText(st[1], { x: 2.72, y: y + 0.17, w: 6.15, h: 0.26, fontFace: FONT, fontSize: 12, bold: true, color: C.ink, margin: 0, fit: "shrink" }); s.addText(st[2], { x: 9.25, y: y + 0.19, w: 2.95, h: 0.22, fontFace: FONT, fontSize: 9.5, color: C.muted, margin: 0, align: "right", fit: "shrink" }); });
}

// 9 As-Is
{
  const s = pptx.addSlide(); addTitle(s, 9, "As-Is嚗?敺?瑁??", "?迤?眼??敺銝?瑕嚗靘??andoff ??敺撠?, "Current journey");
  const flow = [["?豢暑??, C.white], ["?瑕嚗?撠?, C.white], ["霈????, C.white], ["?靘?", C.redSoft], ["?極?瘀??蜓蝞?, C.amberSoft], ["鈭??渡?", C.white]];
  flow.forEach((f, i) => { const x = 0.5 + i * 2.1; box(s, x, 2.45, 1.65, 0.9, { fill: f[1], line: i === 3 ? C.red : C.line }); s.addText(f[0], { x: x + 0.15, y: 2.76, w: 1.35, h: 0.22, fontFace: FONT, fontSize: 11, bold: true, color: C.ink, align: "center", margin: 0, fit: "shrink" }); if (i < flow.length - 1) arrow(s, x + 1.68, 2.9, 0.37, i >= 2 ? C.amber : C.blue); });
  const waste = [["蝑?", "??嚗蜓蝞∠Ⅱ隤?], ["?極", "??頛詨嚗?敺撠?], ["鞈??琿?", "??嚗xcel嚗??頂蝯?], ["銝餈質馱", "蝻?owner嚗LA嚗?隞嗉???]];
  waste.forEach((w, i) => { const x = 0.75 + i * 3.08; box(s, x, 4.25, 2.65, 1.28, { fill: C.white, line: C.line }); s.addText(w[0], { x: x + 0.18, y: 4.5, w: 0.95, h: 0.24, fontFace: FONT, fontSize: 14, bold: true, color: i === 3 ? C.red : C.amber, margin: 0 }); s.addText(w[1], { x: x + 0.18, y: 4.88, w: 2.2, h: 0.32, fontFace: FONT, fontSize: 9.8, color: C.muted, margin: 0, fit: "shrink" }); });
  pill(s, "Gap嚗撩撠絞銝??wner?LA ??end-to-end 鈭辣鞈?", 3.25, 6.08, 6.85, C.red, C.redSoft);
}

// 10 To-Be
{
  const s = pptx.addSlide(); addTitle(s, 10, "To-Be嚗?蝘?瑯?憭?瘚蝔餈賣滲", "璅?瘚?閬嚗?憭?蝔?皜?嚗???蝔閬?葫", "Future journey");
  const main = [["瘣餃?嚗芋??, "?芸?頛閬?"], ["蝯曹? ScanField", "RFID嚗R嚗???], ["?單??文?", "?臬?亙嚗???], ["銝?甇?, "摨找?嚗???蝳"]];
  main.forEach((f, i) => { const x = 0.65 + i * 3.03; box(s, x, 2.2, 2.35, 1.35, { fill: i === 2 ? C.blueSoft : C.white, line: i === 2 ? C.blue : C.line }); s.addText(f[0], { x: x + 0.18, y: 2.48, w: 1.95, h: 0.26, fontFace: FONT, fontSize: 13, bold: true, color: i === 2 ? C.blueDark : C.ink, align: "center", margin: 0 }); s.addText(f[1], { x: x + 0.18, y: 2.87, w: 1.95, h: 0.25, fontFace: FONT, fontSize: 9.5, color: C.muted, align: "center", margin: 0, fit: "shrink" }); if (i < 3) arrow(s, x + 2.42, 2.88, 0.5, C.blue); });
  s.addShape(pptx.ShapeType.line, { x: 6.34, y: 3.56, w: 0, h: 0.72, line: { color: C.red, width: 1.4, endArrowType: "triangle" } });
  box(s, 4.42, 4.25, 3.85, 1.25, { fill: C.redSoft, line: C.red });
  s.addText("靘? ??Manual Review", { x: 4.78, y: 4.58, w: 3.15, h: 0.28, fontFace: FONT, fontSize: 15, bold: true, color: C.red, align: "center", margin: 0 });
  s.addText("Owner嚗LA嚗udit嚗?敺?, { x: 4.78, y: 4.95, w: 3.15, h: 0.2, fontFace: FONT, fontSize: 9.5, color: C.text, align: "center", margin: 0 });
  box(s, 1.52, 5.95, 10.3, 0.55, { fill: C.navy, line: C.navy });
  s.addText("???隞???Analytics嚚udit嚚eport", { x: 2.0, y: 6.13, w: 9.35, h: 0.18, fontFace: FONT, fontSize: 12, bold: true, color: C.white, align: "center", margin: 0 });
}

// 11 Principles
{
  const s = pptx.addSlide(); addTitle(s, 11, "?啁?蝑嚗alm Utility", "?剝????勗???隤??????祈?蝬剛風?", "Design strategy");
  const principles = [["撌乩??芸?","銝颱遙???澆???],["瞍賊脫??,"?蝪∪???啣???],["璅⊥撽?","撌桃?梯身摰??],["?????,"?莎?????銝?甇?],["?舫?皜?,"瘥?閮剛???? KPI"],["?舐雁霅?,"Token嚗omponent嚗oD"]];
  principles.forEach((p,i)=>{ const col=i%3,row=Math.floor(i/3); const x=0.75+col*4.12,y=2.2+row*2.05; box(s,x,y,3.65,1.55,{fill:i===0?C.blueSoft:C.white,line:i===0?C.blue:C.line}); s.addText(`0${i+1}`,{x:x+0.2,y:y+0.2,w:0.45,h:0.22,fontFace:FONT,fontSize:9,bold:true,color:C.blue,margin:0}); s.addText(p[0],{x:x+0.75,y:y+0.2,w:2.4,h:0.28,fontFace:FONT,fontSize:15,bold:true,color:C.ink,margin:0}); s.addText(p[1],{x:x+0.75,y:y+0.7,w:2.35,h:0.36,fontFace:FONT,fontSize:10.5,color:C.muted,margin:0,fit:"shrink"}); });
}

// 12 Architecture
{
  const s = pptx.addSlide(); addTitle(s, 12, "?Ｗ??嗆?嚗??啁陛?殷?敺摰", "???漲?暸?Domain?ervices ??Platform嚗??臭漱蝯衣?港犖??, "Architecture");
  const layers = [
    ["EXPERIENCE", "Front Desk嚚dmin嚚obile嚗ablet", C.blue, C.blueSoft],
    ["DOMAIN", "Event嚚emplate嚚erson嚚ttendance嚚ntitlement嚚xception", C.cyan, C.cyanSoft],
    ["SERVICES", "Identity嚚otification嚚ccess嚚nalytics嚚udit嚚xport", C.amber, C.amberSoft],
    ["PLATFORM", "RBAC嚚18n嚚ffline Sync嚚bservability嚚ecurity嚗etention", C.green, C.greenSoft],
  ];
  layers.forEach((l,i)=>{ const y=2.05+i*1.0; box(s,0.75,y,11.8,0.72,{fill:l[3],line:l[3]}); s.addText(l[0],{x:1.0,y:y+0.23,w:1.45,h:0.2,fontFace:FONT,fontSize:9,bold:true,color:l[2],margin:0,charSpacing:1}); s.addText(l[1],{x:2.45,y:y+0.19,w:9.4,h:0.28,fontFace:FONT,fontSize:11.5,bold:true,color:C.ink,margin:0,fit:"shrink"}); });
  const steps=["SCAN","DECISION","ACTION","AUDIT"];
  steps.forEach((st,i)=>{ const x=2.15+i*2.45; pill(s,st,x,6.17,1.4,C.blueDark,C.white); if(i<3) arrow(s,x+1.5,6.32,0.75,C.blue); });
}

// 13 Visual redesign
{
  const s = pptx.addSlide(); addTitle(s, 13, "Sidebar ?芸?嚗?撠?敺?甇?, "瘛箄?瘜冽??????辣瘝餌????啣???銝?舀???, "Visual design");
  addImageFrame(s, IMG_DARK, 0.55, 2.0, 4.05, 3.35);
  addImageFrame(s, IMG_LIGHT, 4.85, 2.0, 4.05, 3.35);
  s.addText("BEFORE",{x:0.55,y:5.53,w:4.05,h:0.2,fontFace:FONT,fontSize:8,bold:true,color:C.faint,align:"center",margin:0});
  s.addText("AFTER",{x:4.85,y:5.53,w:4.05,h:0.2,fontFace:FONT,fontSize:8,bold:true,color:C.blue,align:"center",margin:0});
  const swatches=[["Primary","0F62FE"],["Canvas","F7F9FC"],["Surface","FFFFFF"],["Border","E3E8EF"],["Success","14804A"],["Error","C4342D"]];
  swatches.forEach((sw,i)=>{ const y=2.05+i*0.65; s.addShape(pptx.ShapeType.roundRect,{x:9.35,y,w:0.38,h:0.38,rectRadius:0.04,fill:{color:sw[1]},line:{color:sw[1]==="FFFFFF"?C.line:sw[1]}}); s.addText(sw[0],{x:9.88,y:y+0.04,w:1.2,h:0.16,fontFace:FONT,fontSize:8.5,bold:true,color:C.ink,margin:0}); s.addText(`#${sw[1]}`,{x:9.88,y:y+0.22,w:1.2,h:0.14,fontFace:FONT,fontSize:7.5,color:C.muted,margin:0}); });
  box(s,9.25,6.0,3.25,0.55,{fill:C.blueSoft,line:C.blueSoft}); s.addText("Focus ???勗??????撠",{x:9.45,y:6.18,w:2.85,h:0.18,fontFace:FONT,fontSize:10.5,bold:true,color:C.blueDark,align:"center",margin:0});
}

// 14 Scenario matrix
{
  const s = pptx.addSlide(); addTitle(s, 14, "銝?敹?銝車?湔", "璅⊥????擃????桃?扯?撌亦??", "Scenario strategy");
  const rows = [
    ["隡平?扯?","??,"??,"??,"??,"??,""],
    ["雓漣","??,"","","??,"",""],
    ["撅汗","??,"","","","","??],
    ["?降","??,"","","","??,""],
    ["?岫","??,"","","","??,""],
    ["?∪極瘣餃?","??,"","??,"","",""],
    ["?蝳?,"??,"??,"","","","??],
  ];
  s.addTable([["?湔","Check-in","Check-out","蝳嚗曈?,"??","頨思遢嚗漣雿?,"???亙"],...rows],{x:0.7,y:2.05,w:11.9,h:3.9,border:{type:"solid",color:C.line,pt:0.6},fill:C.white,color:C.text,fontFace:FONT,fontSize:9.5,margin:0.07,rowH:0.42,colW:[1.55,1.55,1.55,1.55,1.55,1.75,1.75],bold:false,autoFit:false});
  s.addShape(pptx.ShapeType.rect,{x:0.7,y:2.05,w:11.9,h:0.48,fill:{color:C.navy},line:{color:C.navy}});
  s.addText("?梁?詨?嚗dentity嚚ecision嚚esult嚚og嚚nalytics",{x:2.4,y:6.27,w:8.55,h:0.25,fontFace:FONT,fontSize:13,bold:true,color:C.blueDark,align:"center",margin:0});
}

// 15 Value proposition
{
  const s = pptx.addSlide(); addTitle(s, 15, "Value Proposition嚗??勗???唬?璆剖??, "?蜓撘萄?撽???Problem?olution Fit嚗?銝恐蝔勗歇??PMF", "Value proposition");
  box(s,0.55,2.0,5.85,4.2,{fill:C.white,line:C.line}); box(s,6.92,2.0,5.85,4.2,{fill:C.white,line:C.line});
  s.addText("CUSTOMER PROFILE",{x:0.85,y:2.25,w:2.1,h:0.2,fontFace:FONT,fontSize:8.5,bold:true,color:C.blue,charSpacing:1,margin:0});
  s.addText("VALUE MAP",{x:7.22,y:2.25,w:2.1,h:0.2,fontFace:FONT,fontSize:8.5,bold:true,color:C.green,charSpacing:1,margin:0});
  const left=[["JOBS","?蔭?撽?憭里?詻銵?],["PAINS","撌亙???????鈭箄????航蕭皞?],["GAINS","敹恍?蝣箝閫??????葫"]];
  const right=[["PRODUCTS","Check-in Core?芋?踴恣???梯”"],["RELIEVERS","?芸??文???銝甇乓anual Review?udit"],["CREATORS","敹恍?蝺?璆?Demo???刻?鞈?鞈"]];
  left.forEach((a,i)=>{const y=2.78+i*1.08; pill(s,a[0],0.88,y,1.05,C.blueDark,C.blueSoft); s.addText(a[1],{x:2.12,y:y+0.03,w:3.75,h:0.5,fontFace:FONT,fontSize:11,color:C.text,margin:0,fit:"shrink",valign:"mid"});});
  right.forEach((a,i)=>{const y=2.78+i*1.08; pill(s,a[0],7.25,y,1.15,C.green,C.greenSoft); s.addText(a[1],{x:8.55,y:y+0.03,w:3.7,h:0.5,fontFace:FONT,fontSize:11,color:C.text,margin:0,fit:"shrink",valign:"mid"});});
  arrow(s,6.43,4.0,0.42,C.blue);
  pill(s,"PMF 敺?霅???嚗?蝝?隞祥??嚗隞?獢?,3.45,6.42,6.4,C.red,C.redSoft);
}

// 16 KPI tree
{
  const s = pptx.addSlide(); addTitle(s, 16, "KPI嚗遣蝡?撽?平????", "銝誑?憟賜????塚??誑銵?????平蝯??惜撽?", "Measurement");
  const levels=[
    ["DESIGN INPUT","Light Shell嚚?????Design System嚚?暺?,C.blue,C.blueSoft],
    ["USER BEHAVIOR","TCR嚚ime on Task嚚rror嚚US嚚doption",C.cyan,C.cyanSoft],
    ["OPERATIONS","摰Ｘ???閮毀?嚚犖撌亙極??靘??望?",C.amber,C.amberSoft],
    ["BUSINESS","蝥?嚗?憭梧?Demo?OC嚚?桅望?嚚RR嚗OI",C.green,C.greenSoft],
  ];
  levels.forEach((l,i)=>{const x=0.75+i*3.08; box(s,x,2.4,2.65,2.3,{fill:l[3],line:l[3]}); s.addText(l[0],{x:x+0.2,y:2.68,w:2.2,h:0.22,fontFace:FONT,fontSize:8,bold:true,color:l[2],align:"center",margin:0,charSpacing:0.7}); s.addText(l[1],{x:x+0.25,y:3.24,w:2.15,h:0.85,fontFace:FONT,fontSize:11.5,bold:true,color:C.ink,align:"center",margin:0,fit:"shrink",valign:"mid"}); if(i<3) arrow(s,x+2.68,3.55,0.35,C.blue);});
  box(s,1.22,5.25,10.9,0.9,{fill:C.white,line:C.line});
  s.addText("Baseline嚗?蝺??喳? 4 ?望? 20 ?湔暑???∠ cohort嚗??改?摰? Go / No-Go",{x:1.55,y:5.58,w:10.25,h:0.25,fontFace:FONT,fontSize:12,bold:true,color:C.blueDark,align:"center",margin:0,fit:"shrink"});
}

// 17 Finance
{
  const s = pptx.addSlide(); addTitle(s, 17, "?????????", "蝻箔??祕?豢????遣蝡??砍????????漲", "Financial case");
  box(s,0.55,2.05,5.9,2.05,{fill:C.white,line:C.line}); box(s,6.85,2.05,5.9,2.05,{fill:C.white,line:C.line});
  s.addText("?",{x:0.85,y:2.35,w:0.8,h:0.25,fontFace:FONT,fontSize:15,bold:true,color:C.red,margin:0});
  bulletList(s,["?弦嚗身閮???蝡荔?QA","閮毀嚗???蝬剛風嚗????],0.88,2.85,4.9,{fontSize:10.5,gap:0.52,dotColor:C.red});
  s.addText("??",{x:7.15,y:2.35,w:0.8,h:0.25,fontFace:FONT,fontSize:15,bold:true,color:C.green,margin:0});
  bulletList(s,["摰Ｘ?嚗???閮毀嚗??潛???,"?舀飛?憓???瑕??"],7.18,2.85,4.9,{fontSize:10.5,gap:0.52,dotColor:C.green});
  const formulas=["ROI 嚗?蝮賣???蝮賣??伐?繩蝮賣??永?00%","Breakeven ? 嚗?蝮賣???繩 瘥?瘛冽???,"撟游漲摰Ｘ?蝭??嚗???撠?隞亂獢??珍?2"];
  formulas.forEach((f,i)=>{box(s,0.75,4.5+i*0.58,7.3,0.43,{fill:i===0?C.blueSoft:C.white,line:i===0?C.blueSoft:C.line});s.addText(f,{x:0.95,y:4.63+i*0.58,w:6.9,h:0.16,fontFace:FONT,fontSize:10.5,bold:i===0,color:i===0?C.blueDark:C.text,margin:0,fit:"shrink"});});
  s.addTable([["??","?∠嚗???,"?嚗???],["靽?","雿?身","???嚗??嗅辣敺?],["?箸?","隞亥岫暺??,"??roadmap ?批"],["璅?","?∠???券?","餈極雿????"]],{x:8.35,y:4.5,w:4.25,h:1.95,border:{type:"solid",color:C.line,pt:0.6},fill:C.white,color:C.text,fontFace:FONT,fontSize:8.2,margin:0.04,rowH:0.42,colW:[0.8,1.55,1.9]});
  pill(s,"Base Case ?思?閮?蝝??,4.55,6.62,4.2,C.red,C.redSoft);
}

// 18 Roadmap
{
  const s = pptx.addSlide(); addTitle(s, 18, "Roadmap嚗??挾???捱蝑??", "??霅???摨改???詨?瘚?嚗?敺??游之璅∠???璆剝?霅?, "Execution");
  const phases=[
    ["0","?弦?暺?,"瘣?嚗aseline嚗瓷??雿?,C.faint],
    ["1","Design System","Light Shell嚗oken嚗ore UI",C.blue],
    ["2","?詨?瘚?","Check-in嚗?????嚗岫暺?,C.cyan],
    ["3","璅∠??游?","??嚗??抬?Audit嚗芋??,C.amber],
    ["4","撽??游撐","Cohort嚗OI嚗?璅∪?",C.green],
  ];
  phases.forEach((p,i)=>{const x=0.55+i*2.53; box(s,x,2.22,2.18,2.45,{fill:C.white,line:p[3],lineWidth:1.2}); s.addShape(pptx.ShapeType.ellipse,{x:x+0.18,y:2.42,w:0.48,h:0.48,fill:{color:p[3]},line:{color:p[3]}}); s.addText(p[0],{x:x+0.31,y:2.55,w:0.22,h:0.16,fontFace:FONT,fontSize:9,bold:true,color:C.white,align:"center",margin:0}); s.addText(p[1],{x:x+0.22,y:3.13,w:1.72,h:0.32,fontFace:FONT,fontSize:13,bold:true,color:C.ink,align:"center",margin:0,fit:"shrink"}); s.addText(p[2],{x:x+0.22,y:3.65,w:1.72,h:0.58,fontFace:FONT,fontSize:9.5,color:C.muted,align:"center",margin:0,fit:"shrink"}); if(i<4){arrow(s,x+2.2,3.42,0.3,C.blue); pill(s,"GATE",x+2.05,4.95,0.62,C.blueDark,C.blueSoft);} });
  const pri=["P0嚗ight Shell嚗?????Token嚗?暺?,"P1嚗anual Review嚗emplate嚗ffline","P2嚗脤??梯”嚗蜓憿恥鋆?];
  pri.forEach((p,i)=>pill(s,p,1.05+i*4.1,5.9,3.65,i===0?C.blueDark:C.text,i===0?C.blueSoft:C.white));
}

// 19 Risks
{
  const s = pptx.addSlide(); addTitle(s, 19, "憸券???寡?暺?, "?憭折◢?芯??舀滓?莎??瘝?霅????仃?扯??∠銝雲", "Risk management");
  const risks=[
    ["?暹?隞??,"Phase 0?? 撠??舫?銝?Ｙ蕃??,"銝?,"銝?],
    ["?芣蝢?","蝬? Task嚗CAG嚗oken嚗雁霅?KPI","擃?,"銝?],
    ["敶梢蝧","靽?隞餃?璅∪?嚗eta嚗eature flag嚗??","銝?,"擃?],
    ["撌亦?瘝?皞?,"Quick Win ??嚗? effort 靘?RICE 撱嗅?","擃?,"擃?],
    ["???????,"baseline嚗ohort嚗ate嚗???","擃?,"擃?],
  ];
  s.addTable([["?閫暺?,"PM ????雿??,"敶梢","璈?"],...risks],{x:0.6,y:2.0,w:8.4,h:4.35,border:{type:"solid",color:C.line,pt:0.6},fill:C.white,color:C.text,fontFace:FONT,fontSize:9.2,margin:0.06,rowH:0.56,colW:[1.6,4.8,1.0,1.0]});
  s.addShape(pptx.ShapeType.rect,{x:0.6,y:2.0,w:8.4,h:0.56,fill:{color:C.navy},line:{color:C.navy}});
  box(s,9.35,2.0,3.35,4.35,{fill:C.white,line:C.line});
  s.addText("憸券瘝餌?",{x:9.65,y:2.35,w:2.7,h:0.3,fontFace:FONT,fontSize:17,bold:true,color:C.ink,margin:0});
  bulletList(s,["瘥?憸券?? owner","摰儔 trigger ??敺拇獢?,"閰阡?靽???蝔?,"???芷??喳?甇Ｘ撘?,"??銝?銴飛??],9.65,2.95,2.55,{fontSize:10.5,gap:0.55,dotColor:C.red});
}

// 20 Decision
{
  const s = pptx.addSlide(); addTitle(s, 20, "銝餌恣瘙箇???嚗?憭拚?閬??暻?, "?詨? Phase 0???楊?券? owner??????銝??捱蝑?暺?, "Decision request"); addDecisionChip(s,"瘙箇?嚗pprove Phase 0??");
  const cards=[
    ["01 撱箄降?詨?","?弦??baseline\nLight Shell嚗esign System\n?詨???",C.blue,C.blueSoft],
    ["02 ??鞈?","PM嚗X嚗E嚗ata嚗A\nFTE ?望敺?capacity planning",C.cyan,C.cyanSoft],
    ["03 ????","?舫?霅?prototype\nToken嚗omponent嚗aseline\nPhase 2 Business Case",C.green,C.greenSoft],
    ["04 銝餉?憸券","鞈?銝雲嚗cope ?刻\n?∠?餃?嚗?蝡航?鞈?靘陷",C.red,C.redSoft],
  ];
  cards.forEach((c,i)=>{const x=0.55+i*3.12;box(s,x,2.12,2.82,2.7,{fill:c[3],line:c[3]});s.addText(c[0],{x:x+0.22,y:2.42,w:2.3,h:0.27,fontFace:FONT,fontSize:13,bold:true,color:c[2],margin:0});s.addText(c[1],{x:x+0.22,y:3.05,w:2.35,h:1.05,fontFace:FONT,fontSize:10.5,bold:true,color:C.ink,margin:0,fit:"shrink",breakLine:false,valign:"mid"});});
  box(s,1.05,5.25,11.2,0.95,{fill:C.navy,line:C.navy});
  s.addText("銝?瘙箇?蝭暺?Phase 0?? Gate Review嚗??蝣箄?嚗?,{x:1.45,y:5.52,w:10.4,h:0.28,fontFace:FONT,fontSize:16,bold:true,color:C.white,align:"center",margin:0});
  pill(s,"GO嚗脣 Phase 2",3.2,6.45,2.7,C.green,C.greenSoft); pill(s,"ADJUST嚗葬撠?撱嗅?",5.45,6.45,2.7,C.amber,C.amberSoft); pill(s,"NO-GO嚗?甇?,7.7,6.45,2.4,C.red,C.redSoft);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
pptx.writeFile({ fileName: OUT });
console.log(OUT);

