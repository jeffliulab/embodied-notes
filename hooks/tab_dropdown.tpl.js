// 顶部标签页悬停下拉预览菜单（支持二级→三级子菜单，三级带链接）
// 此文件由 hooks/generate_dropdown.py 自动生成，请勿手动编辑
// 如需修改 UI 逻辑，请编辑 hooks/tab_dropdown.tpl.js
(function () {
  /* __NAV_DATA__ */

  if (typeof tabData === "undefined") return;

  function getBase() {
    if (typeof __md_scope !== "undefined" && __md_scope.pathname) {
      return __md_scope.pathname.endsWith("/") ? __md_scope.pathname : __md_scope.pathname + "/";
    }
    var path = new URL(".", window.location.href).pathname;
    return path.endsWith("/") ? path : path + "/";
  }

  var currentDropdown = null;
  var currentTab = null;
  var currentSubMenu = null;

  function hideAll() {
    if (currentSubMenu) { currentSubMenu.remove(); currentSubMenu = null; }
    if (currentDropdown) { currentDropdown.remove(); currentDropdown = null; currentTab = null; }
  }

  function hideSubMenu() {
    if (currentSubMenu) { currentSubMenu.remove(); currentSubMenu = null; }
  }

  function showSubMenu(itemEl, pages, base, parentRect) {
    hideSubMenu();
    var sub = document.createElement("div");
    sub.className = "tab-dropdown tab-submenu";
    pages.forEach(function (p) {
      var a = document.createElement("a");
      a.className = "tab-dropdown__item";
      a.textContent = p[0];
      a.href = base + p[1];
      sub.appendChild(a);
    });
    var itemRect = itemEl.getBoundingClientRect();
    sub.style.position = "fixed";
    sub.style.top = itemRect.top + "px";
    sub.style.left = parentRect.right + 2 + "px";
    document.body.appendChild(sub);
    currentSubMenu = sub;
  }

  function show(link, sections) {
    if (currentTab === link) return;
    hideAll();
    currentTab = link;
    var base = getBase();
    var rect = link.getBoundingClientRect();
    var el = document.createElement("div");
    el.className = "tab-dropdown";
    sections.forEach(function (sec) {
      var a = document.createElement("a");
      a.className = "tab-dropdown__item";
      a.textContent = sec.name;
      a.href = sec.path ? base + sec.path : (link.getAttribute("href") || link.href);
      if (sec.pages && sec.pages.length > 0) {
        a.classList.add("has-submenu");
        a.addEventListener("mouseenter", function () {
          showSubMenu(a, sec.pages, base, el.getBoundingClientRect());
        });
      } else {
        a.addEventListener("mouseenter", hideSubMenu);
      }
      el.appendChild(a);
    });
    el.style.position = "fixed";
    el.style.top = rect.bottom + "px";
    el.style.left = rect.left + rect.width / 2 + "px";
    el.style.transform = "translateX(-50%)";
    document.body.appendChild(el);
    currentDropdown = el;
  }

  function init() {
    var tabsBar = document.querySelector(".md-tabs");
    if (!tabsBar || tabsBar.getAttribute("data-dd")) return;
    tabsBar.setAttribute("data-dd", "1");

    document.querySelectorAll(".md-tabs__link").forEach(function (link) {
      var text = link.textContent.trim();
      var sections = tabData[text];
      if (!sections) return;
      link.addEventListener("mouseenter", function () { show(link, sections); });
    });

    document.addEventListener("mousemove", function (e) {
      if (!currentDropdown) return;
      var tbr = document.querySelector(".md-tabs").getBoundingClientRect();
      var ddr = currentDropdown.getBoundingClientRect();
      var inTabs = e.clientY >= tbr.top && e.clientY <= tbr.bottom + 4
                   && e.clientX >= tbr.left && e.clientX <= tbr.right;
      var inDd = e.clientY >= ddr.top - 4 && e.clientY <= ddr.bottom
                 && e.clientX >= ddr.left && e.clientX <= ddr.right;
      var inSub = false;
      if (currentSubMenu) {
        var sr = currentSubMenu.getBoundingClientRect();
        inSub = e.clientY >= sr.top && e.clientY <= sr.bottom
                && e.clientX >= sr.left - 4 && e.clientX <= sr.right;
      }
      if (!inTabs && !inDd && !inSub) hideAll();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  if (typeof document$ !== "undefined") {
    document$.subscribe(function () { init(); });
  }
})();
