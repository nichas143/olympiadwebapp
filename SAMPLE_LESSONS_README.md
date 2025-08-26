# Sample Lessons Feature

## Overview
The Sample Lessons page provides a curated collection of video lectures to showcase our teaching methodology and give potential students a taste of our comprehensive curriculum.

## Features

### 1. Video Gallery
- Grid layout displaying sample video lessons
- Each lesson shows:
  - Thumbnail from YouTube
  - Title and description
  - Category and difficulty level
  - Duration
  - Play button overlay

### 2. Filtering System
- Filter by category: Number Theory, Geometry, Algebra, Combinatorics, Functions, Problem Solving
- Filter by difficulty: Beginner, Intermediate, Advanced
- Real-time filtering without page reload

### 3. Video Player Modal
- Click any video thumbnail to open a modal player
- Embedded YouTube video player
- Video information display
- Easy close functionality

### 4. Navigation Integration
- Added to the "Program" dropdown in the main navigation
- Accessible from the curriculum page via "View Sample Lessons" button
- Direct link: `/sample-lessons`

## Technical Implementation

### File Structure
```
src/app/sample-lessons/
└── page.tsx          # Main sample lessons page
```

### Key Components
- **VideoLesson Interface**: TypeScript interface for lesson data
- **Filtering Logic**: Client-side filtering using React state
- **Modal System**: Custom modal for video playback
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Data Structure
```typescript
interface VideoLesson {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  youtubeId: string;
}
```

## Usage

### For Students
1. Navigate to "Program" → "Sample Lessons" in the main menu
2. Use filters to find lessons by category or difficulty
3. Click on any video thumbnail to watch
4. Use the call-to-action buttons to enroll or view full curriculum

### For Administrators
To add new sample lessons:
1. Edit the `sampleLessons` array in `src/app/sample-lessons/page.tsx`
2. Add a new object with the required fields
3. Replace the `youtubeId` with the actual YouTube video ID
4. Update categories/difficulties arrays if needed

## YouTube Video Integration
- Uses YouTube's embed API
- Automatically generates thumbnails from video IDs
- Fallback thumbnail handling for missing images
- Responsive iframe embedding

## Styling
- Consistent with the main site design
- Uses the same color scheme (blue/purple gradient)
- Responsive grid layout
- Hover effects and transitions
- Mobile-optimized interface

## Future Enhancements
- Video analytics tracking
- User progress tracking
- Comments and ratings system
- Related videos suggestions
- Download functionality for offline viewing
