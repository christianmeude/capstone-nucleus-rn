# HIPO Chart (Highlighted Modules) - NUcleus Mobile

## Level 0 HIPO Overview

```mermaid
flowchart TB
  A["NUcleus Mobile<br/>Student System"]

  A --> B["1. Authentication<br/>& Session"]
  A --> C["2. Research Discovery<br/>& Access"]
  A --> D["3. Student<br/>Workspace"]
  A --> E["4. Communication"]
  A --> F["5. Data Access Layer<br/>(Supabase)"]

  C --> C1["Browse + Detail +<br/>Open/Download"]
  D --> D1["Dashboard +<br/>My Papers"]
  E --> E1["Notifications +<br/>Invitations"]
  F --> F1["Auth, DB,<br/>Storage, RPC"]

  classDef top fill:#f7f7f7,stroke:#2d2d2d,color:#111,stroke-width:1.4px;
  classDef module fill:#ffffff,stroke:#3a3a3a,color:#111,stroke-width:1.2px;
  class A top;
  class B,C,D,E,F,C1,D1,E1,F1 module;
```

**Figure caption:** Level 0 HIPO decomposition emphasizing five highlighted modules used in the NUcleus Mobile student workflow. This view is intended as the bridge between a generalized system map and process-specific IPO charts.

## Level 1 HIPO - Authentication & Session

```mermaid
flowchart TB
  subgraph AUTH["Authentication & Session"]
    direction LR
    I1["Input:<br/>email/password"]
    I2["Input:<br/>saved session"]
    P1["P1 Validate<br/>credentials"]
    P2["P2 Restore session<br/>& auth state"]
    P3["P3 Resolve student<br/>profile + role"]
    O1["Output:<br/>user context set"]
    O2["Output:<br/>session active/cleared"]

    I1 --> P1 --> P3 --> O1
    I2 --> P2 --> P3
    P2 --> O2
  end

  classDef module fill:#ffffff,stroke:#3a3a3a,color:#111,stroke-width:1.2px;
  class I1,I2,P1,P2,P3,O1,O2 module;
```

**Figure caption:** Authentication flow from credentials/session input to profile validation and final user-context creation. The outputs reflect either an active student session or a cleared unauthorized session.

## Level 1 HIPO - Research Discovery & Access

```mermaid
flowchart TB
  subgraph RDA["Research Discovery & Access"]
    direction LR
    I1["Input:<br/>query, category"]
    I2["Input:<br/>paper ID, action"]
    P1["P1 Load published<br/>papers + categories"]
    P2["P2 Filter/search<br/>papers"]
    P3["P3 Load paper detail<br/>& workflow"]
    P4["P4 Resolve signed URL<br/>or fallback URL"]
    P5["P5 Track view/<br/>download metrics"]
    O1["Output:<br/>filtered paper list"]
    O2["Output:<br/>detail screen data"]
    O3["Output:<br/>PDF opened/downloaded"]
    O4["Output:<br/>view/download persisted"]

    I1 --> P1 --> P2 --> O1
    I2 --> P3 --> O2
    P3 --> P4 --> O3
    I2 --> P5 --> O4
  end

  classDef module fill:#ffffff,stroke:#3a3a3a,color:#111,stroke-width:1.2px;
  class I1,I2,P1,P2,P3,P4,P5,O1,O2,O3,O4 module;
```

**Figure caption:** Discovery and access module showing the complete browse-to-read path, including signed file URL resolution and engagement tracking. Outputs separate user-visible views from persisted analytics side effects.

## Level 1 HIPO - Student Workspace

```mermaid
flowchart TB
  subgraph SW["Student Workspace (Dashboard + My Papers)"]
    direction LR
    I1["Input:<br/>my paper rows"]
    I2["Input:<br/>status + text filters"]
    P1["P1 Load student<br/>paper dataset"]
    P2["P2 Compute status<br/>counts + recency"]
    P3["P3 Apply filter/search<br/>logic"]
    O1["Output:<br/>dashboard stats"]
    O2["Output:<br/>recent papers list"]
    O3["Output:<br/>filtered my-papers view"]

    I1 --> P1 --> P2 --> O1
    P2 --> O2
    I2 --> P3 --> O3
    P1 --> P3
  end

  classDef module fill:#ffffff,stroke:#3a3a3a,color:#111,stroke-width:1.2px;
  class I1,I2,P1,P2,P3,O1,O2,O3 module;
```

**Figure caption:** Student workspace module focused on personal paper monitoring and retrieval. The chart highlights separation between computed dashboard aggregates and interactive filtered lists.

## Level 1 HIPO - Communication

```mermaid
flowchart TB
  subgraph COMM["Communication (Notifications + Invitations)"]
    direction LR
    I1["Input:<br/>notification rows"]
    I2["Input:<br/>invitation rows"]
    I3["Input:<br/>read/respond actions"]
    P1["P1 Load + count<br/>unread notifications"]
    P2["P2 Mark single/all<br/>notifications read"]
    P3["P3 Load invitations<br/>& pending count"]
    P4["P4 Accept/decline<br/>invitation token"]
    O1["Output:<br/>notification feed"]
    O2["Output:<br/>read-state updated"]
    O3["Output:<br/>invitation list + counts"]
    O4["Output:<br/>invitation status persisted"]

    I1 --> P1 --> O1
    I3 --> P2 --> O2
    I2 --> P3 --> O3
    I3 --> P4 --> O4
  end

  classDef module fill:#ffffff,stroke:#3a3a3a,color:#111,stroke-width:1.2px;
  class I1,I2,I3,P1,P2,P3,P4,O1,O2,O3,O4 module;
```

**Figure caption:** Communication module decomposition for student alerts and co-author collaboration requests. Outputs distinguish immediate UI refresh from persisted response/update states.

## Level 1 HIPO - Data Access Layer (Supabase Operations)

```mermaid
flowchart TB
  subgraph DAL["Data Access Layer (Supabase)"]
    direction LR
    I1["Input:<br/>auth event/request"]
    I2["Input:<br/>query + filter params"]
    I3["Input:<br/>file path + metric RPC"]
    P1["P1 Auth APIs:<br/>sign-in/session/user"]
    P2["P2 DB APIs:<br/>select/update/insert"]
    P3["P3 Storage API:<br/>create signed URL"]
    P4["P4 RPC APIs:<br/>increment counters"]
    O1["Output:<br/>validated session data"]
    O2["Output:<br/>normalized app records"]
    O3["Output:<br/>signed file URL generated"]
    O4["Output:<br/>view/download counters updated"]

    I1 --> P1 --> O1
    I2 --> P2 --> O2
    I3 --> P3 --> O3
    I3 --> P4 --> O4
  end

  classDef module fill:#ffffff,stroke:#3a3a3a,color:#111,stroke-width:1.2px;
  class I1,I2,I3,P1,P2,P3,P4,O1,O2,O3,O4 module;
```

**Figure caption:** Data access HIPO focused on Supabase integration points used by the mobile app: authentication, relational queries, storage URL signing, and RPC-based metric updates.

## Legend

- **Input nodes**: upstream data or user/system events entering a module.
- **Process nodes (P1, P2, ...)**: transformation or control steps inside the module.
- **Output nodes**: user-visible or persisted results produced by each process flow.
