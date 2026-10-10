// Khung "Xem trước" trong /admin: vẽ sản phẩm giống trang sản phẩm trên web
// (ảnh, tên, giá, chọn phân loại kiểu Shopee) thay vì chỉ liệt kê các ô.
(() => {
  const { h, createClass, CMS } = window;
  const vnd = (n) => Number(n).toLocaleString("vi-VN") + "đ";
  const range = (lo, hi) => (lo === hi ? vnd(lo) : `${vnd(lo)} – ${vnd(hi)}`);
  const categories = {
    "moc-khoa-nfc": "Móc khoá NFC", "photo-card": "Card Spotify", "card-nfc": "Card NFC",
    "lyric-card": "Lyric card", postcard: "Postcard", poster: "Poster", sticker: "Sticker",
    bookmark: "Bookmark", "phu-kien": "Phụ kiện",
  };
  const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

  const Placeholder = ({ label }) =>
    h("svg", { viewBox: "0 0 400 400", className: "ph" },
      h("rect", { width: 400, height: 400, fill: "hsl(12 70% 92%)" }),
      h("circle", { cx: 200, cy: 180, r: 110, fill: "hsl(12 30% 18%)" }),
      h("circle", { cx: 200, cy: 180, r: 34, fill: "hsl(12 75% 62%)" }),
      h("text", { x: 200, y: 345, textAnchor: "middle", fontSize: 26, fontWeight: 600, fill: "hsl(12 30% 22%)" }, label));

  const ProductPreview = createClass({
    getInitialState() { return { picked: [] }; },
    pick(gi, value) {
      const picked = [...this.state.picked];
      picked[gi] = picked[gi] === value ? null : value;
      this.setState({ picked });
    },
    render() {
      const { entry, getAsset } = this.props;
      const d = entry.get("data").toJS();
      const variants = (d.variants || [])
        .map((v) => ({ o: [v.option1, v.option2].map((s) => (s || "").trim()).filter(Boolean), p: num(v.price) }))
        .filter((v) => v.o.length);
      const groups = [0, 1]
        .map((i) => ({
          name: [d.option1Name, d.option2Name][i] || ["Mẫu", "Tuỳ chọn"][i],
          values: [...new Set(variants.map((v) => v.o[i]).filter(Boolean))],
        }))
        .filter((g) => g.values.length);
      const { picked } = this.state;
      const matching = (gi, value) =>
        variants.filter((v) => groups.every((_, i) => {
          const want = i === gi ? value : picked[i];
          return want == null || v.o[i] === want;
        }));
      const all = variants.map((v) => v.p).filter((p) => p !== null);
      const shown = matching(-1, null).map((v) => v.p).filter((p) => p !== null);
      const prices = shown.length ? shown : all;
      const lo = prices.length ? Math.min(...prices) : num(d.priceMin) ?? 0;
      const hi = prices.length ? Math.max(...prices) : num(d.priceMax) ?? lo;
      const allLo = all.length ? Math.min(...all) : lo;
      const allHi = all.length ? Math.max(...all) : hi;
      const name = d.shortName || d.name || "(chưa có tên)";
      const cat = categories[d.categorySlug] || "";
      const first = (d.images || []).find(Boolean) || d.image;
      const img = first ? String(getAsset(first)) : null;
      const custom = d.type !== "ready";
      const image = img ? h("img", { src: img, alt: "" }) : h(Placeholder, { label: cat });

      return h("div", { className: "page" },
        d.hidden ? h("p", { className: "hidden-note" }, "Sản phẩm này đang ẩn, khách không thấy trên web.") : null,
        h("p", { className: "section" }, "Trang sản phẩm"),
        h("div", { className: "layout" },
          h("div", { className: "media" }, image),
          h("div", null,
            h("span", { className: "tag" }, custom ? "Làm theo yêu cầu" : "Có sẵn"),
            h("h1", null, name),
            d.name && d.name !== name ? h("p", { className: "full" }, d.name) : null,
            h("p", { className: "price" }, range(lo, hi)),
            groups.map((g, gi) =>
              h("div", { className: "row", key: gi },
                h("span", { className: "label" }, g.name),
                h("div", { className: "opts" },
                  g.values.map((v) => {
                    const on = picked[gi] === v;
                    return h("button", {
                      key: v, type: "button", className: "opt" + (on ? " on" : ""),
                      disabled: !on && matching(gi, v).length === 0,
                      onClick: () => this.pick(gi, v),
                    }, v);
                  })))),
            groups.length ? h("p", { className: "hint" }, "Bấm thử các phân loại để xem giá đổi theo.") : null,
            !custom && !variants.length
              ? h("p", { className: "info" }, `Có ${num(d.variantCount) || 1} mẫu để chọn${d.note ? ` (${d.note.toLowerCase()})` : ""}.`)
              : null)),
        h("p", { className: "section" }, d.featured ? `Thẻ sản phẩm (hiện ở trang chủ, vị trí ${d.featured})` : "Thẻ sản phẩm trong danh sách"),
        h("div", { className: "card" },
          h("div", { className: "thumb" }, image),
          h("div", { className: "body" },
            h("p", { className: "cat" }, cat),
            h("p", { className: "cname" }, name),
            h("p", { className: "cprice" }, range(allLo, allHi)))));
    },
  });

  CMS.registerPreviewStyle("/admin/preview.css");
  CMS.registerPreviewTemplate("products", ProductPreview);
})();
