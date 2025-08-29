import { Link, Routes, Route, useParams } from 'react-router-dom'

function ContactsList() {
  // TODO: replace with your real list UI
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">Synergy CRM</h1>
      <p className="text-sm opacity-70">Vite • React • Tailwind • Router</p>

      <div className="mt-6 rounded-2xl bg-white shadow p-6">
        <p className="mb-4">If you can see this, routing is wired.</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <Link className="text-blue-600 hover:underline" to="/contacts/1756338018580">
              Go to a sample contact
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

function ContactDetail() {
  const { id } = useParams()
  // TODO: replace with your real detail UI
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contact #{id}</h1>
        <Link to="/" className="text-sm text-blue-600 hover:underline">← Back</Link>
      </div>

      <div className="mt-6 rounded-2xl bg-white shadow p-6">
        <p>This is a placeholder contact detail page.</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ContactsList />} />
      <Route path="/contacts/:id" element={<ContactDetail />} />
      {/* catch-all back to home if needed */}
      <Route path="*" element={<ContactsList />} />
    </Routes>
  )
}
