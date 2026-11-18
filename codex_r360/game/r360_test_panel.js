// Keep the original buttons, listeners and add-on rows. The toolbar only filters what is visible.
(() => {
  const list = document.getElementById('dbgPanel');
  const toggle = document.getElementById('dbgBtn');
  if (!list || !toggle) return;

  const tabs = ['地图', '剧情', '支线', '战斗', '视听', '工具'];
  const groupOf = title => {
    if (title === '地图传送') return '地图';
    if (title === '剧情跳转') return '剧情';
    if (title.startsWith('支线')) return '支线';
    if (/战|妖兽|鬼火|技能|剑诀|木人桩|洛尘绝技|队伍/.test(title)) return '战斗';
    if (/配乐|声音|灵晶特效/.test(title)) return '视听';
    return '工具';
  };
  const shell = document.createElement('aside');
  shell.id = 'testShelf';
  shell.hidden = list.hidden;
  shell.setAttribute('aria-label', '测试面板');
  shell.innerHTML = `
    <header>
      <h2>测试面板</h2>
      <input type="search" aria-label="搜索全部测试项目" placeholder="搜索地图、剧情、支线…" autocomplete="off" spellcheck="false">
      <button type="button" class="closeTest" aria-label="关闭测试面板">关闭</button>
    </header>
    <nav aria-label="测试分类"></nav>
    <p class="emptyTest" hidden>没有找到相符的项目，请换个词试试。</p>`;
  list.before(shell);
  shell.append(list);
  toggle.setAttribute('aria-controls', shell.id);
  toggle.setAttribute('aria-expanded', String(!list.hidden));
  const search = shell.querySelector('input');
  const nav = shell.querySelector('nav');
  const empty = shell.querySelector('.emptyTest');
  const headings = new Map();
  let active = tabs[0];

  for (const tab of tabs) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = tab;
    b.addEventListener('click', () => {
      active = tab;
      search.value = '';
      filter();
      list.scrollTop = 0;
    });
    nav.append(b);
  }

  function filter() {
    if (list.hidden) return;
    const needle = search.value.trim().toLowerCase();
    let heading, title = '', count = 0;
    headings.clear();
    for (const b of nav.children) {
      b.setAttribute('aria-pressed', String(!needle && b.textContent === active));
    }
    for (const el of list.children) {
      if (el.tagName === 'H4') {
        heading = el;
        title = el.firstChild?.textContent.trim() || '';
        headings.set(el, false);
        continue;
      }
      // The status and error reports may appear between injected groups and the original rows.
      if (!el.classList.contains('row')) {
        heading = null;
        continue;
      }
      const group = groupOf(title);
      const label = el.querySelector(':scope > .tag')?.textContent || '';
      let matched = 0;
      const buttons = el.querySelectorAll('button');
      for (const b of buttons) {
        const haystack = [group, title, label, b.textContent, b.dataset.map || '', b.dataset.part || ''].join(' ').toLowerCase();
        const show = needle ? haystack.includes(needle) : group === active;
        b.classList.toggle('testFiltered', !show);
        if (show) matched++;
      }
      const showRow = buttons.length ? matched > 0 : !needle && group === active;
      el.classList.toggle('testFiltered', !showRow);
      if (showRow && heading) headings.set(heading, true);
      count += matched;
    }
    for (const [h, show] of headings) h.classList.toggle('testFiltered', !show);
    empty.hidden = count !== 0;
  }

  search.addEventListener('input', () => { filter(); list.scrollTop = 0; });
  shell.querySelector('.closeTest').addEventListener('click', () => { list.hidden = true; });
  shell.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Escape' && !e.isComposing) {
      e.preventDefault();
      if (search.value) { search.value = ''; filter(); }
      else list.hidden = true;
    }
  });
  shell.addEventListener('keyup', e => e.stopPropagation());

  // Several original tools prepend rows again when a setting causes the list to be rebuilt.
  new MutationObserver(records => {
    if (records.some(r => r.type === 'attributes')) {
      shell.hidden = list.hidden;
      toggle.setAttribute('aria-expanded', String(!list.hidden));
      if (list.hidden) {
        if (shell.contains(document.activeElement)) toggle.focus({ preventScroll: true });
      } else {
        list.scrollTop = 0;
        nav.querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
      }
    }
    filter();
  }).observe(list, {childList: true, subtree: true, attributes: true, attributeFilter: ['hidden']});
  filter();
})();
