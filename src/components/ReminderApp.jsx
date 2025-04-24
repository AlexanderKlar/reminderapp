import React, { useState, useEffect } from 'react';
import { useClerk, useAuth } from "@clerk/nextjs";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

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
  const [activeTab, setActiveTab] = useState(0);

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
    setActiveTab(1);
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  // Format the date for display
  const formatDateTime = (dateTimeStr) => {
    const dt = new Date(dateTimeStr);
    return dt.toLocaleString();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1" gutterBottom>
            Reminder App
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={() => signOut()}
            startIcon={<DeleteIcon />}
          >
            Sign Out
          </Button>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Create Reminder" />
          <Tab label={`View Reminders (${reminders.length})`} />
        </Tabs>
      </Paper>

      {activeTab === 0 ? (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Schedule a New Reminder
          </Typography>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Recipient Name"
              name="recipient"
              value={newReminder.recipient}
              onChange={handleInputChange}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={newReminder.phoneNumber}
              onChange={handleInputChange}
              variant="outlined"
              placeholder="e.g. +1234567890"
            />
            <TextField
              fullWidth
              label="Reminder Message"
              name="message"
              value={newReminder.message}
              onChange={handleInputChange}
              variant="outlined"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Date and Time"
              name="dateTime"
              type="datetime-local"
              value={newReminder.dateTime}
              onChange={handleInputChange}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={scheduleReminder}
              startIcon={<AddIcon />}
            >
              Schedule Reminder
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {reminders.length === 0 ? (
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No reminders scheduled yet.
              </Typography>
            </Paper>
          ) : (
            reminders.map(reminder => (
              <Card key={reminder.id} elevation={2}>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {reminder.recipient}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {reminder.phoneNumber}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {reminder.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {formatDateTime(reminder.dateTime)}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => deleteReminder(reminder.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))
          )}
        </Stack>
      )}
    </Container>
  );
};

export default ReminderApp;