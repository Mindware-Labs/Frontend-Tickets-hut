// Authentication Service
// Handles all authentication-related operations with the backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface LoginResponse {
    message: string;
    accessToken: string;
    user: {
        id: number;
        name: string;
        lastName: string;
        email: string;
    };
}

interface RegisterData {
    name: string;
    lastName: string;
    email: string;
    password: string;
}

export const auth = {
    /**
     * Login user with email and password
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Login failed' }));
            throw new Error(error.message || 'Invalid credentials');
        }

        const data: LoginResponse = await response.json();

        // Store token and user data
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', data.accessToken);
            localStorage.setItem('user_data', JSON.stringify(data.user));

            // Also set cookie for middleware compatibility
            document.cookie = `auth-token=${data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
        }

        return data;
    },

    /**
     * Register new user
     */
    async register(data: RegisterData): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Registration failed' }));
            throw new Error(error.message || 'Registration failed');
        }

        const result: LoginResponse = await response.json();

        // Store token and user data
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', result.accessToken);
            localStorage.setItem('user_data', JSON.stringify(result.user));

            // Also set cookie for middleware compatibility
            document.cookie = `auth-token=${result.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
        }

        return result;
    },

    /**
     * Logout user
     */
    logout(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');

            // Clear cookie
            document.cookie = 'auth-token=; path=/; max-age=0';
        }
    },

    /**
     * Get stored JWT token
     */
    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    },

    /**
     * Get stored user data
     */
    getUser(): LoginResponse['user'] | null {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('user_data');
            return userData ? JSON.parse(userData) : null;
        }
        return null;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.getToken();
    },

    /**
     * Get user profile from backend (validates token)
     */
    async getProfile(): Promise<LoginResponse['user']> {
        const token = this.getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            // Token is invalid, clear it
            this.logout();
            throw new Error('Session expired');
        }

        return response.json();
    },
};
