export interface SessionUser {
    id: string;
    name: string;
    email: string;
    roleId: string;
    department: string;
    departmentId?: string | null;
    isActive: boolean;
    permissions: string[];
}

export interface LoginResponseUser {
    id: string;
    name: string;
    email: string;
    roleId: string;
    departmentId?: string | null;
    isActive: boolean;
    permissions: string[];
}

export interface LoginResponse {
    accessToken: string;
    tokenType: string;
    expiresAt: string;
    user: LoginResponseUser;
}

export interface AuthSession {
    user: SessionUser;
    token: string;
    loggedInAt: string;
    expiresAt: string;
}