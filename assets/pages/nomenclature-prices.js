import { sectionTitle } from "./mvp-utils.js";

export async function render(ctx) {
  const { page, section, viewEl } = ctx;
  const title = sectionTitle(section);

  page(title, "", { raw: true });
  viewEl.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h5 class="mb-3">Установка цен</h5>
        <p class="mb-2">
          Прямое изменение цен через карточку или список отключено.
        </p>
        <p class="mb-2 text-muted">
          По модели системы цена должна устанавливаться только документом.
        </p>
        <p class="mb-0 text-muted">
          Документ "Установка цен" будет реализован в <code>v4.2</code>. Текущий регистр цен остается внутренним системным хранилищем и не редактируется вручную.
        </p>
      </div>
    </div>
  `;
}
