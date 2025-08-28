import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getContact,
  updateContact,
  deleteContact,
  simulateLogin,
  clearLog,
  type Contact,
} from "../web/lib/contactsApi";

/** naive splitter: last word -> surname; the rest -> given names */
function splitName(full: string | undefined) {
  const s = (full || "").trim().replace(/\s+/g, " ");
  if (!s) return { given: "", surname: "" };
  const parts = s.split(" ");
  if (parts.length === 1) return { given: parts[0], surname: "" };
  const surname = parts.pop() as string;
  return { given: parts.join(" "), surname };
}

/** joiner that avoids extra spaces */
function joinName(given: string, surname: string) {
  return [given?.trim(), surname?.trim()].filter(Boolean).join(" ");
}

type TabKey = "profile" | "portal" | "cases";

export default function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  // Form fields (split name)
  const [given, setGiven] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      const c = await getContact(id);
      setModel(c);
      const { given, surname } = splitName(c?.name);
      setGiven(given);
      setSurname(surname);
      setEmail(c?.email || "");
      setPhone(c?.phone || "");
      setCompany(c?.company || "");
      setRole(c?.role || "");
      setNotes(c?.notes || "");
      setLoading(false);
    })();
  }, [id]);

  const lastSeen = useMemo(() => model?.lastSeen ?? "—
