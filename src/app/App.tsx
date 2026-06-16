import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { PhoneFrame } from './components/PhoneFrame';
import { TopBar } from './components/TopBar';
import { BottomNav, Tab } from './components/BottomNav';
import { useAppActions } from './hooks/useAppActions';
import { useAppState } from './hooks/useAppState';
import { activeTabForRoute, Route, titleForTab } from './navigation';
import { AuthProvider, useAuth } from '../lib/auth';
import { haptic } from './utils/haptic';
import { resolveProfile } from './profile';
import { reminderPreferencesFromOnboarding } from './reminderPreferences';
import { syncHouseholdOwnerToProfile } from './profileHousehold';
import { readHouseholdInviteToken, removeHouseholdInviteParams } from './householdInvite';
import {
  acceptHouseholdInvite,
  createSupabaseHouseholdCloudStore,
  emitHouseholdMembershipChanged,
  HOUSEHOLD_MEMBERSHIP_CHANGED_EVENT,
  mapHouseholdMembers,
  type HouseholdMembershipRole,
} from './householdCloud';
import { supabase } from '../lib/supabase';
import { emitCloudSyncNow } from './cloudSyncStatus';

const Welcome = lazy(() => import('./screens/Welcome').then((m) => ({ default: m.Welcome })));
const SignIn = lazy(() => import('./screens/SignIn').then((m) => ({ default: m.SignIn })));
const SignUp = lazy(() => import('./screens/SignUp').then((m) => ({ default: m.SignUp })));
const ForgotPassword = lazy(() => import('./screens/ForgotPassword').then((m) => ({ default: m.ForgotPassword })));
const Onboarding = lazy(() => import('./screens/Onboarding').then((m) => ({ default: m.Onboarding })));
const Home = lazy(() => import('./screens/Home').then((m) => ({ default: m.Home })));
const Pantry = lazy(() => import('./screens/Pantry').then((m) => ({ default: m.Pantry })));
const AddFood = lazy(() => import('./screens/AddFood').then((m) => ({ default: m.AddFood })));
const GroceryList = lazy(() => import('./screens/GroceryList').then((m) => ({ default: m.GroceryList })));
const Meals = lazy(() => import('./screens/Meals').then((m) => ({ default: m.Meals })));
const ItemDetail = lazy(() => import('./screens/ItemDetail').then((m) => ({ default: m.ItemDetail })));
const SaveSuccess = lazy(() => import('./screens/States').then((m) => ({ default: m.SaveSuccess })));
const BoughtSuccess = lazy(() => import('./screens/States').then((m) => ({ default: m.BoughtSuccess })));
const EmptyPantry = lazy(() => import('./screens/States').then((m) => ({ default: m.EmptyPantry })));
const ErrorState = lazy(() => import('./screens/States').then((m) => ({ default: m.ErrorState })));
const SettingsScreen = lazy(() => import('./screens/Settings').then((m) => ({ default: m.Settings })));
const Plans = lazy(() => import('./screens/Plans').then((m) => ({ default: m.Plans })));
const RecipeDetail = lazy(() => import('./screens/RecipeDetail').then((m) => ({ default: m.RecipeDetail })));
const Insights = lazy(() => import('./screens/Insights').then((m) => ({ default: m.Insights })));
const MealPlanner = lazy(() => import('./screens/MealPlanner').then((m) => ({ default: m.MealPlanner })));
const Cookbook = lazy(() => import('./screens/Cookbook').then((m) => ({ default: m.Cookbook })));
const AIChef = lazy(() => import('./screens/AIChef').then((m) => ({ default: m.AIChef })));
const AddRecipe = lazy(() => import('./screens/AddRecipe').then((m) => ({ default: m.AddRecipe })));

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

function AppInner() {
  const { mode, user, signOut, continueAsGuest } = useAuth();
  const [route, setRoute] = useState<Route>({ name: 'welcome' });
  const [membershipRole, setMembershipRole] = useState<HouseholdMembershipRole | null>(null);
  const [householdJoinNotice, setHouseholdJoinNotice] = useState(false);
  const promptedInviteTokenRef = useRef<string | null>(null);
  const acceptingInviteTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (mode === 'authenticated') {
      setRoute((r) =>
        r.name === 'welcome' || r.name === 'signIn' || r.name === 'signUp' || r.name === 'forgotPassword'
          ? { name: 'tab', tab: 'home' }
          : r,
      );
    } else if (mode === 'unauthenticated') {
      setRoute((r) =>
        r.name === 'tab' || r.name === 'itemDetail' || r.name === 'editItem' || r.name === 'settings' || r.name === 'onboarding'
          ? { name: 'welcome' }
          : r,
      );
    }
  }, [mode]);
  const {
    pantry,
    setPantry,
    groceries,
    setGroceries,
    purchaseHistory,
    setPurchaseHistory,
    favorites,
    setFavorites,
    cookHistory,
    setCookHistory,
    mealPlan,
    setMealPlan,
    household,
    setHousehold,
    householdType,
    setHouseholdType,
    dietPrefs,
    setDietPrefs,
    theme,
    setTheme,
    largeText,
    setLargeText,
    highContrast,
    setHighContrast,
    haptics,
    setHaptics,
    notifsEnabled,
    setNotifsEnabled,
    reminderPrefs,
    setReminderPrefs,
    userMeals,
    setUserMeals,
    barcodeMappings,
    setBarcodeMappings,
    mealsData,
  } = useAppState();
  const profile = resolveProfile({ mode, user, household, membershipRole });

  useEffect(() => {
    if (mode !== 'authenticated' || !user) {
      setMembershipRole(null);
      return;
    }

    let cancelled = false;
    const store = createSupabaseHouseholdCloudStore(supabase);
    const refreshMembership = () => {
      store.getMembership(user.id)
        .then((membership) => {
          if (cancelled) return;
          setMembershipRole(membership?.role ?? null);
          if (!membership) {
            setHousehold([]);
            return;
          }
          store.listMembers(membership.householdId)
            .then((members) => {
              if (!cancelled && members.length > 0) setHousehold(mapHouseholdMembers(members));
            })
            .catch(() => {
              // Keep local household data if member list sync is unavailable.
            });
        })
        .catch(() => {
          if (!cancelled) setMembershipRole(null);
        });
    };

    refreshMembership();
    window.addEventListener(HOUSEHOLD_MEMBERSHIP_CHANGED_EVENT, refreshMembership);

    return () => {
      cancelled = true;
      window.removeEventListener(HOUSEHOLD_MEMBERSHIP_CHANGED_EVENT, refreshMembership);
    };
  }, [mode, user?.id]);

  useEffect(() => {
    if (mode !== 'authenticated') return;
    setHousehold((current) => syncHouseholdOwnerToProfile(profile, current));
  }, [mode, profile.name, profile.roleLabel, setHousehold]);

  useEffect(() => {
    const token = readHouseholdInviteToken(window.location.href);
    if (!token) return;

    if (mode !== 'authenticated' || !user) {
      if (promptedInviteTokenRef.current !== token) {
        promptedInviteTokenRef.current = token;
        toast('Sign in to join this household');
      }
      setRoute({ name: 'signIn' });
      return;
    }

    if (acceptingInviteTokenRef.current === token) return;
    acceptingInviteTokenRef.current = token;

    const store = createSupabaseHouseholdCloudStore(supabase);
    acceptHouseholdInvite(store, token, profile.name)
      .then((membership) => {
        setMembershipRole(membership.role);
        setHouseholdJoinNotice(true);
        window.history.replaceState({}, document.title, removeHouseholdInviteParams(window.location.href));
        emitHouseholdMembershipChanged();
        emitCloudSyncNow();
        toast.success('Joined household');
        setRoute({ name: 'settings' });
      })
      .catch(() => {
        window.history.replaceState({}, document.title, removeHouseholdInviteParams(window.location.href));
        toast.error('Invite link is invalid or expired');
      })
      .finally(() => {
        acceptingInviteTokenRef.current = null;
      });
  }, [mode, user, profile.name]);

  function go(r: Route) { setRoute(r); if (haptics) haptic('tap'); }
  function goTab(tab: Tab) { setRoute({ name: 'tab', tab }); if (haptics) haptic('tap'); }

  const {
    addPantryItem,
    updatePantryItem,
    deletePantryItem,
    markPantryUsed,
    markManyUsed,
    bulkDelete,
    bulkMove,
    toggleGrocery,
    deleteGrocery,
    addGrocery,
    moveBoughtToPantry,
    addMissingToList,
    addManyMealsToGrocery,
    toggleFavorite,
    recordCook,
    addToPlan,
  } = useAppActions({
    pantry,
    groceries,
    purchaseHistory,
    mealsData,
    mealPlan,
    favorites,
    haptics,
    setPantry,
    setGroceries,
    setPurchaseHistory,
    setFavorites,
    setCookHistory,
    setMealPlan,
    go,
    goTab,
  });
  let inner: React.ReactNode = null;
  let chrome = true;
  let title = '';
  let showBack = false;
  let backTo: Route = { name: 'tab', tab: 'home' };

  if (route.name === 'welcome') {
    chrome = false;
    inner = (
      <Welcome
        onCreateAccount={() => go({ name: 'signUp' })}
        onLogIn={() => go({ name: 'signIn' })}
        onGuest={() => { continueAsGuest(); goTab('home'); }}
      />
    );
  } else if (route.name === 'signIn') {
    chrome = false;
    inner = (
      <SignIn
        onSuccess={() => goTab('home')}
        onSignUp={() => go({ name: 'signUp' })}
        onForgot={() => go({ name: 'forgotPassword' })}
        onBack={() => go({ name: 'welcome' })}
      />
    );
  } else if (route.name === 'signUp') {
    chrome = false;
    inner = (
      <SignUp
        onSuccess={() => go({ name: 'onboarding' })}
        onSignIn={() => go({ name: 'signIn' })}
        onBack={() => go({ name: 'welcome' })}
      />
    );
  } else if (route.name === 'forgotPassword') {
    chrome = false;
    inner = (
      <ForgotPassword
        onDone={() => go({ name: 'signIn' })}
        onBack={() => go({ name: 'signIn' })}
      />
    );
  } else if (route.name === 'onboarding') {
    chrome = false;
    inner = (
      <Onboarding
        onDone={(_household, reminders) => {
          setHouseholdType(_household);
          setReminderPrefs(reminderPreferencesFromOnboarding(reminders));
          goTab('home');
        }}
        onSkip={() => goTab('home')}
      />
    );
  } else if (route.name === 'tab') {
    title = titleForTab(route.tab);
    const t = route.tab;
    if (t === 'home') {
      inner = (
        <Home
          pantry={pantry}
          meals={mealsData}
          onOpenMeals={() => goTab('meals')}
          onOpenPantry={() => goTab('pantry')}
          onOpenGrocery={() => goTab('list')}
          onOpenItem={(id) => go({ name: 'itemDetail', id })}
          onOpenInsights={() => go({ name: 'insights' })}
          onOpenPlanner={() => go({ name: 'planner' })}
          onOpenCookbook={() => go({ name: 'cookbook' })}
          onOpenAIChef={() => go({ name: 'aiChef' })}
          onOpenRecipe={(mealId) => go({ name: 'recipeDetail', mealId })}
          mealPlan={mealPlan}
          profile={profile}
        />
      );
    } else if (t === 'pantry') {
      inner = pantry.length === 0
        ? <EmptyPantry onAdd={() => goTab('add')} />
        : <Pantry
            pantry={pantry}
            onOpenItem={(id) => go({ name: 'itemDetail', id })}
            onOpenAdd={() => goTab('add')}
            onBulkDelete={bulkDelete}
            onBulkMarkUsed={markManyUsed}
            onBulkMove={bulkMove}
          />;
    } else if (t === 'add') {
      showBack = true;
      inner = (
        <AddFood
          onCancel={() => goTab('home')}
          onSave={addPantryItem}
          onError={() => go({ name: 'errorSave' })}
          purchaseHistory={purchaseHistory}
          barcodeMappings={barcodeMappings}
          onSaveBarcodeMapping={(mapping) => {
            setBarcodeMappings((current) => ({ ...current, [mapping.barcode]: mapping }));
          }}
        />
      );
    } else if (t === 'list') {
      inner = (
        <GroceryList
          groceries={groceries}
          history={purchaseHistory}
          household={household}
          onToggle={toggleGrocery}
          onDelete={deleteGrocery}
          onAdd={addGrocery}
          onMoveBoughtToPantry={moveBoughtToPantry}
        />
      );
    } else if (t === 'meals') {
      inner = (
        <Meals
          meals={mealsData}
          pantry={pantry}
          favorites={favorites}
          preferredDiets={dietPrefs.diets}
          onToggleFavorite={toggleFavorite}
          onAddMissingToList={addMissingToList}
          onMarkUsed={markManyUsed}
          onOpenRecipe={(mealId) => go({ name: 'recipeDetail', mealId })}
          onAddToPlan={addToPlan}
          onOpenAddRecipe={() => go({ name: 'addRecipe' })}
        />
      );
    }
  } else if (route.name === 'addRecipe') {
    title = 'New Recipe';
    showBack = true;
    backTo = { name: 'tab', tab: 'meals' };
    inner = (
      <AddRecipe
        onCancel={() => goTab('meals')}
        onSave={(meal) => {
          setUserMeals((u) => [meal, ...u]);
          toast.success(`${meal.name} saved to your cookbook`);
          go({ name: 'recipeDetail', mealId: meal.id });
        }}
      />
    );
  } else if (route.name === 'itemDetail') {
    const item = pantry.find((p) => p.id === route.id);
    title = 'Item Detail';
    showBack = true;
    backTo = { name: 'tab', tab: 'pantry' };
    if (!item) {
      inner = <EmptyPantry onAdd={() => goTab('add')} />;
    } else {
      inner = (
        <ItemDetail
          item={item}
          onMarkUsed={() => { markPantryUsed(item.id); goTab('pantry'); }}
          onEdit={() => go({ name: 'editItem', id: item.id })}
          onDelete={() => deletePantryItem(item.id)}
          onFindMeals={() => goTab('meals')}
        />
      );
    }
  } else if (route.name === 'editItem') {
    const item = pantry.find((p) => p.id === route.id);
    title = 'Edit Item';
    showBack = true;
    backTo = { name: 'itemDetail', id: route.id };
    if (!item) {
      inner = <EmptyPantry onAdd={() => goTab('add')} />;
    } else {
      inner = (
        <AddFood
          initial={item}
          mode="edit"
          onCancel={() => go({ name: 'itemDetail', id: item.id })}
          onSave={updatePantryItem}
          onError={() => go({ name: 'errorSave' })}
          purchaseHistory={purchaseHistory}
        />
      );
    }
  } else if (route.name === 'saveSuccess') {
    chrome = false;
    inner = (
      <>
        <TopBar title="Item Saved" />
        <SaveSuccess onViewPantry={() => goTab('pantry')} onAddAnother={() => goTab('add')} />
        <BottomNav active={'pantry'} onChange={goTab} />
      </>
    );
  } else if (route.name === 'boughtSuccess') {
    chrome = false;
    inner = (
      <>
        <TopBar title="Pantry Updated" />
        <BoughtSuccess onViewPantry={() => goTab('pantry')} onBack={() => goTab('list')} />
        <BottomNav active={'pantry'} onChange={goTab} />
      </>
    );
  } else if (route.name === 'settings') {
    title = 'Settings';
    showBack = true;
    backTo = { name: 'tab', tab: 'home' };
    inner = (
      <SettingsScreen
        onLogout={async () => { await signOut(); go({ name: 'welcome' }); }}
        pantry={pantry}
        groceries={groceries}
        purchaseHistory={purchaseHistory}
        userMeals={userMeals}
        household={household}
        householdType={householdType}
        dietPrefs={dietPrefs}
        theme={theme}
        largeText={largeText}
        highContrast={highContrast}
        haptics={haptics}
        notifsEnabled={notifsEnabled}
        profile={profile}
        reminderPrefs={reminderPrefs}
        barcodeMappings={barcodeMappings}
        onOpenPlans={() => go({ name: 'plans' })}
        onImport={(data) => {
          setPantry(data.pantry);
          setGroceries(data.groceries);
          setPurchaseHistory(data.purchaseHistory);
          setUserMeals(data.userMeals);
          if (data.settings) {
            setHouseholdType(data.settings.householdType);
            setDietPrefs(data.settings.dietPrefs);
            setTheme(data.settings.theme);
            setLargeText(data.settings.largeText);
            setHighContrast(data.settings.highContrast);
            setHaptics(data.settings.haptics);
            setNotifsEnabled(data.settings.notifsEnabled);
            setReminderPrefs(data.settings.reminderPrefs);
          }
        }}
        onUpdateHousehold={setHousehold}
        onUpdateHouseholdType={setHouseholdType}
        onUpdateDietPrefs={setDietPrefs}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        onToggleLargeText={setLargeText}
        onToggleHighContrast={setHighContrast}
        onToggleHaptics={setHaptics}
        onToggleNotifs={setNotifsEnabled}
        onUpdateReminderPrefs={setReminderPrefs}
        onUpdateBarcodeMappings={setBarcodeMappings}
        householdJoinNotice={householdJoinNotice}
        onDismissHouseholdJoinNotice={() => setHouseholdJoinNotice(false)}
      />
    );
  } else if (route.name === 'plans') {
    title = 'Plans';
    showBack = true;
    backTo = { name: 'settings' };
    inner = <Plans onBack={() => go({ name: 'settings' })} />;
  } else if (route.name === 'errorSave') {
    chrome = false;
    inner = (
      <>
        <TopBar title="Error" />
        <ErrorState onRetry={() => goTab('add')} onCancel={() => goTab('home')} />
        <BottomNav active={'add'} onChange={goTab} />
      </>
    );
  } else if (route.name === 'recipeDetail') {
    const meal = mealsData.find((m) => m.id === route.mealId);
    title = meal?.name ?? 'Recipe';
    showBack = true;
    backTo = { name: 'tab', tab: 'meals' };
    if (!meal) {
      inner = <div>Recipe not found</div>;
    } else {
      inner = (
        <RecipeDetail
          meal={meal}
          isFavorite={favorites.includes(meal.id)}
          onToggleFavorite={() => toggleFavorite(meal.id)}
          onAddMissingToList={() => addMissingToList(meal.id)}
          onAddToPlan={() => addToPlan(meal.id)}
          onMarkUsed={() => { recordCook(meal.id); goTab('meals'); }}
          onBack={() => goTab('meals')}
        />
      );
    }
  } else if (route.name === 'insights') {
    title = 'Insights';
    showBack = true;
    backTo = { name: 'tab', tab: 'home' };
    inner = <Insights pantry={pantry} />;
  } else if (route.name === 'planner') {
    title = 'Meal Plan';
    showBack = true;
    backTo = { name: 'tab', tab: 'home' };
    inner = (
      <MealPlanner
        meals={mealsData}
        plan={mealPlan}
        onSetPlan={setMealPlan}
        onAddIngredientsToList={addManyMealsToGrocery}
        onOpenRecipe={(mealId) => go({ name: 'recipeDetail', mealId })}
        mealPrepRemindersEnabled={reminderPrefs.mealPrep}
      />
    );
  } else if (route.name === 'aiChef') {
    title = 'AI Chef';
    showBack = true;
    backTo = { name: 'tab', tab: 'home' };
    inner = (
      <AIChef
        pantry={pantry}
        meals={mealsData}
        dietPrefs={dietPrefs}
        history={cookHistory}
        onOpenRecipe={(mealId) => go({ name: 'recipeDetail', mealId })}
        onAddToPlan={addToPlan}
        onAddMissingToList={addMissingToList}
      />
    );
  } else if (route.name === 'cookbook') {
    title = 'Cookbook';
    showBack = true;
    backTo = { name: 'tab', tab: 'home' };
    inner = (
      <Cookbook
        meals={mealsData}
        favorites={favorites}
        history={cookHistory}
        onToggleFavorite={toggleFavorite}
        onOpenRecipe={(mealId) => go({ name: 'recipeDetail', mealId })}
      />
    );
  }

  return (
    <PhoneFrame>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'var(--pp-font)',
            background: 'var(--pp-gray-900)',
            color: 'var(--pp-white)',
            border: 'none',
            borderRadius: 'var(--pp-radius-md)',
          },
        }}
      />
      <Suspense fallback={<RouteFallback />}>
        {chrome ? (
          <>
            <TopBar
              title={title}
              showBack={showBack}
              onBack={() => setRoute(backTo)}
              onProfile={() => go({ name: 'settings' })}
            />
            {inner}
            <BottomNav
              active={activeTabForRoute(route)}
              onChange={goTab}
            />
          </>
        ) : (
          inner
        )}
      </Suspense>
    </PhoneFrame>
  );
}

function RouteFallback() {
  return (
    <div
      className="pp-small"
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--pp-warm-cream)',
      }}
    >
      Loading...
    </div>
  );
}
