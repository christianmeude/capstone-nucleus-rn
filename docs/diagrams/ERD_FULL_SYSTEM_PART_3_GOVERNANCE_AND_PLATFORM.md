# ERD Full System (Part 3) - Governance and Platform

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar email UK
        varchar role
        varchar recovery_email
    }

    PASSWORD_RESET_TOKENS {
        uuid id PK
        uuid user_id FK
        varchar token_hash UK
        timestamptz expires_at
        timestamptz used_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        varchar user_role
        varchar action
        varchar target_type
        uuid target_id
        timestamptz created_at
    }

    SYSTEM_POLICY_SETTINGS {
        bool id PK
        int4 max_file_size_mb
        text[] allowed_file_types
        uuid updated_by
        jsonb legacy_policy_overrides
    }

    PROFILES {
        uuid id PK
        text role
    }

    WORKFLOW_STAGES {
        uuid id PK
        text code UK
        text label
        text reviewer_role
        int4 position
        bool is_active
    }

    RESEARCH_CATEGORIES {
        uuid id PK
        varchar name UK
        text description
    }

    USERS ||--|{ PASSWORD_RESET_TOKENS : "password_reset_tokens_user_id_fkey"
    USERS ||--o{ AUDIT_LOGS : "audit_logs_user_id_fkey"
```

**Figure caption:** Governance and platform ERD showing account security and audit relations, alongside standalone policy and configuration tables without declared foreign keys in `public`.

## Verified Standalone Tables In This Partition

- `PROFILES` (no FK declared in `public`)
- `WORKFLOW_STAGES` (no FK declared in `public`)
- `RESEARCH_CATEGORIES` (no FK declared in `public`)
- `SYSTEM_POLICY_SETTINGS.updated_by` is not declared as a foreign key
