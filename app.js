// Synergy CRM - Company Page renderer (safe, drop-in)
(function(){
  const STORAGE_KEY = "synergy_company_docs_v1";
  const COMPANY_KEY = "synergy_company_profile_v1";
  const CONTACTS_KEY = "synergy_company_contacts_v1";

  const $ = (sel, root=document)=> root.querySelector(sel);
  const $$ = (sel, root=document)=> Array.from(root.querySelectorAll(sel));

  const fmtBytes = (n) => {
    if (n == null) return "—";
    const u = ["B","KB","MB","GB"];
    let i = 0;
    while(n >= 1024 && i < u.length-1){ n/=1024; i++; }
    return `${n.toFixed( (i?1:0) )} ${u[i]}`;
  };

  // Last seen badge (re-uses 'User Log' pattern if host exposes it)
  const lastSeenEl = $("#last-seen");
  if (lastSeenEl) {
    try {
      const lastSeen = window.sessionStorage.getItem("synergy_last_seen_company") || "—";
      lastSeenEl.textContent = `Last seen: ${lastSeen}`;
      window.sessionStorage.setItem("synergy_last_seen_company", new Date().toLocaleString());
    } catch {}
  }

  // Profile state & helpers
  const profile = {
    load(){
      try { return JSON.parse(localStorage.getItem(COMPANY_KEY)) || {}; }
      catch { return {}; }
    },
    save(patch){
      const cur = this.load();
      const next = { ...cur, ...patch };
      localStorage.setItem(COMPANY_KEY, JSON.stringify(next));
      // Emit a custom event in case the host wants to persist server-side
      window.dispatchEvent(new CustomEvent("company:profile:save", { detail: next }));
      return next;
    }
  };

  // Contacts state
  const contactsStore = {
    load(){ try { return JSON.parse(localStorage.getItem(CONTACTS_KEY)) || []; } catch { return []; } },
    save(list){ localStorage.setItem(CONTACTS_KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent("company:contacts:save", { detail: list })); }
  };

  // Docs state: simple path-based tree
  function loadTree(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { "/": [] }; }
    catch { return { "/": [] }; }
  }
  function saveTree(tree){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tree)); }

  // DOM refs
  const nameEl = $("#company-name");
  const crumbEl = $("#crumb-company");

  // Initialize with profile data
  const p = profile.load();
  nameEl.textContent = p.name || "Acme Pty Ltd";
  crumbEl.textContent = nameEl.textContent;

  const fld = {
    address: $("#cp-address"),
    postal: $("#cp-postal"),
    abn: $("#cp-abn"),
    industry: $("#cp-industry"),
    type: $("#cp-type"),
    notes: $("#cp-notes")
  };

  Object.entries(fld).forEach(([k, el])=> {
    if (p[k]) el.value = p[k];
    // Fields except industry/type are always enabled
    if (k !== "industry" && k !== "type") el.disabled = false;
  });

  const editBtn = $("#edit-profile");
  const saveBtn = $("#save-profile");
  function setEditMode(on){
    fld.industry.disabled = !on;
    fld.type.disabled = !on;
    editBtn.setAttribute("aria-pressed", on ? "true" : "false");
    saveBtn.disabled = !on;
  }
  editBtn.addEventListener("click", ()=> setEditMode(saveBtn.disabled));
  saveBtn.addEventListener("click", ()=> {
    const next = {
      address: fld.address.value.trim(),
      postal: fld.postal.value.trim(),
      abn: fld.abn.value.trim(),
      industry: fld.industry.value,
      type: fld.type.value,
      notes: fld.notes.value.trim()
    };
    profile.save(next);
    setEditMode(false);
  });

  // CONTACTS
  const contactsTbody = $("#contacts-tbody");
  function renderContacts(){
    const data = contactsStore.load();
    contactsTbody.innerHTML = "";
    for (const c of data){
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.name||"—"}</td>
        <td>${c.email||"—"}</td>
        <td><span class="pill">${[c.position, c.org].filter(Boolean).join(" · ")||"—"}</span></td>
        <td>
          <a class="btn icon" href="mailto:${encodeURIComponent(c.email||"")}"
             title="Email ${c.name||""}">✉️</a>
        </td>
      `;
      contactsTbody.appendChild(tr);
    }
  }
  renderContacts();

  $("#add-contact").addEventListener("click", ()=>{
    const name = prompt("Contact name");
    if (!name) return;
    const email = prompt("Email for " + name) || "";
    const position = prompt("Position/Role (optional)") || "";
    const org = prompt("Org/Team (optional)") || "";
    const list = contactsStore.load();
    list.push({ name, email, position, org });
    contactsStore.save(list);
    renderContacts();
  });

  // DOCUMENTS
  const docsTbody = $("#docs-tbody");
  const docPath = $("#doc-path");
  const fileInput = $("#file-input");
  const dropzone = $("#dropzone");

  let tree = loadTree();
  let cwd = "/";

  function ls(path){
    tree[path] ||= [];
    return tree[path];
  }
  function cd(next){
    if (!tree[next]) tree[next] = [];
    cwd = next;
    docPath.textContent = next;
    renderDocs();
  }

  function renderDocs(){
    docsTbody.innerHTML = "";
    // parent link
    if (cwd !== "/"){
      const up = cwd.replace(/\/[^\/]+\/?$/, "/");
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4"><a href="#" data-cd="${up}">⬆️ Up to ${up}</a></td>`;
      docsTbody.appendChild(tr);
    }
    for (const item of ls(cwd)){
      const tr = document.createElement("tr");
      if (item.type === "folder"){
        tr.innerHTML = `
          <td class="doc-row">📁 <a href="#" data-cd="${cwd}${item.name}/">${item.name}</a></td>
          <td>Folder</td>
          <td>—</td>
          <td class="doc-actions">
            <button class="btn icon" data-del="${item.id}" title="Delete folder">🗑️</button>
          </td>`;
      } else {
        tr.innerHTML = `
          <td class="doc-row">📄 ${item.name}</td>
          <td>${item.mime||"File"}</td>
          <td>${fmtBytes(item.size)}</td>
          <td class="doc-actions">
            <a class="btn icon" download="${item.name}" href="${item.url}" title="Download">⬇️</a>
            <button class="btn icon" data-del="${item.id}" title="Delete file">🗑️</button>
          </td>`;
      }
      docsTbody.appendChild(tr);
    }
    // wire events
    $$("a[data-cd]").forEach(a=> a.addEventListener("click", (e)=> { e.preventDefault(); cd(a.getAttribute("data-cd")); }));
    $$("button[data-del]").forEach(btn=> btn.addEventListener("click", ()=> {
      const id = btn.getAttribute("data-del");
      const list = ls(cwd).filter(x=> x.id !== id);
      tree[cwd] = list;
      saveTree(tree);
      renderDocs();
    }));
  }
  renderDocs();

  // new folder
  $("#new-folder").addEventListener("click", ()=>{
    const name = prompt("Folder name");
    if (!name) return;
    const id = "f_" + Math.random().toString(36).slice(2,9);
    tree[cwd].push({ id, type:"folder", name: name.replace(/[\/]/g, "-") });
    saveTree(tree);
    renderDocs();
  });

  // upload helpers
  function storeFileLike(file){
    const id = "u_" + Math.random().toString(36).slice(2,9);
    // Create an object URL (keeps data in-memory for the session). For persistence we base64 it.
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      const url = base64; // data URL for download
      tree[cwd].push({ id, type:"file", name:file.name, size:file.size, mime:file.type, url });
      saveTree(tree);
      renderDocs();
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener("change", ()=> {
    Array.from(fileInput.files).forEach(storeFileLike);
    fileInput.value = "";
  });

  ;["dragenter","dragover"].forEach(evt => dropzone.addEventListener(evt, (e)=>{
    e.preventDefault(); e.stopPropagation();
    dropzone.style.background = "#eef2ff";
  }));
  ;["dragleave","drop"].forEach(evt => dropzone.addEventListener(evt, (e)=>{
    e.preventDefault(); e.stopPropagation();
    dropzone.style.background = "#fafafa";
  }));
  dropzone.addEventListener("drop", (e)=>{
    const files = Array.from(e.dataTransfer.files || []);
    files.forEach(storeFileLike);
  });

  // Expose a minimal API back to host app (non-breaking)
  window.CompanyPage = {
    setCompany(data){
      // Accept partials
      if (data && data.name){ nameEl.textContent = data.name; crumbEl.textContent = data.name; }
      profile.save({ ...profile.load(), ...data });
      Object.entries(fld).forEach(([k, el])=> { if (data[k] != null) el.value = data[k]; });
    },
    getProfile(){ return profile.load(); },
    addContact(c){ const list = contactsStore.load(); list.push(c); contactsStore.save(list); renderContacts(); },
    cd(path){ cd(path); },
    list(){ return ls(cwd).slice(); }
  };
})();