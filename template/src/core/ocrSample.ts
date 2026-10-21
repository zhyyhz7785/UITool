import type { OcrDocument, OcrLine, OcrOpenParams } from "./contract";

const ENGINE = "ppocrv6-small";

function glyphs(text: string, marks: Record<number, number> = {}): OcrLine {
  return { glyphs: [...text].map((ch, i) => ({ ch, conf: marks[i] ?? 0.98 })) };
}

/** 门诊单据。下标是可能有误或可能错误的字。 */
function clinicPage(): OcrLine[] {
  return [
    glyphs("市第一医院 · 内科门诊"),
    glyphs("门诊病历"),
    glyphs("姓名　张伟　　性别　男　　年龄　34"),
    glyphs("就诊日期　2026-03-18　　编号　A-1842"),
    glyphs("主诉　反复咳嗽三周，夜间加重。", { 5: 0.83 }),
    glyphs("现病史　无明显发热，偶有胸问，活动后气短。", { 13: 0.51 }),
    glyphs("体格检查　双肺呼吸音粗，未闻及湿罗音。", { 16: 0.82 }),
    glyphs("初步诊断　急性支气菅炎", { 9: 0.44 }),
    glyphs("处理　口服药物，三日后复诊。如加重请及时就诊。", { 12: 0.74 })
  ];
}

function reportPage(): OcrLine[] {
  return [glyphs("检验报告"), glyphs("白细胞　6.2"), glyphs("中性粒比　0.71", { 0: 0.62 })];
}

function advicePage(): OcrLine[] {
  return [glyphs("医嘱"), glyphs("多饮水，三日后复诊。")];
}

export function ocrPlain(doc: OcrDocument | null): string {
  if (!doc || doc.status !== "ready") return "";
  return doc.pages.map((page) => page.map((line) => line.glyphs.map((g) => g.ch).join("")).join("\n")).join("\n\n");
}

export function buildOcrDocument(params: OcrOpenParams, phase: "open" | "done" = "open"): OcrDocument {
  const source = params.source === "pdf" ? "pdf" : "image";
  const path = params.path ?? (source === "pdf" ? "扫描件.pdf" : "附图.jpg");
  const base = { source, path, engine: ENGINE, page: 0 } as const;
  if (path === "nomodel") {
    return { ...base, status: "nomodel", pageCount: 0, pages: [] };
  }
  if (path === "empty") {
    return { ...base, status: "empty", pageCount: source === "pdf" ? 1 : 1, pages: [] };
  }
  const pages = source === "pdf" ? [clinicPage(), reportPage(), advicePage()] : [clinicPage()];
  if (source === "pdf" && phase === "open") {
    return { ...base, status: "busy", pageCount: pages.length, pages: [] };
  }
  return { ...base, status: "ready", pageCount: pages.length, pages };
}
