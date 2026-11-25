/**
 * In-browser stand-in for the Express/Prisma backend.
 *
 * Reads are served from fixtures.json (a snapshot of the real seeded API
 * responses for each of the 4 demo roles). Writes mutate an in-memory copy
 * that is persisted to localStorage, so changes survive a refresh on the
 * same device.
 */
import { findCredential, DemoRole } from '../credentials/accounts';

type Json = any;
type Store = Record<string, Json>;

const STORAGE_KEY = 'cc_mock_state_v1';
const TOKEN_PREFIX = 'mock-token:';

let fixtures: Record<string, Store> | null = null;
let state: Record<string, Store> | null = null;

async function load(): Promise<Record<string, Store>> {
  if (state) return state;
  const mod: any = await import('./data/fixtures.json');
  fixtures = mod.default || mod;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      state = JSON.parse(saved);
      return state!;
    }
  } catch {
    /* storage unavailable — fall through to fresh copy */
  }
  state = JSON.parse(JSON.stringify(fixtures));
  return state!;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

export function resetMockState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  state = null;
}

class MockError extends Error {}
const fail = (message: string): never => {
  throw new MockError(message);
};

const uid = () => 'mock_' + Math.random().toString(36).slice(2, 12);
const now = () => new Date().toISOString();
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

function roleFromToken(): DemoRole | null {
  try {
    const t = localStorage.getItem('cc_token');
    if (t && t.startsWith(TOKEN_PREFIX)) return t.slice(TOKEN_PREFIX.length) as DemoRole;
  } catch {
    /* ignore */
  }
  return null;
}

/** Generic query-string filtering for list endpoints. */
function filterList(list: Json[], query: URLSearchParams): Json[] {
  let out = list;
  query.forEach((value, key) => {
    if (!value || value === 'All' || value === 'ALL') return;
    const v = value.toLowerCase();
    if (key === 'search') {
      out = out.filter((item) => JSON.stringify(item).toLowerCase().includes(v));
    } else if (key === 'verified') {
      out = out.filter((item) => String(item.isVerified) === value);
    } else {
      out = out.filter((item) => {
        if (!(key in item)) return true;
        return String(item[key]).toLowerCase() === v;
      });
    }
  });
  return out;
}

function listKey(store: Store, path: string, key: string): Json[] {
  return store[path]?.[key] || [];
}

export async function mockRequest<T>(
  endpoint: string,
  method: string,
  body: any
): Promise<T> {
  const all = await load();
  const [path, qs = ''] = endpoint.split('?');
  const query = new URLSearchParams(qs);

  // ---- Login (checked against src/credentials/accounts.ts) ----
  if (path === '/auth/login' && method === 'POST') {
    const cred = findCredential(body?.email || '', body?.password || '');
    if (!cred) fail('Invalid email or password.');
    const user = all[cred!.role].login;
    return { success: true, token: TOKEN_PREFIX + cred!.role, user } as T;
  }

  const role = roleFromToken();
  if (!role || !all[role]) fail('Not authenticated. Please sign in again.');
  const store = all[role!];
  const me = store.login;

  const done = (data: Json) => {
    persist();
    return clone(data) as T;
  };

  // ---------------------------- READS ----------------------------
  if (method === 'GET') {
    if (path === '/auth/me') {
      return clone({
        success: true,
        user: me,
        unreadNotificationsCount: store['/notifications']?.unreadCount ?? 0,
      }) as T;
    }
    const data = store[path];
    if (!data) {
      // Roles that lack an endpoint (e.g. admin routes for students) get a 403, like the real API.
      fail('Access denied or endpoint unavailable for this account.');
    }
    const res = clone(data);
    const listProps = [
      'companies', 'records', 'experiences', 'bookmarks', 'seniors', 'questions',
      'resources', 'users', 'applications', 'requests',
    ];
    for (const p of listProps) {
      if (Array.isArray(res[p]) && qs) {
        res[p] = filterList(res[p], query);
        if ('count' in res) res.count = res[p].length;
      }
    }
    return res as T;
  }

  // --------------------------- WRITES ----------------------------
  let m: RegExpMatchArray | null;

  // Profile
  if (path === '/auth/profile' && method === 'PUT') {
    Object.assign(me, body, { updatedAt: now() });
    if (store['/auth/me']) store['/auth/me'].user = me;
    return done({ success: true, user: me, message: 'Profile updated successfully.' });
  }

  // Companies
  if (path === '/companies' && method === 'POST') {
    const company = { id: uid(), collegeId: me.collegeId, createdAt: now(), updatedAt: now(), _count: {}, ...body };
    store['/companies'].companies.unshift(company);
    store['/companies/' + company.id] = { success: true, company };
    return done({ success: true, company, message: 'Company created successfully.' });
  }
  if ((m = path.match(/^\/companies\/([^/]+)$/))) {
    const id = m[1];
    const list = listKey(store, '/companies', 'companies');
    const idx = list.findIndex((c) => c.id === id);
    if (idx < 0) fail('Company not found.');
    if (method === 'PUT') {
      list[idx] = { ...list[idx], ...body, updatedAt: now() };
      if (store['/companies/' + id]) Object.assign(store['/companies/' + id].company, list[idx]);
      return done({ success: true, company: list[idx], message: 'Company updated successfully.' });
    }
    if (method === 'DELETE') {
      list.splice(idx, 1);
      delete store['/companies/' + id];
      return done({ success: true, message: 'Company deleted successfully.' });
    }
  }

  // Placement records
  if (path === '/placements/records' && method === 'POST') {
    const company = listKey(store, '/companies', 'companies').find((c) => c.id === body.companyId);
    const record = {
      id: uid(), collegeId: me.collegeId, isVerified: false, createdAt: now(), updatedAt: now(),
      ...body,
      company: company ? { id: company.id, name: company.name, tier: company.tier, logo: company.logo } : undefined,
    };
    store['/placements/records'].records.unshift(record);
    store['/placements/records'].count = store['/placements/records'].records.length;
    return done({ success: true, record, message: 'Placement record added.' });
  }
  if ((m = path.match(/^\/placements\/records\/([^/]+)(\/verify)?$/))) {
    const list = listKey(store, '/placements/records', 'records');
    const idx = list.findIndex((r) => r.id === m![1]);
    if (idx < 0) fail('Placement record not found.');
    if (m[2] && method === 'PATCH') {
      list[idx] = { ...list[idx], isVerified: true, verifiedBy: me.name, updatedAt: now() };
      return done({ success: true, record: list[idx], message: 'Record verified.' });
    }
    if (method === 'PUT') {
      list[idx] = { ...list[idx], ...body, updatedAt: now() };
      return done({ success: true, record: list[idx], message: 'Record updated.' });
    }
    if (method === 'DELETE') {
      list.splice(idx, 1);
      store['/placements/records'].count = list.length;
      return done({ success: true, message: 'Record deleted.' });
    }
  }

  // Experiences
  if (path === '/experiences' && method === 'POST') {
    const company = listKey(store, '/companies', 'companies').find((c) => c.id === body.companyId);
    const experience = {
      id: uid(), collegeId: me.collegeId, authorId: me.id, helpfulCount: 0, status: 'PENDING',
      isVerified: false, createdAt: now(), updatedAt: now(), bookmarks: [], helpfulVotes: [],
      _count: { questions: 0, bookmarks: 0, helpfulVotes: 0 }, isBookmarked: false, isHelpful: false,
      rounds: [], ...body,
      company: company ? { id: company.id, name: company.name, logo: company.logo, tier: company.tier } : undefined,
      author: { id: me.id, name: me.name, avatar: me.avatar, department: me.department, batch: me.batch },
    };
    if (Array.isArray(body.rounds)) {
      experience.rounds = body.rounds.map((r: any, i: number) => ({ id: uid(), experienceId: experience.id, roundNumber: i + 1, ...r }));
    }
    (store['/experiences/my/submitted'] ||= { success: true, experiences: [] }).experiences.unshift(experience);
    return done({ success: true, experience, message: 'Experience submitted for review.' });
  }
  if ((m = path.match(/^\/experiences\/([^/]+)\/(bookmark|helpful)$/)) && method === 'POST') {
    const [, id, kind] = m;
    const exps = [
      ...listKey(store, '/experiences', 'experiences'),
      store['/experiences/' + id]?.experience,
    ].filter(Boolean);
    const target = exps.find((e) => e.id === id);
    if (!target) fail('Experience not found.');
    const flag = kind === 'bookmark' ? 'isBookmarked' : 'isHelpful';
    const next = !target[flag];
    exps.filter((e) => e.id === id).forEach((e) => {
      e[flag] = next;
      if (kind === 'helpful') e.helpfulCount = Math.max(0, (e.helpfulCount || 0) + (next ? 1 : -1));
    });
    if (kind === 'bookmark') {
      const bm = (store['/experiences/my/bookmarks'] ||= { success: true, bookmarks: [] });
      bm.bookmarks = bm.bookmarks.filter((b: any) => b.id !== id);
      if (next) bm.bookmarks.unshift(clone(target));
      return done({ success: true, isBookmarked: next, message: next ? 'Bookmarked.' : 'Bookmark removed.' });
    }
    return done({ success: true, isHelpful: next, helpfulCount: target.helpfulCount });
  }
  if ((m = path.match(/^\/experiences\/([^/]+)$/)) && method === 'DELETE') {
    for (const k of ['/experiences', '/experiences/my/submitted']) {
      const prop = 'experiences';
      if (store[k]?.[prop]) store[k][prop] = store[k][prop].filter((e: any) => e.id !== m![1]);
    }
    delete store['/experiences/' + m[1]];
    return done({ success: true, message: 'Experience deleted.' });
  }

  // Questions
  if (path === '/questions' && method === 'POST') {
    const senior = listKey(store, '/seniors', 'seniors').find((s) => s.id === body.seniorId);
    const question = {
      id: uid(), studentId: me.id, isAnswered: false, createdAt: now(), updatedAt: now(), answers: [], ...body,
      senior: senior && { id: senior.id, name: senior.name, avatar: senior.avatar, seniorProfile: senior.seniorProfile },
    };
    (store['/questions/asked'] ||= { success: true, questions: [] }).questions.unshift(question);
    (store['/questions'] ||= { success: true, questions: [] }).questions.unshift(question);
    return done({ success: true, question, message: 'Question sent to senior.' });
  }
  if ((m = path.match(/^\/questions\/([^/]+)\/answers$/)) && method === 'POST') {
    const answer = {
      id: uid(), questionId: m[1], authorId: me.id, content: body.content, createdAt: now(), updatedAt: now(),
      author: { id: me.id, name: me.name, avatar: me.avatar },
    };
    for (const k of ['/questions', '/questions/received', '/questions/asked']) {
      const q = store[k]?.questions?.find((x: any) => x.id === m![1]);
      if (q) {
        q.answers = [...(q.answers || []), answer];
        q.isAnswered = true;
      }
    }
    return done({ success: true, answer, message: 'Answer posted.' });
  }

  // Seniors
  if (path === '/seniors/profile' && method === 'PUT') {
    const list = listKey(store, '/seniors', 'seniors');
    const self = list.find((s) => s.id === me.id);
    const profile = { ...(self?.seniorProfile || me.seniorProfile || {}), ...body };
    if (self) self.seniorProfile = profile;
    me.seniorProfile = profile;
    return done({ success: true, seniorProfile: profile, message: 'Senior profile updated.' });
  }

  // Resources
  if (path === '/resources' && method === 'POST') {
    const resource = { id: uid(), collegeId: me.collegeId, createdAt: now(), updatedAt: now(), company: null, ...body };
    store['/resources'].resources.unshift(resource);
    store['/resources'].count = store['/resources'].resources.length;
    return done({ success: true, resource, message: 'Resource added.' });
  }
  if ((m = path.match(/^\/resources\/([^/]+)$/)) && method === 'DELETE') {
    const r = store['/resources'];
    r.resources = r.resources.filter((x: any) => x.id !== m![1]);
    r.count = r.resources.length;
    return done({ success: true, message: 'Resource deleted.' });
  }

  // Notifications
  if (store['/notifications']) {
    const n = store['/notifications'];
    const recount = () => (n.unreadCount = n.notifications.filter((x: any) => !x.isRead).length);
    if (path === '/notifications/read-all' && method === 'PATCH') {
      n.notifications.forEach((x: any) => (x.isRead = true));
      recount();
      return done({ success: true, message: 'All notifications marked as read.' });
    }
    if ((m = path.match(/^\/notifications\/([^/]+)\/read$/)) && method === 'PATCH') {
      const x = n.notifications.find((y: any) => y.id === m![1]);
      if (x) x.isRead = true;
      recount();
      return done({ success: true, message: 'Notification marked as read.' });
    }
    if ((m = path.match(/^\/notifications\/([^/]+)$/)) && method === 'DELETE') {
      n.notifications = n.notifications.filter((y: any) => y.id !== m![1]);
      recount();
      return done({ success: true, message: 'Notification deleted.' });
    }
  }

  // Readiness
  if (path === '/readiness' && method === 'PUT') {
    const r = store['/readiness'].readiness;
    Object.assign(r, body, { updatedAt: now() });
    r.overallPercentage = Math.round(
      (r.aptitude + r.dsa + r.coreCs + r.communication + r.resumePreparation) / 5
    );
    return done({ success: true, message: 'Readiness updated.', readiness: r });
  }

  // Applications
  if (path === '/applications' && method === 'POST') {
    const application = {
      id: uid(), userId: me.id, collegeId: me.collegeId, createdAt: now(), updatedAt: now(),
      applicationDate: now(), interviewDate: null, applicationLink: null, notes: null, ...body,
    };
    const a = (store['/applications'] ||= { success: true, applications: [] });
    a.applications.unshift(application);
    a.count = a.applications.length;
    return done({ success: true, message: 'Application added.', application });
  }
  if ((m = path.match(/^\/applications\/([^/]+)$/))) {
    const a = store['/applications'];
    const idx = a?.applications.findIndex((x: any) => x.id === m![1]);
    if (idx == null || idx < 0) fail('Application not found.');
    if (method === 'PUT') {
      a.applications[idx] = { ...a.applications[idx], ...body, updatedAt: now() };
      return done({ success: true, message: 'Application updated.', application: a.applications[idx] });
    }
    if (method === 'DELETE') {
      a.applications.splice(idx, 1);
      a.count = a.applications.length;
      return done({ success: true, message: 'Application deleted.' });
    }
  }

  // Practice zone
  if (path === '/practice/attempt' && method === 'POST') {
    const pq = store['/practice/questions'];
    const q = pq.questions.find((x: any) => x.id === body.questionId);
    if (!q) fail('Question not found.');
    const isCorrect = body.selectedIdx === q.correctIdx;
    const prev = q.userAttempt;
    q.userAttempt = { id: prev?.id || uid(), questionId: q.id, selectedIdx: body.selectedIdx, isCorrect, createdAt: now() };
    const s = pq.stats;
    s.attemptedCount = pq.questions.filter((x: any) => x.userAttempt).length;
    s.correctCount = pq.questions.filter((x: any) => x.userAttempt?.isCorrect).length;
    s.accuracy = s.attemptedCount ? Math.round((s.correctCount / s.attemptedCount) * 100) : 0;
    s.categoryStats.forEach((c: any) => {
      const qs = pq.questions.filter((x: any) => x.category === c.category);
      c.attempted = qs.filter((x: any) => x.userAttempt).length;
      c.correct = qs.filter((x: any) => x.userAttempt?.isCorrect).length;
    });
    return done({ success: true, isCorrect, correctIdx: q.correctIdx, explanation: q.explanation });
  }

  // Mentorship
  if (path === '/mentorship' && method === 'POST') {
    const senior = listKey(store, '/seniors', 'seniors').find((s) => s.id === body.seniorId);
    const request = {
      id: uid(), studentId: me.id, status: 'PENDING', responseNote: null, createdAt: now(), updatedAt: now(), ...body,
      senior: senior && { id: senior.id, name: senior.name, avatar: senior.avatar, department: senior.department, batch: senior.batch, seniorProfile: senior.seniorProfile },
    };
    (store['/mentorship/my'] ||= { success: true, requests: [] }).requests.unshift(request);
    return done({ success: true, message: 'Mentorship request sent.', request });
  }
  if ((m = path.match(/^\/mentorship\/([^/]+)\/respond$/)) && method === 'PATCH') {
    const r = store['/mentorship/received']?.requests.find((x: any) => x.id === m![1]);
    if (!r) fail('Request not found.');
    Object.assign(r, { status: body.status, responseNote: body.responseNote ?? null, updatedAt: now() });
    return done({ success: true, message: `Request ${String(body.status).toLowerCase()}.`, request: r });
  }

  // Admin
  if ((m = path.match(/^\/admin\/users\/([^/]+)\/role$/)) && method === 'PATCH') {
    const u = store['/admin/users']?.users.find((x: any) => x.id === m![1]);
    if (!u) fail('User not found.');
    u.role = body.role;
    return done({ success: true, message: 'User role updated.', user: u });
  }
  if ((m = path.match(/^\/admin\/moderation\/experience\/([^/]+)$/)) && method === 'PATCH') {
    const q = store['/admin/moderation'];
    const idx = q?.experiences.findIndex((x: any) => x.id === m![1]);
    if (idx == null || idx < 0) fail('Experience not found.');
    const exp = q.experiences[idx];
    exp.status = body.status;
    exp.isVerified = body.status === 'APPROVED';
    q.experiences.splice(idx, 1);
    if (store['/admin/metrics']?.metrics) {
      store['/admin/metrics'].metrics.pendingExperiencesCount = q.experiences.length;
    }
    return done({ success: true, message: `Experience ${String(body.status).toLowerCase()}.`, experience: exp });
  }
  if (path === '/admin/college' && method === 'PUT') {
    const c = store['/admin/college'];
    c.college = { ...c.college, ...body };
    return done({ success: true, message: 'College info updated.', college: c.college });
  }

  fail(`Not available in demo mode: ${method} ${path}`);
  return undefined as never;
}
