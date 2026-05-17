import { useEffect, useRef, useState } from 'react';
import { Button, Card, ScreenScroll, SectionHeader, Badge } from '../components/ui';
import { AlertCircle, Bell, CheckCircle2, Cloud, CloudOff, Eye, Loader2, LogOut, RefreshCw, User, Users, ChevronRight, Upload, FileJson, FileSpreadsheet, Moon, Sun, Smartphone, Heart, Salad, Plus, X, Trash2, Share2, Pencil } from 'lucide-react';
import { notificationsSupported, requestNotificationsPermission } from '../../lib/notifications';
import { FoodItem, GroceryItem, PurchaseHistory, HouseholdMember, DietPreferences, DietTag, dietLabels } from '../data';
import type { Meal } from '../data';
import type { AppProfile } from '../profile';
import { ExportData, ExportSettings, exportToJSON, exportToCSV, downloadFile, importFromJSON } from '../utils/exportImport';
import { buildImportSummary } from '../utils/importSummary';
import { toast } from 'sonner';
import { haptic } from '../utils/haptic';
import { Modal } from '../components/Modal';
import {
  ReminderPreferences,
  updateReminderPreference,
} from '../reminderPreferences';
import {
  HouseholdType,
  householdTypeDescriptions,
  householdTypeLabels,
} from '../householdPreferences';
import { buildHouseholdInviteLink } from '../householdInvite';
import {
  ActiveHouseholdInvite,
  createHouseholdInvite,
  createSupabaseHouseholdCloudStore,
  emitHouseholdMembershipChanged,
  ensureUserHousehold,
  listActiveHouseholdInvites,
  removeHouseholdMember,
  revokeHouseholdInvite,
} from '../householdCloud';
import { householdMembersForProfile } from '../profileHousehold';
import {
  canCreateHouseholdInvite,
  canEditLocalHousehold,
  canLeaveHousehold,
  householdActionConfirmation,
  inviteTokenSuffix,
  type HouseholdActionConfirmation,
} from '../householdSettings';
import { useAuth } from '../../lib/auth';
import { normalizeAuthProfileName } from '../../lib/authProfile';
import { supabase } from '../../lib/supabase';
import {
  CLOUD_SYNC_STATUS_EVENT,
  CloudSyncStatusDetail,
  CloudSyncStatusMap,
  cloudSyncDetailRows,
  emitCloudSyncNow,
  formatLastSynced,
  summarizeCloudSync,
} from '../cloudSyncStatus';
import { launchInfoItems } from '../launchInfo';

const dietOptions: DietTag[] = ['vegetarian', 'vegan', 'gluten-free', 'low-carb', 'high-protein', 'dairy-free'];
const AVATAR_COLORS = [
  'var(--pp-pantry-green)',
  'var(--pp-sky-blue)',
  'var(--pp-tomato-red)',
  'var(--pp-grocery-brown)',
  'var(--pp-lemon-yellow)',
  'var(--pp-fresh-mint)',
];
const AVATAR_EMOJIS = ['👤', '🧑', '👩', '👨', '🧒', '👶', '🐱', '🐶'];

export function Settings({
  onLogout,
  pantry = [],
  groceries = [],
  purchaseHistory = [],
  userMeals = [],
  household,
  householdType,
  dietPrefs,
  theme,
  largeText,
  highContrast,
  haptics,
  notifsEnabled = false,
  profile,
  reminderPrefs,
  onImport,
  onUpdateHousehold,
  onUpdateHouseholdType,
  onUpdateDietPrefs,
  onToggleTheme,
  onToggleLargeText,
  onToggleHighContrast,
  onToggleHaptics,
  onToggleNotifs,
  onUpdateReminderPrefs,
  householdJoinNotice = false,
  onDismissHouseholdJoinNotice,
}: {
  onLogout: () => void;
  pantry?: FoodItem[];
  groceries?: GroceryItem[];
  purchaseHistory?: PurchaseHistory[];
  userMeals?: Meal[];
  household: HouseholdMember[];
  householdType: HouseholdType;
  dietPrefs: DietPreferences;
  theme: 'light' | 'dark';
  largeText: boolean;
  highContrast: boolean;
  haptics: boolean;
  notifsEnabled?: boolean;
  profile: AppProfile;
  reminderPrefs: ReminderPreferences;
  onImport?: (data: ExportData) => void;
  onUpdateHousehold: (h: HouseholdMember[]) => void;
  onUpdateHouseholdType: (h: HouseholdType) => void;
  onUpdateDietPrefs: (p: DietPreferences) => void;
  onToggleTheme: () => void;
  onToggleLargeText: (v: boolean) => void;
  onToggleHighContrast: (v: boolean) => void;
  onToggleHaptics: (v: boolean) => void;
  onToggleNotifs?: (v: boolean) => void;
  onUpdateReminderPrefs: (v: ReminderPreferences) => void;
  householdJoinNotice?: boolean;
  onDismissHouseholdJoinNotice?: () => void;
}) {
  const [newMember, setNewMember] = useState('');
  const [pendingImport, setPendingImport] = useState<ExportData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [cloudSyncStatuses, setCloudSyncStatuses] = useState<CloudSyncStatusMap>({});
  const [syncClock, setSyncClock] = useState(() => Date.now());
  const [showSyncDetails, setShowSyncDetails] = useState(false);
  const [sharingInvite, setSharingInvite] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [leavingHousehold, setLeavingHousehold] = useState(false);
  const [confirmHouseholdAction, setConfirmHouseholdAction] = useState<HouseholdActionConfirmation | null>(null);
  const [activeInvites, setActiveInvites] = useState<ActiveHouseholdInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [revokingInviteId, setRevokingInviteId] = useState<string | null>(null);
  const [copyingInviteId, setCopyingInviteId] = useState<string | null>(null);
  const [editingProfileName, setEditingProfileName] = useState(false);
  const [profileNameDraft, setProfileNameDraft] = useState(profile.name);
  const [savingProfileName, setSavingProfileName] = useState(false);
  const { user, updateProfileName } = useAuth();

  useEffect(() => {
    if (!editingProfileName) setProfileNameDraft(profile.name);
  }, [editingProfileName, profile.name]);

  useEffect(() => {
    if (!user || profile.roleLabel !== 'Owner') {
      setActiveInvites([]);
      return;
    }
    refreshActiveInvites();
  }, [user?.id, profile.roleLabel]);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<CloudSyncStatusDetail>).detail;
      if (!detail?.key) return;
      setCloudSyncStatuses((current) => ({ ...current, [detail.key]: detail }));
      setSyncClock(Date.now());
    };
    window.addEventListener(CLOUD_SYNC_STATUS_EVENT, handler);
    return () => window.removeEventListener(CLOUD_SYNC_STATUS_EVENT, handler);
  }, []);

  useEffect(() => {
    const hasSyncing = Object.values(cloudSyncStatuses).some((status) => status.phase === 'syncing');
    if (!hasSyncing) return;
    const timer = window.setInterval(() => setSyncClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [cloudSyncStatuses]);

  function installPWA() {
    if (installPrompt) {
      installPrompt.prompt();
      toast.success('Add PantryPal to your home screen');
    } else {
      toast('To install: tap the share button, then "Add to Home Screen"');
    }
  }

  function addMember() {
    const name = newMember.trim();
    if (!name) return;
    const color = AVATAR_COLORS[household.length % AVATAR_COLORS.length];
    const emoji = AVATAR_EMOJIS[household.length % AVATAR_EMOJIS.length];
    onUpdateHousehold([...household, { id: `u-${Date.now()}`, name, emoji, color, role: 'member' }]);
    setNewMember('');
    toast.success(`${name} invited to household`);
    if (haptics) haptic('success');
  }
  async function removeMember(id: string) {
    const m = household.find((x) => x.id === id);
    if (!m || m.role === 'owner') return;
    if (!user) {
      onUpdateHousehold(household.filter((x) => x.id !== id));
      toast(`${m.name} removed from household`);
      return;
    }
    if (profile.roleLabel !== 'Owner') {
      toast.error('Only the household owner can remove members');
      return;
    }

    setRemovingMemberId(id);
    try {
      const store = createSupabaseHouseholdCloudStore(supabase);
      const membership = await store.getMembership(user.id);
      if (!membership) throw new Error('No household membership');
      await removeHouseholdMember(store, membership.householdId, id);
      onUpdateHousehold(household.filter((x) => x.id !== id));
      emitHouseholdMembershipChanged();
      toast(`${m.name} removed from household`);
      if (haptics) haptic('success');
    } catch {
      toast.error('Could not remove household member');
    } finally {
      setRemovingMemberId(null);
    }
  }
  async function leaveHousehold() {
    if (!user || leavingHousehold) return;
    setLeavingHousehold(true);
    try {
      const store = createSupabaseHouseholdCloudStore(supabase);
      const membership = await store.getMembership(user.id);
      if (!membership) throw new Error('No household membership');
      await removeHouseholdMember(store, membership.householdId, user.id);
      onUpdateHousehold([]);
      emitHouseholdMembershipChanged();
      emitCloudSyncNow();
      toast.success('Left household');
      if (haptics) haptic('success');
    } catch {
      toast.error('Could not leave household');
    } finally {
      setLeavingHousehold(false);
    }
  }
  function confirmPendingHouseholdAction() {
    const action = confirmHouseholdAction;
    if (!action) return;
    setConfirmHouseholdAction(null);
    if (action.type === 'removeMember') {
      removeMember(action.memberId);
    } else if (action.type === 'revokeInvite') {
      revokeInvite(action.inviteId);
    } else {
      leaveHousehold();
    }
  }
  function toggleDiet(d: DietTag) {
    const next = dietPrefs.diets.includes(d)
      ? dietPrefs.diets.filter((x) => x !== d)
      : [...dietPrefs.diets, d];
    onUpdateDietPrefs({ ...dietPrefs, diets: next });
  }
  function updatePreferenceList(key: 'allergies' | 'dislikedIngredients', value: string) {
    onUpdateDietPrefs({
      ...dietPrefs,
      [key]: value.split(',').map((item) => item.trim()).filter(Boolean),
    });
  }
  function updateReminder(key: keyof ReminderPreferences, value: boolean) {
    onUpdateReminderPrefs(updateReminderPreference(reminderPrefs, key, value));
  }
  function syncNow() {
    emitCloudSyncNow();
    toast('Syncing now');
  }
  async function refreshActiveInvites() {
    if (!user || profile.roleLabel !== 'Owner') return;
    setLoadingInvites(true);
    try {
      const store = createSupabaseHouseholdCloudStore(supabase);
      const householdId = await ensureUserHousehold(store, user.id, profile.name);
      setActiveInvites(await listActiveHouseholdInvites(store, householdId));
    } catch {
      setActiveInvites([]);
    } finally {
      setLoadingInvites(false);
    }
  }
  async function shareInviteLink() {
    if (sharingInvite) return;
    if (!user) {
      toast.error('Sign in to create a household invite');
      return;
    }
    if (profile.roleLabel !== 'Owner') {
      toast.error('Only the household owner can create invite links');
      return;
    }

    setSharingInvite(true);
    try {
      const store = createSupabaseHouseholdCloudStore(supabase);
      const householdId = await ensureUserHousehold(store, user.id, profile.name);
      const token = await createHouseholdInvite(store, householdId, user.id);
      const link = buildHouseholdInviteLink(window.location.href, token);
      setActiveInvites(await listActiveHouseholdInvites(store, householdId));
      emitHouseholdMembershipChanged();

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(link);
        toast.success('Invite link copied');
      } else {
        toast(link);
      }
      if (haptics) haptic('success');
    } catch {
      toast.error('Could not copy invite link');
    } finally {
      setSharingInvite(false);
    }
  }
  async function revokeInvite(inviteId: string) {
    if (!user || revokingInviteId) return;
    setRevokingInviteId(inviteId);
    try {
      const store = createSupabaseHouseholdCloudStore(supabase);
      await revokeHouseholdInvite(store, inviteId);
      setActiveInvites((current) => current.filter((invite) => invite.id !== inviteId));
      toast.success('Invite revoked');
    } catch {
      toast.error('Could not revoke invite');
    } finally {
      setRevokingInviteId(null);
    }
  }
  async function copyExistingInvite(invite: ActiveHouseholdInvite) {
    setCopyingInviteId(invite.id);
    try {
      const link = buildHouseholdInviteLink(window.location.href, invite.token);
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(link);
        toast.success('Invite link copied');
      } else {
        toast(link);
      }
      if (haptics) haptic('success');
    } catch {
      toast.error('Could not copy invite link');
    } finally {
      setCopyingInviteId(null);
    }
  }

  function handleExportJSON() {
    const settings: ExportSettings = {
      householdType,
      dietPrefs,
      theme,
      largeText,
      highContrast,
      haptics,
      notifsEnabled,
      reminderPrefs,
    };
    const json = exportToJSON(pantry, groceries, purchaseHistory, { userMeals, settings });
    const date = new Date().toISOString().split('T')[0];
    downloadFile(json, `pantrypal-backup-${date}.json`, 'application/json');
    toast.success('Data exported as JSON');
  }
  function handleExportCSV() {
    const csv = exportToCSV(pantry);
    const date = new Date().toISOString().split('T')[0];
    downloadFile(csv, `pantrypal-pantry-${date}.csv`, 'text/csv');
    toast.success('Pantry exported as CSV');
  }
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await importFromJSON(file);
    if (data) {
      setPendingImport(data);
    } else {
      toast.error('Failed to import file. Please check the format.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }
  function confirmImport() {
    if (!pendingImport || !onImport) return;
    onImport(pendingImport);
    toast.success(`Imported ${pendingImport.pantry.length} pantry items`);
    setPendingImport(null);
  }
  async function saveProfileName() {
    if (!user || savingProfileName) return;
    const nextName = normalizeAuthProfileName(profileNameDraft);
    if (!nextName) {
      toast.error('Enter a display name');
      return;
    }
    if (nextName === profile.name) {
      setEditingProfileName(false);
      return;
    }

    setSavingProfileName(true);
    try {
      await updateProfileName(nextName);
      onUpdateHousehold(household.map((member) => (
        member.id === user.id || (profile.roleLabel === 'Owner' && member.role === 'owner')
          ? { ...member, name: nextName }
          : member
      )));
      emitHouseholdMembershipChanged();
      toast.success('Profile name updated');
      if (haptics) haptic('success');
      setEditingProfileName(false);
    } catch {
      toast.error('Could not update profile name');
    } finally {
      setSavingProfileName(false);
    }
  }

  const importSummary = pendingImport ? buildImportSummary(pendingImport) : null;
  const visibleHousehold = householdMembersForProfile(profile, household);
  const isSignedIn = Boolean(user);
  const localHouseholdEditing = canEditLocalHousehold(isSignedIn);
  const householdInviteAvailable = canCreateHouseholdInvite(isSignedIn, profile.roleLabel);
  const householdLeaveAvailable = canLeaveHousehold(isSignedIn, profile.roleLabel);
  const cloudSyncSummary = summarizeCloudSync(cloudSyncStatuses, Boolean(user), syncClock);
  const cloudSyncRows = cloudSyncDetailRows(cloudSyncStatuses);

  return (
    <ScreenScroll>
      <Card style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 'var(--pp-radius-full)',
          background: 'var(--pp-pantry-green)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <User size={26} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="pp-card-title">{profile.name}</div>
          <div className="pp-small">{profile.email}</div>
        </div>
        <Badge tone="green">{profile.roleLabel}</Badge>
        {isSignedIn && (
          <button
            onClick={() => setEditingProfileName((value) => !value)}
            aria-label={editingProfileName ? 'Close profile editor' : 'Edit profile name'}
            title={editingProfileName ? 'Close profile editor' : 'Edit profile name'}
            style={iconBtn}
          >
            {editingProfileName ? <X size={16} color="var(--pp-gray-600)" /> : <Pencil size={16} color="var(--pp-gray-600)" />}
          </button>
        )}
      </Card>

      {isSignedIn && editingProfileName && (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="pp-h6" style={{ fontWeight: 500, color: 'var(--pp-gray-700)' }}>Display name</span>
            <input
              value={profileNameDraft}
              onChange={(event) => setProfileNameDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') saveProfileName();
                if (event.key === 'Escape') setEditingProfileName(false);
              }}
              placeholder="Your name"
              disabled={savingProfileName}
              style={textInput}
            />
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={saveProfileName}
              disabled={savingProfileName}
              style={{
                ...primaryBtn,
                opacity: savingProfileName ? 0.7 : 1,
              }}
            >
              {savingProfileName ? <Loader2 size={16} className="pp-spin" /> : <CheckCircle2 size={16} />}
              Save
            </button>
            <button
              onClick={() => setEditingProfileName(false)}
              disabled={savingProfileName}
              style={secondaryBtn}
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </Card>
      )}

      {householdJoinNotice && (
        <Card style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 14,
          borderColor: 'var(--pp-pantry-green)',
          background: 'var(--pp-soft-sage)',
        }}>
          <CheckCircle2 size={20} color="var(--pp-pantry-green)" />
          <div style={{ flex: 1 }}>
            <div className="pp-strong" style={{ fontSize: 14 }}>Household joined</div>
            <div className="pp-small">Shared pantry, grocery, meal, and recipe data will sync here.</div>
          </div>
          <button
            onClick={onDismissHouseholdJoinNotice}
            aria-label="Dismiss household joined notice"
            style={iconBtn}
          >
            <X size={16} color="var(--pp-gray-600)" />
          </button>
        </Card>
      )}

      <Card style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 'var(--pp-radius-full)',
          background: 'var(--pp-gray-100)', color: syncToneColor(cloudSyncSummary.tone),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <SyncIcon tone={cloudSyncSummary.tone} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="pp-strong" style={{ fontSize: 14 }}>{cloudSyncSummary.title}</div>
          <div className="pp-small">{cloudSyncSummary.detail}</div>
          {cloudSyncSummary.lastSyncedAt && (
            <div className="pp-small" style={{ marginTop: 2 }}>
              Last synced {formatLastSynced(cloudSyncSummary.lastSyncedAt)}
            </div>
          )}
          {cloudSyncRows.length > 0 && (
            <button
              onClick={() => setShowSyncDetails((value) => !value)}
              style={textBtn}
            >
              {showSyncDetails ? 'Hide sync details' : 'View sync details'}
            </button>
          )}
        </div>
        {cloudSyncSummary.tone === 'neutral' ? (
          <Badge tone="neutral">Local</Badge>
        ) : (
          <button
            onClick={syncNow}
            aria-label="Sync now"
            title="Sync now"
            style={syncBtn}
          >
            <RefreshCw size={16} />
          </button>
        )}
      </Card>
      {showSyncDetails && cloudSyncRows.length > 0 && (
        <Card style={{ padding: 0 }}>
          {cloudSyncRows.map((row, i) => (
            <div
              key={row.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderTop: i === 0 ? 'none' : '1px solid var(--pp-gray-100)',
              }}
            >
              <div style={{ flex: 1 }}>
                <div className="pp-strong" style={{ fontSize: 13 }}>{row.label}</div>
                <div className="pp-small">{row.scopeLabel}</div>
                {row.phase === 'error' && row.message && (
                  <div className="pp-small">{row.message}</div>
                )}
              </div>
              <Badge tone={syncPhaseTone(row.phase)}>{syncPhaseLabel(row.phase)}</Badge>
            </div>
          ))}
        </Card>
      )}

      {/* Appearance */}
      <div>
        <SectionHeader title="Appearance" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <ToggleRow
            icon={theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            label="Dark mode"
            sub="Easier on the eyes at night."
            value={theme === 'dark'}
            onChange={() => { onToggleTheme(); if (haptics) haptic('tap'); }}
          />
          <ToggleRow icon={<Eye size={18} />} label="Larger text" sub="Increase base font size." value={largeText} onChange={onToggleLargeText} />
          <ToggleRow icon={<Eye size={18} />} label="High contrast" sub="Boost color contrast for readability." value={highContrast} onChange={onToggleHighContrast} />
          <ToggleRow icon={<Smartphone size={18} />} label="Haptic feedback" sub="Vibrate on key actions." value={haptics} onChange={onToggleHaptics} />
        </div>
      </div>

      {/* Notifications */}
      <div>
        <SectionHeader title="Notifications" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <ToggleRow
            icon={<Bell size={18} />}
            label="Expiring & low-stock reminders"
            sub={notificationsSupported() ? 'Get notified when items are about to expire.' : 'Not supported on this device.'}
            value={notifsEnabled}
            onChange={async (v) => {
              if (!onToggleNotifs) return;
              if (v) {
                const perm = await requestNotificationsPermission();
                if (perm !== 'granted') {
                  toast.error('Notification permission denied');
                  return;
                }
                toast.success('Reminders enabled');
              }
              onToggleNotifs(v);
            }}
          />
        </div>
      </div>

      {/* PWA */}
      <Card
        onClick={installPWA}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--pp-gradient-primary)',
          borderColor: 'var(--pp-pantry-green)', color: 'var(--pp-white)', cursor: 'pointer',
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--pp-radius-full)',
          background: 'var(--pp-overlay-white-18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Smartphone size={22} /></div>
        <div style={{ flex: 1 }}>
          <div className="pp-strong" style={{ color: 'white' }}>Install PantryPal</div>
          <div className="pp-small" style={{ color: 'var(--pp-overlay-white-85)' }}>Add to home screen · works offline</div>
        </div>
        <ChevronRight size={18} />
      </Card>

      {/* Household members */}
      <div>
        <SectionHeader
          title="Household"
          action={<Badge tone="blue">{visibleHousehold.length} member{visibleHousehold.length === 1 ? '' : 's'}</Badge>}
        />
        <Card style={{ marginTop: 8 }}>
          <div className="pp-strong" style={{ fontSize: 14, marginBottom: 10 }}>Household type</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            {(['student', 'single', 'family'] as HouseholdType[]).map((type) => {
              const active = householdType === type;
              return (
                <button
                  key={type}
                  onClick={() => onUpdateHouseholdType(type)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 'var(--pp-radius-md)',
                    border: `1px solid ${active ? 'var(--pp-pantry-green)' : 'var(--pp-gray-300)'}`,
                    background: active ? 'var(--pp-soft-sage)' : 'var(--pp-white)',
                    color: 'var(--pp-gray-900)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'var(--pp-font)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div className="pp-strong" style={{ fontSize: 14 }}>{householdTypeLabels[type]}</div>
                    <div className="pp-small">{householdTypeDescriptions[type]}</div>
                  </div>
                  {active && <Badge tone="green">Active</Badge>}
                </button>
              );
            })}
          </div>
        </Card>
        <Card style={{ marginTop: 8, padding: 0 }}>
          {visibleHousehold.map((m, i) => (
            <div
              key={m.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                borderTop: i === 0 ? 'none' : '1px solid var(--pp-gray-100)',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--pp-radius-full)',
                background: m.color, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>{m.emoji}</div>
              <div style={{ flex: 1 }}>
                <div className="pp-strong">{m.name}</div>
                <div className="pp-small">{m.role === 'owner' ? 'Owner' : 'Member'}</div>
              </div>
              {(localHouseholdEditing || householdInviteAvailable) && m.role !== 'owner' && (
                <button
                  onClick={() => setConfirmHouseholdAction({ type: 'removeMember', memberId: m.id, memberName: m.name })}
                  aria-label="Remove"
                  style={iconBtn}
                  disabled={removingMemberId === m.id}
                >
                  {removingMemberId === m.id ? (
                    <Loader2 size={16} color="var(--pp-gray-500)" className="pp-spin" />
                  ) : (
                    <Trash2 size={16} color="var(--pp-gray-500)" />
                  )}
                </button>
              )}
            </div>
          ))}
          {localHouseholdEditing ? (
          <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--pp-gray-100)' }}>
            <input
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addMember()}
              placeholder="Invite by name…"
              style={{
                flex: 1, padding: '10px 14px',
                border: '1px solid var(--pp-gray-300)',
                borderRadius: 'var(--pp-radius-md)',
                background: 'var(--pp-white)', color: 'var(--pp-gray-900)',
                fontSize: 14, fontFamily: 'var(--pp-font)', outline: 'none',
              }}
            />
            <button
              onClick={addMember}
              aria-label="Add member"
              style={{
                width: 40, height: 40, borderRadius: 'var(--pp-radius-md)',
                background: 'var(--pp-pantry-green)', color: 'white',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            ><Plus size={18} /></button>
          </div>
          ) : (
            <div className="pp-small" style={{ padding: 12, borderTop: '1px solid var(--pp-gray-100)' }}>
              Household members are managed with secure invite links.
            </div>
          )}
        </Card>
        {isSignedIn && (
        <Card
          onClick={householdInviteAvailable ? shareInviteLink : undefined}
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: householdInviteAvailable ? 'pointer' : 'default',
          }}
        >
          <Share2 size={18} color={householdInviteAvailable ? 'var(--pp-pantry-green)' : 'var(--pp-gray-500)'} />
          <div style={{ flex: 1 }}>
            <div className="pp-strong" style={{ fontSize: 14 }}>Share invite link</div>
            <div className="pp-small">
              {householdInviteAvailable
                ? sharingInvite ? 'Creating secure invite...' : 'Creates a secure one-use household link'
                : 'Only the household owner can create invite links'}
            </div>
          </div>
          {householdInviteAvailable && sharingInvite ? (
            <Loader2 size={16} color="var(--pp-gray-500)" className="pp-spin" />
          ) : householdInviteAvailable ? (
            <ChevronRight size={16} color="var(--pp-gray-500)" />
          ) : (
            <Badge tone="neutral">Owner only</Badge>
          )}
        </Card>
        )}
        {householdInviteAvailable && (activeInvites.length > 0 || loadingInvites) && (
          <Card style={{ marginTop: 8, padding: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              borderBottom: activeInvites.length > 0 ? '1px solid var(--pp-gray-100)' : 'none',
            }}>
              <div style={{ flex: 1 }}>
                <div className="pp-strong" style={{ fontSize: 14 }}>Pending invites</div>
                <div className="pp-small">
                  {loadingInvites ? 'Checking invite links...' : `${activeInvites.length} active invite${activeInvites.length === 1 ? '' : 's'}`}
                </div>
              </div>
              {loadingInvites && <Loader2 size={16} color="var(--pp-gray-500)" className="pp-spin" />}
            </div>
            {activeInvites.map((invite, i) => (
              <div
                key={invite.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--pp-gray-100)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div className="pp-strong" style={{ fontSize: 13 }}>Invite ending {inviteTokenSuffix(invite.token)}</div>
                  <div className="pp-small">Expires {formatInviteExpiry(invite.expiresAt)}</div>
                </div>
                <button
                  onClick={() => copyExistingInvite(invite)}
                  disabled={copyingInviteId === invite.id}
                  style={{
                    ...textBtn,
                    marginTop: 0,
                    flexShrink: 0,
                  }}
                >
                  {copyingInviteId === invite.id ? 'Copying...' : 'Copy'}
                </button>
                <button
                  onClick={() => setConfirmHouseholdAction({
                    type: 'revokeInvite',
                    inviteId: invite.id,
                    tokenSuffix: inviteTokenSuffix(invite.token),
                  })}
                  disabled={revokingInviteId === invite.id}
                  style={{
                    ...textBtn,
                    marginTop: 0,
                    color: 'var(--pp-tomato-red)',
                    flexShrink: 0,
                  }}
                >
                  {revokingInviteId === invite.id ? 'Revoking...' : 'Revoke'}
                </button>
              </div>
            ))}
          </Card>
        )}
        {householdLeaveAvailable && (
          <Card
            onClick={() => {
              if (!leavingHousehold) setConfirmHouseholdAction({ type: 'leaveHousehold' });
            }}
            style={{
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: leavingHousehold ? 'default' : 'pointer',
              borderColor: 'var(--pp-gray-300)',
            }}
          >
            <LogOut size={18} color="var(--pp-tomato-red)" />
            <div style={{ flex: 1 }}>
              <div className="pp-strong" style={{ fontSize: 14 }}>Leave household</div>
              <div className="pp-small">
                {leavingHousehold ? 'Leaving household...' : 'Return to your personal pantry and settings'}
              </div>
            </div>
            {leavingHousehold ? (
              <Loader2 size={16} color="var(--pp-gray-500)" className="pp-spin" />
            ) : (
              <ChevronRight size={16} color="var(--pp-gray-500)" />
            )}
          </Card>
        )}
      </div>

      {/* Diet preferences */}
      <div>
        <SectionHeader title="Dietary preferences" />
        <Card style={{ marginTop: 8 }}>
          <div className="pp-small" style={{ marginBottom: 10 }}>
            <Salad size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Filter recipes to match your diet.
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {dietOptions.map((d) => {
              const active = dietPrefs.diets.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggleDiet(d)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--pp-radius-full)',
                    border: `1px solid ${active ? 'var(--pp-pantry-green)' : 'var(--pp-gray-300)'}`,
                    background: active ? 'var(--pp-pantry-green)' : 'var(--pp-white)',
                    color: active ? 'white' : 'var(--pp-gray-700)',
                    fontSize: 13, fontWeight: 600,
                    fontFamily: 'var(--pp-font)', cursor: 'pointer',
                  }}
                >
                  {dietLabels[d]}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div className="pp-strong" style={{ fontSize: 14 }}>Daily calorie goal</div>
              <div className="pp-small">{dietPrefs.dailyCalorieGoal} kcal</div>
            </div>
            <input
              type="range" min={1200} max={3500} step={50}
              value={dietPrefs.dailyCalorieGoal}
              onChange={(e) => onUpdateDietPrefs({ ...dietPrefs, dailyCalorieGoal: parseInt(e.target.value) })}
              style={{ flex: 1 }}
            />
          </div>
          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span className="pp-strong" style={{ fontSize: 14 }}>Allergies</span>
              <input
                value={dietPrefs.allergies.join(', ')}
                onChange={(event) => updatePreferenceList('allergies', event.target.value)}
                placeholder="peanuts, shellfish"
                style={textInput}
              />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span className="pp-strong" style={{ fontSize: 14 }}>Disliked ingredients</span>
              <input
                value={dietPrefs.dislikedIngredients.join(', ')}
                onChange={(event) => updatePreferenceList('dislikedIngredients', event.target.value)}
                placeholder="mushrooms, cilantro"
                style={textInput}
              />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span className="pp-strong" style={{ fontSize: 14 }}>Cook time</span>
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={dietPrefs.preferredCookTime}
                  onChange={(event) => onUpdateDietPrefs({ ...dietPrefs, preferredCookTime: parseInt(event.target.value, 10) || 30 })}
                  style={textInput}
                />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span className="pp-strong" style={{ fontSize: 14 }}>Servings</span>
                <input
                  type="number"
                  min={1}
                  value={dietPrefs.servingSize}
                  onChange={(event) => onUpdateDietPrefs({ ...dietPrefs, servingSize: parseInt(event.target.value, 10) || 2 })}
                  style={textInput}
                />
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span className="pp-strong" style={{ fontSize: 14 }}>Budget</span>
                <select
                  value={dietPrefs.budgetLevel}
                  onChange={(event) => onUpdateDietPrefs({ ...dietPrefs, budgetLevel: event.target.value as DietPreferences['budgetLevel'] })}
                  style={textInput}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="flexible">Flexible</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span className="pp-strong" style={{ fontSize: 14 }}>Skill</span>
                <select
                  value={dietPrefs.cookingSkill}
                  onChange={(event) => onUpdateDietPrefs({ ...dietPrefs, cookingSkill: event.target.value as DietPreferences['cookingSkill'] })}
                  style={textInput}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
            </div>
          </div>
        </Card>
      </div>

      {/* Reminders */}
      <div>
        <SectionHeader title="Reminders" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <ToggleRow
            icon={<Bell size={18} />}
            label="Expiration reminders"
            sub="Nudge me before food expires."
            value={reminderPrefs.expiration}
            onChange={(v) => updateReminder('expiration', v)}
          />
          <ToggleRow
            icon={<Bell size={18} />}
            label="Low-stock reminders"
            sub="Tell me when essentials are running out."
            value={reminderPrefs.lowStock}
            onChange={(v) => updateReminder('lowStock', v)}
          />
          <ToggleRow
            icon={<Bell size={18} />}
            label="Meal prep reminders"
            sub="Notify me when it's time to prep."
            value={reminderPrefs.mealPrep}
            onChange={(v) => updateReminder('mealPrep', v)}
          />
        </div>
      </div>

      {/* Data */}
      <div>
        <SectionHeader title="Data" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <Card style={{ padding: '14px 16px' }}>
            <div className="pp-strong" style={{ marginBottom: 4 }}>Export your data</div>
            <div className="pp-small" style={{ marginBottom: 12 }}>
              Download a backup of your pantry, groceries, and history
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleExportJSON} style={primaryBtn}>
                <FileJson size={16} /> Export JSON
              </button>
              <button onClick={handleExportCSV} style={secondaryBtn}>
                <FileSpreadsheet size={16} /> Export CSV
              </button>
            </div>
          </Card>

          <Card style={{ padding: '14px 16px' }}>
            <div className="pp-strong" style={{ marginBottom: 4 }}>Import from backup</div>
            <div className="pp-small" style={{ marginBottom: 12 }}>
              Restore data from a previous JSON export
            </div>
            <input
              ref={fileInputRef} type="file" accept=".json"
              onChange={handleImport} style={{ display: 'none' }} id="import-file"
            />
            <label htmlFor="import-file" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 14px', background: 'var(--pp-white)',
              color: 'var(--pp-gray-900)',
              border: '1px solid var(--pp-gray-300)',
              borderRadius: 'var(--pp-radius-md)',
              cursor: 'pointer', fontFamily: 'var(--pp-font)',
              fontSize: 14, fontWeight: 600,
            }}>
              <Upload size={16} /> Choose File to Import
            </label>
          </Card>

          <Card style={{ padding: '14px 16px' }}>
            <div className="pp-strong" style={{ marginBottom: 8 }}>Privacy & support</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {launchInfoItems.map((item) => (
                <div key={item.title}>
                  <div className="pp-strong" style={{ fontSize: 13 }}>{item.title}</div>
                  <div className="pp-small">{item.detail}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Button variant="secondary" size="lg" fullWidth onClick={onLogout}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--pp-tomato-red)' }}>
          <LogOut size={18} /> Log out
        </span>
      </Button>

      <div className="pp-small" style={{ textAlign: 'center' }}>PantryPal v2.0 · Made with 🥦</div>
      <Modal open={Boolean(pendingImport)} onClose={() => setPendingImport(null)}>
        <div>
          <div className="pp-card-title">Import backup?</div>
          <div className="pp-small" style={{ marginTop: 4 }}>
            This will replace your current pantry data{importSummary?.includesSettings ? ' and app settings' : ''}.
          </div>
        </div>
        {importSummary && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <ImportStat label="Pantry items" value={importSummary.pantryCount} />
            <ImportStat label="Groceries" value={importSummary.groceryCount} />
            <ImportStat label="History" value={importSummary.historyCount} />
            <ImportStat label="Custom recipes" value={importSummary.userMealCount} />
          </div>
        )}
        {importSummary && (
          <div className="pp-small">
            Backup v{importSummary.version} · Exported {importSummary.exportedAt}
            {importSummary.includesSettings ? ' · Includes settings' : ' · Data only'}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" fullWidth onClick={() => setPendingImport(null)}>Cancel</Button>
          <Button variant="primary" fullWidth onClick={confirmImport}>Import</Button>
        </div>
      </Modal>
      <Modal open={Boolean(confirmHouseholdAction)} onClose={() => setConfirmHouseholdAction(null)}>
        {confirmHouseholdAction && (
          <>
            <div>
              <div className="pp-card-title">{householdActionConfirmation(confirmHouseholdAction).title}</div>
              <div className="pp-small" style={{ marginTop: 4 }}>
                {householdActionConfirmation(confirmHouseholdAction).detail}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" fullWidth onClick={() => setConfirmHouseholdAction(null)}>
                Cancel
              </Button>
              <Button variant="primary" fullWidth onClick={confirmPendingHouseholdAction}>
                {householdActionConfirmation(confirmHouseholdAction).confirmLabel}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </ScreenScroll>
  );
}

function ImportStat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        border: '1px solid var(--pp-gray-300)',
        borderRadius: 'var(--pp-radius-md)',
        padding: 10,
        background: 'var(--pp-gray-100)',
      }}
    >
      <div className="pp-strong">{value}</div>
      <div className="pp-small">{label}</div>
    </div>
  );
}

function SyncIcon({ tone }: { tone: 'neutral' | 'green' | 'red' | 'yellow' | 'blue' | 'brown' }) {
  if (tone === 'neutral') return <CloudOff size={18} />;
  if (tone === 'green') return <CheckCircle2 size={18} />;
  if (tone === 'red') return <AlertCircle size={18} />;
  if (tone === 'yellow') return <Loader2 size={18} />;
  return <Cloud size={18} />;
}

function syncToneColor(tone: 'neutral' | 'green' | 'red' | 'yellow' | 'blue' | 'brown') {
  if (tone === 'green') return 'var(--pp-pantry-green)';
  if (tone === 'red') return 'var(--pp-red-text)';
  if (tone === 'yellow') return 'var(--pp-yellow-text)';
  if (tone === 'blue') return 'var(--pp-blue-text)';
  if (tone === 'brown') return 'var(--pp-brown-text)';
  return 'var(--pp-gray-600)';
}

function syncPhaseTone(phase: 'syncing' | 'synced' | 'error') {
  if (phase === 'synced') return 'green';
  if (phase === 'error') return 'red';
  return 'yellow';
}

function syncPhaseLabel(phase: 'syncing' | 'synced' | 'error') {
  if (phase === 'synced') return 'Synced';
  if (phase === 'error') return 'Failed';
  return 'Syncing';
}

function formatInviteExpiry(expiresAt: string) {
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return 'soon';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const iconBtn = {
  width: 32, height: 32, borderRadius: 'var(--pp-radius-full)',
  background: 'transparent', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
} as const;

const textBtn = {
  marginTop: 6,
  padding: 0,
  border: 'none',
  background: 'transparent',
  color: 'var(--pp-pantry-green)',
  cursor: 'pointer',
  fontFamily: 'var(--pp-font)',
  fontSize: 12,
  fontWeight: 700,
} as const;

const syncBtn = {
  width: 36, height: 36, borderRadius: 'var(--pp-radius-full)',
  background: 'var(--pp-gray-100)', color: 'var(--pp-pantry-green)',
  border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
} as const;

const primaryBtn = {
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '10px 14px', background: 'var(--pp-pantry-green)', color: 'white',
  border: 'none', borderRadius: 'var(--pp-radius-md)', cursor: 'pointer',
  fontFamily: 'var(--pp-font)', fontSize: 14, fontWeight: 600,
} as const;

const secondaryBtn = {
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '10px 14px', background: 'var(--pp-white)', color: 'var(--pp-pantry-green)',
  border: '1px solid var(--pp-pantry-green)', borderRadius: 'var(--pp-radius-md)',
  cursor: 'pointer', fontFamily: 'var(--pp-font)', fontSize: 14, fontWeight: 600,
} as const;

const textInput = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid var(--pp-gray-300)',
  borderRadius: 'var(--pp-radius-md)',
  background: 'var(--pp-white)',
  color: 'var(--pp-gray-900)',
  fontSize: 15,
  fontFamily: 'var(--pp-font)',
  outline: 'none',
  boxSizing: 'border-box',
} as const;

function ToggleRow({
  icon, label, sub, value, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: 14, background: 'var(--pp-white)',
      border: '1px solid var(--pp-gray-300)',
      borderRadius: 'var(--pp-radius-lg)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 'var(--pp-radius-full)',
        background: 'var(--pp-soft-sage)', color: 'var(--pp-pantry-green)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div className="pp-strong">{label}</div>
        <div className="pp-small">{sub}</div>
      </div>
      <button
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        style={{
          width: 48, height: 28,
          borderRadius: 'var(--pp-radius-full)',
          background: value ? 'var(--pp-pantry-green)' : 'var(--pp-gray-300)',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'background 0.15s',
          flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: value ? 23 : 3,
          width: 22, height: 22, borderRadius: '50%',
          background: 'white',
          transition: 'left 0.15s',
          boxShadow: 'var(--pp-shadow-toggle)',
        }} />
      </button>
    </div>
  );
}
