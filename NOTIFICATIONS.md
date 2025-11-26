# Arcade Theme - Notifications System

## Overview

The Arcade theme now includes a fully functional notification system that integrates with CTFd's native notification API. Notifications appear as a bell icon in the navbar and display toast popups in the bottom-right corner.

## Features

- **Bell Icon**: Shows unread notification count with animated badge
- **Dropdown Menu**: Click the bell to view all notifications
- **Toast Notifications**: New notifications slide in from the right and fade out after 5 seconds
- **Auto-Polling**: Checks for new notifications every 10 seconds
- **Responsive Design**: Works on desktop and mobile devices

## Components

### NotificationBell.jsx

Main component that handles:

- Fetching notifications from CTFd API
- Displaying notification dropdown
- Showing toast notifications
- Managing notification state

### notifications.css

Styles for:

- Bell icon and badge
- Dropdown menu
- Toast notifications
- Animations and transitions

## API Integration

The notification system uses CTFd's standard notification endpoints:

```javascript
// Check for new notifications (HEAD request)
HEAD /api/v1/notifications?since_id=0

// Fetch notifications (GET request)
GET /api/v1/notifications?since_id=0

// Mark as read (PATCH request)
PATCH /api/v1/notifications/{id}
```

### Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Challenge Solved",
      "content": "You solved the challenge 'Web Exploitation 101'!",
      "date": "2025-11-26T18:30:00Z"
    }
  ]
}
```

## Usage

### For Users

1. **View Notifications**: Click the bell icon (🔔) in the navbar
2. **Clear All**: Click "Clear All" button in the dropdown
3. **Toast Notifications**: Automatically appear for new notifications

### For Admins

Admins can send notifications through the CTFd admin panel:

1. Go to **Admin Panel** → **Notifications**
2. Create a new notification with:
   - **Title**: Short heading (e.g., "Server Maintenance")
   - **Content**: Detailed message
   - **Type**: Info, Warning, Success, or Error
3. Click **Send** to broadcast to all users

## Customization

### Change Poll Interval

Edit `NotificationBell.jsx`:

```javascript
// Change from 10 seconds to 30 seconds
pollIntervalRef.current = setInterval(() => {
  fetchNotifications();
}, 30000); // 30 seconds
```

### Change Toast Duration

Edit `NotificationBell.jsx`:

```javascript
// Change from 5 seconds to 10 seconds
setTimeout(() => {
  toast.classList.remove("show");
  setTimeout(() => toast.remove(), 300);
}, 10000); // 10 seconds
```

### Customize Styles

Edit `notifications.css` to change:

- Colors (cyan/magenta theme)
- Animation speeds
- Dropdown size
- Toast position

## Troubleshooting

### Notifications Not Appearing

1. **Check API Connection**: Open browser console and look for errors
2. **Verify Authentication**: Ensure user is logged in
3. **Check CTFd Version**: Notifications API requires CTFd 3.0+

### Toast Not Showing

1. **Check z-index**: Ensure no elements overlap (z-index: 10000)
2. **Verify CSS Import**: Ensure `notifications.css` is imported in `App.jsx`
3. **Check Console**: Look for JavaScript errors

### Badge Not Updating

1. **Clear Browser Cache**: Force refresh (Ctrl+F5)
2. **Check Polling**: Verify `setInterval` is running
3. **Inspect Network Tab**: Ensure API calls are being made

## Technical Details

### State Management

- `notifications`: Array of notification objects
- `unreadCount`: Number of unread notifications
- `isOpen`: Dropdown visibility state
- `lastId`: Last notification ID fetched (for incremental updates)

### Polling Strategy

The component uses efficient polling:

1. HEAD request checks if new notifications exist
2. Only fetches full data if `X-New-Notifications` header > 0
3. Tracks `lastId` to avoid duplicate fetches

### Animation Flow

1. **Toast Appears**: Slides in from right (300ms)
2. **Toast Visible**: Stays for 5 seconds
3. **Toast Fades**: Slides out to right (300ms)
4. **Toast Removed**: DOM element deleted

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Performance

- **Minimal API Calls**: Uses HEAD requests to check before fetching
- **Efficient Rendering**: Only re-renders on state changes
- **Memory Management**: Limits to 50 most recent notifications
- **Cleanup**: Properly removes event listeners and intervals

## Future Enhancements

Possible improvements:

- [ ] Sound effects for new notifications
- [ ] Different icons for notification types (info, warning, error)
- [ ] Mark individual notifications as read
- [ ] Filter notifications by type
- [ ] Notification preferences/settings
- [ ] Desktop notifications (browser API)
- [ ] WebSocket support for real-time updates

## Credits

Designed to match the Arcade theme's cyberpunk aesthetic with:

- Cyan/magenta color scheme
- Neon glow effects
- Retro-futuristic animations
- Pixel-perfect attention to detail
