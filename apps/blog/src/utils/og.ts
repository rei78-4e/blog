import { readFileSync } from "node:fs";
import path from "node:path";
import { html } from "satori-html";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_AUTHOR = "れい(rei78_4e)";
export const OG_SITE_NAME = "Compute on Snails";

// Uncoated Paper Design: 不透明な紙面・罫線・ink の文字だけで構成する
const OG_THEME = {
	paper: "#f1eee5",
	paperLight: "#fbf9f2",
	ink: "#2d302b",
	inkMuted: "#77766d",
	rule: "#b7b0a2",
	ruleSoft: "#d0c9bb",
	rose: "#d38ca0",
} as const;

const fontPath = path.resolve(
	process.cwd(),
	"src/assets/fonts/noto_sans/NotoSansJP-Bold.ttf",
);
const fontData = readFileSync(fontPath);

const ogFonts = [
	{
		name: "Noto Sans JP",
		data: fontData,
		weight: 700 as const,
		style: "normal" as const,
	},
];

export const loadOgFonts = () => ogFonts;

const wrapperStyle = `
  width:${OG_IMAGE_WIDTH}px;
  height:${OG_IMAGE_HEIGHT}px;
  display:flex;
  background:${OG_THEME.paper};
  font-family:'Noto Sans JP',sans-serif;
`;

const cardStyle = `
  margin:56px;
  flex:1;
  background:${OG_THEME.paperLight};
  border:2px solid ${OG_THEME.rule};
  display:flex;
  flex-direction:column;
  box-sizing:border-box;
  padding:56px 64px 40px;
`;

export const buildOgVNode = (title: string, description?: string) => {
	const safeTitle = title.trim() || OG_SITE_NAME;
	const safeDescription = description?.trim() ?? "";

	return html`
    <div style="${wrapperStyle}">
      <div style="${cardStyle}">
        <div
          style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:24px;border-left:6px solid ${OG_THEME.rose};padding-left:36px;"
        >
          <div
            style="font-size:64px;font-weight:700;line-height:1.25;color:${OG_THEME.ink};word-break:break-word;white-space:pre-wrap;"
          >
            ${safeTitle}
          </div>

          <div
            style="display:${safeDescription ? "flex" : "none"};font-size:28px;font-weight:700;line-height:1.5;color:${OG_THEME.inkMuted};word-break:break-word;white-space:pre-wrap;"
          >
            ${safeDescription}
          </div>
        </div>

        <div
          style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:40px;padding-top:24px;border-top:1px solid ${OG_THEME.ruleSoft};font-size:28px;font-weight:700;color:${OG_THEME.inkMuted};"
        >
          <div>${OG_SITE_NAME}</div>
          <div>${OG_AUTHOR}</div>
        </div>
      </div>
    </div>
  `;
};
