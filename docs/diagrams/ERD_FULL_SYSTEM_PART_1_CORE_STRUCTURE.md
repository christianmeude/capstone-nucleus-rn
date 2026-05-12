# ERD Full System (Part 1) - Core Structure

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar email UK
        varchar role
        uuid department_id FK
        uuid program_id FK
        varchar first_name
        varchar last_name
        bool is_active
    }

    DEPARTMENTS {
        uuid id PK
        varchar name UK
        varchar code UK
        bool is_active
    }

    PROGRAMS {
        uuid id PK
        uuid department_id FK
        varchar name
        varchar code
        bool is_active
    }

    RESEARCH_PAPERS {
        uuid id PK
        varchar title
        varchar status
        uuid author_id FK
        uuid faculty_id FK
        uuid dean_chair_id FK
        uuid department_id FK
        uuid program_id FK
        uuid bypassed_by FK
        uuid deleted_by FK
        timestamptz deleted_at
    }

    RESEARCH_AUTHORS {
        uuid id PK
        uuid research_id FK
        uuid user_id FK
        int4 author_order
        bool is_primary
    }

    DEPARTMENTS ||--o{ USERS : "users_department_id_fkey"
    PROGRAMS ||--o{ USERS : "users_program_id_fkey"
    DEPARTMENTS ||--|{ PROGRAMS : "programs_department_id_fkey"

    USERS ||--|{ RESEARCH_PAPERS : "research_papers_author_id_fkey"
    USERS ||--o{ RESEARCH_PAPERS : "research_papers_faculty_id_fkey"
    USERS ||--o{ RESEARCH_PAPERS : "research_papers_dean_chair_id_fkey"
    USERS ||--o{ RESEARCH_PAPERS : "research_papers_bypassed_by_fkey"
    USERS ||--o{ RESEARCH_PAPERS : "research_papers_deleted_by_fkey"
    DEPARTMENTS ||--o{ RESEARCH_PAPERS : "research_papers_department_id_fkey"
    PROGRAMS ||--o{ RESEARCH_PAPERS : "research_papers_program_id_fkey"

    RESEARCH_PAPERS ||--|{ RESEARCH_AUTHORS : "research_authors_research_id_fkey"
    USERS ||--|{ RESEARCH_AUTHORS : "research_authors_user_id_fkey"
```

**Figure caption:** Core structural ERD of NUcleus showing institutional hierarchy (`departments` and `programs`), user placement, and foundational research ownership/authorship relations.
