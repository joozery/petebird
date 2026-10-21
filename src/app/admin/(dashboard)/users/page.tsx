'use client';

import { useEffect, useState, type FormEvent } from 'react';

type UserRow = { _id: string; name: string; email: string; role: 'owner' | 'editor'; isActive: boolean };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'editor' as 'owner' | 'editor' });
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch('/api/admin/users');
    if (res.status === 403) return setForbidden(true);
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'โหลดข้อมูลไม่สำเร็จ');
    setUsers(data.users);
  }

  useEffect(() => {
    load();
  }, []);

  async function createUser(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'สร้างผู้ใช้ไม่สำเร็จ');
      setForm({ name: '', email: '', password: '', role: 'editor' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'สร้างผู้ใช้ไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u: UserRow) {
    const res = await fetch(`/api/admin/users/${u._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !u.isActive }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    load();
  }

  async function changeRole(u: UserRow, role: 'owner' | 'editor') {
    const res = await fetch(`/api/admin/users/${u._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    load();
  }

  async function remove(u: UserRow) {
    if (!confirm(`ลบผู้ใช้ "${u.name}" ใช่ไหม?`)) return;
    const res = await fetch(`/api/admin/users/${u._id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    load();
  }

  if (forbidden) {
    return <p className="text-sm text-[#827b71]">หน้านี้สำหรับ owner เท่านั้น</p>;
  }

  const input = 'mt-1 w-full rounded-lg border border-[#e0d4bf] px-3 py-2 text-sm outline-none focus:border-[#a87c3c]';

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-[#302a22]">ผู้ใช้งานแอดมิน</h1>
          <p className="mt-1 text-sm text-[#827b71]">จัดการบัญชีแอดมินและสิทธิ์การใช้งาน</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="rounded-lg bg-[#a77a3b] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#8a622b]">
          {showForm ? 'ปิดฟอร์ม' : '+ เพิ่มผู้ใช้'}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {showForm && (
        <form onSubmit={createUser} className="mt-4 bg-white border border-[#e9e2d6] rounded-xl p-5 grid grid-cols-2 gap-4 max-w-xl">
          <label className="text-sm text-[#5c5244]">
            ชื่อ
            <input className={input} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="text-sm text-[#5c5244]">
            อีเมล
            <input type="email" className={input} required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="text-sm text-[#5c5244]">
            รหัสผ่าน (อย่างน้อย 8 ตัว)
            <input type="password" className={input} required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          <label className="text-sm text-[#5c5244]">
            สิทธิ์
            <select className={input} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'owner' | 'editor' })}>
              <option value="editor">editor — แก้ไขเนื้อหา</option>
              <option value="owner">owner — จัดการผู้ใช้ได้ด้วย</option>
            </select>
          </label>
          <div className="col-span-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-[#a77a3b] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#8a622b] disabled:opacity-60">
              {saving ? 'กำลังสร้าง...' : 'สร้างผู้ใช้'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 bg-white border border-[#e9e2d6] rounded-xl overflow-hidden">
        {users === null ? (
          <p className="p-6 text-sm text-[#827b71]">กำลังโหลด...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e9e2d6] text-left text-xs text-[#a0947e]">
                <th className="px-4 py-3 font-normal">ชื่อ</th>
                <th className="px-4 py-3 font-normal">อีเมล</th>
                <th className="px-4 py-3 font-normal">สิทธิ์</th>
                <th className="px-4 py-3 font-normal">สถานะ</th>
                <th className="px-4 py-3 font-normal text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-[#f1ece3] last:border-0">
                  <td className="px-4 py-3 text-[#302a22]">{u.name}</td>
                  <td className="px-4 py-3 text-[#827b71]">{u.email}</td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={(e) => changeRole(u, e.target.value as 'owner' | 'editor')} className="text-sm border border-[#e0d4bf] rounded-md px-2 py-1">
                      <option value="editor">editor</option>
                      <option value="owner">owner</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(u)}
                      className={`text-xs px-2.5 py-1 rounded-full ${u.isActive ? 'bg-[#e9f5ea] text-[#3a7a44]' : 'bg-[#f1ece3] text-[#827b71]'}`}
                    >
                      {u.isActive ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(u)} className="text-red-500 hover:underline">
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
