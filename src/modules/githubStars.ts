import { createZToolkit } from "../utils/ztoolkit";

/* global Zotero, addon */
declare const Zotero: any;
declare const addon: any;

// Ensure ztoolkit is available globally (hooks creates it), but fall back if not yet
const ztoolkit: ReturnType<typeof createZToolkit> = (globalThis as any).ztoolkit || createZToolkit();
(globalThis as any).ztoolkit = ztoolkit;

export class GitHubStars {
    /**
     * Register context menu item and extra column during startup.
     */
    static async register() {
        this.registerContextMenuItem();
        await this.registerExtraColumn();
    }

    private static _menuRegistered = false;

    /**
     * Add "Update GitHub Stars" item into item context menu.
     */
    private static registerContextMenuItem() {
        if (this._menuRegistered) return;

        // 清理已有重复菜单项（可能由旧版本残留或多次加载产生）
        try {
            for (const win of Zotero.getMainWindows?.() || []) {
                const elems = win.document?.querySelectorAll?.('#zotero-itemmenu-github-stars');
                elems?.forEach((el: any) => el.remove());
            }
        } catch (e) {
            // ignore if Zotero not ready
        }

        const id = "zotero-itemmenu-github-stars";
        ztoolkit.Menu.register("item", {
            tag: "menuitem",
            id,
            label: "更新 GitHub Stars", // TODO: I18N
            commandListener: () => this.updateStarsForSelectedItems(),
        });
        this._menuRegistered = true;
    }

    /**
     * Provide a read-only column to show current GitHub Stars value extracted from Extra field.
     */
    private static async registerExtraColumn() {
        const field = "githubStars";
        await Zotero.ItemTreeManager.registerColumns({
            pluginID: addon.data.config.addonID,
            dataKey: field,
            label: "GitHub Stars",
            dataProvider: (item: any) => {
                const extra = (item.getField("extra") || "") as string;
                const m = /GitHub Stars:\s*(\d+)/i.exec(extra);
                return m ? m[1] : "";
            },
        });
    }

    /**
     * Iterate over currently selected items and update GitHub Stars information.
     */
    static async updateStarsForSelectedItems() {
        const mainWin = Zotero.getMainWindow();
        // @ts-ignore – ZoteroPane is exposed on main window
        const selItems: any[] = mainWin?.ZoteroPane?.getSelectedItems?.();
        if (!selItems || !selItems.length) {
            ztoolkit.getGlobal("alert")("未选择任何条目！");
            return;
        }

        const progress = new ztoolkit.ProgressWindow("更新 GitHub Stars", {
            closeOnClick: true,
            closeTime: -1,
        })
            .createLine({ text: "正在更新…", progress: 0 })
            .show();

        const total = selItems.length;

        for (let i = 0; i < total; i++) {
            const item = selItems[i];
            try {
                const stars = await this.fetchStarsForItem(item);
                if (stars !== null) {
                    await this.writeStarsToItem(item, stars);
                }
            } catch (e) {
                ztoolkit.log("GitHubStars", "Error updating item", item.id, e);
            }
            progress.changeLine({
                progress: Math.round(((i + 1) / total) * 100),
                text: `(${i + 1}/${total}) 完成`,
            });
        }

        progress.startCloseTimer(3000);
    }

    /**
     * Query GitHub search API for the best-matched repository.
     * Returns stars number or null if not found.
     */
    private static async fetchStarsForItem(item: any): Promise<number | null> {
        const title = item.getField("title")?.toString().trim();
        if (!title) return null;

        const query = encodeURIComponent(`${title} in:name,description`);
        const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=1`;
        try {
            const response = await fetch(url, {
                headers: {
                    Accept: "application/vnd.github+json",
                    "User-Agent": "Zotero-GitHubStars-Plugin",
                },
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data: any = await response.json();
            if (data?.total_count > 0 && data.items?.length) {
                return data.items[0].stargazers_count ?? null;
            }
            return null;
        } catch (err) {
            ztoolkit.log("GitHubStars", "fetch error", err);
            return null;
        }
    }

    /**
     * Write or update "GitHub Stars: N" line in Extra field of item.
     */
    private static async writeStarsToItem(item: any, stars: number) {
        const keyLabel = "GitHub Stars";
        let extra = (item.getField("extra") || "") as string;
        const lines = extra.split(/\r?\n/).filter((l) => l.trim() !== "");
        const idx = lines.findIndex((l) => l.toLowerCase().startsWith(keyLabel.toLowerCase()));
        const newLine = `${keyLabel}: ${stars}`;
        if (idx >= 0) {
            lines[idx] = newLine;
        } else {
            lines.push(newLine);
        }
        extra = lines.join("\n");
        item.setField("extra", extra);
        await item.saveTx();
    }
} 