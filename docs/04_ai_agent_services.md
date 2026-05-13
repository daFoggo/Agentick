# Tài liệu Kỹ thuật: Hệ thống Dịch vụ AI Agent - Agentick

Tài liệu này cung cấp cái nhìn tổng quan và chi tiết về các dịch vụ AI Agent hiện có trong dự án **Agentick**, dựa trực tiếp trên cấu trúc codebase thực tế (`app/services`, `app/agents`, `app/core/scheduler.py`).

Hệ thống AI của Agentick không chỉ là một Chatbot đơn thuần mà được tích hợp sâu vào nghiệp vụ quản lý dự án, hoạt động cả ở lớp "nổi" (Interactive/API) và lớp "ngầm" (Background Scheduler).

---

## 1. Kiến trúc Tổng quan (High-Level Architecture)

Kiến trúc AI tuân theo mô hình hóa chiến lược (Strategy Pattern), cho phép thay đổi LLM backend linh hoạt thông qua `LLMStrategy` (hiện tại sử dụng `OpenRouterStrategy`).

```plantuml
@startuml
skinparam shadowing false
skinparam nodeBackgroundColor #F5F9FF
skinparam databaseBackgroundColor #FFFDF0
skinparam cloudBackgroundColor #F1FAF2
skinparam packageBackgroundColor #FFFFFF
skinparam ArrowColor #2563EB

left to right direction

' ========================
' TIER 3: EXTERNAL API
' ========================
cloud "External AI Providers" as EXT {
    [OpenRouter API] as OR_API
}

' ========================
' TIER 2: APPLICATION LOGIC
' ========================
node "FastAPI Server Node" as APP_NODE {
    
    package "AI Agent Components" {
        [CustomAgent] as CA
        [AgentService] as AS
        [EstimationService] as ES
        [RiskAnalysisService] as RAS
        [AgentOutreachService] as AOS
    }
    
    package "Background Process" {
        [APScheduler] as SCH
    }
}

' ========================
' TIER 1: PERSISTENCE LAYER
' ========================
node "Storage Layer" as STORE_NODE {
    database "PostgreSQL" as PG_DB
    database "Qdrant VectorDB" as QD_DB
}

' ======= FLOWS & RELATIONSHIPS =======

' In-app Interactions
AS -down-> CA : usage
RAS -down-> CA : prompts
AOS -down-> CA : prompts

' External Connection
CA ..> OR_API : "REST/JSON"

' Data Persistence
ES -down-> QD_DB : "search"
ES -down-> PG_DB : "read"
RAS -down-> PG_DB : "scan"
AOS -down-> PG_DB : "monitor"

' Automation Scheduler
SCH -right-> RAS : "Morning Run"
SCH -right-> PG_DB : "Evening Summary"

@enduml
```

---

## 2. Các Dịch vụ AI Agent Chi tiết

### 2.1 Agent Service (Trợ lý Tương tác Trực tiếp)

**Mô tả:**
Dịch vụ này cung cấp một Chatbot thông minh có khả năng sử dụng công cụ (Tool Use/Function Calling) để thao tác trực tiếp với dữ liệu hệ thống (nhiệm vụ, dự án) theo yêu cầu tự nhiên của người dùng thông qua REST API.

**Sử dụng:** `app/services/agent_service.py`, `app/agents/custom_agent.py`

#### Sequence Diagram: Luồng Tương tác Agent & Tool Calling

```plantuml
@startuml
skinparam shadowing false

actor User
box "Agentick Platform" #F0F4FF
    participant "AgentController" as API
    participant "AgentService" as SVC
    participant "TaskTools" as TT
    participant "CustomAgent" as CA
end box

box "LLM Gateway" #E8F5E9
    participant "OpenRouter\nStrategy" as OR
end box

User -> API : POST /agent (prompt, history)
activate API
API -> SVC : run_agent(prompt, history)
activate SVC
SVC -> TT : get_tool_definitions()
SVC -> CA : run(tools, executor)
activate CA

group Call 1: Phân tích & Quyết định Tool
    CA -> OR : generate_chat_completion(messages, tools)
    activate OR
    OR --> CA : Trả về message [tool_calls]
    deactivate OR
end

alt Có yêu cầu gọi Tool
    loop Duyệt từng tool_call
        CA -> TT : execute_tool(func_name, args)
        activate TT
        TT --> CA : Trả về data kết quả từ DB
        deactivate TT
    end
    
    group Call 2: Tổng hợp câu trả lời cuối
        CA -> OR : generate_chat_completion(messages_with_tool_result)
        activate OR
        OR --> CA : Trả về text phản hồi
        deactivate OR
    end
else Không có Tool
    CA --> CA : Dùng content text từ Call 1
end

CA --> SVC : Kết quả (response, tools_executed)
deactivate CA
SVC --> API : Dữ liệu JSON
deactivate SVC
API --> User : Trả về kết quả hiển thị UI
deactivate API

@enduml
```

---

### 2.2 Estimation Service (Ước lượng Thời gian Thông minh)

**Mô tả:**
Thực hiện ước lượng thời gian (`estimated_hours`) cho một Task mới dựa trên mô hình **Case-Based Reasoning (CBR)** kết hợp RAG. Dịch vụ này truy xuất các task tương tự trong quá khứ từ Qdrant Vector DB, phân tích độ lệch thời gian thực tế và nhờ AI dự đoán.

**Sử dụng:** `app/services/estimation_service.py`

#### Use Case & Flow Diagram

```plantuml
@startuml
skinparam ActorBackgroundColor #FFD700
actor "User / Project Manager" as PM

box "Estimation Workflow" #F0F9FF
    participant "EstimationService" as ES
    participant "QdrantHelper" as QH
    participant "TaskRepository" as TR
    participant "LLMStrategy" as LLM
end box

PM -> ES : Yêu cầu ước lượng (Title, Desc)
activate ES

ES -> QH : search_similar_tasks(project_id, query_text)
activate QH
note right: Tìm 5 task tương tự về mặt ngữ nghĩa
QH --> ES : Danh sách task_ids tương tự
deactivate QH

ES -> TR : get_tasks_by_ids(task_ids)
activate TR
TR --> ES : Lấy thông tin estimated vs actual hours
deactivate TR

ES -> ES : Compile Context (Historical Cases)
ES -> LLM : generate_chat_completion(prompt + context)
activate LLM
note right: AI phân tích variance & similarity
LLM --> ES : Trả về JSON (suggested_hours, rationale)
deactivate LLM

alt Lỗi LLM hoặc Không có dữ liệu quá khứ
    ES -> ES : Kích hoạt logic Programmatic Fallback\n(Tính trung bình lịch sử hoặc trả về 8.0h)
end

ES --> PM : Trả về Suggested Hours & Biện luận (Rationale)
deactivate ES
@enduml
```

---

### 2.3 Risk Analysis Service (Phân tích & Cảnh báo Rủi ro)

**Mô tả:**
Một dịch vụ "Hybrid" kết hợp giữa các thuật toán xác định (Deterministic) và AI tổng hợp. Hệ thống tự động tính toán các chỉ số rủi ro (Tiến độ, Trễ lịch trình, Xung đột tải công việc), sau đó chuyển cho AI Agent để đưa ra đánh giá rủi ro chi tiết và các khuyến nghị quản lý (Managerial recommendations).

Dịch vụ này có thể chạy thủ công từ API hoặc được gọi tự động định kỳ bởi Scheduler.

**Sử dụng:** `app/services/risk_analysis_service.py`

#### Sequence Diagram: Luồng Phân tích Rủi ro tự động

```plantuml
@startuml
skinparam shadowing false

box "System / Scheduler" #FEFECE
    participant "RiskAnalysisService" as RAS
    database "Database" as DB
end box

box "AI Layer" #E8F5E9
    participant "CustomAgent" as CA
    participant "LLM Strategy" as LLM
end box

participant "Notification" as NTF

[-> RAS : analyze_task(task_id)
activate RAS

RAS -> DB : get(Task, TaskCheckpoint, WorkSchedule)
activate DB
DB --> RAS : Trả về Dữ liệu gốc
deactivate DB

note over RAS: Bước 1: Chạy Programmatic Signals\n- Tính toán Time Variance\n- Kiểm tra Schedule Bottleneck\n- Thống kê Parallel Congestion

RAS -> CA : Gọi LLM phân tích tập trung
activate CA
CA -> LLM : generate_chat_completion(Signals Context)\n[Force JSON Format]
activate LLM
LLM --> CA : Trả về {risk_score, risk_level, recommendation}
deactivate LLM
CA --> RAS : Kết quả JSON
deactivate CA

alt LLM Fail parsing
    RAS -> RAS : Chạy Programmatic Fallback Logic
end

RAS -> RAS : Thêm Penalty nếu trễ mà chưa Start

RAS -> DB : Lưu RiskSnapshot()
activate DB
DB --> RAS : Thành công
deactivate DB

alt NẾU Risk Score >= 0.7
    RAS -> NTF : send_risk_alert_email(Assignees)
    activate NTF
    NTF --> RAS : Email Dispatched
    deactivate NTF
    RAS -> DB : Cập nhật alert_sent = True
end

[<-- RAS : Hoàn tất Phân tích
deactivate RAS

@enduml
```

---

### 2.4 Các Dịch vụ Chạy Ngầm (Silent Services)

Hệ thống bao gồm hai cơ chế chạy ngầm chính vận hành bởi **APScheduler** kết hợp cùng các logic AI để tự động hóa việc theo dõi dự án:

#### A. Scheduler & Risk Management Lifecycle

**Mô tả:**
Bộ lập lịch `app/core/scheduler.py` đảm bảo việc phân tích rủi ro diễn ra tự động vào đầu ngày và báo cáo tổng hợp vào cuối ngày, căn cứ chính xác theo **Timezone** của từng dự án.

1.  **Morning Scan Job (9:00 AM Local Time):** Duyệt qua tất cả tasks chưa hoàn thành, nếu giờ địa phương của project là 9h sáng, tự động gọi `RiskAnalysisService.analyze_task` bất đồng bộ.
2.  **Evening Summary Job (5:30 PM Local Time):** Quét các Snapshot rủi ro được tạo ra trong ngày, lọc các rủi ro >= 0.5, tạo template HTML báo cáo và gửi email trực tiếp đến Team Lead.

#### B. Agent Outreach Service (Chăm sóc & Nhắc nhở tự động)

**Mô tả:**
Dịch vụ này hoạt động như một "Quản lý ảo" đi rà soát hệ thống. Khi phát hiện dữ liệu task bị hụt (ví dụ: thiếu giờ ước tính) hoặc task đã quá lâu không có hoạt động (stale updates), dịch vụ sẽ nhờ AI soạn một email nhắc nhở thân thiện, cá nhân hóa để gửi tới Assignee.

**Sử dụng:** `app/services/agent_outreach_service.py`

#### Sequence Diagram: Luồng Chăm sóc & Gửi Mail nhắc nhở

```plantuml
@startuml
skinparam shadowing false

box "Background Job" #FDFD96
    participant "OutreachService" as OS
    database "Database" as DB
end box

box "AI Logic" #E8F5E9
    participant "CustomAgent" as CA
end box

participant "SMTP Server" as MAIL

[-> OS : run_outreach_cycle()
activate OS

OS -> DB : Lấy all active tasks != Completed
activate DB
DB --> OS : List tasks
deactivate DB

loop Mỗi Task hợp lệ
    OS -> OS : assess_data_gap() && should_send_stale_alert()
    
    alt Thỏa mãn tiêu chí Outreach
        OS -> CA : compose_outreach_email(task_data, gaps)
        activate CA
        note right: AI cá nhân hóa email (max 5 câu)
        CA --> OS : Email Content body
        deactivate CA
        
        OS -> MAIL : send_agent_outreach_email()
        activate MAIL
        MAIL --> OS : Success
        deactivate MAIL
        
        OS -> DB : Log AgentOutreach + Create RiskSnapshot
    end
end

[<-- OS : Kết thúc vòng lặp Cycle
deactivate OS

@enduml
```

### Tổng hợp các API Trigger cho Background Services

Các dịch vụ ngầm này cũng được expose qua route `/api/v1/agent/` để quản trị viên có thể trigger cưỡng bức ngay lập tức phục vụ demo hoặc xử lý khẩn cấp:
*   `POST /agent/outreaches`: Kích hoạt vòng quét outreach gửi mail nhắc nhở.
*   `POST /agent/morning-scan/trigger`: Cưỡng bức chạy quét rủi ro sáng sớm toàn hệ thống.
*   `POST /agent/evening-summary/trigger`: Gửi báo cáo tổng hợp chiều tối tới Team Lead ngay lập tức.

---
*Tài liệu này được trích xuất và hệ thống hóa tự động dựa trên codebase hiện tại của Agentick.*
