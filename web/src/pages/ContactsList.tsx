import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import type { Contact } from '../types'

export default function ContactsList() {
  const [rows, setRows] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()

  useEffect(() => {
    let live = true
    setLoading(true)
    api.get<Contact[]>('/contacts')
      .then((data) => live && setRows(data))
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false))
    return () => { live = false }
  }, [])

  return (
    <div className="panel">
      <div className="toprow" style={{ marginBottom: 8 }}>
        <h3 style={{ margin:0 }}>Contacts</h3>
        <button className="btn" onClick={() => nav('/contacts/new')}>Create contact</button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color:'#b91c1c' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ overflowX:'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>{c.givenNames} {c.surname}</td>
                  <td>{c.company ?? '—'}</td>
                  <td>{c.email ?? '—'}</td>
                  <td>
                   
