export async function render(ctx) {
  const { page, viewEl, state, section } = ctx;
  const lang = document.documentElement.lang || "ru";
  const title = typeof section?.label === "string"
    ? section.label
    : (typeof section?.label === "object"
      ? (section.label[lang] || section.label.ru || section.label.en || section?.key || "Section")
      : (section?.key || "Section"));

  const message = lang === "uz"
    ? "Bu bo'lim keyingi bosqichda to'ldiriladi."
    : (lang === "en"
      ? "This section is reserved for the next implementation stage."
      : "Этот раздел будет реализован на следующем этапе.");

  page(title, "", { raw: true });
  viewEl.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h5 class="mb-2">${title}</h5>
        <p class="text-muted mb-0">${message}</p>
      </div>
    </div>
  `;

  if (state) state.lastPlaceholder = section?.id || null;
}
