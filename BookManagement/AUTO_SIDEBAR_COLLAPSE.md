# Automatic Sidebar Collapse Feature

## Overview
The application now includes an automatic sidebar collapse feature that detects when content overflows horizontally and automatically collapses the sidebar to provide more space for the content.

## How It Works

### 1. Overflow Detection Hook (`useOverflowDetection.js`)
- **Purpose**: Detects when content overflows horizontally beyond the container width
- **Features**:
  - Uses ResizeObserver to monitor size changes
  - Listens for window resize events
  - Configurable threshold for overflow detection
  - Can be enabled/disabled dynamically

### 2. Automatic Collapse Logic (`App.jsx`)
- **Trigger**: When content overflows and sidebar is expanded on desktop (≥1024px width)
- **Behavior**:
  - Automatically collapses sidebar when overflow is detected
  - Auto-expands sidebar when overflow is resolved (with 500ms delay to prevent flickering)
  - Only works on desktop screens (mobile behavior unchanged)
  - Manual sidebar toggle resets auto-collapse state

### 3. Visual Indicators (`Sidebar.jsx`)
- **Auto-collapse indicator**: Toggle button shows green background and lightning bolt (⚡) when auto-collapsed
- **Tooltip**: Explains why sidebar was collapsed ("Auto-collapsed due to content overflow")
- **Manual override**: Users can still manually expand/collapse the sidebar

## Implementation Details

### Key Components Modified:
1. **`client/src/hooks/useOverflowDetection.js`** - New custom hook for overflow detection
2. **`client/src/App.jsx`** - Main layout with auto-collapse logic
3. **`client/src/components/Sidebar.jsx`** - Visual indicators for auto-collapse state
4. **`client/src/pages/Inventory.jsx`** - Improved table responsiveness
5. **`client/src/index.css`** - Enhanced table styling with minimum width

### CSS Changes:
- Table container: `min-width: 0` to allow shrinking
- Table: `min-width: 800px` to ensure overflow detection triggers
- Responsive design maintained across all screen sizes

## Usage Examples

### Scenario 1: Wide Table Content
- User navigates to Inventory page with many columns
- Table content exceeds available width
- Sidebar automatically collapses to provide more space
- User sees ⚡ indicator on sidebar toggle button

### Scenario 2: Window Resize
- User resizes browser window to smaller width
- Content overflows due to reduced space
- Sidebar automatically collapses
- When window is resized back to larger width, sidebar auto-expands

### Scenario 3: Manual Override
- Sidebar is auto-collapsed due to overflow
- User manually clicks toggle button to expand
- Auto-collapse state is reset
- Sidebar remains expanded until next overflow detection

## Technical Notes

- **Threshold**: 30px overflow threshold to prevent false triggers
- **Delay**: 500ms delay before auto-expanding to prevent flickering
- **Responsive**: Only affects desktop screens (≥1024px)
- **Performance**: Uses ResizeObserver for efficient size monitoring
- **Accessibility**: Maintains all existing keyboard navigation and screen reader support

## Browser Compatibility
- Modern browsers with ResizeObserver support
- Graceful fallback for older browsers (overflow detection disabled)
- Works with all existing responsive breakpoints
