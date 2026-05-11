import fs from "node:fs";
import path from "node:path";

const outPath = path.resolve("docs/user-manual.pdf");
const pageW = 595.28;
const pageH = 841.89;
const marginX = 54;
const marginTop = 58;
const marginBottom = 56;
const contentW = pageW - marginX * 2;

const colors = {
  ink: [0.13, 0.14, 0.12],
  muted: [0.38, 0.4, 0.37],
  line: [0.82, 0.79, 0.74],
  accent: [0.18, 0.44, 0.37],
  rust: [0.73, 0.35, 0.19],
  soft: [0.95, 0.94, 0.9],
  pale: [0.9, 0.95, 0.92],
  white: [1, 1, 1],
};

const doc = {
  pages: [],
  current: null,
  y: 0,
};

function rgb([r, g, b], stroke = false) {
  return `${f(r)} ${f(g)} ${f(b)} ${stroke ? "RG" : "rg"}`;
}

function f(num) {
  return Number(num).toFixed(3).replace(/\.?0+$/, "");
}

function utf16Hex(text) {
  const bytes = [];
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code > 0xffff) {
      const hi = Math.floor((code - 0x10000) / 0x400) + 0xd800;
      const lo = ((code - 0x10000) % 0x400) + 0xdc00;
      bytes.push(hi >> 8, hi & 255, lo >> 8, lo & 255);
    } else {
      bytes.push(code >> 8, code & 255);
    }
  }
  return Buffer.from(bytes).toString("hex").toUpperCase();
}

function textWidth(text, size) {
  let units = 0;
  for (const ch of text) {
    if (ch === " ") units += 0.32;
    else if (/[\x00-\x7F]/.test(ch)) units += 0.56;
    else units += 1;
  }
  return units * size;
}

function wrap(text, size, maxWidth) {
  const lines = [];
  const paras = String(text).split("\n");
  for (const para of paras) {
    let line = "";
    for (const ch of para) {
      if (textWidth(line + ch, size) <= maxWidth || line.length === 0) {
        line += ch;
      } else {
        lines.push(line);
        line = ch.trimStart();
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function beginPage({ cover = false } = {}) {
  doc.current = [];
  doc.y = pageH - marginTop;
  doc.pages.push(doc.current);
  if (!cover) {
    line(marginX, pageH - 38, pageW - marginX, pageH - 38, colors.line, 0.6);
    drawText("尹の日本語 用户使用手册", marginX, pageH - 28, 8.5, colors.muted);
    drawText(String(doc.pages.length - 1).padStart(2, "0"), pageW - marginX - 12, pageH - 28, 8.5, colors.muted);
  }
}

function add(cmd) {
  doc.current.push(cmd);
}

function drawText(text, x, y, size = 10.5, color = colors.ink) {
  add(`BT /F1 ${f(size)} Tf ${rgb(color)} 1 0 0 1 ${f(x)} ${f(y)} Tm <${utf16Hex(text)}> Tj ET`);
}

function line(x1, y1, x2, y2, color = colors.line, width = 1) {
  add(`q ${rgb(color, true)} ${f(width)} w ${f(x1)} ${f(y1)} m ${f(x2)} ${f(y2)} l S Q`);
}

function rect(x, y, w, h, fill, stroke = null, width = 1) {
  const fillCmd = fill ? rgb(fill) : "";
  const strokeCmd = stroke ? `${rgb(stroke, true)} ${f(width)} w` : "";
  const paint = fill && stroke ? "B" : fill ? "f" : "S";
  add(`q ${fillCmd} ${strokeCmd} ${f(x)} ${f(y)} ${f(w)} ${f(h)} re ${paint} Q`);
}

function ensure(space = 40) {
  if (doc.y - space < marginBottom) beginPage();
}

function heading(text) {
  ensure(56);
  drawText(text, marginX, doc.y, 19, colors.accent);
  doc.y -= 12;
  line(marginX, doc.y, pageW - marginX, doc.y, colors.line, 0.8);
  doc.y -= 22;
}

function subheading(text) {
  ensure(34);
  drawText(text, marginX, doc.y, 12.5, colors.ink);
  doc.y -= 19;
}

function paragraph(text, opts = {}) {
  const size = opts.size ?? 10.5;
  const color = opts.color ?? colors.ink;
  const width = opts.width ?? contentW;
  const x = opts.x ?? marginX;
  const lines = wrap(text, size, width);
  ensure(lines.length * size * 1.7 + 8);
  for (const ln of lines) {
    drawText(ln, x, doc.y, size, color);
    doc.y -= size * 1.7;
  }
  doc.y -= opts.after ?? 4;
}

function bullet(items) {
  for (const item of items) {
    const lines = wrap(item, 10.2, contentW - 18);
    ensure(lines.length * 17 + 4);
    drawText("•", marginX + 2, doc.y, 10.2, colors.rust);
    lines.forEach((ln, idx) => {
      drawText(ln, marginX + 18, doc.y - idx * 17, 10.2, colors.ink);
    });
    doc.y -= lines.length * 17 + 3;
  }
  doc.y -= 3;
}

function callout(text, kind = "green") {
  const size = 10;
  const lines = wrap(text, size, contentW - 24);
  const h = lines.length * 16 + 18;
  ensure(h + 8);
  rect(marginX, doc.y - h + 6, contentW, h, kind === "gold" ? [0.98, 0.95, 0.88] : colors.pale, null);
  rect(marginX, doc.y - h + 6, 4, h, kind === "gold" ? [0.7, 0.54, 0.22] : colors.accent, null);
  let y = doc.y - 10;
  for (const ln of lines) {
    drawText(ln, marginX + 14, y, size, kind === "gold" ? [0.36, 0.29, 0.11] : [0.14, 0.28, 0.24]);
    y -= 16;
  }
  doc.y -= h + 4;
}

function placeholder(title, desc) {
  const h = 118;
  ensure(h + 22);
  rect(marginX, doc.y - h, contentW, h, colors.white, [0.68, 0.7, 0.66], 1.2);
  line(marginX + 10, doc.y - 10, pageW - marginX - 10, doc.y - h + 10, [0.85, 0.86, 0.82], 0.6);
  line(pageW - marginX - 10, doc.y - 10, marginX + 10, doc.y - h + 10, [0.85, 0.86, 0.82], 0.6);
  drawText(title, marginX + 142, doc.y - 49, 12, colors.accent);
  drawText(desc, marginX + 82, doc.y - 72, 9.2, colors.muted);
  doc.y -= h + 14;
}

function table(rows, widths) {
  const size = 9.2;
  const rowHeights = rows.map((row, idx) => {
    const maxLines = Math.max(...row.map((cell, i) => wrap(cell, size, widths[i] - 12).length));
    return Math.max(idx === 0 ? 28 : 34, maxLines * 14 + 12);
  });
  const total = rowHeights.reduce((a, b) => a + b, 0);
  ensure(total + 14);
  let y = doc.y;
  rows.forEach((row, r) => {
    const h = rowHeights[r];
    let x = marginX;
    row.forEach((cell, c) => {
      rect(x, y - h, widths[c], h, r === 0 ? colors.pale : colors.white, colors.line, 0.6);
      const lines = wrap(cell, size, widths[c] - 12);
      let ty = y - 16;
      for (const ln of lines) {
        drawText(ln, x + 6, ty, size, r === 0 ? colors.accent : colors.ink);
        ty -= 14;
      }
      x += widths[c];
    });
    y -= h;
  });
  doc.y = y - 10;
}

function cover() {
  beginPage({ cover: true });
  rect(0, 0, pageW, pageH, [1, 0.99, 0.97]);
  drawText("尹の日本語", marginX, pageH - 80, 24, colors.ink);
  rect(pageW - marginX - 106, pageH - 82, 106, 24, null, colors.accent, 1);
  drawText("用户使用手册", pageW - marginX - 91, pageH - 75, 10, colors.accent);
  drawText("日本语语法与词汇练习平台", marginX, pageH - 250, 30, colors.ink);
  drawText("使用指南", marginX, pageH - 290, 30, colors.ink);
  paragraph("这份手册面向第一次使用平台的学习者，帮助用户快速了解入口、练习流程、词汇集、加词、历史记录和设置功能。手册中已预留截图位置，方便后续补充真实界面图片。", {
    x: marginX,
    width: 410,
    size: 12,
    color: colors.muted,
    after: 0,
  });
  const cardY = 230;
  const cards = [
    ["语法练习", "从题库中抽取日语例句，通过单选题练习目标语法。"],
    ["共享词汇练习", "基于词汇集进行单词辨析，可按设置控制练习范围。"],
    ["词汇集管理", "查看、创建、加入、编辑词汇集，并为练习准备题库。"],
  ];
  cards.forEach(([t, d], i) => {
    const x = marginX + i * 162;
    rect(x, cardY, 148, 76, colors.white, colors.line, 0.8);
    drawText(t, x + 12, cardY + 49, 11, colors.accent);
    wrap(d, 8.8, 122).forEach((ln, idx) => drawText(ln, x + 12, cardY + 30 - idx * 13, 8.8, colors.muted));
  });
  line(marginX, 72, pageW - marginX, 72, colors.line, 0.8);
  drawText("文档版本：1.0　｜　生成日期：2026 年 5 月 9 日　｜　适用对象：平台普通用户与词汇贡献者", marginX, 52, 8.8, colors.muted);
}

function toc() {
  beginPage();
  heading("目录");
  const rows = [
    ["01", "快速开始", "认识首页、顶部导航和主要入口。", "P3"],
    ["02", "完成一次练习", "选择答案、提交、查看解析、继续下一题。", "P4"],
    ["03", "词汇集", "查看词汇、排序、切换假名、管理词汇集。", "P6"],
    ["04", "加词与贡献", "向指定词汇集提交新单词和备注。", "P8"],
    ["05", "设置、账号与历史", "登录注册、练习范围、片假名比例和历史记录。", "P9"],
  ];
  for (const [no, title, desc, page] of rows) {
    line(marginX, doc.y + 8, pageW - marginX, doc.y + 8, colors.line, 0.5);
    drawText(no, marginX, doc.y, 12, colors.rust);
    drawText(title, marginX + 42, doc.y, 12, colors.ink);
    drawText(desc, marginX + 42, doc.y - 18, 9, colors.muted);
    drawText(page, pageW - marginX - 18, doc.y, 9, colors.muted);
    doc.y -= 46;
  }
  callout("截图说明：本手册中的虚线框为图片预留位。你可以在后续编辑 HTML 源文件时，把对应位置替换为实际截图，或直接在 PDF 编辑器中覆盖插入图片。", "gold");
}

cover();
toc();

beginPage();
heading("01 快速开始");
paragraph("打开平台后，首页会展示应用标识和两个主要练习入口：语法练习与共享词汇练习。顶部导航提供常用功能，包括加词、词汇集、历史和设置；在较窄的屏幕上，这些入口会收纳到菜单中。");
placeholder("预留图片：首页截图", "建议放入首页完整界面，包含应用标题和两个练习按钮。");
subheading("主要入口");
bullet([
  "语法练习：适合练习固定语法句型，题目来自语法题库。",
  "共享词汇练习：适合复习词汇集中的单词和例句。",
  "词汇集：查看已有词汇集，进入某个词汇集浏览词条。",
  "设置：登录账号，调整共享词汇练习范围和假名显示比例。",
]);
subheading("推荐使用顺序");
bullet([
  "先进入设置，确认共享词汇练习会使用哪些词汇集。",
  "从首页选择一种练习模式，完成数道题熟悉流程。",
  "在词汇集中查看生词，必要时使用加词功能补充内容。",
]);

beginPage();
heading("02 完成一次练习");
paragraph("练习页面采用单选题形式。题目会展示一段日语句子，目标位置以空缺或强调形式呈现；下方列出若干备选答案。选择答案后，点击提交即可查看结果。");
placeholder("预留图片：答题页面截图", "建议放入一道尚未提交的题目，展示题干、选项和提交按钮。");
subheading("答题步骤");
bullet([
  "阅读题干：先通读日语句子，观察空缺前后的语境，判断最自然的语法或词汇。",
  "选择答案：点击一个单选项。未选择答案时，提交按钮不可用，避免误提交。",
  "提交并查看反馈：系统会提示“回答正确！”或“好像有点不太对...”，并展示正确答案的含义。",
  "继续下一题：点击“继续:D”，系统会加载下一道题。",
]);
callout("小提示：如果题目涉及词汇读音，答案页可能会在词条后显示假名读法，帮助你把字形、读音和意思一起记住。");

beginPage();
heading("答案页与翻译");
paragraph("答案页会再次显示原句、目标语法或词汇形式、中文含义，并提供“获得翻译”按钮。点击后，平台会请求翻译服务，把日文例句翻译成中文。");
placeholder("预留图片：答案页截图", "建议放入提交后的界面，包含正确/错误反馈、原句、含义和两个操作按钮。");
table([
  ["页面元素", "用途"],
  ["答题反馈", "告诉你本题是否答对。"],
  ["原句", "复盘题目语境，确认正确答案放入句子后的效果。"],
  ["获得翻译", "请求中文翻译。网络或服务异常时，页面会提示翻译失败。"],
  ["继续:D", "结束当前题目，加载下一题。"],
], [130, contentW - 130]);

beginPage();
heading("03 词汇集");
paragraph("词汇集用于组织共享词汇练习的题库。进入词汇集页面后，你可以查看自己可访问的词汇集卡片；点击某张卡片即可进入详情页，浏览其中的词条。");
placeholder("预留图片：词汇集列表截图", "建议放入词汇集卡片列表，包含顶部操作图标。");
subheading("词汇集详情页");
paragraph("详情页会列出词汇集中的单词。顶部按钮可返回列表、切换排序方式、切换单词显示为原词或假名。排序按钮会在默认顺序、あ→ん、ん→あ之间循环。");
bullet([
  "查看词条：点击词条可展开更多信息，例如读音、含义、例句或相关说明。",
  "切换假名：点击语言图标后，词条可切换为假名显示，适合复习读音。",
]);

beginPage();
heading("管理词汇集");
paragraph("词汇集列表右上方提供若干操作图标。普通用户可以加入私有词汇集；有权限的用户可以创建、编辑或删除词汇集。部分操作需要输入词汇集密码。");
table([
  ["功能", "使用场景", "需要填写的信息"],
  ["添加词汇集", "创建一个新的公共或私有词汇集。", "名称、描述、权限、状态、密码、创建者。"],
  ["加入词汇集", "通过 ID 和密码加入私有词汇集。", "词汇集 ID、密码。"],
  ["编辑词汇集", "修改已选词汇集的信息或密码。", "名称、描述、作者、权限、状态、新密码。"],
  ["删除词汇集", "删除已选词汇集。", "词汇集密码。"],
], [108, 178, contentW - 286]);
callout("私有词汇集通常需要登录后才能加入。若加入失败，请先确认账号状态、词汇集 ID、密码和网络连接。");

beginPage();
heading("04 加词与贡献");
paragraph("通过加词页面，你可以向指定词汇集提交新的日语单词。系统会先检查同一词汇集中是否已经存在该词，再自动生成词条信息和例句。");
placeholder("预留图片：加词表单截图", "建议放入表单完整截图，包含词语名、贡献者、备注、词汇集和提交按钮。");
subheading("提交步骤");
bullet([
  "填写词语名：输入真实存在的日语单词，例如“改める”。这是必填项。",
  "补充贡献者和备注：贡献者和备注为可选项。备注可说明希望生成的用法、语境或侧重点。",
  "选择词汇集：选择这个单词要加入的词汇集。不同词汇集可以包含同名词。",
  "提交：提交期间页面会显示“提交中”。成功后会提示“提交成功！”。",
]);
callout("如果输入的词不是有效日语单词，或同一词汇集中已存在该词，页面会显示错误提示。根据提示修改后重新提交即可。", "gold");

beginPage();
heading("05 设置、账号与历史");
subheading("登录与注册");
paragraph("在设置页面可以登录或注册账号。注册成功后请留意确认邮件；登录后，设置页会显示当前账号邮箱，并提供退出登录按钮。");
placeholder("预留图片：设置页面截图", "建议放入登录区域、假名比例滑杆和词汇集选择区域。");
subheading("调整共享词汇练习范围");
paragraph("设置页会展示可用词汇集卡片。点击卡片即可决定该词汇集是否参与共享词汇练习。至少需要保留一个词汇集，避免练习范围为空。");
subheading("切换显示假名的比例");
paragraph("滑动比例条可以调整共享词汇练习中显示假名提示的概率。比例越高，练习时越容易看到假名读法；比例越低，越接近纯汉字/原词辨认训练。");
subheading("历史记录");
paragraph("每次提交题目后，平台会把该题保存到浏览器本地历史记录中。进入历史页面可以回看做过的句子，方便复盘高频错误或整理学习笔记。");
callout("历史记录保存在当前浏览器本地。如果更换设备、清理浏览器数据或使用不同浏览器，历史记录可能不会同步显示。");

beginPage();
heading("常见问题");
subheading("为什么题目一直在加载？");
paragraph("可能是网络连接、题库服务或数据库响应较慢。请稍等片刻，或刷新页面后重试。");
subheading("为什么翻译失败？");
paragraph("翻译功能依赖外部接口。若接口暂时不可用，页面会提示失败；可以稍后再次点击获得翻译。");
subheading("为什么加入私有词汇集失败？");
paragraph("请检查是否已登录、词汇集 ID 是否正确、密码是否匹配，以及该词汇集是否允许加入。");
subheading("为什么提交单词后显示已存在？");
paragraph("同一词汇集中不能重复添加同一个单词。你可以选择其他词汇集，或修改备注后联系管理员更新已有词条。");
callout("手册维护建议：每次新增页面、按钮或用户流程后，同步更新对应章节，并替换预留图片为真实截图。", "gold");

function buildPdf(pages) {
  const objects = [];
  const addObj = (body) => {
    objects.push(body);
    return objects.length;
  };

  const catalogId = addObj("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesId = addObj("");
  const fontId = addObj("<< /Type /Font /Subtype /Type0 /BaseFont /STSong-Light /Encoding /UniGB-UCS2-H /DescendantFonts [4 0 R] >>");
  const descendantId = addObj("<< /Type /Font /Subtype /CIDFontType0 /BaseFont /STSong-Light /CIDSystemInfo << /Registry (Adobe) /Ordering (GB1) /Supplement 2 >> /FontDescriptor 5 0 R >>");
  const descriptorId = addObj("<< /Type /FontDescriptor /FontName /STSong-Light /Flags 6 /FontBBox [0 -200 1000 900] /ItalicAngle 0 /Ascent 880 /Descent -120 /CapHeight 700 /StemV 80 >>");

  const pageIds = [];
  for (const page of pages) {
    const stream = page.join("\n");
    const streamId = addObj(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
    const pageId = addObj(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${streamId} 0 R >>`);
    pageIds.push(pageId);
  }

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, "binary"));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, "binary");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, "binary");
}

fs.writeFileSync(outPath, buildPdf(doc.pages));
console.log(`Wrote ${outPath}`);
