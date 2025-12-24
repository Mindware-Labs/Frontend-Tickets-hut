'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link. No token provided.');
            return;
        }

        verifyEmail(token);
    }, [token]);

    const verifyEmail = async (token: string) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            // Read response as text first to avoid parsing issues
            const responseText = await response.text();
            let data: any;

            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                // If JSON parsing fails, use the text as error message
                if (!response.ok) {
                    throw new Error(responseText || 'Verification failed. Invalid response from server.');
                }
                data = { message: responseText || 'Email verified successfully!' };
            }

            if (response.ok) {
                setStatus('success');
                setMessage(data.message || 'Email verified successfully!');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setStatus('error');
                // Handle NestJS error format
                const errorMessage = data.message || 
                    (Array.isArray(data.message) ? data.message.join(', ') : null) ||
                    data.error ||
                    'Verification failed. The link may be invalid or expired.';
                setMessage(errorMessage);
            }
        } catch (error: any) {
            console.error('Verification error:', error);
            setStatus('error');
            
            // Handle specific error cases
            let errorMessage = 'An error occurred during verification. Please try again.';
            
            if (error instanceof TypeError && error.message.includes('fetch')) {
                errorMessage = 'Unable to connect to the server. Please ensure the backend is running and try again.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setMessage(errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                        {status === 'loading' && (
                            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                        )}
                        {status === 'success' && (
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        )}
                        {status === 'error' && (
                            <XCircle className="h-16 w-16 text-red-500" />
                        )}
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        {status === 'loading' && 'Verifying Email...'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-slate-300">
                        {message}
                    </p>

                    {status === 'success' && (
                        <div className="space-y-2">
                            <p className="text-sm text-slate-400">
                                Redirecting to login page in 3 seconds...
                            </p>
                            <Button
                                onClick={() => router.push('/login')}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                            >
                                Go to Login Now
                            </Button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-2">
                            <Button
                                onClick={() => router.push('/login')}
                                variant="outline"
                                className="w-full"
                            >
                                Back to Login
                            </Button>
                            <p className="text-xs text-slate-500">
                                Need help? Contact support
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                </div>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
}
