import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  type IViewModeDefinition,
  resolveViewModes,
  useViewModeListHydrated,
  useViewModeListStore,
} from "@/stores/use-view-mode-list-store"
import { useMatches } from "@tanstack/react-router"
import { SlidersHorizontal } from "lucide-react"
import { ViewModeListSkeleton } from "./skeleton"

interface IViewModeListProps {
  definitions?: IViewModeDefinition[]
  scope?: string
  hide?: boolean
  allowCustomization?: boolean
}

export const ViewModeList = ({
  definitions,
  scope,
  hide,
  allowCustomization,
}: IViewModeListProps) => {
  const matches = useMatches()
  const currentMatch = matches.at(-1)
  const currentStaticData = currentMatch?.staticData
  const viewModeDefinitions = definitions ?? currentStaticData?.viewModes ?? []

  const viewModeScope =
    scope ??
    currentStaticData?.viewModeScope ??
    currentMatch?.routeId ??
    "global"
  const allowViewModeCustomization =
    allowCustomization ?? currentStaticData?.allowViewModeCustomization ?? true
  const hasHydrated = useViewModeListHydrated()

  const scopeState = useViewModeListStore(
    (state) => state.modesByScope[viewModeScope]
  )
  const setActiveMode = useViewModeListStore((state) => state.setActiveMode)
  const toggleModeVisibility = useViewModeListStore(
    (state) => state.toggleModeVisibility
  )

  if (
    hide ||
    currentStaticData?.hideViewModes ||
    viewModeDefinitions.length === 0
  ) {
    return null
  }

  if (!hasHydrated) {
    return <ViewModeListSkeleton />
  }

  const { modes, activeValue } = resolveViewModes(
    viewModeDefinitions,
    scopeState
  )

  const visibleModes = modes.filter((mode) => mode.isVisible)

  if (visibleModes.length === 0) {
    return null
  }

  return (
    <Tabs
      value={activeValue ?? visibleModes[0].value}
      onValueChange={(value) => setActiveMode(viewModeScope, value)}
      className="w-full"
    >
      <div className="flex justify-between items-center gap-2">
        <TabsList variant="default">
          {visibleModes.map((mode) => (
            <TabsTrigger value={mode.value} key={`trigger-${mode.value}`}>
              <div className="flex items-center gap-2">
                {mode.icon && <mode.icon />}
                {mode.label}
                {mode.badge && <span>{mode.badge}</span>}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {allowViewModeCustomization ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal />
                Customize
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>View Modes</DropdownMenuLabel>
                {modes.map((mode) => {
                  const disabled = mode.isVisible && visibleModes.length === 1

                  return (
                    <DropdownMenuCheckboxItem
                      key={`mode-setting-${mode.value}`}
                      checked={mode.isVisible}
                      disabled={disabled}
                      onCheckedChange={() => {
                        toggleModeVisibility(
                          viewModeScope,
                          mode.value,
                          viewModeDefinitions
                        )
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <mode.icon />
                        {mode.label}
                      </span>
                    </DropdownMenuCheckboxItem>
                  )
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
      {visibleModes.map((mode) => (
        <TabsContent value={mode.value} key={`content-${mode.value}`}>
          {mode.render()}
        </TabsContent>
      ))}
    </Tabs>
  )
}
