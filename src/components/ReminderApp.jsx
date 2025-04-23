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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Reminder App</h1>
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'create' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('create')}
        >
          Create Reminder
        </button>
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'view' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('view')}
        >
          View Reminders ({reminders.length})
        </button>
      </div>
      
      {/* Create Reminder Form */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Schedule a New Reminder</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Recipient Name</label>
            <input
              type="text"
              name="recipient"
              value={newReminder.recipient}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter recipient name"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={newReminder.phoneNumber}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. +1234567890"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Reminder Message</label>
            <textarea
              name="message"
              value={newReminder.message}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Enter your reminder message"
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-medium">Date and Time</label>
            <input
              type="datetime-local"
              name="dateTime"
              value={newReminder.dateTime}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={scheduleReminder}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Schedule Reminder
          </button>
        </div>
      )}
      
      {/* View Reminders */}
      {activeTab === 'view' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Scheduled Reminders</h2>
          
          {reminders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No reminders scheduled yet.</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {reminders.map(reminder => (
                <div key={reminder.id} className="py-4 flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{reminder.recipient} ({reminder.phoneNumber})</p>
                    <p className="text-gray-600 mt-1">{reminder.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDateTime(reminder.dateTime)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
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
  );
};

export default ReminderApp;