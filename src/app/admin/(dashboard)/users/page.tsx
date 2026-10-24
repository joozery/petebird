'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertDialog, Dialog, DropdownMenu, Switch, Tooltip } from 'radix-ui';
import { AlertTriangle, ChevronDown, Clock, Crown, Eye, EyeOff, Mail, Plus, Trash2, UserCog, X } from 'lucide-react';

type Role = 'owner' | 'editor';
type UserRow = { _id: string; name: string; email: string; role: Role; isActive: boolean; lastLoginAt: string | null; createdAt: string };

const roleMeta: Record<Role, { label: string; description: string; icon: typeof Crown }> = {
  owner: { label: 'Owner', description: 'จัดการผู้ใช้และเนื้อหาได้ทั้งหมด', icon: Crown },
  editor: { label: 'Editor', description: 'แก้ไขเนื้อหาได้ จัดการผู้ใช้ไม่ได้', icon: UserCog },
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function initialsOf(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || '?';
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  async function load() {
    const [meRes, usersRes] = await Promise.all([fetch('/api/admin/me'), fetch('/api/admin/users')]);
    if (usersRes.status === 403) return setForbidden(true);
    if (meRes.ok) setCurrentUserId((await meRes.json()).user.sub);
    const data = await usersRes.json();
    if (!usersRes.ok) return setError(data.error || 'โหลดข้อมูลไม่สำเร็จ');
    setUsers(data.users);
  }

  useEffect(() => {
    load();
  }, []);

  const activeOwnerCount = useMemo(() => (users ?? []).filter((u) => u.role === 'owner' && u.isActive).length, [users]);

  async function patchUser(id: string, body: Record<string, unknown>) {
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'บันทึกไม่สำเร็จ');
      return false;
    }
    load();
    return true;
  }

  async function removeUser(u: UserRow) {
    setError(null);
    const res = await fetch(`/api/admin/users/${u._id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'ลบไม่สำเร็จ');
      return;
    }
    setDeleteTarget(null);
    load();
  }

  if (forbidden) {
    return (
      <div className="max-w-md bg-white border border-[#ededed] rounded-2xl p-8 text-center">
        <p className="text-sm text-[#8a7f6d]">หน้านี้สำหรับผู้ใช้ที่มีสิทธิ์ owner เท่านั้น</p>
      </div>
    );
  }

  const total = users?.length ?? 0;
  const owners = users?.filter((u) => u.role === 'owner').length ?? 0;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl text-[#1f1b16]">ผู้ใช้งานแอดมิน</h1>
          <p className="mt-1 text-sm text-[#8a7f6d]">จัดการบัญชีแอดมินและระดับสิทธิ์การใช้งาน</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-[#1f1b16] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#33291c] transition-colors shrink-0"
        >
          <Plus size={16} /> เพิ่มผู้ใช้งาน
        </button>
      </div>

      {users !== null && (
        <div className="mt-5 flex gap-3">
          <StatPill label="ทั้งหมด" value={total} />
          <StatPill label="Owner" value={owners} />
          <StatPill label="Editor" value={total - owners} />
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#fdf0ee] border border-[#f3cfc8] px-4 py-3 text-sm text-[#a83a2a]">
          <AlertTriangle size={15} className="shrink-0" /> {error}
        </div>
      )}

      <div className="mt-6 bg-white border border-[#ededed] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(57,40,14,0.04)]">
        {users === null ? (
          <div className="p-5 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-[#f7f6f3] animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="p-10 text-center text-sm text-[#8a7f6d]">ยังไม่มีผู้ใช้งาน</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#ededed] text-left text-[11px] uppercase tracking-wide text-[#a79e8c]">
                <th className="px-5 py-3 font-medium">ผู้ใช้งาน</th>
                <th className="px-5 py-3 font-medium">สิทธิ์</th>
                <th className="px-5 py-3 font-medium">สถานะ</th>
                <th className="px-5 py-3 font-medium">เข้าใช้งานล่าสุด</th>
                <th className="px-5 py-3 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u._id === currentUserId;
                const isLastOwner = u.role === 'owner' && u.isActive && activeOwnerCount <= 1;
                const lastLogin = formatDate(u.lastLoginAt);
                return (
                  <tr key={u._id} className="border-b border-[#f3f2ef] last:border-0 hover:bg-[#fbfbfa] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-[#c7974c] to-[#9c753a] text-white text-xs font-semibold flex items-center justify-center">
                          {initialsOf(u.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#1f1b16] font-medium truncate">{u.name}</span>
                            {isSelf && <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-[#f3ead9] text-[#b8892c]">คุณ</span>}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#a79e8c]">
                            <Mail size={11} /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <RoleMenu
                        user={u}
                        disabled={isLastOwner && u.role === 'owner'}
                        disabledReason="ต้องมี owner ที่ใช้งานอยู่อย่างน้อย 1 คน"
                        onChange={(role) => patchUser(u._id, { role })}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <Tooltip.Provider delayDuration={200}>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <div className="flex items-center gap-2">
                              <Switch.Root
                                checked={u.isActive}
                                disabled={isLastOwner}
                                onCheckedChange={(checked) => patchUser(u._id, { isActive: checked })}
                                className="w-9 h-5 rounded-full bg-[#e5e3dd] data-[state=checked]:bg-[#1f1b16] transition-colors relative outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow translate-x-0.5 data-[state=checked]:translate-x-[18px] transition-transform" />
                              </Switch.Root>
                              <span className={u.isActive ? 'text-[#3a7a44]' : 'text-[#a79e8c]'}>{u.isActive ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}</span>
                            </div>
                          </Tooltip.Trigger>
                          {isLastOwner && (
                            <Tooltip.Portal>
                              <Tooltip.Content sideOffset={6} className="rounded-md bg-[#1f1b16] text-white text-xs px-2.5 py-1.5 shadow-lg">
                                ต้องมี owner ที่ใช้งานอยู่อย่างน้อย 1 คน
                                <Tooltip.Arrow className="fill-[#1f1b16]" />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          )}
                        </Tooltip.Root>
                      </Tooltip.Provider>
                    </td>
                    <td className="px-5 py-3.5 text-[#8a7f6d]">
                      {lastLogin ? (
                        <span className="flex items-center gap-1.5 text-xs"><Clock size={12} className="text-[#a79e8c]" /> {lastLogin}</span>
                      ) : (
                        <span className="text-xs text-[#c3b89f]">ยังไม่เคยเข้าสู่ระบบ</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Tooltip.Provider delayDuration={200}>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <button
                              onClick={() => !isSelf && !isLastOwner && setDeleteTarget(u)}
                              disabled={isSelf || isLastOwner}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#c0564a] hover:bg-[#fdf0ee] disabled:opacity-35 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                              aria-label={`ลบ ${u.name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </Tooltip.Trigger>
                          {(isSelf || isLastOwner) && (
                            <Tooltip.Portal>
                              <Tooltip.Content sideOffset={6} className="rounded-md bg-[#1f1b16] text-white text-xs px-2.5 py-1.5 shadow-lg">
                                {isSelf ? 'ลบบัญชีตัวเองไม่ได้' : 'ต้องมี owner ที่ใช้งานอยู่อย่างน้อย 1 คน'}
                                <Tooltip.Arrow className="fill-[#1f1b16]" />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          )}
                        </Tooltip.Root>
                      </Tooltip.Provider>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <AddUserDialog open={addOpen} onOpenChange={setAddOpen} onCreated={load} />

      <AlertDialog.Root open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="dialog-overlay" />
          <AlertDialog.Content className="dialog-content" style={{ maxWidth: 400 }}>
            <div className="w-11 h-11 rounded-full bg-[#fdf0ee] text-[#c0564a] flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <AlertDialog.Title className="mt-4 text-lg font-medium text-[#1f1b16]">ลบผู้ใช้งานนี้?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-[#8a7f6d] leading-6">
              บัญชี <strong className="text-[#1f1b16]">{deleteTarget?.name}</strong> ({deleteTarget?.email}) จะถูกลบถาวร ย้อนกลับไม่ได้
            </AlertDialog.Description>
            <div className="mt-6 flex gap-3 justify-end">
              <AlertDialog.Cancel className="rounded-lg border border-[#e5e3dd] px-4 py-2 text-sm text-[#50493f]">ยกเลิก</AlertDialog.Cancel>
              <AlertDialog.Action
                onClick={() => deleteTarget && removeUser(deleteTarget)}
                className="rounded-lg bg-[#c0564a] text-white px-4 py-2 text-sm font-medium hover:bg-[#a8483d]"
              >
                ลบผู้ใช้งาน
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1.5 bg-white border border-[#ededed] rounded-full px-3.5 py-1.5">
      <span className="text-sm font-semibold text-[#b8892c]">{value}</span>
      <span className="text-xs text-[#a79e8c]">{label}</span>
    </div>
  );
}

function RoleMenu({
  user,
  disabled,
  disabledReason,
  onChange,
}: {
  user: UserRow;
  disabled: boolean;
  disabledReason: string;
  onChange: (role: Role) => void;
}) {
  const meta = roleMeta[user.role];
  const Icon = meta.icon;
  const trigger = (
    <DropdownMenu.Trigger
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e3dd] bg-[#fafafa] px-3 py-1.5 text-xs font-medium text-[#50493f] hover:border-[#d9d5cb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Icon size={13} className="text-[#b8892c]" /> {meta.label} <ChevronDown size={12} className="text-[#a79e8c]" />
    </DropdownMenu.Trigger>
  );

  return (
    <DropdownMenu.Root>
      {disabled ? (
        <Tooltip.Provider delayDuration={200}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>{trigger}</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content sideOffset={6} className="rounded-md bg-[#1f1b16] text-white text-xs px-2.5 py-1.5 shadow-lg">
                {disabledReason}
                <Tooltip.Arrow className="fill-[#1f1b16]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      ) : (
        trigger
      )}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="min-w-[220px] p-1.5 bg-[#fffdf8] border border-[#ededed] rounded-2xl shadow-[0_18px_50px_rgba(57,40,14,0.15)] outline-none"
        >
          {(Object.keys(roleMeta) as Role[]).map((role) => {
            const RoleIcon = roleMeta[role].icon;
            const active = user.role === role;
            return (
              <DropdownMenu.Item
                key={role}
                onSelect={() => role !== user.role && onChange(role)}
                className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm cursor-pointer outline-none data-[highlighted]:bg-[#f3ead9] ${active ? 'text-[#b8892c]' : 'text-[#4b4234]'}`}
              >
                <RoleIcon size={15} className="mt-0.5 shrink-0" />
                <span>
                  <span className="block font-medium">{roleMeta[role].label}</span>
                  <span className="block text-[11px] text-[#a79e8c] font-normal leading-snug">{roleMeta[role].description}</span>
                </span>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function AddUserDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (open: boolean) => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'editor' as Role });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setForm({ name: '', email: '', password: '', role: 'editor' });
    setError(null);
    setShowPassword(false);
  }

  async function submit(e: FormEvent) {
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
      reset();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'สร้างผู้ใช้ไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  const input = 'mt-1.5 w-full rounded-lg border border-[#e5e3dd] bg-white px-3 py-2.5 text-sm text-[#1f1b16] outline-none focus:border-[#b8892c] focus:ring-2 focus:ring-[#b8892c1a] transition-shadow';
  const label = 'block text-[13px] font-medium text-[#50493f]';

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { onOpenChange(next); if (!next) reset(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content" style={{ maxWidth: 440 }}>
          <Dialog.Close className="dialog-close" aria-label="ปิด"><X size={18} /></Dialog.Close>
          <Dialog.Title className="text-lg font-medium text-[#1f1b16]">เพิ่มผู้ใช้งานแอดมิน</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-[#8a7f6d]">สร้างบัญชีใหม่สำหรับเข้าใช้งานหลังบ้าน</Dialog.Description>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <label className={label}>
              ชื่อ
              <input className={input} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น สมชาย ใจดี" />
            </label>
            <label className={label}>
              อีเมล
              <input type="email" className={input} required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@petebird.local" />
            </label>
            <label className={label}>
              รหัสผ่าน
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`${input} pr-10`}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a79e8c]" tabIndex={-1}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            <div className={label}>
              สิทธิ์การใช้งาน
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {(Object.keys(roleMeta) as Role[]).map((role) => {
                  const RoleIcon = roleMeta[role].icon;
                  const active = form.role === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setForm({ ...form, role })}
                      className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${active ? 'border-[#b8892c] bg-[#f3ead9]' : 'border-[#e5e3dd] hover:border-[#d9d5cb]'}`}
                    >
                      <span className="flex items-center gap-1.5 text-sm font-medium text-[#1f1b16]">
                        <RoleIcon size={14} className="text-[#b8892c]" /> {roleMeta[role].label}
                      </span>
                      <span className="block mt-0.5 text-[11px] text-[#a79e8c] leading-tight">{roleMeta[role].description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-[#fdf0ee] border border-[#f3cfc8] px-3 py-2.5 text-sm text-[#a83a2a]">
                <AlertTriangle size={14} className="shrink-0" /> {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-[#1f1b16] text-white py-2.5 text-sm font-medium hover:bg-[#33291c] disabled:opacity-60 transition-colors">
                {saving ? 'กำลังสร้าง...' : 'สร้างผู้ใช้งาน'}
              </button>
              <Dialog.Close className="rounded-lg border border-[#e5e3dd] px-5 py-2.5 text-sm text-[#50493f]">ยกเลิก</Dialog.Close>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
