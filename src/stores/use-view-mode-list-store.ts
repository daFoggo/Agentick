import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export interface IViewModeDefinition {
  value: string
  label: string
  icon: LucideIcon
  render: () => ReactNode
  isDefault?: boolean
  isVisibleByDefault?: boolean
  badge?: string | number | ReactNode
  badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
}

export interface IViewModeState {
  value: string
  label: string
  isDefault?: boolean
  isVisible: boolean
  metadata?: Record<string, unknown>
}

export interface IResolvedViewMode extends IViewModeState {
  icon: LucideIcon
  render: () => ReactNode
  badge?: string | number | ReactNode
  badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
}

interface IViewModeListStore {
  modesByScope: Record<string, IViewModeScopeState>
  hasHydrated: boolean
  setHasHydrated: (value: boolean) => void
  setModes: (scope: string, modes: IViewModeState[]) => void
  toggleModeVisibility: (scope: string, value: string, definitions: IViewModeDefinition[]) => void
  reorderModes: (
    scope: string,
    sourceIndex: number,
    targetIndex: number,
    definitions: IViewModeDefinition[]
  ) => void
  updateMode: (
    scope: string,
    value: string,
    updates: Partial<IViewModeState>,
    definitions: IViewModeDefinition[]
  ) => void
  updateModeMetadata: (scope: string, value: string, metadata: Record<string, unknown>) => void
  setActiveMode: (scope: string, value: string) => void
  resetToDefault: (scope: string) => void
}

export interface IViewModeScopeState {
  modes: IViewModeState[]
  activeValue?: string
}

const buildDefaultModeStates = (definitions: IViewModeDefinition[]): IViewModeState[] =>
  definitions.map((item, index) => ({
    value: item.value,
    label: item.label,
    isDefault: item.isDefault ?? index === 0,
    isVisible: item.isVisibleByDefault ?? true,
  }))

export const resolveViewModes = (
  definitions: IViewModeDefinition[],
  scopeState?: IViewModeScopeState
): { modes: IResolvedViewMode[]; activeValue?: string } => {
  if (definitions.length === 0) {
    return { modes: [] }
  }

  const defaultModes = buildDefaultModeStates(definitions)
  const mergedModes: IResolvedViewMode[] = (scopeState?.modes ?? defaultModes)
    .map((savedMode) => {
      const definition = definitions.find((item) => item.value === savedMode.value)
      if (!definition) return null

      return {
        value: savedMode.value,
        label: savedMode.label ?? definition.label,
        isDefault: savedMode.isDefault,
        isVisible: savedMode.isVisible,
        metadata: savedMode.metadata,
        icon: definition.icon,
        render: definition.render,
        badge: definition.badge,
        badgeVariant: definition.badgeVariant,
      } as IResolvedViewMode
    })
    .filter((mode): mode is IResolvedViewMode => mode !== null)

  const seenValues = new Set(mergedModes.map((mode) => mode.value))
  const missingModes = definitions
    .filter((definition) => !seenValues.has(definition.value))
    .map((definition, index) => ({
      value: definition.value,
      label: definition.label,
      icon: definition.icon,
      render: definition.render,
      isDefault: definition.isDefault ?? (mergedModes.length === 0 && index === 0),
      isVisible: definition.isVisibleByDefault ?? true,
      badge: definition.badge,
      badgeVariant: definition.badgeVariant,
    }))

  const modes = [...mergedModes, ...missingModes]
  const visibleModes = modes.filter((mode) => mode.isVisible)
  const activeValueIsVisible = visibleModes.some((mode) => mode.value === scopeState?.activeValue)
  const activeValue = activeValueIsVisible
    ? scopeState?.activeValue
    : visibleModes.find((mode) => mode.isDefault)?.value ?? visibleModes[0]?.value

  return {
    modes,
    activeValue,
  }
}



const getScopeState = (
  scope: string,
  definitions: IViewModeDefinition[],
  modesByScope: Record<string, IViewModeScopeState>
) => {
  const resolved = resolveViewModes(definitions, modesByScope[scope])
  return {
    modes: resolved.modes.map(({ icon, render, ...rest }) => rest),
    activeValue: resolved.activeValue,
  }
}

export const useViewModeListStore = create<IViewModeListStore>()(
  persist(
    (set) => ({
      modesByScope: {},
      hasHydrated: false,

      setHasHydrated: (value) =>
        set(() => ({
          hasHydrated: value,
        })),

      setModes: (scope, modes) =>
        set((state) => ({
          modesByScope: {
            ...state.modesByScope,
            [scope]: {
              ...state.modesByScope[scope],
              modes,
            },
          },
        })),

      toggleModeVisibility: (scope, value, definitions) =>
        set((state) => {
          const scopeState = getScopeState(scope, definitions, state.modesByScope)
          const modes = scopeState.modes.map((mode) => {
            if (mode.value !== value) {
              return mode
            }

            const nextVisibility = !mode.isVisible
            if (!nextVisibility) {
              const visibleCount = scopeState.modes.filter((item) => item.isVisible).length
              if (visibleCount <= 1) {
                return mode
              }
            }

            return { ...mode, isVisible: nextVisibility }
          })

          return {
            modesByScope: {
              ...state.modesByScope,
              [scope]: {
                modes,
                activeValue: scopeState.activeValue,
              },
            },
          }
        }),

      reorderModes: (scope, sourceIndex, targetIndex, definitions) =>
        set((state) => {
          const scopeState = getScopeState(scope, definitions, state.modesByScope)
          const modes = [...scopeState.modes]
          const [removed] = modes.splice(sourceIndex, 1)
          modes.splice(targetIndex, 0, removed)

          return {
            modesByScope: {
              ...state.modesByScope,
              [scope]: {
                modes,
                activeValue: scopeState.activeValue,
              },
            },
          }
        }),

      updateMode: (scope, value, updates, definitions) =>
        set((state) => {
          const scopeState = getScopeState(scope, definitions, state.modesByScope)
          const modes = scopeState.modes.map((mode) =>
            mode.value === value ? { ...mode, ...updates } : mode
          )

          return {
            modesByScope: {
              ...state.modesByScope,
              [scope]: {
                modes,
                activeValue: scopeState.activeValue,
              },
            },
          }
        }),

      updateModeMetadata: (scope, value, metadata) =>
        set((state) => {
          const scopeState = state.modesByScope[scope]
          if (!scopeState) return state

          const modes = scopeState.modes.map((mode) =>
            mode.value === value ? { ...mode, metadata: { ...mode.metadata, ...metadata } } : mode
          )

          return {
            modesByScope: {
              ...state.modesByScope,
              [scope]: {
                ...scopeState,
                modes,
              },
            },
          }
        }),

      setActiveMode: (scope, value) =>
        set((state) => ({
          modesByScope: {
            ...state.modesByScope,
            [scope]: {
              ...state.modesByScope[scope],
              activeValue: value,
            },
          },
        })),

      resetToDefault: (scope) =>
        set((state) => {
          const nextState = { ...state.modesByScope }
          delete nextState[scope]

          return {
            modesByScope: nextState,
          }
        }),
    }),
    {
      name: "view-mode-list-storage",
      version: 1,
      partialize: (state) => ({
        modesByScope: state.modesByScope,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export const useViewModeListHydrated = () =>
  useViewModeListStore((state) => state.hasHydrated)