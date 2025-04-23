import axios from 'axios';

// Base API instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://dansaviourbooks.onrender.com/api',
  withCredentials: true, // Include cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ErrorResponse {
  msg: string;
}

function handleError(error: unknown): never {
  if (axios.isAxiosError(error) && error.response) {
    console.error('API Error:', error.response.data);
    const data = error.response.data as ErrorResponse;
    throw new Error(data?.msg || 'API Error');
  }
  throw new Error('Network or unknown error');
}


// ========== Auth ==========
export interface LoginData {
  username: string;
  password: string;
}

export interface SessionUser {
  id: string;
  username: string;
  role: string;
}

interface LoginResponse {
  msg: string;
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
}

export async function login(data: LoginData): Promise<SessionUser> {
  try {
    const resp = await api.post<LoginResponse>('/auth/login', data);
    // Store the token (e.g., in localStorage or cookies)
    localStorage.setItem('accessToken', resp.data.accessToken);
    localStorage.setItem('refreshToken', resp.data.refreshToken);
    return resp.data.user;
  } catch (err) {
    handleError(err);
  }
}

export async function logout(): Promise<void> {
  try {
    // Clear stored tokens on logout
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    await api.post('/auth/logout');
  } catch (err) {
    handleError(err);
  }
}

// Function to get the current user
export async function getCurrentUser(): Promise<SessionUser> {
  try {
    // Get the token from localStorage (or from cookies, depending on your preference)
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      // Attach token to Authorization header for authenticated requests
      api.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const resp = await api.get<SessionUser>('/auth/me');
    return resp.data;
  } catch (err) {
    handleError(err);
  }
}


// ========== Clients ==========
export interface Client {
  _id: string;
  name: string;
  phone: string;
  location: string;
  gross_commission: number;
  wins_commission: number;
  is_active: boolean;
}

export interface CreateClientData {
  name: string;
  phone: string;
  location: string;
  gross_commission: number;
  wins_commission: number;
}

export async function fetchClients(): Promise<Client[]> {
  try {
    const resp = await api.get<Client[]>('/clients');
    return resp.data;
  } catch (err) {
    handleError(err);
  }
}

export async function fetchClient(id: string): Promise<Client> {
  try {
    const resp = await api.get<Client>(`/clients/${id}`);
    return resp.data;
  } catch (err) {
    handleError(err);
  }
}

export async function createClient(data: CreateClientData): Promise<Client> {
  try {
    const resp = await api.post<Client>('/clients', data);
    return resp.data;
  } catch (err) {
    handleError(err);
  }
}

export async function updateClient(
  id: string,
  data: CreateClientData & { is_active: boolean }
): Promise<Client> {
  try {
    const resp = await api.put<Client>(`/clients/${id}`, data);
    return resp.data;
  } catch (err) {
    console.error("Error updating client:", err);
    throw new Error("Failed to update client.");
  }
}

export async function getClientStatements(clientId: string): Promise<Statement[]> {
  try {
    const res = await api.get<Statement[]>(`/clients/${clientId}/statements`);
    return res.data;
  } catch (err) {
    handleError(err);
  }
}

// ========== Employees ==========
export interface Employee {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  status: string;
  hire_date: Date;
  salary: number;
}

export interface CreateEmployeeData {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  status: string;
  hire_date: Date;
  salary: number;
}


export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const resp = await api.get('/employees');
    return resp.data.data;
  } catch (err) {
    handleError(err);
    throw err;
  }
}


export async function createEmployee(data: CreateEmployeeData): Promise<Employee> {
  try {
    const resp = await api.post<Employee>('/employees', data);
    return resp.data;
  } catch (err) {
    handleError(err);
  }
}

export async function updateEmployee(employeeId: string, data: CreateEmployeeData): Promise<Employee> {
  try {
    const resp = await api.put<Employee>(`/employees/${employeeId}`, data);
    return resp.data;
  } catch (err) {
    handleError(err);
  }
}


// ========== Statements ==========
export interface Statement {
  _id: string;
  client: Client | string;
  gross: number;
  wins: number;
  net: number;
  wins_commission_total: number;
  balance_office: number;
  balance_client: number;
  prev_balance_office: number;
  prev_balance_client: number;
  cash_received: number;
  cash_paid: number;
  expenses?: number;
  final_receivable: number;
  final_payable: number;
  start_date: string;
  due_date: string;
}

export interface DailySalesInput {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface StatementWithSales extends Statement {
  dailySales: DailySalesInput;
}

export type CreateStatementData = {
  client: string;
  wins: number;
  cash_received: number;
  cash_paid: number;
  expenses?: number;
  dailySales: DailySalesInput;
  start_date: string;
  due_date: string;
};

export async function fetchStatements(clientId?: string): Promise<Statement[]> {
  try {
    const url = clientId ? `/statements?client=${clientId}` : '/statements';
    const resp = await api.get<Statement[]>(url);
    return resp.data;
  } catch (err) {
    handleError(err);
  }
}

export async function createStatement(data: CreateStatementData): Promise<Statement> {
  try {
    const resp = await api.post<Statement>('/statements', data);
    return resp.data;
  } catch (err) {
    handleError(err);
  }
}

export async function updateStatement(statementId: string, data: CreateStatementData): Promise<Statement> {
  try {
    const resp = await api.put<Statement>(`/statements/${statementId}`, data);
    return resp.data;
  } catch (err) {
    handleError(err);
  }
}

export async function fetchStatementWithSales(
  clientId: string,
  statementId: string
): Promise<StatementWithSales> {
  try {
    const response = await api.get<StatementWithSales>(`/statements/${clientId}/statements/${statementId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export const getStatementDetails = async (statementId: string): Promise<StatementWithSales> => {
  try {
    const response = await api.get<StatementWithSales>(`/statements/${statementId}`);
    return response.data;
  } catch (err) {
    handleError(err);
  }
};


// ========== Reports ==========
export interface Report {
  _id: string;
  client: string;
  clientName: string;
  period_type: string;
  period: string;
  total_gross: number;
  total_wins: number;
  total_net: number;
  total_wins_commission: number;
  total_balance_office: number;
  total_balance_client: number;
  generated_at: string;
  notes: string;
}


// export async function fetchReport(clientId: string, period: string): Promise<Report> {
//     try {
//         const resp = await api.get<Report>(`/reports/${clientId}/${period}`);
//         return resp.data;
//     } catch (err) {
//         handleError(err);
//     }
// }

export async function fetchAllReports(): Promise<Report[]> {
  try {
    const resp = await api.get<Report[]>('/reports');
    return resp.data;
  } catch (err) {
    handleError(err);
    return [];
  }
}


export type CreateReportData = {
  client: string;
  period_type: 'monthly' | 'yearly';
  period: string;
  notes?: string;
};

export async function createReport(data: CreateReportData): Promise<Report> {
  try {
    const resp = await api.post<Report>('/reports', data);
    return resp.data;
  } catch (err) {
    // Rethrow so the component can handle it
    throw err;
  }
}

export const getReportById = async (id: string): Promise<Report> => {
  try {
    const response = await api.get<Report>(`/reports/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (err) {
    handleError(err);
  }
};



export default api;