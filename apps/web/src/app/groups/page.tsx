'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CustomerLayout } from '../CustomerLayout';
import { customerApi } from '@/lib/api';
import { ROUTES } from '../routes';

type GroupItem = {
  id: string;
  name: string;
  ownerId: string;
  memberCount?: number;
  createdAt: string;
};
type GroupMemberItem = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  createdAt: string;
};
type SoloMemberItem = { id: string; name?: string; email: string };

export default function GroupsPage() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMemberItem[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [soloList, setSoloList] = useState<SoloMemberItem[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberUserId, setAddMemberUserId] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchGroups = () => {
    customerApi
      .fetchallgroupslist()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Failed to load'));
          setGroups([]);
        } else {
          const list = (data?.fetchallgroupslist ?? data?.list) as GroupItem[] | undefined;
          setGroups(list ?? []);
          setError(null);
        }
      })
      .catch(() => {
        setError('Failed to load groups');
        setGroups([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroupId) {
      setMembers([]);
      setShowAddMember(false);
      return;
    }
    setMembersLoading(true);
    customerApi
      .fetchgroupMembers(selectedGroupId)
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        const list = (data?.fetchgroupMembers ?? data?.list) as GroupMemberItem[] | undefined;
        setMembers(list ?? []);
      })
      .catch(() => setMembers([]))
      .finally(() => setMembersLoading(false));
  }, [selectedGroupId]);

  const loadSoloMembers = () => {
    if (!selectedGroupId) return;
    customerApi.fetchSoloMembers(selectedGroupId).then((res) => {
      const data = res?.data as Record<string, unknown> | undefined;
      const list = (data?.fetchSoloMembers ?? data?.list) as SoloMemberItem[] | undefined;
      setSoloList(list ?? []);
      setShowAddMember(true);
      setAddMemberUserId('');
    });
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newGroupName.trim();
    if (!name) return;
    setCreateLoading(true);
    setError(null);
    customerApi
      .addgroupname(name)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setNewGroupName('');
          setShowCreateForm(false);
          fetchGroups();
        } else {
          setError(String(data?.message ?? 'Create failed'));
        }
      })
      .catch(() => setError('Create failed'))
      .finally(() => setCreateLoading(false));
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId || !addMemberUserId) return;
    setActionLoading('add');
    setError(null);
    customerApi
      .addgroupmember(selectedGroupId, addMemberUserId)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setShowAddMember(false);
          setAddMemberUserId('');
          customerApi.fetchgroupMembers(selectedGroupId).then((r) => {
            const d = r?.data as Record<string, unknown>;
            setMembers(((d?.fetchgroupMembers ?? d?.list) as GroupMemberItem[]) ?? []);
          });
          fetchGroups();
        } else {
          setError(String(data?.message ?? 'Add member failed'));
        }
      })
      .catch(() => setError('Add member failed'))
      .finally(() => setActionLoading(null));
  };

  const handleRemoveMember = (groupId: string, memberId: string) => {
    if (!confirm('Remove this member from the group?')) return;
    setActionLoading(memberId);
    setError(null);
    customerApi
      .updategroupmember(groupId, memberId)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setMembers((prev) => prev.filter((m) => m.id !== memberId));
          fetchGroups();
        } else {
          setError(String(data?.message ?? 'Remove failed'));
        }
      })
      .catch(() => setError('Remove failed'))
      .finally(() => setActionLoading(null));
  };

  const handleDeleteGroup = (groupId: string) => {
    if (!confirm('Delete this group? Members will not be removed from the app.')) return;
    setActionLoading('delete');
    setError(null);
    customerApi
      .deletegrouplist(groupId)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setSelectedGroupId(null);
          setMembers([]);
          fetchGroups();
        } else {
          setError(String(data?.message ?? 'Delete failed'));
        }
      })
      .catch(() => setError('Delete failed'))
      .finally(() => setActionLoading(null));
  };

  return (
    <CustomerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <span className="gf-home__logo">Groups</span>
        <div className="gf-home__header-actions">
          <Link
            href={ROUTES.notifications}
            className="gf-home__header-link"
            aria-label="Notifications"
          >
            🔔
          </Link>
        </div>
      </header>

      <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 16 }}>
        Create groups and add other customers as members (e.g. for group sessions).
      </p>

      <Link
        href={ROUTES.dashboard}
        style={{
          fontSize: 14,
          color: 'var(--groupfit-secondary)',
          fontWeight: 600,
          marginBottom: 16,
          display: 'inline-block',
        }}
      >
        ← Dashboard
      </Link>

      {error && <p style={{ color: '#c00', marginBottom: 16 }}>{error}</p>}

      <button
        type="button"
        onClick={() => setShowCreateForm((v) => !v)}
        style={{
          marginBottom: 20,
          padding: '10px 16px',
          borderRadius: 8,
          border: 'none',
          background: 'var(--groupfit-secondary)',
          color: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {showCreateForm ? 'Cancel' : 'Create group'}
      </button>

      {showCreateForm && (
        <form
          onSubmit={handleCreateGroup}
          style={{
            marginBottom: 24,
            padding: 20,
            border: '1px solid var(--groupfit-border-light)',
            borderRadius: 8,
          }}
        >
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
            Group name
          </label>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="e.g. Weekend runners"
            required
            style={{
              padding: 8,
              width: '100%',
              maxWidth: 280,
              marginBottom: 12,
              borderRadius: 6,
              border: '1px solid var(--groupfit-border-light)',
            }}
          />
          <button
            type="submit"
            disabled={createLoading}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--groupfit-secondary)',
              color: '#fff',
              fontWeight: 600,
              cursor: createLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {createLoading ? 'Creating…' : 'Create'}
          </button>
        </form>
      )}

      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : groups.length === 0 ? (
        <div className="gf-home__empty">No groups yet. Create one above.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {groups.map((group) => (
            <div
              key={group.id}
              style={{
                padding: 16,
                border: '1px solid var(--groupfit-border-light)',
                borderRadius: 8,
                background:
                  selectedGroupId === group.id ? 'var(--groupfit-bg-subtle, #f8f9fa)' : undefined,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedGroupId(selectedGroupId === group.id ? null : group.id)
                    }
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: 0,
                    }}
                  >
                    {group.name}
                  </button>
                  <span style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginLeft: 8 }}>
                    {group.memberCount ?? 0} member{(group.memberCount ?? 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                {selectedGroupId === group.id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteGroup(group.id)}
                    disabled={actionLoading === 'delete'}
                    style={{
                      padding: '6px 12px',
                      fontSize: 13,
                      borderRadius: 6,
                      border: '1px solid #c00',
                      background: '#fff',
                      color: '#c00',
                      cursor: actionLoading === 'delete' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {actionLoading === 'delete' ? '…' : 'Delete group'}
                  </button>
                )}
              </div>

              {selectedGroupId === group.id && (
                <div style={{ marginTop: 16 }}>
                  {membersLoading ? (
                    <p style={{ color: 'var(--groupfit-grey)', fontSize: 14 }}>Loading members…</p>
                  ) : (
                    <>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 8,
                        }}
                      >
                        <strong style={{ fontSize: 14 }}>Members</strong>
                        <button
                          type="button"
                          onClick={loadSoloMembers}
                          style={{
                            padding: '6px 12px',
                            fontSize: 13,
                            borderRadius: 6,
                            border: '1px solid var(--groupfit-secondary)',
                            background: '#fff',
                            color: 'var(--groupfit-secondary)',
                            cursor: 'pointer',
                          }}
                        >
                          Add member
                        </button>
                      </div>
                      {showAddMember && (
                        <form
                          onSubmit={handleAddMember}
                          style={{
                            marginBottom: 12,
                            padding: 12,
                            background: '#fff',
                            borderRadius: 6,
                            border: '1px solid var(--groupfit-border-light)',
                          }}
                        >
                          <label
                            style={{
                              display: 'block',
                              marginBottom: 4,
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            Select customer to add
                          </label>
                          <select
                            value={addMemberUserId}
                            onChange={(e) => setAddMemberUserId(e.target.value)}
                            required
                            style={{
                              padding: 8,
                              width: '100%',
                              maxWidth: 320,
                              marginBottom: 8,
                              borderRadius: 6,
                              border: '1px solid var(--groupfit-border-light)',
                            }}
                          >
                            <option value="">— Choose —</option>
                            {soloList.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name || u.email} ({u.email})
                              </option>
                            ))}
                          </select>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              type="submit"
                              disabled={actionLoading === 'add'}
                              style={{
                                padding: '8px 14px',
                                borderRadius: 6,
                                border: 'none',
                                background: 'var(--groupfit-secondary)',
                                color: '#fff',
                                fontWeight: 600,
                                cursor: actionLoading === 'add' ? 'not-allowed' : 'pointer',
                              }}
                            >
                              {actionLoading === 'add' ? '…' : 'Add'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowAddMember(false)}
                              style={{
                                padding: '8px 14px',
                                borderRadius: 6,
                                border: '1px solid #666',
                                background: '#fff',
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                      {members.length === 0 ? (
                        <p style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>
                          No members. Add one above.
                        </p>
                      ) : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {members.map((m) => (
                            <li
                              key={m.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 0',
                                borderBottom: '1px solid var(--groupfit-border-light)',
                              }}
                            >
                              <span style={{ fontSize: 14 }}>
                                {m.userName || m.userEmail || m.userId}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(group.id, m.id)}
                                disabled={actionLoading === m.id}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: 12,
                                  borderRadius: 6,
                                  border: '1px solid #c00',
                                  background: '#fff',
                                  color: '#c00',
                                  cursor: actionLoading === m.id ? 'not-allowed' : 'pointer',
                                }}
                              >
                                {actionLoading === m.id ? '…' : 'Remove'}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </CustomerLayout>
  );
}
