import React, { useState, useEffect } from 'react';
import { useClerk, useAuth } from "@clerk/nextjs";
import { supabase } from '@/utils/supabase';
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
  Alert,
  Snackbar,
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
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Load reminders from Supabase on component mount
  useEffect(() => {
    const loadReminders = async () => {
      try {
        const { data, error } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', userId)
          .order('scheduled_time', { ascending: true });

        if (error) throw error;
        setReminders(data || []);
      } catch (error) {
        console.error('Error loading reminders:', error);
        setNotification({
          open: true,
          message: 'Error loading reminders',
          severity: 'error',
        });
      }
    };

    if (userId) {
      loadReminders();
    }
  }, [userId]);

  // Check for reminders that need to be sent
  useEffect(() => {
    const checkReminders = async () => {
      const now = new Date();
      for (const reminder of reminders) {
        const reminderTime = new Date(reminder.scheduled_time);
        if (reminderTime <= now && reminder.status === 'scheduled') {
          try {
            const response = await fetch('/api/send-sms', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: reminder.phone_number,
                message: reminder.message,
              }),
            });

            const result = await response.json();
            
            if (result.success) {
              // Update reminder status in Supabase
              const { error } = await supabase
                .from('reminders')
                .update({ 
                  status: 'sent',
                  message_id: result.messageId,
                  updated_at: new Date().toISOString()
                })
                .eq('id', reminder.id);

              if (error) throw error;

              // Update local state
              setReminders(prevReminders =>
                prevReminders.map(r =>
                  r.id === reminder.id
                    ? { ...r, status: 'sent', message_id: result.messageId }
                    : r
                )
              );

              setNotification({
                open: true,
                message: `Reminder sent to ${reminder.recipient}`,
                severity: 'success',
              });
            } else {
              setNotification({
                open: true,
                message: `Failed to send reminder to ${reminder.recipient}`,
                severity: 'error',
              });
            }
          } catch (error) {
            console.error('Error sending reminder:', error);
            setNotification({
              open: true,
              message: `Error sending reminder to ${reminder.recipient}`,
              severity: 'error',
            });
          }
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [reminders]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReminder({
      ...newReminder,
      [name]: value,
    });
  };

  const scheduleReminder = async () => {
    // Validate form
    if (!newReminder.recipient || !newReminder.phoneNumber || !newReminder.message || !newReminder.dateTime) {
      setNotification({
        open: true,
        message: 'Please fill in all fields',
        severity: 'error',
      });
      return;
    }

    try {
      // Insert new reminder into Supabase
      const { data, error } = await supabase
        .from('reminders')
        .insert([
          {
            user_id: userId,
            recipient: newReminder.recipient,
            phone_number: newReminder.phoneNumber,
            message: newReminder.message,
            scheduled_time: newReminder.dateTime,
            status: 'scheduled'
          }
        ])
        .select();

      if (error) throw error;

      // Add to local state
      setReminders([...reminders, data[0]]);

      // Reset form
      setNewReminder({
        recipient: '',
        phoneNumber: '',
        message: '',
        dateTime: '',
      });

      // Switch to view tab
      setActiveTab(1);

      setNotification({
        open: true,
        message: 'Reminder scheduled successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      setNotification({
        open: true,
        message: 'Error scheduling reminder',
        severity: 'error',
      });
    }
  };

  const deleteReminder = async (id) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setReminders(reminders.filter(reminder => reminder.id !== id));
      
      setNotification({
        open: true,
        message: 'Reminder deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      setNotification({
        open: true,
        message: 'Error deleting reminder',
        severity: 'error',
      });
    }
  };

  // Format the date for display
  const formatDateTime = (dateTimeStr) => {
    const dt = new Date(dateTimeStr);
    return dt.toLocaleString();
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
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
                    {reminder.phone_number}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {reminder.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Scheduled for: {formatDateTime(reminder.scheduled_time)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Status: {reminder.status}
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

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ReminderApp;