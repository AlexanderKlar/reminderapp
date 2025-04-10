import React, { useState, useEffect } from 'react';

const ReminderApp = () => {
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
    const savedReminders = localStorage.getItem('reminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
  }, []);

  // Save reminders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Reminder App</h1>
      
      {/* Tabs */}
      <div className="flex mb-6 border-b">
        <button 
          className={`py-2 px-4 ${activeTab === 'create' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('create')}
        >
          Create Reminder
        </button>
        <button 
          className={`py-2 px-4 ${activeTab === 'view' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('view')}
        >
          View Reminders ({reminders.length})
        </button>
      </div>
      
      {/* Create Reminder Form */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Schedule a New Reminder</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Recipient Name</label>
            <input
              type="text"
              name="recipient"
              value={newReminder.recipient}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="Enter recipient name"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={newReminder.phoneNumber}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="e.g. +1234567890"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Reminder Message</label>
            <textarea
              name="message"
              value={newReminder.message}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows="3"
              placeholder="Enter your reminder message"
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Date and Time</label>
            <input
              type="datetime-local"
              name="dateTime"
              value={newReminder.dateTime}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <button
            onClick={scheduleReminder}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Schedule Reminder
          </button>
        </div>
      )}
      
      {/* View Reminders */}
      {activeTab === 'view' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Scheduled Reminders</h2>
          
          {reminders.length === 0 ? (
            <p className="text-gray-500">No reminders scheduled yet.</p>
          ) : (
            <div className="divide-y">
              {reminders.map(reminder => (
                <div key={reminder.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{reminder.recipient} ({reminder.phoneNumber})</p>
                    <p className="text-gray-600">{reminder.message}</p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(reminder.dateTime)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
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