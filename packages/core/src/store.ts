import type {
  ToastConfig,
  ToastContentInput,
  ToastContext,
  ToastEvent,
  ToastId,
  ToastInstance,
  ToastLoadingConfig,
  ToastLoadingInput,
  ToastLoadingResult,
  ToastOptions,
  ToastOrder,
  ToastPosition,
  ToastShowInput,
  ToastShowOptions,
  ToastState,
  ToastStore,
  ToastTextInput,
  ToastType,
  ToastUpdateInput,
} from "./types";
import {
  defaultCreatedAtFormatter,
  generateUuid,
  isPositiveFiniteNumber,
  VALID_TOAST_TYPES,
} from "./util";

type Listener = (state: ToastState) => void;
type EventListener = (event: ToastEvent) => void;
type TimeoutHandle = ReturnType<typeof setTimeout>;

interface TimerState {
  timeout: TimeoutHandle | null;
  startTime: number;
  remaining: number;
  paused: boolean;
}

const defaults: ToastConfig = {
  offset: "16px",
  gap: "8px",
  zIndex: 9999,
  width: "350px",
  overflowScroll: false,
  duration: 5000,
  maxVisible: 5,
  queue: false,
  position: "top-right",
  alignment: "left",
  progressAlignment: "right-to-left",
  preventDuplicates: false,
  order: "newest",
  progressBar: true,
  pauseOnHover: true,
  pauseStrategy: "resume",
  animation: {
    name: "Toastflow__animation",
    bump: "Toastflow__animation-bump",
    clearAll: "Toastflow__animation-clearAll",
    update: "Toastflow__animation-update",
  },
  closeButton: true,
  showIcon: true,
  closeOnClick: false,
  swipeToDismiss: false,
  supportHtml: false,
  showCreatedAt: false,
  createdAtFormatter: defaultCreatedAtFormatter,
};

// delay before removing clear-all toasts from state (lets the CSS animation start)
const CLEAR_ALL_DELAY = 50;

// Queues, capacity, duplicate detection, and ordering are scoped per
// (position, containerId). ToastPosition values never contain "::".
function scopeKeyOf(position: ToastPosition, containerId?: string): string {
  return `${position}::${containerId ?? ""}`;
}

export function createToastStore(
  globalConfig: Partial<ToastConfig> = {},
): ToastStore {
  let state: ToastState = { toasts: [], queue: [] };
  const listeners = new Set<Listener>();
  const eventListeners = new Set<EventListener>();
  const timers = new Map<ToastId, TimerState>();
  const promiseRuns = new Map<ToastId, symbol>();
  const queueByScope = new Map<string, ToastInstance[]>();
  // Internal delays (phase-2 removal, clear-all) tracked so destroy() can cancel them.
  const pendingTimeouts = new Set<TimeoutHandle>();
  let queuePaused = false;

  function scheduleInternal(fn: () => void, delay: number): void {
    const handle: TimeoutHandle = setTimeout(function () {
      pendingTimeouts.delete(handle);
      fn();
    }, delay);
    pendingTimeouts.add(handle);
  }

  const resolvedGlobalConfig: ToastConfig = getConfig();

  function flattenQueue(): ToastInstance[] {
    const items: ToastInstance[] = [];
    for (const queued of queueByScope.values()) {
      items.push(...queued);
    }
    return items;
  }

  function syncState(nextToasts: ToastInstance[] = state.toasts): void {
    state = {
      toasts: nextToasts,
      queue: flattenQueue(),
    };
  }

  function getVisibleAt(
    position: ToastPosition,
    containerId?: string,
  ): ToastInstance[] {
    return state.toasts.filter(function (t) {
      return (
        t.position === position &&
        t.containerId === containerId &&
        t.phase !== "leaving" &&
        t.phase !== "clear-all"
      );
    });
  }

  type LocatedToast =
    | { location: "visible"; toast: ToastInstance }
    | {
        location: "queue";
        toast: ToastInstance;
        scope: string;
        index: number;
      };

  function findToastById(id: ToastId): LocatedToast | null {
    const visible = state.toasts.find((t) => t.id === id);
    if (visible) {
      return { location: "visible", toast: visible };
    }

    for (const [scope, queued] of queueByScope.entries()) {
      const index = queued.findIndex((t) => t.id === id);
      if (index !== -1) {
        const toastAtIndex = queued[index];
        if (!toastAtIndex) {
          continue;
        }
        return {
          location: "queue",
          toast: toastAtIndex,
          scope,
          index,
        };
      }
    }

    return null;
  }

  function findDuplicateToast(toast: ToastInstance): LocatedToast | null {
    const predicate = function (t: ToastInstance) {
      return (
        t.position === toast.position &&
        t.containerId === toast.containerId &&
        t.type === toast.type &&
        t.title === toast.title &&
        t.description === toast.description &&
        t.phase !== "leaving" &&
        t.phase !== "clear-all"
      );
    };

    const visible = state.toasts.find(predicate);
    if (visible) {
      return { location: "visible", toast: visible };
    }

    for (const [scope, queued] of queueByScope.entries()) {
      const index = queued.findIndex(predicate);
      if (index !== -1) {
        const toastAtIndex = queued[index];
        if (!toastAtIndex) {
          continue;
        }
        return {
          location: "queue",
          toast: toastAtIndex,
          scope,
          index,
        };
      }
    }

    return null;
  }

  function replaceQueuedToast(
    scope: string,
    index: number,
    toast: ToastInstance,
  ): void {
    const queued = queueByScope.get(scope);
    if (!queued) {
      return;
    }
    queued[index] = toast;
    queueByScope.set(scope, queued);
    syncState();
  }

  function removeQueuedToast(
    scope: string,
    index: number,
  ): ToastInstance | null {
    const queued = queueByScope.get(scope);
    if (!queued || index < 0 || index >= queued.length) {
      return null;
    }

    const [removed] = queued.splice(index, 1);

    if (!queued.length) {
      queueByScope.delete(scope);
    } else {
      queueByScope.set(scope, queued);
    }

    syncState();
    return removed ?? null;
  }

  function enqueueToast(toast: ToastInstance): void {
    const scope = scopeKeyOf(toast.position, toast.containerId);
    const queued = queueByScope.get(scope) ?? [];
    queued.push(toast);
    queueByScope.set(scope, queued);
    syncState();
  }

  function dequeueNext(scope: string): ToastInstance | null {
    const queued = queueByScope.get(scope);
    if (!queued || !queued.length) {
      return null;
    }
    const next = queued.shift() ?? null;
    if (!queued.length) {
      queueByScope.delete(scope);
    } else {
      queueByScope.set(scope, queued);
    }
    syncState();
    return next;
  }

  function hasCapacityFor(toast: ToastInstance): boolean {
    if (toast.maxVisible <= 0) {
      return true;
    }
    const samePos = getVisibleAt(toast.position, toast.containerId);
    return samePos.length < toast.maxVisible;
  }

  // Evict until the new toast fits (a per-toast maxVisible smaller than the
  // stack needs more than one eviction). Queue processing stays suspended so
  // dismiss() can't promote queued toasts into the slots being freed.
  function evictUntilFits(toastInstance: ToastInstance): void {
    const wasQueuePaused = queuePaused;
    queuePaused = true;
    try {
      while (!hasCapacityFor(toastInstance)) {
        const toEvict = pickOverflowToast(
          getVisibleAt(toastInstance.position, toastInstance.containerId),
          toastInstance.order,
          toastInstance.position,
        );
        if (!toEvict) {
          break;
        }
        dismiss(toEvict.id);
      }
    } finally {
      queuePaused = wasQueuePaused;
    }
  }

  function processQueue(position: ToastPosition, containerId?: string): void {
    if (queuePaused) {
      return;
    }

    const scope = scopeKeyOf(position, containerId);
    let changed = false;

    while (true) {
      const nextQueued = queueByScope.get(scope)?.[0];
      if (!nextQueued) {
        break;
      }

      if (!hasCapacityFor(nextQueued)) {
        break;
      }

      const next = dequeueNext(scope);
      if (!next) {
        break;
      }

      syncState(insertToast(state.toasts, next));

      if (next.onMount) {
        next.onMount(toContext(next));
      }

      scheduleAutoDismiss(next);
      changed = true;
    }

    if (changed) {
      notify();
    }
  }

  function notify() {
    for (const listener of listeners) {
      listener(state);
    }
  }

  function emitEvent(event: ToastEvent) {
    for (const listener of eventListeners) {
      listener(event);
    }
  }

  // Return the current toast state.
  function getState(): ToastState {
    return state;
  }

  // Subscribe to store updates and immediately receive the current state.
  function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener(state);
    return () => {
      listeners.delete(listener);
    };
  }

  // Subscribe to toast lifecycle events only.
  function subscribeEvents(listener: EventListener): () => void {
    eventListeners.add(listener);
    return () => {
      eventListeners.delete(listener);
    };
  }

  // Show a toast, handling duplicates and auto-dismiss scheduling.
  function show(options: ToastShowInput): ToastId;
  function show(
    content: string | ToastTextInput | ToastShowInput,
    options?: ToastShowOptions,
  ): ToastId;
  function show(
    arg1: ToastShowInput | ToastTextInput | string,
    arg2?: ToastShowOptions,
  ): ToastId {
    const options = normalizeShowArgs(arg1, arg2);

    assertShowInput(options, "show");

    const toast = resolveConfig(resolvedGlobalConfig, options);
    const id = generateUuid();
    const createdAt = Date.now();

    const toastInstance: ToastInstance = {
      ...toast,
      id,
      createdAt,
      phase: "enter",
    };

    if (toastInstance.preventDuplicates) {
      const duplicate = findDuplicateToast(toastInstance);

      if (duplicate) {
        const updated: ToastInstance = {
          ...duplicate.toast,
          ...toastInstance,
          id: duplicate.toast.id,
          createdAt: duplicate.toast.createdAt,
        };

        if (duplicate.location === "visible") {
          rescheduleAutoDismiss(updated);
          syncState(
            state.toasts.map(function (t) {
              return t.id === updated.id ? updated : t;
            }),
          );
        } else {
          clearAutoDismiss(duplicate.toast.id);
          replaceQueuedToast(duplicate.scope, duplicate.index, updated);
        }

        emitEvent({ id: updated.id, kind: "duplicate" });
        notify();

        return duplicate.toast.id;
      }
    }

    if (!hasCapacityFor(toastInstance)) {
      if (toastInstance.queue) {
        enqueueToast(toastInstance);
        notify();
        return toastInstance.id;
      }

      evictUntilFits(toastInstance);
    }

    syncState(insertToast(state.toasts, toastInstance));

    if (toastInstance.onMount) {
      toastInstance.onMount(toContext(toastInstance));
    }

    scheduleAutoDismiss(toastInstance);
    notify();

    return id;
  }

  // Wrap a promise with loading/success/error toast states.
  function loading<T>(
    input: ToastLoadingInput<T>,
    config: ToastLoadingConfig<T>,
  ): ToastLoadingResult<T> {
    const loadingOptions: ToastShowInput = {
      ...config.loading,
      type: "loading",
      duration: Infinity,
      progressBar: false,
    };

    assertShowInput(loadingOptions, "loading.loading");

    const runToken = Symbol("toastflow-loading-run");
    const toastId = show(loadingOptions);
    promiseRuns.set(toastId, runToken);

    // Reset only the loading-phase overrides back to the global config;
    // everything else set in config.loading (position, containerId,
    // buttons, ...) is preserved by update()'s merge.
    function settledOptions(
      resolved: ToastContentInput,
      type: ToastType,
    ): ToastShowInput {
      return {
        duration: resolvedGlobalConfig.duration,
        progressBar: resolvedGlobalConfig.progressBar,
        ...resolved,
        type,
      };
    }

    function successOptions(value: T): ToastShowInput {
      const resolved =
        typeof config.success === "function"
          ? config.success(value)
          : config.success;

      assertContentFields(resolved, "loading.success");

      return settledOptions(resolved, "success");
    }

    function errorOptions(error: unknown): ToastShowInput {
      const resolved =
        typeof config.error === "function" ? config.error(error) : config.error;

      assertContentFields(resolved, "loading.error");

      return settledOptions(resolved, "error");
    }

    function applyIfActive(options: ToastShowInput) {
      if (promiseRuns.get(toastId) !== runToken) {
        return;
      }
      promiseRuns.delete(toastId);
      update(toastId, options);
    }

    function handleSuccess(value: T): T {
      applyIfActive(successOptions(value));
      return value;
    }

    function handleError(error: unknown): never {
      applyIfActive(errorOptions(error));
      throw error;
    }

    let task: Promise<T>;
    try {
      task = typeof input === "function" ? input() : input;
    } catch (error) {
      applyIfActive(errorOptions(error));
      const rejected = Promise.reject(error) as ToastLoadingResult<T>;
      rejected.toastId = toastId;
      return rejected;
    }

    const result = task.then(
      handleSuccess,
      handleError,
    ) as ToastLoadingResult<T>;
    result.toastId = toastId;
    return result;
  }

  // Update an existing toast and reset its timer.
  function update(id: ToastId, options: ToastUpdateInput): void {
    const located = findToastById(id);
    if (!located) {
      return;
    }

    if (options.type) {
      assertToastType(options.type, "update");
    }

    // Deep-merge nested objects so partial updates don't lose existing sub-fields
    const merged: ToastOptions = {
      ...located.toast,
      ...options,
      ...mergeOptionSlices(located.toast, options),
    };

    // Validate the merged result (not the raw input) has content
    assertContentFields(merged, "update");

    const updated: ToastInstance = {
      ...located.toast,
      ...merged,
      id: located.toast.id,
      createdAt: located.toast.createdAt,
    };

    const scopeChanged =
      updated.position !== located.toast.position ||
      updated.containerId !== located.toast.containerId;
    const canMove =
      located.toast.phase !== "leaving" && located.toast.phase !== "clear-all";

    if (located.location === "visible") {
      if (scopeChanged && canMove) {
        moveVisibleToast(located.toast, updated);
      } else {
        rescheduleAutoDismiss(updated);
        syncState(state.toasts.map((t) => (t.id === id ? updated : t)));
        emitEvent({ id, kind: "timer-reset" });
      }
    } else if (scopeChanged) {
      // Move between queue buckets so the toast waits in its new scope.
      removeQueuedToast(located.scope, located.index);
      enqueueToast(updated);
      processQueue(updated.position, updated.containerId);
    } else {
      replaceQueuedToast(located.scope, located.index, updated);
    }

    emitEvent({ id, kind: "update" });
    notify();
  }

  // Hide a toast, run lifecycle callbacks, and let the renderer handle leave animation.
  function dismiss(id: ToastId): void {
    const located = findToastById(id);
    if (!located) {
      clearAutoDismiss(id);
      promiseRuns.delete(id);
      return;
    }

    // Already leaving (or clear-all): a second dismiss must not re-run
    // onClose or schedule another removal.
    if (
      located.location === "visible" &&
      (located.toast.phase === "leaving" || located.toast.phase === "clear-all")
    ) {
      return;
    }

    clearAutoDismiss(id);
    promiseRuns.delete(id);

    const toast = located.toast;
    const context = toContext(toast);

    if (toast.onClose) {
      toast.onClose(context);
    }

    if (located.location === "queue") {
      removeQueuedToast(located.scope, located.index);
      notify();
      return;
    }

    // Phase 1: mark as leaving so getVisibleAt frees the slot,
    // but keep in the array for one render frame so TransitionGroup
    // can capture the correct visual position.
    syncState(
      state.toasts.map(function (t) {
        if (t.id !== id) {
          return t;
        }
        return { ...t, phase: "leaving" };
      }),
    );

    notify();
    processQueue(toast.position, toast.containerId);

    // Phase 2: remove after the current render cycle so the leave
    // animation starts from where the toast was actually visible.
    scheduleInternal(function () {
      const still = state.toasts.find(function (t) {
        return t.id === id;
      });
      if (!still) {
        return;
      }

      syncState(
        state.toasts.filter(function (t) {
          return t.id !== id;
        }),
      );

      if (toast.onUnmount) {
        toast.onUnmount(context);
      }

      notify();
      processQueue(toast.position, toast.containerId);
    }, 0);
  }

  // Cancel all pending timers, clear state, and drop all listeners.
  function destroy(): void {
    for (const timer of timers.values()) {
      if (timer.timeout) {
        clearTimeout(timer.timeout);
      }
    }
    timers.clear();

    for (const handle of pendingTimeouts) {
      clearTimeout(handle);
    }
    pendingTimeouts.clear();

    promiseRuns.clear();
    queueByScope.clear();
    listeners.clear();
    eventListeners.clear();
    state = { toasts: [], queue: [] };
  }

  // Clear all toasts, or only those targeting a specific container.
  // dismissAll() clears everything; dismissAll({ containerId }) clears one
  // container ({ containerId: undefined } targets the default container).
  function dismissAll(filter?: { containerId?: string }): void {
    if (!state.toasts.length && !state.queue.length) {
      return;
    }

    const scoped = filter !== undefined && "containerId" in filter;
    const matches = function (t: ToastInstance): boolean {
      return !scoped || t.containerId === filter.containerId;
    };

    // Skip toasts already leaving/clear-all: their onClose already ran.
    const current = state.toasts.filter(function (t) {
      return matches(t) && t.phase !== "leaving" && t.phase !== "clear-all";
    });
    const queued = flattenQueue().filter(matches);

    if (!current.length && !queued.length) {
      return;
    }

    for (const toast of current) {
      clearAutoDismiss(toast.id);
      promiseRuns.delete(toast.id);

      if (toast.onClose) {
        toast.onClose(toContext(toast));
      }
    }

    for (const toast of queued) {
      promiseRuns.delete(toast.id);

      if (toast.onClose) {
        toast.onClose(toContext(toast));
      }
    }

    // Clear queue immediately to prevent processQueue from dequeuing
    // toasts that already had onClose called during the animation delay.
    if (!scoped) {
      queueByScope.clear();
    } else {
      for (const [scope, bucket] of Array.from(queueByScope.entries())) {
        const remaining = bucket.filter(function (t) {
          return !matches(t);
        });
        if (!remaining.length) {
          queueByScope.delete(scope);
        } else {
          queueByScope.set(scope, remaining);
        }
      }
    }

    const clearedIds = new Set(current.map((t) => t.id));

    syncState(
      state.toasts.map(function (t) {
        if (!clearedIds.has(t.id)) {
          return t;
        }
        return {
          ...t,
          phase: "clear-all",
        };
      }),
    );

    notify();

    scheduleInternal(function () {
      for (const toast of current) {
        if (toast.onUnmount) {
          toast.onUnmount(toContext(toast));
        }
      }

      syncState(
        state.toasts.filter(function (t) {
          return !clearedIds.has(t.id);
        }),
      );
      notify();
    }, CLEAR_ALL_DELAY);
  }

  // Pause queue processing; queued toasts stay stored until resumed.
  function pauseQueue(): void {
    queuePaused = true;
  }

  // Resume queue processing and try to render queued toasts.
  function resumeQueue(): void {
    if (!queuePaused) {
      return;
    }
    queuePaused = false;
    // Snapshot bucket heads first: processQueue deletes emptied scope keys.
    const heads = Array.from(queueByScope.values(), (bucket) => bucket[0]);
    for (const head of heads) {
      if (head) {
        processQueue(head.position, head.containerId);
      }
    }
  }

  // Reschedule a toast's timer, preserving a paused state so updates or
  // duplicate re-shows during hover don't silently restart (and later fire)
  // the auto-dismiss while the user is still interacting with the toast.
  function rescheduleAutoDismiss(toastInstance: ToastInstance): void {
    const wasPaused = timers.get(toastInstance.id)?.paused === true;
    clearAutoDismiss(toastInstance.id);

    if (!isPositiveFiniteNumber(toastInstance.duration)) {
      return;
    }

    if (wasPaused) {
      timers.set(toastInstance.id, {
        timeout: null,
        startTime: Date.now(),
        remaining: toastInstance.duration,
        paused: true,
      });
      return;
    }

    scheduleAutoDismiss(toastInstance);
  }

  // Move a visible toast to another position/container: free the old slot,
  // apply the destination's capacity rules, then backfill the old scope.
  function moveVisibleToast(
    previous: ToastInstance,
    updated: ToastInstance,
  ): void {
    syncState(
      state.toasts.filter(function (t) {
        return t.id !== updated.id;
      }),
    );

    if (!hasCapacityFor(updated)) {
      if (updated.queue) {
        clearAutoDismiss(updated.id);
        enqueueToast(updated);
        processQueue(previous.position, previous.containerId);
        return;
      }
      evictUntilFits(updated);
    }

    syncState(insertToast(state.toasts, updated));
    rescheduleAutoDismiss(updated);
    emitEvent({ id: updated.id, kind: "timer-reset" });
    processQueue(previous.position, previous.containerId);
  }

  function scheduleAutoDismiss(toastInstance: ToastInstance) {
    if (!isPositiveFiniteNumber(toastInstance.duration)) {
      timers.delete(toastInstance.id);
      return;
    }

    const now = Date.now();
    const duration = toastInstance.duration;

    const handle: TimeoutHandle = setTimeout(() => {
      dismiss(toastInstance.id);
    }, duration);

    timers.set(toastInstance.id, {
      timeout: handle,
      startTime: now,
      remaining: duration,
      paused: false,
    });
  }

  function clearAutoDismiss(id: ToastId) {
    const timer = timers.get(id);
    if (timer && timer.timeout) {
      clearTimeout(timer.timeout);
    }
    timers.delete(id);
  }

  // Pause a toast timer and capture the remaining time.
  function pause(id: ToastId): void {
    const timer = timers.get(id);
    if (!timer || timer.paused) {
      return;
    }

    const now = Date.now();
    const elapsed = now - timer.startTime;
    const remaining = Math.max(timer.remaining - elapsed, 0);

    if (timer.timeout) {
      clearTimeout(timer.timeout);
    }

    timers.set(id, {
      timeout: null,
      startTime: now,
      remaining,
      paused: true,
    });
  }

  // Resume a paused toast timer according to its pause strategy.
  function resume(id: ToastId): void {
    const timer = timers.get(id);
    const toastInstance = state.toasts.find((t) => t.id === id);

    if (!toastInstance) {
      timers.delete(id);
      return;
    }

    if (!isPositiveFiniteNumber(toastInstance.duration)) {
      timers.delete(id);
      return;
    }

    const strategy = toastInstance.pauseStrategy;

    let remaining: number;

    if (!timer || !timer.paused) {
      // Restarting a running (non-paused) timer: drop the old timeout so the
      // original deadline can't dismiss the toast early.
      if (timer?.timeout) {
        clearTimeout(timer.timeout);
      }
      remaining = toastInstance.duration;
      if (strategy === "reset") {
        emitEvent({ id, kind: "timer-reset" });
      }
    } else {
      if (strategy === "reset") {
        remaining = toastInstance.duration;
        emitEvent({ id, kind: "timer-reset" });
      } else {
        remaining = timer.remaining;
      }
    }

    if (remaining <= 0) {
      dismiss(id);
      return;
    }

    const now = Date.now();
    const handle: TimeoutHandle = setTimeout(() => {
      dismiss(id);
    }, remaining);

    timers.set(id, {
      timeout: handle,
      startTime: now,
      remaining,
      paused: false,
    });
  }

  // Return the resolved global configuration for this store.
  function getConfig(): ToastConfig {
    return {
      ...defaults,
      ...globalConfig,
      animation: {
        ...defaults.animation,
        ...(globalConfig.animation ?? {}),
      },
    };
  }

  return {
    getState,
    subscribe,
    subscribeEvents,
    show,
    loading,
    update,
    dismiss,
    dismissAll,
    pauseQueue,
    resumeQueue,
    pause,
    resume,
    getConfig,
    destroy,
  };
}

// ------------- helpers -------------

function toContext(t: ToastInstance): ToastContext {
  return {
    id: t.id,
    position: t.position,
    type: t.type,
    title: t.title,
    description: t.description,
    createdAt: t.createdAt,
    containerId: t.containerId,
  };
}

function normalizeShowArgs(
  arg1: ToastShowInput | ToastTextInput | string,
  arg2?: ToastShowOptions,
): ToastShowInput {
  if (typeof arg1 === "string") {
    const {
      type = "default",
      title: _title,
      description,
      ...rest
    } = arg2 ?? {};
    return {
      ...rest,
      type,
      title: arg1,
      description: description ?? "",
    };
  }

  if ("type" in arg1) {
    if (!arg2) {
      return arg1;
    }
    // Same precedence as the other call forms: options override everything
    // except the content fields, which the input owns.
    const {
      title: optionsTitle,
      description: optionsDescription,
      ...rest
    } = arg2;
    return {
      ...arg1,
      ...rest,
      type: rest.type ?? arg1.type,
      title: arg1.title ?? optionsTitle ?? "",
      description: arg1.description ?? optionsDescription ?? "",
    };
  }

  const { title: inputTitle, description: inputDescription } = arg1;
  const {
    type = "default",
    title: optionsTitle,
    description: optionsDescription,
    ...rest
  } = arg2 ?? {};

  return {
    ...arg1,
    ...rest,
    type,
    title: inputTitle ?? optionsTitle ?? "",
    description: inputDescription ?? optionsDescription ?? "",
  };
}

function assertToastType(type: ToastType, caller: string) {
  if (!VALID_TOAST_TYPES.has(type)) {
    throw new Error(`[toastflow-core] ${caller} requires a valid toast type.`);
  }
}

function assertContentFields(
  options: { title?: unknown; description?: unknown },
  caller: string,
): asserts options is { title?: string; description?: string } {
  const hasTitle = isNonEmptyString(options.title);
  const hasDescription = isNonEmptyString(options.description);

  if (!hasTitle && !hasDescription) {
    throw new Error(
      `[toastflow-core] ${caller} requires a non-empty title or description.`,
    );
  }
}

function assertShowInput(options: ToastShowInput, caller: string) {
  assertToastType(options.type, caller);
  assertContentFields(options, caller);
}

function isNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function resolveConfig(
  base: ToastConfig,
  overrides: ToastOptions | ToastShowInput | ToastUpdateInput,
): ToastOptions {
  const {
    type,
    title,
    description,
    animation: animationOverride,
    buttons: buttonsOverride,
    css: cssOverride,
    ...restOverrides
  } = overrides as Partial<ToastOptions>;

  return {
    ...base,
    ...restOverrides,
    ...mergeOptionSlices(base, {
      animation: animationOverride,
      buttons: buttonsOverride,
      css: cssOverride,
    }),
    type: type ?? "default",
    title: title ?? "",
    description: description ?? "",
  };
}

// Deep-merge the nested option slices so partial overrides don't drop the
// existing sub-fields. Shared by resolveConfig() and update().
function mergeOptionSlices(
  base: Partial<Pick<ToastOptions, "animation" | "buttons" | "css">>,
  overrides: Partial<Pick<ToastOptions, "animation" | "buttons" | "css">>,
): Pick<ToastConfig, "animation" | "buttons" | "css"> {
  return {
    animation: {
      ...base.animation,
      ...(overrides.animation ?? {}),
    },
    buttons:
      base.buttons || overrides.buttons
        ? {
            ...(base.buttons ?? {}),
            ...(overrides.buttons ?? {}),
          }
        : undefined,
    css:
      base.css || overrides.css
        ? {
            ...(base.css ?? {}),
            ...(overrides.css ?? {}),
          }
        : undefined,
  };
}

function insertToast(
  existing: ToastInstance[],
  next: ToastInstance,
): ToastInstance[] {
  if (!isPositiveFiniteNumber(next.duration)) {
    next.progressBar = false;
  }

  const position = next.position;
  const order = next.order;

  // Ordering is scoped per (position, containerId) so each container's
  // stack stays contiguous and deterministic.
  const sameScope = (t: ToastInstance) =>
    t.position === position && t.containerId === next.containerId;

  const others = existing.filter((t) => !sameScope(t));
  const samePos = existing.filter(sameScope);

  const isTop = position.startsWith("top-");

  if (order === "newest") {
    if (isTop) {
      return [...others, next, ...samePos];
    } else {
      return [...others, ...samePos, next];
    }
  }

  if (isTop) {
    return [...others, ...samePos, next];
  } else {
    return [...others, next, ...samePos];
  }
}

function pickOverflowToast(
  samePos: ToastInstance[],
  order: ToastOrder,
  position: ToastPosition,
): ToastInstance | null {
  if (!samePos.length) {
    return null;
  }

  const isTop = position.startsWith("top-");

  // Always evict the toast that has been visible the longest (FIFO).
  // insertToast places the newest at the start (top) or end (bottom) depending
  // on order + position, so the oldest is always at the opposite end.
  if (order === "newest") {
    return isTop ? samePos[samePos.length - 1]! : samePos[0]!;
  }

  return isTop ? samePos[0]! : samePos[samePos.length - 1]!;
}
