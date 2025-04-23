import React, { useState, useEffect } from 'react';
import { useClerk, useAuth } from "@clerk/nextjs";

const ReminderApp = () => {
  const { signOut } = useClerk();
  const { userId } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({
    recipient: '',
    phoneNumber: '',
    message: '',
    dateTime: '',
  });
  const [activeTab, setActiveTab] = useState('create');

  // Load reminders from localStorage on component mount
  useEffect(() => {
    const savedReminders = localStorage.getItem(`reminders_${userId}`);
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
  }, [userId]);

  // Save reminders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`reminders_${userId}`, JSON.stringify(reminders));
  }, [reminders, userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReminder({
      ...newReminder,
      [name]: value,
    });
  };

  const scheduleReminder = () => {
    // Validate form
    if (!newReminder.recipient || !newReminder.phoneNumber || !newReminder.message || !newReminder.dateTime) {
      alert('Please fill in all fields');
      return;
    }

    // Create a new reminder with a unique ID
    const reminder = {
      ...newReminder,
      id: Date.now().toString(),
      status: 'scheduled'
    };

    // Add to reminders list
    setReminders([...reminders, reminder]);

    // Reset form
    setNewReminder({
      recipient: '',
      phoneNumber: '',
      message: '',
      dateTime: '',
    });

    // Switch to view tab
    setActiveTab('view');

    // In a real app, here's where you would call your backend API to schedule the actual SMS
    console.log('Scheduled reminder:', reminder);
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
    // In a real app, you would also call your backend API to cancel the scheduled SMS
  };

  // Format the date for display
  const formatDateTime = (dateTimeStr) => {
    const dt = new Date(dateTimeStr);
    return dt.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Reminder App</h1>
            <button
              onClick={() => signOut()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('create')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Create Reminder
              </button>
              <button
                onClick={() => setActiveTab('view')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'view'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                View Reminders ({reminders.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'create' ? (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule a New Reminder</h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    name="recipient"
                    value={newReminder.recipient}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter recipient name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={newReminder.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. +1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Message
                  </label>
                  <textarea
                    name="message"
                    value={newReminder.message}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your reminder message"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date and Time
                  </label>
                  <input
                    type="datetime-local"
                    name="dateTime"
                    value={newReminder.dateTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={scheduleReminder}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Schedule Reminder
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Scheduled Reminders</h2>
              {reminders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No reminders scheduled yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminders.map(reminder => (
                    <div
                      key={reminder.id}
                      className="bg-gray-50 rounded-lg p-4 flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {reminder.recipient}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{reminder.phoneNumber}</p>
                        <p className="mt-2 text-gray-700">{reminder.message}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatDateTime(reminder.dateTime)}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderApp;