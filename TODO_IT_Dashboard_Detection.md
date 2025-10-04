# TODO: Implement Automatic Problem Detection in IT Dashboard

## Tasks
- [ ] Add ALERT_RULES to backend/config.py
- [ ] Create backend/utils/it_monitor.py for event logging and alerting utilities
- [ ] Add event logging middleware to backend/app.py
- [ ] Implement rule-based alert creation in backend/utils/it_monitor.py
- [ ] Add endpoint to fetch alerts in backend/resources/it_alerts.py
- [ ] Update frontend/src/api/it.js to include fetchAlerts function
- [ ] Update frontend/src/pages/ITActivityDashboard.jsx to display alerts and real-time notifications
- [ ] Test the implementation with sample data
- [ ] Update backend/create_sample_it_data.py if needed

## Information Gathered
- IT dashboard has models for ITEvent and ITAlert, but events are not logged automatically.
- No rule-based alerting system implemented.
- Dashboard allows viewing events and manual incident creation.
- Need to add automatic detection of problems like failed logins, API errors, etc.

## Plan
1. Define alert rules in config.
2. Create utility to log events on API requests.
3. Implement logic to check rules and create alerts.
4. Update frontend to show alerts.
5. Add real-time updates via WebSocket if possible.
