'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CustomerLayout } from '../CustomerLayout';
import { CustomerHeader } from '@/components/CustomerHeader';
import { customerApi } from '@/lib/api';
import { ROUTES } from '../routes';
import { useStoredUser } from '@/lib/auth';

type GroupItem = {
  id: string;
  name: string;
  ownerId: string;
  memberCount?: number;
  createdAt: string;
  myMemberId?: string;
};
type GroupMemberItem = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  createdAt: string;
};
type SoloMemberItem = { id: string; name?: string; email: string };
type GroupInviteByPhoneItem = {
  id: string;
  phone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};
type MyPendingGroupInviteItem = {
  id: string;
  groupId: string;
  groupName: string;
  createdAt: string;
};

export default function GroupsPage() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMemberItem[]>([]);
  const [phoneInvites, setPhoneInvites] = useState<GroupInviteByPhoneItem[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [soloList, setSoloList] = useState<SoloMemberItem[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberUserId, setAddMemberUserId] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  // Invite by phone
  const [invitePhone, setInvitePhone] = useState('');
  const [invitePhoneLoading, setInvitePhoneLoading] = useState(false);
  const [inviteSuccessMessage, setInviteSuccessMessage] = useState<string | null>(null);
  // Edit group modal
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [saveNameLoading, setSaveNameLoading] = useState(false);
  // Pending group invite modal (invitee)
  const [pendingInvites, setPendingInvites] = useState<MyPendingGroupInviteItem[]>([]);
  const [inviteModalLoading, setInviteModalLoading] = useState(false);

  const { user: storedUser } = useStoredUser();
  const currentUserId = storedUser?.sub ?? null;

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
    customerApi
      .listMyPendingGroupInvites()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype !== 'error') {
          const list = (data?.listMyPendingGroupInvites ?? data?.list) as
            | MyPendingGroupInviteItem[]
            | undefined;
          setPendingInvites(list ?? []);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedGroupId) {
      setMembers([]);
      setPhoneInvites([]);
      setShowAddMember(false);
      return;
    }
    const selectedGroup = groups.find((g) => g.id === selectedGroupId);
    const isOwner = selectedGroup && currentUserId && selectedGroup.ownerId === currentUserId;
    if (!isOwner) {
      setMembers([]);
      setPhoneInvites([]);
      setShowAddMember(false);
      setMembersLoading(false);
      return;
    }
    setMembersLoading(true);
    let cancelled = false;
    Promise.all([
      customerApi.fetchgroupMembers(selectedGroupId),
      customerApi.listGroupInvitesByPhone(selectedGroupId),
    ])
      .then(([membersRes, invitesRes]) => {
        if (cancelled) return;
        const membersData = membersRes?.data as Record<string, unknown> | undefined;
        const membersList = (membersData?.fetchgroupMembers ?? membersData?.list) as
          | GroupMemberItem[]
          | undefined;
        setMembers(membersList ?? []);
        const invitesData = invitesRes?.data as Record<string, unknown> | undefined;
        const invitesList = (invitesData?.listGroupInvitesByPhone ?? invitesData?.list) as
          | GroupInviteByPhoneItem[]
          | undefined;
        setPhoneInvites(invitesList ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setMembers([]);
        setPhoneInvites([]);
      })
      .finally(() => {
        if (!cancelled) setMembersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedGroupId, currentUserId, groups]);

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

  const closeCreateModal = () => {
    setShowCreateForm(false);
    setNewGroupName('');
  };

  const openEditModal = (group: GroupItem) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
    setSelectedGroupId(group.id);
    setShowAddMember(false);
  };

  const closeEditModal = () => {
    setEditingGroupId(null);
    setEditingGroupName('');
    setShowAddMember(false);
    setSelectedGroupId(null);
    setInviteSuccessMessage(null);
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
          closeCreateModal();
          fetchGroups();
        } else {
          setError(String(data?.message ?? 'Create failed'));
        }
      })
      .catch(() => setError('Create failed'))
      .finally(() => setCreateLoading(false));
  };

  const handleSaveGroupName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroupId) return;
    const name = editingGroupName.trim();
    if (!name) return;
    setSaveNameLoading(true);
    setError(null);
    customerApi
      .editgroup(editingGroupId, name)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          fetchGroups();
        } else {
          setError(String(data?.message ?? 'Update failed'));
        }
      })
      .catch(() => setError('Update failed'))
      .finally(() => setSaveNameLoading(false));
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

  const handleInviteByPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId || !invitePhone.trim()) return;
    setInvitePhoneLoading(true);
    setError(null);
    setInviteSuccessMessage(null);
    customerApi
      .inviteGroupMemberByPhone(selectedGroupId, invitePhone.trim())
      .then((res) => {
        const data = res?.data as { mtype?: string; message?: string; added?: boolean };
        if (data?.mtype === 'success') {
          setInvitePhone('');
          setInviteSuccessMessage(data?.message ?? 'Invite sent.');
          if (data.added) {
            customerApi.fetchgroupMembers(selectedGroupId).then((r) => {
              const d = r?.data as Record<string, unknown>;
              setMembers(((d?.fetchgroupMembers ?? d?.list) as GroupMemberItem[]) ?? []);
            });
          }
          customerApi.listGroupInvitesByPhone(selectedGroupId).then((r) => {
            const d = r?.data as Record<string, unknown>;
            setPhoneInvites(
              ((d?.listGroupInvitesByPhone ?? d?.list) as GroupInviteByPhoneItem[]) ?? []
            );
          });
          fetchGroups();
        } else {
          setError(String(data?.message ?? 'Invite failed'));
        }
      })
      .catch(() => setError('Failed to send invite'))
      .finally(() => setInvitePhoneLoading(false));
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
          closeEditModal();
          setMembers([]);
          fetchGroups();
        } else {
          setError(String(data?.message ?? 'Delete failed'));
        }
      })
      .catch(() => setError('Delete failed'))
      .finally(() => setActionLoading(null));
  };

  const currentInvite = pendingInvites[0] ?? null;

  const handleAcceptGroupInvite = () => {
    if (!currentInvite) return;
    setInviteModalLoading(true);
    setError(null);
    customerApi
      .acceptGroupInviteByPhone(currentInvite.id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setPendingInvites((prev) => prev.filter((i) => i.id !== currentInvite.id));
          fetchGroups();
        } else {
          setError(String(data?.message ?? 'Failed to join group'));
        }
      })
      .catch(() => setError('Failed to join group'))
      .finally(() => setInviteModalLoading(false));
  };

  const handleDeclineGroupInvite = () => {
    if (!currentInvite) return;
    setInviteModalLoading(true);
    setError(null);
    customerApi
      .rejectGroupInviteByPhone(currentInvite.id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setPendingInvites((prev) => prev.filter((i) => i.id !== currentInvite.id));
          fetchGroups();
        } else {
          setError(String(data?.message ?? 'Failed to decline'));
        }
      })
      .catch(() => setError('Failed to decline'))
      .finally(() => setInviteModalLoading(false));
  };

  const handleLeaveGroup = (groupId: string, memberId: string) => {
    if (!confirm('Leave this group? You can be re-added by the group owner.')) return;
    setActionLoading('leave');
    setError(null);
    customerApi
      .updategroupmember(groupId, memberId)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setSelectedGroupId(null);
          setMembers([]);
          setPhoneInvites([]);
          fetchGroups();
        } else {
          setError(String(data?.message ?? 'Failed to leave group'));
        }
      })
      .catch(() => setError('Failed to leave group'))
      .finally(() => setActionLoading(null));
  };

  const isEditModalOpen = Boolean(editingGroupId);

  return (
    <CustomerLayout>
      <CustomerHeader
        title="Groups"
        className="gf-locations__header"
        rightContent={
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="gf-groups__add-btn gf-groups__add-btn--header"
          >
            + Create group
          </button>
        }
      />

      <div className="gf-groups">
        <p className="gf-groups__intro">
          Create groups and add other customers as members (e.g. for group sessions).
        </p>

        <Link href={ROUTES.profile} className="gf-groups__back">
          ← Profile
        </Link>

        {error && (
          <div className="gf-groups__error" role="alert">
            {error}
          </div>
        )}

        {/* Pending group invite modal (you were invited to join a group) */}
        {currentInvite && (
          <div
            className="gf-groups-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gf-groups-invite-modal-title"
          >
            <div className="gf-groups-modal__backdrop" aria-hidden />
            <div
              className="gf-groups-modal__box"
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="gf-groups-form">
                <h2 id="gf-groups-invite-modal-title" className="gf-groups-form__title">
                  Group invitation
                </h2>
                <p
                  className="gf-groups-form__section-title"
                  style={{ marginBottom: 16, fontWeight: 400 }}
                >
                  You&apos;ve been invited to join the group &quot;{currentInvite.groupName}&quot;.
                  Do you want to join?
                </p>
                <div className="gf-groups-form__actions" style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={handleAcceptGroupInvite}
                    disabled={inviteModalLoading}
                    className="gf-locations-btn gf-locations-btn--primary"
                  >
                    {inviteModalLoading ? '…' : 'Accept'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeclineGroupInvite}
                    disabled={inviteModalLoading}
                    className="gf-locations-btn gf-locations-btn--secondary"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create group modal */}
        {showCreateForm && (
          <div
            className="gf-groups-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gf-groups-modal-title"
          >
            <div className="gf-groups-modal__backdrop" onClick={closeCreateModal} aria-hidden />
            <div
              className="gf-groups-modal__box"
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="gf-groups-modal__close"
                onClick={closeCreateModal}
                aria-label="Close"
              >
                ×
              </button>
              <div className="gf-groups-form">
                <h2 id="gf-groups-modal-title" className="gf-groups-form__title">
                  New group
                </h2>
                <form onSubmit={handleCreateGroup}>
                  <label className="gf-groups-form__label" htmlFor="group-name">
                    Group name
                  </label>
                  <input
                    id="group-name"
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Weekend runners"
                    required
                    className="gf-groups-form__input"
                  />
                  <div className="gf-groups-form__actions">
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="gf-locations-btn gf-locations-btn--primary"
                    >
                      {createLoading ? 'Creating…' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={closeCreateModal}
                      className="gf-locations-btn gf-locations-btn--secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit group modal */}
        {isEditModalOpen && editingGroupId && (
          <div
            className="gf-groups-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gf-groups-edit-modal-title"
          >
            <div className="gf-groups-modal__backdrop" onClick={closeEditModal} aria-hidden />
            <div
              className="gf-groups-modal__box gf-groups-modal__box--edit"
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="gf-groups-modal__close"
                onClick={closeEditModal}
                aria-label="Close"
              >
                ×
              </button>
              <div className="gf-groups-form">
                <h2 id="gf-groups-edit-modal-title" className="gf-groups-form__title">
                  Edit group
                </h2>

                <form onSubmit={handleSaveGroupName}>
                  <label className="gf-groups-form__label" htmlFor="edit-group-name">
                    Group name
                  </label>
                  <input
                    id="edit-group-name"
                    type="text"
                    value={editingGroupName}
                    onChange={(e) => setEditingGroupName(e.target.value)}
                    placeholder="Group name"
                    required
                    className="gf-groups-form__input"
                  />
                  <div
                    className="gf-groups-form__actions"
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: '1px solid var(--groupfit-border-light)',
                    }}
                  >
                    <button
                      type="submit"
                      disabled={saveNameLoading}
                      className="gf-locations-btn gf-locations-btn--primary"
                    >
                      {saveNameLoading ? 'Saving…' : 'Save name'}
                    </button>
                  </div>
                </form>

                <div className="gf-groups-form__section" style={{ marginTop: 20 }}>
                  <span className="gf-groups-form__section-title">Members</span>

                  <p style={{ fontSize: 13, color: 'var(--groupfit-grey)', marginBottom: 12 }}>
                    Add someone already on GroupFit, or invite by phone. If they have an account
                    they’ll be added and notified; otherwise they’ll get an SMS to sign up and join.
                  </p>

                  {inviteSuccessMessage && (
                    <p
                      style={{
                        fontSize: 14,
                        color: 'var(--groupfit-success, #16a34a)',
                        marginBottom: 8,
                      }}
                    >
                      {inviteSuccessMessage}
                    </p>
                  )}
                  <form
                    onSubmit={handleInviteByPhone}
                    className="gf-groups-add-member-form"
                    style={{ marginTop: 12 }}
                  >
                    <label className="gf-groups-form__label">Invite by phone number</label>
                    <input
                      type="tel"
                      value={invitePhone}
                      onChange={(e) => setInvitePhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                      className="gf-groups-form__input"
                      style={{ marginBottom: 8 }}
                    />
                    <button
                      type="submit"
                      disabled={invitePhoneLoading || !invitePhone.trim()}
                      className="gf-groups-card-btn gf-groups-card-btn--primary"
                    >
                      {invitePhoneLoading ? 'Sending…' : 'Send invite'}
                    </button>
                  </form>

                  {membersLoading ? (
                    <p className="gf-groups-loading" style={{ padding: '8px 0' }}>
                      Loading members…
                    </p>
                  ) : members.length === 0 ? (
                    <p style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>
                      No members. Add one above.
                    </p>
                  ) : (
                    <ul className="gf-groups-members">
                      {members.map((m) => (
                        <li key={m.id} className="gf-groups-members__item">
                          <span>{m.userName || m.userEmail || m.userId}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(editingGroupId, m.id)}
                            disabled={actionLoading === m.id}
                            className="gf-groups-card-btn gf-groups-card-btn--danger"
                          >
                            {actionLoading === m.id ? '…' : 'Remove'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {phoneInvites.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <span
                        className="gf-groups-form__section-title"
                        style={{ display: 'block', marginBottom: 8 }}
                      >
                        Phone invites
                      </span>
                      <ul
                        className="gf-groups-members"
                        style={{ listStyle: 'none', padding: 0, margin: 0 }}
                      >
                        {phoneInvites.map((inv) => (
                          <li
                            key={inv.id}
                            className="gf-groups-members__item"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              flexWrap: 'wrap',
                            }}
                          >
                            <span style={{ flex: 1 }}>{inv.phone}</span>
                            <span
                              style={{
                                fontSize: 12,
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontWeight: 500,
                                ...(inv.status === 'PENDING'
                                  ? {
                                      background: 'var(--groupfit-warning-bg, #fef3c7)',
                                      color: 'var(--groupfit-warning, #b45309)',
                                    }
                                  : inv.status === 'APPROVED'
                                    ? {
                                        background: 'var(--groupfit-success-bg, #dcfce7)',
                                        color: 'var(--groupfit-success, #16a34a)',
                                      }
                                    : {
                                        background: 'var(--groupfit-muted-bg, #f3f4f6)',
                                        color: 'var(--groupfit-grey)',
                                      }),
                              }}
                            >
                              {inv.status === 'PENDING'
                                ? 'Pending'
                                : inv.status === 'APPROVED'
                                  ? 'Approved'
                                  : 'Rejected'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div
                  className="gf-groups-form__actions"
                  style={{ marginTop: 24, borderTop: '1px solid var(--groupfit-border-light)' }}
                >
                  <button
                    type="button"
                    onClick={() => handleDeleteGroup(editingGroupId)}
                    disabled={actionLoading === 'delete'}
                    className="gf-groups-card-btn gf-groups-card-btn--danger"
                  >
                    {actionLoading === 'delete' ? '…' : 'Delete group'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="gf-groups-loading">Loading…</p>
        ) : groups.length === 0 ? (
          <div className="gf-home__empty">No groups yet. Create one above.</div>
        ) : (
          <ul className="gf-groups-list">
            {groups.map((group) => (
              <li
                key={group.id}
                className={`gf-groups-card${selectedGroupId === group.id && !isEditModalOpen ? ' gf-groups-card--selected' : ''}`}
              >
                <div className="gf-groups-card__head">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedGroupId(selectedGroupId === group.id ? null : group.id)
                    }
                    className="gf-groups-card__title"
                  >
                    {group.name}
                  </button>
                  <span className="gf-groups-card__meta">
                    {group.memberCount ?? 0} member{(group.memberCount ?? 0) !== 1 ? 's' : ''}
                  </span>
                  {group.ownerId === currentUserId ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(group);
                      }}
                      className="gf-groups-card-btn gf-groups-card-btn--outline"
                      style={{ marginLeft: 'auto' }}
                    >
                      Edit
                    </button>
                  ) : group.myMemberId ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeaveGroup(group.id, group.myMemberId!);
                      }}
                      disabled={actionLoading === 'leave'}
                      className="gf-groups-card-btn gf-groups-card-btn--danger"
                      style={{ marginLeft: 'auto' }}
                    >
                      {actionLoading === 'leave' ? '…' : 'Leave group'}
                    </button>
                  ) : null}
                </div>

                {selectedGroupId === group.id && !isEditModalOpen && (
                  <div className="gf-groups-card__body">
                    {group.ownerId === currentUserId ? (
                      <>
                        <div className="gf-groups-card__actions">
                          <button
                            type="button"
                            onClick={loadSoloMembers}
                            className="gf-groups-card-btn gf-groups-card-btn--outline"
                          >
                            Add existing member
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(group)}
                            className="gf-groups-card-btn gf-groups-card-btn--outline"
                          >
                            Edit group
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGroup(group.id)}
                            disabled={actionLoading === 'delete'}
                            className="gf-groups-card-btn gf-groups-card-btn--danger"
                          >
                            {actionLoading === 'delete' ? '…' : 'Delete group'}
                          </button>
                        </div>

                        {inviteSuccessMessage && (
                          <p
                            style={{
                              fontSize: 14,
                              color: 'var(--groupfit-success, #16a34a)',
                              marginBottom: 8,
                            }}
                          >
                            {inviteSuccessMessage}
                          </p>
                        )}
                        <form
                          onSubmit={handleInviteByPhone}
                          className="gf-groups-add-member-form"
                          style={{ marginBottom: 12 }}
                        >
                          <label className="gf-groups-form__label">Invite by phone number</label>
                          <input
                            type="tel"
                            value={invitePhone}
                            onChange={(e) => setInvitePhone(e.target.value)}
                            placeholder="+1 234 567 8900"
                            className="gf-groups-form__input"
                            style={{ marginBottom: 8 }}
                          />
                          <button
                            type="submit"
                            disabled={invitePhoneLoading || !invitePhone.trim()}
                            className="gf-groups-card-btn gf-groups-card-btn--primary"
                          >
                            {invitePhoneLoading ? 'Sending…' : 'Send invite'}
                          </button>
                        </form>

                        {membersLoading ? (
                          <p className="gf-groups-loading" style={{ padding: '8px 0' }}>
                            Loading members…
                          </p>
                        ) : (
                          <div>
                            {showAddMember && (
                              <form
                                onSubmit={handleAddMember}
                                className="gf-groups-add-member-form"
                              >
                                <label className="gf-groups-form__label">
                                  Select customer to add
                                </label>
                                <select
                                  value={addMemberUserId}
                                  onChange={(e) => setAddMemberUserId(e.target.value)}
                                  required
                                >
                                  <option value="">— Choose —</option>
                                  {soloList.map((u) => (
                                    <option key={u.id} value={u.id}>
                                      {u.name || u.email} ({u.email})
                                    </option>
                                  ))}
                                </select>
                                <div
                                  className="gf-groups-form__actions"
                                  style={{ marginTop: 12, paddingTop: 0, borderTop: 'none' }}
                                >
                                  <button
                                    type="submit"
                                    disabled={actionLoading === 'add'}
                                    className="gf-groups-card-btn gf-groups-card-btn--primary"
                                  >
                                    {actionLoading === 'add' ? '…' : 'Add'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowAddMember(false)}
                                    className="gf-groups-card-btn gf-groups-card-btn--outline"
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
                              <ul className="gf-groups-members">
                                {members.map((m) => (
                                  <li key={m.id} className="gf-groups-members__item">
                                    <span>{m.userName || m.userEmail || m.userId}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveMember(group.id, m.id)}
                                      disabled={actionLoading === m.id}
                                      className="gf-groups-card-btn gf-groups-card-btn--danger"
                                    >
                                      {actionLoading === m.id ? '…' : 'Remove'}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {phoneInvites.length > 0 && selectedGroupId === group.id && (
                              <div style={{ marginTop: 12 }}>
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    display: 'block',
                                    marginBottom: 6,
                                  }}
                                >
                                  Phone invites
                                </span>
                                <ul
                                  className="gf-groups-members"
                                  style={{ listStyle: 'none', padding: 0, margin: 0 }}
                                >
                                  {phoneInvites.map((inv) => (
                                    <li
                                      key={inv.id}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        flexWrap: 'wrap',
                                        marginBottom: 4,
                                      }}
                                    >
                                      <span style={{ flex: 1 }}>{inv.phone}</span>
                                      <span
                                        style={{
                                          fontSize: 12,
                                          padding: '2px 8px',
                                          borderRadius: 4,
                                          fontWeight: 500,
                                          ...(inv.status === 'PENDING'
                                            ? {
                                                background: 'var(--groupfit-warning-bg, #fef3c7)',
                                                color: 'var(--groupfit-warning, #b45309)',
                                              }
                                            : inv.status === 'APPROVED'
                                              ? {
                                                  background: 'var(--groupfit-success-bg, #dcfce7)',
                                                  color: 'var(--groupfit-success, #16a34a)',
                                                }
                                              : {
                                                  background: 'var(--groupfit-muted-bg, #f3f4f6)',
                                                  color: 'var(--groupfit-grey)',
                                                }),
                                        }}
                                      >
                                        {inv.status === 'PENDING'
                                          ? 'Pending'
                                          : inv.status === 'APPROVED'
                                            ? 'Approved'
                                            : 'Rejected'}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : group.myMemberId ? (
                      <div className="gf-groups-card__actions" style={{ paddingTop: 0 }}>
                        <p
                          style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 12 }}
                        >
                          You are a member of this group. You can leave at any time.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleLeaveGroup(group.id, group.myMemberId!)}
                          disabled={actionLoading === 'leave'}
                          className="gf-groups-card-btn gf-groups-card-btn--danger"
                        >
                          {actionLoading === 'leave' ? '…' : 'Leave group'}
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </CustomerLayout>
  );
}
