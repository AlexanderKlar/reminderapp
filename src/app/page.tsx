'use client';

import { useAuth } from "@clerk/nextjs";
import { SignIn, SignUp } from "@clerk/nextjs";
import ReminderApp from '../components/ReminderApp';

export default function Home() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <main className="min-h-screen p-4 bg-gray-100">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <SignIn />
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <SignUp />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 bg-gray-100">
      <ReminderApp />
    </main>
  );
}