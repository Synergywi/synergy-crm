import React, { useMemo, useState } from "react";

// --- Tiny UI primitives (Tailwind only; no external deps) ---
const Badge = ({ children, tone = "neutral" }) => (
  <span
    className={
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
      (tone === "success"
        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
        : tone === "muted"
        ? "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
        : tone === "warning"
        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
        : "bg-slate-50 text-slate-700 ring-1 ring-slate-200")
    }
  >
    {children}
  </span>
);

const Button = ({ children, variant = "default", size = "md", className = "", ...props }) => (
  <button
    className={
      (
        variant === "ghost"
          ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 "
          : variant === "link"
          ? "text-sky-700 hover:underline "
          : variant === "soft"
          ? "bg-slate-100 text-slate-800 hover:bg-slate-200 "
          : "bg-sky-600 text-white hover:bg-sky-700 "
      ) +
      (size === "sm" ? "px-3 py-1.5 text-sm " : size === "lg" ? "px-5 py-3 text-base " : "px-4 py-2 text-sm ") +
      "rounded-md transition-all shadow-sm " +
      className
    }
    {...props}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={"rounded-xl bg-white shadow-sm ring-1 ring-slate-200 " + className}>{children}</div>
);
const CardHeader = ({ title, aside }) => (
  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    {aside}
  </div>
);
const CardBody = ({ children, className = "" }) => <div className={"px-5 py-4 " + className}>{children}</div>;

const Table = ({ columns, rows, empty = "No data." }) => (
  <div className="overflow-hidden rounded-lg ring-1 ring-slate-200">
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          {columns.map((c, i) => (
            <th key={i} className={"px-4 py-2 font-medium " + (i === 0 ? "w-1/3" : "")}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td className="px-4 py-6 text-slate-500" colSpan={columns.length}>
              {empty}
            </td>
          </tr>
        )}
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-slate-100">
            {r.map((cell, j) => (
              <td key={j} className="px-4 py-2 align-middle text-slate-800">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --- Fake data ---
const USERS = [
  { name: "Admin", email: "admin@synergy.com", role: "Admin" },
  { name: "Alex Ng", email: "alex@synergy.com", role: "Investigator" },
  { name: "Priya Menon", email: "priya@synergy.com", role: "Investigator" },
  { name: "Chris Rice", email: "chris@synergy.com", role: "Reviewer" },
];

const RESOURCES = {
  links: [
    { label: "Investigation Framework", href: "#" },
    { label: "HR Policy", href: "#" },
  ],
  faqs: [
    { q: "How to open a case?", a: "Go to Cases → New." },
    { q: "Where are templates?", a: "Documents tab." },
  ],
  guides: ["Interview best practices.pdf", "Case lifecycle.png"],
};

const DOCS = {
  templates: [
    { name: "Case intake form.docx" },
    { name: "Interview checklist.pdf" },
    { name: "Final report.docx" },
  ],
  procedures: [
    { name: "Code of conduct.pdf" },
    { name: "Incident workflow.png" },
  ],
};

// --- Page shells ---
const Shell = ({ children, rightTop }) => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    {/* Top bar */}
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500">Synergy CRM</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600">You: Admin (Admin)</span>
          <span><Badge tone="success">Soft Stable baseline-1.0.0</Badge></span>
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-4 py-6">
      <aside className="col-span-2">
        <Nav />
      </aside>
      <main className="col-span-10">{children}</main>
    </div>

    {/* Floating calendar toast */}
    <div className="pointer-events-none fixed right-6 top-4 z-50">
      <div className="pointer-events-auto flex items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-xl ring-1 ring-slate-200">
        <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg border border-slate-200">
          <div className="text-[10px] font-semibold text-slate-500">AUG</div>
          <div className="-mt-1 text-base font-bold text-slate-800">18</div>
        </div>
        <div>
          <div className="text-sm font-semibold">Calendar</div>
          <div className="text-xs text-slate-600">Report writing and Canterbury College Meeting today</div>
        </div>
      </div>
    </div>
  </div>
);

const NAV_ITEMS = [
  "Dashboard",
  "Calendar",
  "Cases",
  "Contacts",
  "Companies",
  "Documents",
  "Resources",
  "Admin",
];

const Nav = () => {
  const [active, setActive] = useNav();
  return (
    <nav className="sticky top-[68px] rounded-xl border border-slate-200 bg-white p-2 text-sm shadow-sm">
      <div className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        Investigations
      </div>
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => (
          <li key={item}>
            <button
              onClick={() => setActive(item)}
              className={
                "w-full rounded-lg px-3 py-2 text-left hover:bg-slate-50 " +
                (active === item ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200" : "text-slate-700")
              }
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// global nav state (simple)
const navStore: { value: string; listeners: Set<(v:string)=>void> } = { value: "Admin", listeners: new Set() };
const useNav = (): [string, (v:string)=>void] => {
  const [active, setActiveState] = useState(navStore.value);
  const setActive = (val: string) => {
    navStore.value = val;
    setActiveState(val);
    navStore.listeners.forEach((l) => l(val));
  };
  return [active, setActive];
};

// --- Screens ---
const AdminScreen = () => {
  const [tab, setTab] = useState("Users");
  return (
    <>
      <Tabs tabs={["Users", "Settings", "Audit"]} tab={tab} setTab={setTab} />
      {tab === "Users" && <AdminUsers />}
      {tab === "Settings" && <AdminSettings />}
      {tab === "Audit" && (
        <Card>
          <CardHeader title="Audit" />
          <CardBody>
            <div className="text-sm text-slate-600">No events yet.</div>
          </CardBody>
        </Card>
      )}
    </>
  );
};

const AdminUsers = () => (
  <Card>
    <CardHeader title="Users" />
    <CardBody>
      <Table
        columns={["Name", "Email", "Role", ""]}
        rows={USERS.map((u) => [
          u.name,
          <span className="text-slate-600" key={u.email}>{u.email}</span>,
          <span className="text-slate-600" key={u.role}>{u.role}</span>,
          <div className="flex justify-end" key={u.email+"b"}>
            <Button variant="ghost" size="sm">Impersonate</Button>
          </div>,
        ])}
      />
      <div className="mt-4 flex justify-end">
        <Button size="sm" className="rounded-full">Add User</Button>
      </div>
    </CardBody>
  </Card>
);

const AdminSettings = () => (
  <Card>
    <CardHeader title="Settings" aside={<Button size="sm">Save Settings</Button>} />
    <CardBody>
      <div className="space-y-3 text-sm">
        <label className="flex items-center gap-3">
          <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300" />
          <span>Email alerts</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
          <span>Dark mode (display only)</span>
        </label>
      </div>
    </CardBody>
  </Card>
);

const ResourcesScreen = () => {
  const [tab, setTab] = useState("Links");
  return (
    <>
      <Tabs tabs={["Links", "FAQs", "Guides"]} tab={tab} setTab={setTab} />
      {tab === "Links" && (
        <Card>
          <CardHeader title="Links" />
          <CardBody>
            <ul className="space-y-2 text-sky-700">
              {RESOURCES.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:underline">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
      {tab === "FAQs" && (
        <Card>
          <CardHeader title="FAQs" />
          <CardBody>
            <div className="space-y-4 text-sm">
              {RESOURCES.faqs.map((f) => (
                <div key={f.q}>
                  <div className="font-semibold">{f.q}</div>
                  <div className="text-slate-600">{f.a}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
      {tab === "Guides" && (
        <Card>
          <CardHeader title="Guides" />
          <CardBody>
            <ul className="list-inside list-disc text-sm text-slate-700">
              {RESOURCES.guides.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </>
  );
};

const DocumentsScreen = () => {
  const [tab, setTab] = useState("Templates");
  return (
    <>
      <Tabs tabs={["Templates", "Procedures"]} tab={tab} setTab={setTab} />
      {tab === "Templates" && (
        <Card>
          <CardHeader title="Templates" />
          <CardBody>
            <Table
              columns={["File", ""]}
              rows={DOCS.templates.map((d) => [
                d.name,
                <div key={d.name} className="flex justify-end"><Button variant="ghost" size="sm">Download</Button></div>,
              ])}
            />
          </CardBody>
        </Card>
      )}
      {tab === "Procedures" && (
        <Card>
          <CardHeader title="Procedures" />
          <CardBody>
            <Table
              columns={["File", ""]}
              rows={DOCS.procedures.map((d) => [
                d.name,
                <div key={d.name} className="flex justify-end"><Button variant="ghost" size="sm">Download</Button></div>,
              ])}
            />
          </CardBody>
        </Card>
      )}
    </>
  );
};

const CompaniesScreen = () => {
  const [view, setView] = useState("list");
  const company = {
    name: "Sunrise Mining Pty Ltd",
    contacts: [
      { name: "Alex Ng", email: "alex@synergy.com", role: "Investigator", phone: "07 345 5678" },
    ],
    documents: [],
  };
  return (
    <>
      {view === "list" && (
        <Card>
          <CardHeader title="Companies" />
          <CardBody>
            <div className="mb-4 flex justify-end">
              <Button onClick={() => setView("detail")}>Open Sunrise Mining Pty Ltd</Button>
            </div>
            <div className="text-sm text-slate-600">(For the prototype, click the button above to open the company detail view.)</div>
          </CardBody>
        </Card>
      )}
      {view === "detail" && <CompanyDetail company={company} onBack={() => setView("list")} />}
    </>
  );
};

const CompanyDetail = ({ company, onBack }) => {
  const [tab, setTab] = useState("Company Contacts");
  return (
    <Card>
      <CardBody>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">S</div>
            <div>
              <div className="text-lg font-semibold">{company.name}</div>
            </div>
          </div>
          <Button variant="ghost" onClick={onBack}>Back</Button>
        </div>
        <div className="mb-4 flex gap-6 border-b border-slate-200 text-sm">
          {["Summary", "Company Contacts", "Company Documents"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "-mb-px border-b-2 px-1.5 py-2 " +
                (tab === t ? "border-sky-600 font-semibold text-sky-700" : "border-transparent text-slate-600 hover:text-slate-800")
              }
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Summary" && <div className="text-sm text-slate-600">No summary yet.</div>}

        {tab === "Company Contacts" && (
          <div>
            <div className="mb-4 flex gap-3">
              <input placeholder="Name" className="w-56 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none" />
              <input placeholder="Email" className="w-56 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none" />
              <input placeholder="Phone" className="w-56 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none" />
              <div className="flex-1" />
              <Button size="sm" className="self-end">Add Contact</Button>
            </div>
            <Table
              columns={["Name", "Email", "Role", "Phone", "", ""]}
              rows={company.contacts.map((c) => [
                c.name,
                c.email,
                c.role,
                c.phone,
                <div key={c.email+"open"} className="flex justify-end"><Button variant="ghost" size="sm">Open</Button></div>,
                <div key={c.email+"view"} className="flex justify-end"><Button variant="ghost" size="sm">View Portal</Button></div>,
              ])}
            />
          </div>
        )}

        {tab === "Company Documents" && (
          <div>
            <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700">
              <span>Company Documents</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">Add folder</Button>
                <Button variant="ghost" size="sm">Select files</Button>
              </div>
            </div>
            <Table columns={["File", "Size", ""]} rows={[]} empty={"No files"} />
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm">Upload to General</Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

const Placeholder = ({ title }) => (
  <Card>
    <CardHeader title={title} />
    <CardBody>
      <div className="text-sm text-slate-600">Coming soon…</div>
    </CardBody>
  </Card>
);

const Tabs = ({ tabs, tab, setTab }) => (
  <div className="mb-4 flex gap-6 border-b border-slate-200 text-sm">
    {tabs.map((t) => (
      <button
        key={t}
        onClick={() => setTab(t)}
        className={
          "-mb-px border-b-2 px-1.5 py-2 " +
          (tab === t ? "border-sky-600 font-semibold text-sky-700" : "border-transparent text-slate-600 hover:text-slate-800")
        }
      >
        {t}
      </button>
    ))}
  </div>
);

export default function App() {
  const [active] = useNav();

  const screen = useMemo(() => {
    switch (active) {
      case "Admin":
        return <AdminScreen />;
      case "Resources":
        return <ResourcesScreen />;
      case "Documents":
        return <DocumentsScreen />;
      case "Companies":
        return <CompaniesScreen />;
      case "Cases":
        return <Placeholder title="Cases" />;
      case "Contacts":
        return <Placeholder title="Contacts" />;
      case "Calendar":
        return <Placeholder title="Calendar" />;
      default:
        return <Placeholder title="Dashboard" />;
    }
  }, [active]);

  return <Shell>{screen}</Shell>;
}
