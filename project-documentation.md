

## 1. System Overview

CampusConnect resolves the critical problem of fragmented placement information in university campuses. Typically, placement statistics are distributed across WhatsApp groups, word-of-mouth conversations, and informal spreadsheets. Juniors lack transparent access to company hiring rounds, compensation breakdowns, and preparation advice.

CampusConnect provides:
1. **Centralized Placement Intelligence:** Verified placement records, batch statistics, salary ranges in LPA, and hiring company requirements.
2. **Senior Connect:** A structured knowledge-sharing portal where placed alumni publish round-by-round interview experiences and answer student questions.
3. **Curated Preparation Sheets:** Targeted study materials covering DSA, System Design, Core CS, Aptitude, and HR interviews.
4. **Administrative Verification & Moderation:** Controls for placement officers to approve records, verify offers, and moderate submitted content.

---

## 2. Relational Database Architecture

The system uses a relational architecture with **15 core models** configured via **Prisma ORM**:

```
+---------------------------------------------------------------------------------+
|                                    College                                      |
|  - id, name, code (MCU-IND), address, website, departments, placementEmail      |
+----------------------------------------+----------------------------------------+
                                         | 1:N
     +-----------------------------------+-----------------------------------+
     |                                   |                                   |
     v                                   v                                   v
+---------+                        +-----------+                    +-----------------+
|  User   |                        |  Company  |                    | PlacementRecord |
+----+----+                        +-----+-----+                    +-----------------+
     |                                   |
     +------------+                      |
     | 1:1        | 1:N                  | 1:N
     v            v                      v
+-------------+ +-----------------------------+
|SeniorProfile| |     InterviewExperience     |
+-------------+ +--------------+--------------+
                               | 1:N
                               v
                        +--------------+
                        |InterviewRound|
                        +--------------+
```

### Models Defined:
1. **`College`:** Multi-tenant institution space.
2. **`User`:** Identity records with hashed passwords and role authorizations.
3. **`SeniorProfile`:** Extended mentorship details (current employer, role, package, bio, LinkedIn).
4. **`Company`:** Visiting recruiters with criteria, CTC brackets, and status.
5. **`PlacementRecord`:** Individual verified student offers with student name, roll number, and CTC.
6. **`PlacementStatistic`:** Pre-aggregated batch analytics for rapid chart rendering.
7. **`InterviewExperience`:** Structured senior contribution with difficulty, outcome, and advice.
8. **`InterviewRound`:** Dynamic round-wise breakdowns (OA, Technical 1, LLD, HR).
9. **`Question`:** Questions asked by students to seniors.
10. **`Answer`:** Responses submitted by seniors.
11. **`Bookmark`:** Saved experiences per student.
12. **`Resource`:** Curated preparation roadmaps and links.
13. **`Notification`:** Real-time in-app alerts.
14. **`ModerationRecord`:** Audit trail of approved/rejected content.
15. **`AuditLog`:** Security logs of authentication and admin changes.

---

## 3. Role-Based Access Control (RBAC)

| Capability | Student | Senior | Placement Admin | System Admin |
|---|:---:|:---:|:---:|:---:|
| View Placement Overview & Charts | Yes | Yes | Yes | Yes |
| Search Companies & Criteria | Yes | Yes | Yes | Yes |
| Read Interview Rounds | Yes | Yes | Yes | Yes |
| Bookmark Experiences | Yes | Yes | Yes | Yes |
| Ask Questions to Seniors | Yes | - | - | - |
| Publish Interview Rounds | - | Yes | Yes | Yes |
| Answer Junior Questions | - | Yes | Yes | Yes |
| Add / Verify Placement Records | - | - | Yes | Yes |
| Register Visiting Companies | - | - | Yes | Yes |
| Moderate Content | - | - | Yes | Yes |
| Assign User Roles | - | - | - | Yes |
| Configure College Settings | - | - | - | Yes |

---

## 4. API Endpoints Catalog

- **Authentication:**
  - `POST /api/auth/login` — Authenticate and issue JWT.
  - `GET /api/auth/me` — Retrieve active session profile.
  - `PUT /api/auth/profile` — Update phone, bio, and branch.
- **Placement & Companies:**
  - `GET /api/placements/statistics` — Aggregate batch stats and department breakdown.
  - `GET /api/placements/records` — Search verified offers.
  - `POST /api/placements/records` — Create offer record (Admin).
  - `PATCH /api/placements/records/:id/verify` — Verify offer record.
  - `GET /api/companies` — Filter recruiters by tier/status.
  - `POST /api/companies` — Register recruiter (Admin).
- **Senior Connect & Experiences:**
  - `GET /api/experiences` — Search interview stories.
  - `POST /api/experiences` — Publish new multi-round experience.
  - `POST /api/experiences/:id/bookmark` — Toggle bookmark.
  - `GET /api/seniors` — Directory of active senior mentors.
  - `POST /api/questions` — Submit question to senior.
  - `POST /api/questions/:id/answers` — Post answer to question.
- **Resources & Notifications:**
  - `GET /api/resources` — Filter prep materials.
  - `GET /api/notifications` — Fetch user alerts.
  - `PATCH /api/notifications/read-all` — Mark alerts read.
- **Administration:**
  - `GET /api/admin/metrics` — High-level platform health.
  - `GET /api/admin/users` — User management directory.
  - `PATCH /api/admin/users/:id/role` — Update user role (Super Admin).
  - `GET /api/admin/moderation` — Content review queue.
