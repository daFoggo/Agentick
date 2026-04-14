# 📐 Phân Tích Kiến Trúc: Projects & Project Members

## 🏗️ Tổng Quan Kiến Trúc

Cấu trúc tuân theo **Feature-Based Architecture** với pattern rõ ràng:

```
features/
├── teams/               # Parent entity (giống Projects)
│   ├── components/
│   ├── functions.ts     # Server functions
│   ├── queries.ts       # TanStack Query
│   ├── schemas.ts       # Zod validation
│   ├── server.ts        # Mocking API
│   ├── sample-data.ts
│   └── index.ts
│
├── team-members/        # Child entity (giống Project Members)
│   ├── schemas.ts
│   ├── sample-data.ts
│   └── index.ts
│
├── projects/            # Project entity
│   ├── components/
│   ├── functions.ts
│   ├── queries.ts
│   ├── schemas.ts
│   ├── server.ts
│   ├── sample-data.ts
│   └── index.ts
│
└── project-members/     # Project member entity
    ├── schemas.ts
    ├── sample-data.ts
    └── index.ts
```

---

## 🔄 Pattern So Sánh: Teams vs Projects

### 1️⃣ **Schema Definition**

#### **Teams Pattern** (Đầy đủ)
```typescript
// teams/schemas.ts
export const TeamSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
  owner_id: z.string(),
  is_deleted: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string().optional().nullable(),
})

export type TTeam = z.infer<typeof TeamSchema> & {
  members?: TTeamMember[]
  projects?: TProject[]
}
```

#### **Projects Pattern** (Tương Tự)
```typescript
// projects/schemas.ts
export const ProjectSchema = z.object({
  id: z.string(),
  team_id: z.string(),           // FK tới Team
  name: z.string().min(3),       // Yêu cầu 3 ký tự (vs team 2 ký tự)
  description: z.string().optional(),
  avatar_url: z.url().optional().or(z.literal("")),
  created_at: z.iso.datetime().optional(),
})

export type TProject = z.infer<typeof ProjectSchema> & {
  members?: TProjectMember[]
  tasks?: TTask[]
}
```

**Nhận xét:**
- Projects có `team_id` (foreign key) vì nó là con của Team
- Projects không có `owner_id`, `is_deleted`, `updated_at` (cần xem xét thêm?)

---

### 2️⃣ **Member Schemas**

#### **TeamMember Pattern** (Chi Tiết)
```typescript
// team-members/schemas.ts
export const TeamRoleSchema = z.enum(["owner", "manager", "member", "viewer"])

export const TeamMemberSchema = z.object({
  id: z.string(),
  user_id: z.string(),           // snake_case (Backend API style)
  team_id: z.string(),
  role: TeamRoleSchema,
  joined_at: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional().nullable(),
  user: UserSchema.optional(),
})

// Cung cấp các schemas cho CRUD operations
export const AddTeamMemberSchema = z.object({...})
export const UpdateTeamMemberRoleSchema = z.object({...})
```

#### **ProjectMember Pattern** (Cơ Bản)
```typescript
// project-members/schemas.ts
export const ProjectRoleSchema = z.enum(["manager", "member", "viewer"])

export const ProjectMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),            // camelCase (FE style)
  projectId: z.string(),          // camelCase
  role: ProjectRoleSchema,
  joinedAt: z.iso.datetime().optional(),
  user: UserSchema.optional(),
})
```

**Nhận xét:**
- ⚠️ **INCONSISTENCY**: TeamMember dùng `snake_case` (user_id, team_id, joined_at)
- ⚠️ **INCONSISTENCY**: ProjectMember dùng `camelCase` (userId, projectId, joinedAt)
- ⚠️ **Missing Schemas**: ProjectMember không có schemas cho Add/Update operations
- ⚠️ **Missing Roles**: ProjectMember không có role "owner" (chỉ có manager, member, viewer)

---

### 3️⃣ **Server Functions & Queries**

#### **Teams Pattern** (Hoàn Chỉnh)
```typescript
// teams/functions.ts - Server Functions
export const getTeamsFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(GetTeamsSchema)
  .handler(async ({ data }) => {...})

// teams/queries.ts - TanStack Query
export const teamKeys = {
  all: ["teams"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  list: (params) => [...teamKeys.lists(), params] as const,
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (id) => [...teamKeys.details(), id] as const,
}

export const teamsQueryOptions = (params = {}) => queryOptions({
  queryKey: teamKeys.list(params),
  queryFn: () => getTeamsFn({ data: params }),
  staleTime: 1000 * 60 * 5,
})
```

#### **Projects Pattern** (Tương Tự)
```typescript
// projects/functions.ts
export const getProjectsFn = createServerFn({ method: "GET" })
  .middleware([requestLoggerMiddleware])
  .inputValidator(GetProjectsSchema)
  .handler(async ({ data }) => {...})

// projects/queries.ts
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id) => [...projectKeys.details(), id] as const,
}

export const projectsQueryOptions = (params = {}) => queryOptions({
  queryKey: projectKeys.list(params),
  queryFn: () => getProjectsFn({ data: params }),
  staleTime: 1000 * 60 * 5,
})
```

---

### 4️⃣ **Sample Data**

#### **Teams Pattern**
```typescript
// teams/sample-data.ts
export const SAMPLE_TEAMS = [{
  id: "team-1",
  name: "Design Team",
  members: SAMPLE_TEAM_MEMBERS,
  projects: SAMPLE_PROJECTS,
}]
```

#### **Projects Pattern**
```typescript
// projects/sample-data.ts
export const SAMPLE_PROJECTS = [{
  id: "project-1",
  team_id: SAMPLE_TEAM.id,        // Reference tới team
  name: "Project 1",
  members: SAMPLE_PROJECT_MEMBERS,
  tasks: [],
}]
```

---

## 📋 File Organization Pattern

### Core Layer (Per Feature)
```
feature/
├── schemas.ts         # Zod schemas + types
├── server.ts          # Mock API layer (sử dụng @tanstack/react-start/server-only)
├── functions.ts       # createServerFn wrappers
├── queries.ts         # TanStack Query integration
├── sample-data.ts     # Mock data
├── index.ts           # Barrel export
└── components/        # React components (optional)
```

### Benefits
- ✅ **Clear separation of concerns**: Schema, validation, API, queries riêng biệt
- ✅ **Reusability**: Có thể dùng schemas + queries trong client components
- ✅ **Testing**: Dễ mock server functions
- ✅ **Type safety**: Full TypeScript inference

---

## 🔗 Workflow: Fetch → Query → Component

### Sequence
```
Client Component
    ↓
    └─→ useQuery(projectQueryOptions(projectId))
        ↓
        └─→ projectQueryOptions()
            ↓
            └─→ getProjectByIdFn()
                ↓
                └─→ fetchProjectById() (server.ts)
                    ↓
                    └─→ SAMPLE_PROJECTS (mock data)
```

### Code Example
```typescript
// In component
export const ProjectDetail = () => {
  const { projectId } = useParams()
  const { data: project } = useSuspenseQuery(projectQueryOptions(projectId!))
  // ...
}
```

---

## ⚠️ Issues & Inconsistencies Found

### 1. **Naming Convention Mismatch**
| Entity | Naming | Example |
|--------|--------|---------|
| TeamMember | snake_case | `user_id`, `team_id`, `joined_at` |
| ProjectMember | camelCase | `userId`, `projectId`, `joinedAt` |

**Fix**: Thống nhất dùng `camelCase` cho FE hoặc `snake_case` (follow backend)

### 2. **Missing ProjectMember Operations**
- TeamMember có: `AddTeamMemberSchema`, `UpdateTeamMemberRoleSchema`
- ProjectMember chỉ có: base schema

**Fix**: Cần thêm schemas cho:
```typescript
export const AddProjectMemberSchema = z.object({...})
export const UpdateProjectMemberRoleSchema = z.object({...})
```

### 3. **ProjectMember Roles Incomplete**
- TeamRoleSchema: `["owner", "manager", "member", "viewer"]`
- ProjectRoleSchema: `["manager", "member", "viewer"]` ❌ Missing "owner"

**Fix**: Cần xác định xem Project có cần owner role không

### 4. **Project Schema Comparison**
```typescript
// TeamSchema có
is_deleted: boolean
updated_at: string
owner_id: string

// ProjectSchema không có
// ❓ Có cần không?
```

### 5. **Missing Server Functions for ProjectMembers**
- project-members chỉ có schemas + sample-data
- Cần thêm: `functions.ts`, `queries.ts`, `server.ts`

---

## 🎯 Recommendations Trước Khi Deploy

### Priority 1: Fix Inconsistencies
```
✅ Đồng bộ naming convention (snake_case vs camelCase)
✅ Hoàn chỉnh ProjectMember schemas cho CRUD operations
✅ Xác định ProjectMember roles (có cần owner không?)
✅ Thêm server functions cho project-members
```

### Priority 2: Enhance ProjectSchema
```
? Thêm is_deleted, updated_at, owner_id?
? Thêm status field (planning, in-progress, completed)?
? Thêm visibility field (public, private)?
```

### Priority 3: Add Routes & Components
```
/dashboard/$teamId/projects/              ✅ Exists (empty)
/dashboard/$teamId/projects/$projectId/   ✅ Exists (empty)
- Create project component
- Edit project component
- Delete project dialog
- Project settings page
```

---

## 📚 Export Pattern (index.ts)

### Teams Export
```typescript
// teams/index.ts
export * from "./schemas"
export * from "./functions"
export * from "./queries"
export * from "./sample-data"
export * from "./components/..."
```

### TeamMembers Export
```typescript
// team-members/index.ts
export * from "./schemas"
export * from "./sample-data"
// ⚠️ Missing functions & queries
```

### Projects Export
```typescript
// projects/index.ts
export * from "./schemas"
export * from "./functions"
export * from "./queries"
export * from "./sample-data"
export * from "./components/sidebar-project-list"
```

### ProjectMembers Export
```typescript
// project-members/index.ts
export * from "./schemas"
export * from "./sample-data"
// ⚠️ Missing functions & queries
```

---

## 🚀 Next Steps

1. **Code Review**: Xác định strategy cho inconsistencies
2. **Complete ProjectMembers**: Thêm functions.ts, queries.ts, server.ts
3. **Create Routes**: Implement project management pages
4. **Add Components**: Create, Edit, Delete dialogs + settings
5. **Test Integration**: Verify data flow end-to-end
