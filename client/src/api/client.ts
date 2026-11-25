const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('cc_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // Auth
  login(credentials: { email: string; password: string }) {
    return this.request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  getMe() {
    return this.request<{ success: boolean; user: any; unreadNotificationsCount: number }>('/auth/me');
  }

  updateProfile(profileData: any) {
    return this.request<{ success: boolean; user: any; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Companies
  getCompanies(params?: { search?: string; tier?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; companies: any[] }>(`/companies?${query}`);
  }

  getCompany(id: string) {
    return this.request<{ success: boolean; company: any }>(`/companies/${id}`);
  }

  createCompany(data: any) {
    return this.request<{ success: boolean; company: any; message: string }>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateCompany(id: string, data: any) {
    return this.request<{ success: boolean; company: any; message: string }>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteCompany(id: string) {
    return this.request<{ success: boolean; message: string }>(`/companies/${id}`, {
      method: 'DELETE',
    });
  }

  // Placements
  getPlacementStats() {
    return this.request<{ success: boolean; statistics: any }>('/placements/statistics');
  }

  getPlacementRecords(params?: { search?: string; batch?: string; department?: string; verified?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; records: any[] }>(`/placements/records?${query}`);
  }

  createPlacementRecord(data: any) {
    return this.request<{ success: boolean; record: any; message: string }>('/placements/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updatePlacementRecord(id: string, data: any) {
    return this.request<{ success: boolean; record: any; message: string }>(`/placements/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deletePlacementRecord(id: string) {
    return this.request<{ success: boolean; message: string }>(`/placements/records/${id}`, {
      method: 'DELETE',
    });
  }

  verifyPlacementRecord(id: string) {
    return this.request<{ success: boolean; record: any; message: string }>(`/placements/records/${id}/verify`, {
      method: 'PATCH',
    });
  }

  // Interview Experiences
  getExperiences(params?: {
    search?: string;
    companyId?: string;
    difficulty?: string;
    outcome?: string;
    batch?: string;
    role?: string;
    interviewType?: string;
  }) {
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') cleanParams[k] = v;
      });
    }
    const query = new URLSearchParams(cleanParams).toString();
    return this.request<{ success: boolean; experiences: any[] }>(`/experiences?${query}`);
  }

  getExperience(id: string) {
    return this.request<{ success: boolean; experience: any }>(`/experiences/${id}`);
  }

  createExperience(data: any) {
    return this.request<{ success: boolean; experience: any; message: string }>('/experiences', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  toggleBookmark(id: string) {
    return this.request<{ success: boolean; isBookmarked: boolean; bookmarkCount?: number; message: string }>(`/experiences/${id}/bookmark`, {
      method: 'POST',
    });
  }

  toggleHelpful(id: string) {
    return this.request<{ success: boolean; isHelpful: boolean; helpfulCount: number }>(`/experiences/${id}/helpful`, {
      method: 'POST',
    });
  }

  getMyBookmarks() {
    return this.request<{ success: boolean; bookmarks: any[] }>('/experiences/my/bookmarks');
  }

  getMySubmittedExperiences() {
    return this.request<{ success: boolean; experiences: any[] }>('/experiences/my/submitted');
  }

  deleteExperience(id: string) {
    return this.request<{ success: boolean; message: string }>(`/experiences/${id}`, {
      method: 'DELETE',
    });
  }

  // Seniors & Questions
  getSeniors(params?: { search?: string; company?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; seniors: any[] }>(`/seniors?${query}`);
  }

  getSenior(id: string) {
    return this.request<{ success: boolean; senior: any }>(`/seniors/${id}`);
  }

  updateSeniorProfile(data: any) {
    return this.request<{ success: boolean; seniorProfile: any; message: string }>('/seniors/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  getQuestions(params?: { seniorId?: string; experienceId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; questions: any[] }>(`/questions?${query}`);
  }

  getReceivedQuestions() {
    return this.request<{ success: boolean; questions: any[] }>('/questions/received');
  }

  getAskedQuestions() {
    return this.request<{ success: boolean; questions: any[] }>('/questions/asked');
  }

  askQuestion(data: { seniorId: string; title: string; content: string; experienceId?: string }) {
    return this.request<{ success: boolean; question: any; message: string }>('/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  answerQuestion(questionId: string, content: string) {
    return this.request<{ success: boolean; answer: any; message: string }>(`/questions/${questionId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Resources
  getResources(params?: { search?: string; category?: string; difficulty?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; resources: any[] }>(`/resources?${query}`);
  }

  createResource(data: any) {
    return this.request<{ success: boolean; resource: any; message: string }>('/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  deleteResource(id: string) {
    return this.request<{ success: boolean; message: string }>(`/resources/${id}`, {
      method: 'DELETE',
    });
  }

  // Notifications
  getNotifications() {
    return this.request<{ success: boolean; unreadCount: number; notifications: any[] }>('/notifications');
  }

  markNotificationRead(id: string) {
    return this.request<{ success: boolean; message: string }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  markAllNotificationsRead() {
    return this.request<{ success: boolean; message: string }>('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  deleteNotification(id: string) {
    return this.request<{ success: boolean; message: string }>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin
  getAdminMetrics() {
    return this.request<{ success: boolean; metrics: any }>('/admin/metrics');
  }

  getAdminUsers(params?: { role?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; users: any[] }>(`/admin/users?${query}`);
  }

  updateUserRole(userId: string, role: string) {
    return this.request<{ success: boolean; message: string; user: any }>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  getModerationQueue() {
    return this.request<{ success: boolean; experiences: any[] }>('/admin/moderation');
  }

  moderateExperience(id: string, status: string, reason?: string) {
    return this.request<{ success: boolean; message: string; experience: any }>(`/admin/moderation/experience/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  }

  getCollegeInfo() {
    return this.request<{ success: boolean; college: any }>('/admin/college');
  }

  updateCollegeInfo(data: any) {
    return this.request<{ success: boolean; message: string; college: any }>('/admin/college', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Placement Readiness Tracker
  getReadiness() {
    return this.request<{ success: boolean; readiness: any }>('/readiness');
  }

  updateReadiness(data: {
    aptitude: number;
    dsa: number;
    coreCs: number;
    communication: number;
    resumePreparation: number;
  }) {
    return this.request<{ success: boolean; message: string; readiness: any }>('/readiness', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Placement Application Tracker
  getApplications(params?: { status?: string; search?: string }) {
    const clean: Record<string, string> = {};
    if (params?.status) clean.status = params.status;
    if (params?.search) clean.search = params.search;
    const query = new URLSearchParams(clean).toString();
    return this.request<{ success: boolean; applications: any[] }>(`/applications?${query}`);
  }

  createApplication(data: any) {
    return this.request<{ success: boolean; message: string; application: any }>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateApplication(id: string, data: any) {
    return this.request<{ success: boolean; message: string; application: any }>(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteApplication(id: string) {
    return this.request<{ success: boolean; message: string }>(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  // Practice Zone
  getPracticeQuestions(params?: { category?: string; difficulty?: string }) {
    const clean: Record<string, string> = {};
    if (params?.category) clean.category = params.category;
    if (params?.difficulty) clean.difficulty = params.difficulty;
    const query = new URLSearchParams(clean).toString();
    return this.request<{ success: boolean; questions: any[]; stats: any }>(`/practice/questions?${query}`);
  }

  submitPracticeAttempt(questionId: string, selectedIdx: number) {
    return this.request<{ success: boolean; isCorrect: boolean; correctIdx: number; explanation: string }>('/practice/attempt', {
      method: 'POST',
      body: JSON.stringify({ questionId, selectedIdx }),
    });
  }

  // Senior Mentorship
  getMyMentorshipRequests() {
    return this.request<{ success: boolean; requests: any[] }>('/mentorship/my');
  }

  getReceivedMentorshipRequests() {
    return this.request<{ success: boolean; requests: any[] }>('/mentorship/received');
  }

  createMentorshipRequest(data: { seniorId: string; topic: string; message: string }) {
    return this.request<{ success: boolean; message: string; request: any }>('/mentorship', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  respondToMentorshipRequest(id: string, status: 'ACCEPTED' | 'DECLINED', responseNote?: string) {
    return this.request<{ success: boolean; message: string; request: any }>(`/mentorship/${id}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ status, responseNote }),
    });
  }

  // Placement Analytics
  getPlacementAnalytics() {
    return this.request<{ success: boolean; analytics: any }>('/placements/analytics');
  }
}

export const api = new ApiClient();
