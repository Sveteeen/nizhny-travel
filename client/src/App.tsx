import "./App.css";
import { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from "react";
import { fetchMe, toPublicUser } from "./api/auth";
import { AccountOverlay } from "./components/account/AccountOverlay";
import { clearStoredUser, readAuthToken, readPublicUser, saveSession } from "./components/account/storage";
import { AlertModal } from "./components/AlertModal";
import { DetailsModal } from "./components/DetailsModal";
import { FiltersBar } from "./components/FiltersBar";
import { Lightbox } from "./components/Lightbox";
import { PlacesOverviewMap } from "./components/maps/PlacesOverviewMap";
import { PlannerPage } from "./components/planner/PlannerPage";
import { PlaceCard } from "./components/PlaceCard";
import { RouteCard } from "./components/RouteCard";
import { useTravelData } from "./hooks/useTravelData";
import type { ViewerState } from "./types";

const DEFAULT_ROUTE_COVER =
  "http://localhost:5000/uploads/places/main/kremlin.png";
const normalizeImageUrl = (value: string) => {
  if (!value) return value;
  if (value.startsWith("http")) return value;
  return `http://localhost:5000${value}`;
};

const formatDuration = (minutes: number | string) => `${Number(minutes)} мин`;
const formatDistance = (distance: number | string) => `${Number(distance)} км`;
const handleImageFallback = (
  event: SyntheticEvent<HTMLImageElement, Event>,
) => {
  event.currentTarget.src = DEFAULT_ROUTE_COVER;
};

function App() {
  const [activeTab, setActiveTab] = useState<
    "places" | "routes" | "map" | "planner"
  >("places");
  const [viewerState, setViewerState] = useState<ViewerState | null>(null);
  const [showFavoritePlacesOnly, setShowFavoritePlacesOnly] = useState(false);
  const [showFavoriteRoutesOnly, setShowFavoriteRoutesOnly] = useState(false);
  const [mapSearch, setMapSearch] = useState("");
  const [showMapFavoritesOnly, setShowMapFavoritesOnly] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountInitialView, setAccountInitialView] = useState<"login" | "register">("login");
  const [pendingPlannerRouteId, setPendingPlannerRouteId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
  } | null>(readPublicUser);

  useEffect(() => {
    const token = readAuthToken();
    if (!token) return;

    let mounted = true;

    fetchMe(token)
      .then((user) => {
        if (!mounted) return;
        const publicUser = toPublicUser(user);
        saveSession({ token, user: publicUser });
        setCurrentUser(publicUser);
      })
      .catch(() => {
        if (!mounted) return;
        clearStoredUser();
        setCurrentUser(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const {
    places,
    routes,
    placeDetails,
    routeDetails,
    loading,
    detailsLoading,
    favoritesLoading,
    favoriteRoutesLoading,
    error,
    notice,
    clearNotice,
    yandexApiKey,
    favoritePlaceIds,
    favoriteRouteIds,
    openPlaceDetails,
    openRouteDetails,
    togglePlaceFavorite,
    toggleRouteFavorite,
    closeDetails,
    categories,
    tags,
    fetchPlaces,
    fetchRoutes,
    loadFavorites,
  } = useTravelData(!!currentUser)

  const placeFiltersRef = useRef<{ search?: string; category?: number[]; tag?: number[] }>({})
  const routeFiltersRef = useRef<{ search?: string; sort?: string }>({})

  const routeSortOptions = useMemo(
    () => [
      { value: "", label: "По умолчанию" },
      { value: "duration_asc", label: "Сначала короткие" },
      { value: "duration_desc", label: "Сначала длинные" },
    ],
    [],
  )

  const applyPlaceFilters = useCallback((patch: Partial<typeof placeFiltersRef.current>) => {
    const prev = placeFiltersRef.current
    placeFiltersRef.current = { ...prev, ...patch }
    fetchPlaces(placeFiltersRef.current)
  }, [fetchPlaces]);

  const applyRouteFilters = useCallback(
    (patch: Partial<typeof routeFiltersRef.current>) => {
      routeFiltersRef.current = { ...routeFiltersRef.current, ...patch }
      const { search, sort } = routeFiltersRef.current
      void fetchRoutes({
        search,
        sort: sort || undefined,
      })
    },
    [fetchRoutes],
  )

  const openViewer = (
    images: { src: string; alt: string }[],
    startIndex: number,
    title: string,
  ) => {
    if (!images.length) return;
    setViewerState({ images, index: startIndex, title });
  };

  const routePhotos = useMemo(() => {
    if (!routeDetails) return [];
    return routeDetails.points
      .filter((point) => point.place?.main_photo)
      .map((point) => ({
        src: normalizeImageUrl(point.place!.main_photo),
        alt: point.place!.name,
      }));
  }, [routeDetails]);

  const placePhotos = useMemo(() => {
    if (!placeDetails) return [];
    return [
      {
        src: normalizeImageUrl(placeDetails.main_photo),
        alt: placeDetails.name,
      },
      ...placeDetails.photos.map((photo) => ({
        src: normalizeImageUrl(photo.photo),
        alt: placeDetails.name,
      })),
    ];
  }, [placeDetails]);

  const visiblePlaces = useMemo(
    () =>
      showFavoritePlacesOnly
        ? places.filter((place) => favoritePlaceIds.has(place.id))
        : places,
    [showFavoritePlacesOnly, places, favoritePlaceIds],
  );

  const visibleRoutes = useMemo(
    () =>
      showFavoriteRoutesOnly
        ? routes.filter((route) => favoriteRouteIds.has(route.id))
        : routes,
    [showFavoriteRoutesOnly, routes, favoriteRouteIds],
  );

  const visibleMapPlaces = useMemo(() => {
    let list = places;
    if (showMapFavoritesOnly) {
      list = list.filter((place) => favoritePlaceIds.has(place.id));
    }
    const query = mapSearch.trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (place) =>
        place.name.toLowerCase().includes(query) ||
        place.address.toLowerCase().includes(query),
    );
  }, [places, showMapFavoritesOnly, favoritePlaceIds, mapSearch]);

  const openAccount = useCallback((view: "login" | "register" = "login") => {
    setAccountInitialView(view);
    setIsAccountOpen(true);
  }, []);

  const handleAccountClose = useCallback(() => setIsAccountOpen(false), []);

  const handleNoticeLogin = useCallback(() => {
    clearNotice();
    openAccount("login");
  }, [clearNotice, openAccount]);

  const handleNoticeRegister = useCallback(() => {
    clearNotice();
    openAccount("register");
  }, [clearNotice, openAccount]);
  const handleAuthSuccess = useCallback(
    (user: { name: string; email: string }) => {
      setCurrentUser(user);
      void loadFavorites();
    },
    [loadFavorites],
  );
  const handleLogout = useCallback(() => setCurrentUser(null), []);
  const handleUpdateProfile = useCallback((user: { name: string; email: string }) => {
    setCurrentUser(user);
  }, []);

  const openFavoritePlaces = useCallback(async () => {
    await loadFavorites();
    setActiveTab("places");
    setShowFavoritePlacesOnly(true);
    setShowFavoriteRoutesOnly(false);
    setIsAccountOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [loadFavorites]);

  const openFavoriteRoutes = useCallback(async () => {
    await loadFavorites();
    setActiveTab("routes");
    setShowFavoriteRoutesOnly(true);
    setShowFavoritePlacesOnly(false);
    setIsAccountOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [loadFavorites]);

  const openPlanner = useCallback(() => {
    setPendingPlannerRouteId(null);
    setActiveTab("planner");
    setIsAccountOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openSavedRouteInPlanner = useCallback((routeId: number) => {
    setPendingPlannerRouteId(routeId);
    setActiveTab("planner");
    setIsAccountOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePendingPlannerRouteHandled = useCallback(() => {
    setPendingPlannerRouteId(null);
  }, []);

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__top">
          <p className="hero__eyebrow">Выбери свой путь знакомства с городом</p>
          <button
            className="profile-button"
            type="button"
            aria-label="Личный кабинет"
            title="Личный кабинет"
            onClick={() => openAccount("login")}
          >
            <span className="profile-button__icon" aria-hidden>
              👤
            </span>
          </button>
        </div>
        <div className="hero__title-row">
          <h1>
            Туристический гид по Нижнему
            <br />
            Новгороду
          </h1>
          <img
            className="hero__coat"
            src="/coat-of-arms.png"
            alt="Герб Нижегородской области"
            width={96}
            height={99}
          />
        </div>
        <p className="hero__description">
          Подборка мест и маршрутов по любым запросам
        </p>
      </header>

      <section className="tabs">
        <button
          className={`tab ${activeTab === "places" ? "tab--active" : ""}`}
          onClick={() => setActiveTab("places")}
        >
          Достопримечательности
        </button>
        <button
          className={`tab ${activeTab === "routes" ? "tab--active" : ""}`}
          onClick={() => setActiveTab("routes")}
        >
          Маршруты
        </button>
        <button
          className={`tab ${activeTab === "planner" ? "tab--active" : ""}`}
          onClick={() => setActiveTab("planner")}
        >
          Планировщик маршрутов
        </button>
        <button
          className={`tab ${activeTab === "map" ? "tab--active" : ""}`}
          onClick={() => setActiveTab("map")}
        >
          Карта
        </button>
      </section>

      {loading && (
        <section className="grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <article className="card card--skeleton" key={`skeleton-${index}`}>
              <div className="skeleton skeleton__image" />
              <div className="card__body">
                <div className="skeleton skeleton__line skeleton__line--short" />
                <div className="skeleton skeleton__line" />
                <div className="skeleton skeleton__line skeleton__line--button" />
              </div>
            </article>
          ))}
        </section>
      )}
      {error && <div className="state state--error">{error}</div>}

      {!loading && !error && activeTab === "places" && (
        <>
          <FiltersBar
            searchPlaceholder="Поиск достопримечательностей"
            searchLabel="Поиск достопримечательностей"
            categoryLabel="Фильтр по категории достопримечательностей"
            tagsLabel="Фильтр по тегам достопримечательностей"
            categories={categories}
            tags={tags}
            onSearchChange={(q) => applyPlaceFilters({ search: q || undefined })}
            onCategoryChange={(ids) =>
              applyPlaceFilters({ category: ids.length ? ids : undefined })
            }
            onTagChange={(ids) =>
              applyPlaceFilters({ tag: ids.length ? ids : undefined })
            }
            extraControl={
              <label
                className="favorite-switch"
                htmlFor="favorites-only-places"
              >
                <span className="favorite-switch__label">Избранное</span>
                <input
                  id="favorites-only-places"
                  className="favorite-switch__input"
                  type="checkbox"
                  checked={showFavoritePlacesOnly}
                  onChange={(event) =>
                    setShowFavoritePlacesOnly(event.target.checked)
                  }
                />
                <span className="favorite-switch__slider" aria-hidden />
              </label>
            }
          />
          {showFavoritePlacesOnly && visiblePlaces.length === 0 && (
            <div className="state">
              Пока нет избранных достопримечательностей.
            </div>
          )}
          <section className="grid">
            {visiblePlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                isFavorite={favoritePlaceIds.has(place.id)}
                isLoading={favoritesLoading === place.id}
                onToggleFavorite={togglePlaceFavorite}
                onOpenDetails={openPlaceDetails}
                normalizeImageUrl={normalizeImageUrl}
              />
            ))}
          </section>
        </>
      )}

      {!loading && !error && activeTab === "routes" && (
        <>
          <FiltersBar
            searchPlaceholder="Поиск маршрутов"
            searchLabel="Поиск маршрутов"
            onSearchChange={(query) =>
              applyRouteFilters({ search: query || undefined })
            }
            sortLabel="Сортировка по длительности"
            sortOptions={routeSortOptions}
            onSortChange={(sort) =>
              applyRouteFilters({ sort: sort || undefined })
            }
            compactSwitch
            extraControl={
              <label className="favorite-switch" htmlFor="favorites-only-routes">
                <span className="favorite-switch__label">Избранное</span>
                <input
                  id="favorites-only-routes"
                  className="favorite-switch__input"
                  type="checkbox"
                  checked={showFavoriteRoutesOnly}
                  onChange={(event) =>
                    setShowFavoriteRoutesOnly(event.target.checked)
                  }
                />
                <span className="favorite-switch__slider" aria-hidden />
              </label>
            }
          />
          {showFavoriteRoutesOnly && visibleRoutes.length === 0 && (
            <div className="state">Пока нет избранных маршрутов.</div>
          )}
          <section className="grid">
            {visibleRoutes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                isFavorite={favoriteRouteIds.has(route.id)}
                isLoading={favoriteRoutesLoading === route.id}
                onToggleFavorite={toggleRouteFavorite}
                onOpenDetails={openRouteDetails}
                normalizeImageUrl={normalizeImageUrl}
                formatDuration={formatDuration}
                formatDistance={formatDistance}
                onImageError={handleImageFallback}
              />
            ))}
          </section>
        </>
      )}

      {!loading && !error && activeTab === "map" && (
        <section className="map-page">
          <div className="map-page__header">
            <h2>Карта всех достопримечательностей</h2>
            <p>
              На карте отображены все точки из базы данных. Нажми на маркер,
              чтобы увидеть название и адрес.
            </p>
          </div>
          <FiltersBar
            searchPlaceholder="Поиск на карте"
            searchLabel="Поиск на карте"
            onSearchChange={setMapSearch}
            compactSwitch
            extraControl={
              <label className="favorite-switch" htmlFor="favorites-only-map">
                <span className="favorite-switch__label">Избранное</span>
                <input
                  id="favorites-only-map"
                  className="favorite-switch__input"
                  type="checkbox"
                  checked={showMapFavoritesOnly}
                  onChange={(event) =>
                    setShowMapFavoritesOnly(event.target.checked)
                  }
                />
                <span className="favorite-switch__slider" aria-hidden />
              </label>
            }
          />
          {showMapFavoritesOnly && visibleMapPlaces.length === 0 && (
            <div className="state">Пока нет избранных мест на карте.</div>
          )}
          {visibleMapPlaces.length > 0 && yandexApiKey && (
            <PlacesOverviewMap
              apiKey={yandexApiKey}
              places={visibleMapPlaces}
              normalizeImageUrl={normalizeImageUrl}
              onOpenDetails={openPlaceDetails}
            />
          )}
          {visibleMapPlaces.length > 0 && !yandexApiKey && (
            <div className="map map--big map--fallback">
              Не настроен ключ Яндекс.Карт
            </div>
          )}
          {!showMapFavoritesOnly &&
            visibleMapPlaces.length === 0 &&
            mapSearch.trim() && (
              <div className="state">Ничего не найдено по вашему запросу.</div>
            )}
        </section>
      )}

      {!loading && !error && activeTab === "planner" && (
        <PlannerPage
          places={places}
          favoritePlaceIds={favoritePlaceIds}
          yandexApiKey={yandexApiKey}
          isAuthenticated={!!currentUser}
          normalizeImageUrl={normalizeImageUrl}
          formatDuration={formatDuration}
          formatDistance={formatDistance}
          pendingSavedRouteId={pendingPlannerRouteId}
          onPendingSavedRouteHandled={handlePendingPlannerRouteHandled}
          onOpenLogin={() => openAccount("login")}
          onOpenPlaceDetails={openPlaceDetails}
        />
      )}

      {(placeDetails || routeDetails) && (
        <DetailsModal
          placeDetails={placeDetails}
          routeDetails={routeDetails}
          detailsLoading={detailsLoading}
          yandexApiKey={yandexApiKey}
          placePhotos={placePhotos}
          routePhotos={routePhotos}
          normalizeImageUrl={normalizeImageUrl}
          formatDuration={formatDuration}
          formatDistance={formatDistance}
          onImageError={handleImageFallback}
          onOpenPlaceDetails={openPlaceDetails}
          onOpenViewer={openViewer}
          onClose={closeDetails}
        />
      )}

      {viewerState && (
        <Lightbox
          viewerState={viewerState}
          onImageError={handleImageFallback}
          onClose={() => setViewerState(null)}
          onPrev={() =>
            setViewerState((prev) =>
              prev
                ? {
                    ...prev,
                    index:
                      prev.index === 0
                        ? prev.images.length - 1
                        : prev.index - 1,
                  }
                : prev,
            )
          }
          onNext={() =>
            setViewerState((prev) =>
              prev
                ? {
                    ...prev,
                    index:
                      prev.index === prev.images.length - 1
                        ? 0
                        : prev.index + 1,
                  }
                : prev,
            )
          }
        />
      )}

      {notice && (
        <AlertModal
          message={notice.message}
          onClose={clearNotice}
          actionLabel={notice.action === "login" ? "Войти" : undefined}
          onAction={notice.action === "login" ? handleNoticeLogin : undefined}
          onRegister={notice.action === "login" ? handleNoticeRegister : undefined}
        />
      )}

      {isAccountOpen && (
        <AccountOverlay
          user={currentUser}
          initialView={accountInitialView}
          onClose={handleAccountClose}
          onAuthSuccess={handleAuthSuccess}
          onLogout={handleLogout}
          onUpdateProfile={handleUpdateProfile}
          onOpenFavoritePlaces={openFavoritePlaces}
          onOpenFavoriteRoutes={openFavoriteRoutes}
          onOpenPlanner={openPlanner}
          onOpenSavedRoute={openSavedRouteInPlanner}
          normalizeImageUrl={normalizeImageUrl}
          onImageError={handleImageFallback}
          formatDuration={formatDuration}
          formatDistance={formatDistance}
        />
      )}
    </div>
  );
}

export default App;
