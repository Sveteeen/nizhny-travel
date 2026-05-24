const ROUTER_API_URL = "https://api.routing.yandex.net/v2/route";
const REQUEST_TIMEOUT_MS = 15000;
// https://yandex.com/maps-api/docs/router-api/request.html — для walking max 25 waypoints
const MAX_WALKING_WAYPOINTS = 25;

const toNumber = (value) => Number(value);

const toDurationMinutes = (seconds) => Math.round(toNumber(seconds) / 60);

const toDistanceKm = (meters) => Number((toNumber(meters) / 1000).toFixed(2));

const pointsEqual = (a, b) =>
  Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;

const appendPolylinePoints = (target, points) => {
  if (!Array.isArray(points)) return;

  points.forEach((point) => {
    if (!Array.isArray(point) || point.length < 2) return;

    const lat = toNumber(point[0]);
    const lon = toNumber(point[1]);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return;

    const nextPoint = [lat, lon];
    const lastPoint = target[target.length - 1];
    if (lastPoint && pointsEqual(lastPoint, nextPoint)) return;

    target.push(nextPoint);
  });
};

const sumLegMetrics = (legs) => {
  let totalDistanceM = 0;
  let totalDurationSec = 0;

  legs.forEach((leg) => {
    if (leg.status && leg.status !== "OK") return;

    (leg.steps || []).forEach((step) => {
      totalDistanceM += toNumber(step.length) || 0;
      totalDurationSec += toNumber(step.duration) || 0;
    });
  });

  return {
    totalDistanceM: Math.round(totalDistanceM),
    totalDurationSec: Math.round(totalDurationSec),
  };
};

const buildGeometry = (legs) => {
  const geometry = [];

  legs.forEach((leg) => {
    if (leg.status && leg.status !== "OK") return;

    (leg.steps || []).forEach((step) => {
      appendPolylinePoints(geometry, step.polyline?.points);
    });
  });

  return geometry;
};

const buildLegMetrics = (legs) =>
  legs.map((leg) => {
    let legDistanceM = 0;
    let legDurationSec = 0;

    if (leg.status && leg.status !== "OK") {
      return { legDistanceM: 0, legDurationSec: 0 };
    }

    (leg.steps || []).forEach((step) => {
      legDistanceM += toNumber(step.length) || 0;
      legDurationSec += toNumber(step.duration) || 0;
    });

    return {
      legDistanceM: Math.round(legDistanceM),
      legDurationSec: Math.round(legDurationSec),
    };
  });

const reorderPoints = (points, waypointsOrder) => {
  if (
    !Array.isArray(waypointsOrder) ||
    waypointsOrder.length !== points.length
  ) {
    return points;
  }

  return waypointsOrder.map((index) => points[index]).filter(Boolean);
};

const buildWaypointsParam = (points) =>
  points
    .map((point) => `${toNumber(point.latitude)},${toNumber(point.longitude)}`)
    .join("|");

const parseRouterError = (status, payload) => {
  const errors = Array.isArray(payload?.errors)
    ? payload.errors.join("; ")
    : null;
  const message =
    errors ||
    payload?.message ||
    `Yandex Router API responded with status ${status}`;

  if (status === 401) {
    return {
      code: "invalid_api_key",
      message: "Неверный или неактивный ключ Яндекс Router API.",
    };
  }

  if (status === 429) {
    return {
      code: "rate_limit",
      message: "Превышен лимит запросов к Яндекс Router API.",
    };
  }

  if (status === 400) {
    return { code: "invalid_request", message };
  }

  return { code: "router_error", message };
};

const isOptimizeDeniedError = (error) => {
  if (!error || typeof error.message !== "string") return false;
  return (
    error.status === 403 &&
    /optimize/i.test(error.message) &&
    /denied/i.test(error.message)
  );
};

/**
 * @param {{
 *   points: Array<{
 *     placeId?: number,
 *     name?: string,
 *     latitude: number | string,
 *     longitude: number | string,
 *   }>,
 *   optimize?: boolean,
 * }} params
 */
const buildWalkingRoute = async ({ points, optimize = true }) => {
  const apiKey = process.env.YANDEX_ROUTE_API_KEY;

  if (!apiKey) {
    const error = new Error("YANDEX_ROUTE_API_KEY is not configured");
    error.code = "missing_api_key";
    throw error;
  }

  if (!Array.isArray(points) || points.length < 2) {
    const error = new Error("At least two route points are required");
    error.code = "invalid_points";
    throw error;
  }

  if (points.length > MAX_WALKING_WAYPOINTS) {
    const error = new Error(
      `Yandex Router API supports up to ${MAX_WALKING_WAYPOINTS} points for walking routes`,
    );
    error.code = "too_many_points";
    throw error;
  }

  const requestRoute = async (requestOptimize) => {
    const searchParams = new URLSearchParams({
      apikey: apiKey,
      mode: "walking",
      waypoints: buildWaypointsParam(points),
    });

    if (requestOptimize) {
      searchParams.set("optimize", "true");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(`${ROUTER_API_URL}?${searchParams.toString()}`, {
        signal: controller.signal,
      });
    } catch (fetchError) {
      if (fetchError.name === "AbortError") {
        const error = new Error("Yandex Router API request timed out");
        error.code = "timeout";
        throw error;
      }

      const error = new Error("Failed to reach Yandex Router API");
      error.code = "network_error";
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const parsed = parseRouterError(response.status, payload);
      const error = new Error(parsed.message);
      error.code = parsed.code;
      error.status = response.status;
      throw error;
    }

    return payload;
  };

  let payload;
  let usedOptimize = optimize;
  try {
    payload = await requestRoute(optimize);
  } catch (error) {
    if (optimize && isOptimizeDeniedError(error)) {
      usedOptimize = false;
      payload = await requestRoute(false);
    } else {
      throw error;
    }
  }

  const legs = payload?.route?.legs;
  if (!Array.isArray(legs) || legs.length === 0) {
    const error = new Error("Yandex Router API returned an empty route");
    error.code = "empty_route";
    throw error;
  }

  const hasFailedLeg = legs.some((leg) => leg.status && leg.status !== "OK");
  if (hasFailedLeg) {
    const error = new Error(
      "Yandex Router API could not build a walking route for these points",
    );
    error.code = "route_unavailable";
    throw error;
  }

  const waypointsOrder = payload?.optimization?.waypoints_order;
  const orderedInputPoints = reorderPoints(points, waypointsOrder);
  const { totalDistanceM, totalDurationSec } = sumLegMetrics(legs);
  const geometry = buildGeometry(legs);
  const legMetrics = buildLegMetrics(legs);

  const orderedPoints = orderedInputPoints.map((point, index) => ({
    placeId: point.placeId ?? null,
    name: point.name ?? null,
    latitude: toNumber(point.latitude),
    longitude: toNumber(point.longitude),
    orderIndex: index + 1,
    legDurationMinutes:
      index === 0
        ? null
        : toDurationMinutes(legMetrics[index - 1]?.legDurationSec ?? 0),
    legDistanceKm:
      index === 0
        ? null
        : toDistanceKm(legMetrics[index - 1]?.legDistanceM ?? 0),
  }));

  return {
    orderedPoints,
    distanceKm: toDistanceKm(totalDistanceM),
    durationMinutes: toDurationMinutes(totalDurationSec),
    geometry,
    optimized: Boolean(usedOptimize && Array.isArray(waypointsOrder)),
    waypointsOrder: Array.isArray(waypointsOrder)
      ? waypointsOrder
      : points.map((_, index) => index),
  };
};

module.exports = {
  buildWalkingRoute,
  MAX_WALKING_WAYPOINTS,
};
