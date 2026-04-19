# Progress Reviews & Custom Strategies Setup

## Overview

A comprehensive progress tracking system that allows mentors and mentees to:

- ⭐ Rate goal progress (1-5 stars)
- 📝 Document what went well and what didn't
- 💡 Plan next steps together
- 🎯 Track custom, editable strategies
- 📊 Get AI-powered recommendations based on progress trends

## Features

### 1. Goal Reviews

- **Star Ratings**: 1-5 star rating system for each goal
- **Structured Feedback**:
  - What went well (celebrate wins)
  - What didn't work (identify blockers)
  - How to progress forward (next steps)
- **Strategy Tracking**: Mark which strategies are working well
- **Shared Access**: Both mentor and mentee can create and view reviews

### 2. Custom Strategies

Instead of hardcoded temptation routines, strategies are now:

- **User-Created**: Both users can add custom strategies
- **Categorized**:
  - Coping Strategies (manage stress/emotions)
  - Motivation Boosters (keep momentum)
  - Accountability Tactics (stay on track)
  - Celebration Methods (recognize wins)
  - Other (flexible)
- **Manageable**: View, use, and delete strategies as needed

### 3. Progress Analytics & Recommendations

**Automatic Insights:**

- Overall progress rating across all goals
- Trend analysis (improving/stable/declining)
- Top strategies per goal
- AI-powered recommendations based on:
  - Rating trends
  - Strategy effectiveness
  - Historical progress

**Smart Recommendations:**

- 4+/5 stars: Celebrate wins, set new goals
- 3-4/5 stars: Refine existing approach
- 2-3/5 stars: Try new strategies
- Below 2/5: Fundamental strategy change needed

## Firestore Collection Structure

```
goalReviews/
  {reviewId}/
    relationshipId: string
    goalId: string
    reviewedBy: string
    rating: number (1-5)
    whatWentWell: string
    whatDidntWork: string
    howToProgressForward: string
    workingStrategies: string[] (strategy IDs)
    suggestedStrategies?: string[]
    notes?: string
    createdAt: Timestamp
    updatedAt: Timestamp

customStrategies/
  {strategyId}/
    relationshipId: string
    name: string
    description: string
    category: "coping" | "motivation" | "accountability" | "celebration" | "other"
    createdBy: string
    createdAt: Timestamp
    updatedAt: Timestamp
```

## Firestore Security Rules

Add these rules to your Firestore security configuration:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ... existing rules ...

    // Goal Reviews - both users can read/write reviews
    match /goalReviews/{reviewId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
                       request.auth.uid == request.resource.data.reviewedBy;
      allow update: if request.auth != null &&
                       request.auth.uid == resource.data.reviewedBy;
      allow delete: if request.auth != null &&
                       request.auth.uid == resource.data.reviewedBy;
    }

    // Custom Strategies - both users can manage strategies
    match /customStrategies/{strategyId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
                               request.auth.uid == resource.data.createdBy;
    }
  }
}
```

## Usage

### Tab Navigation

**Reviews Page** has three main tabs:

1. **Goal Reviews** - Create and view progress reviews
   - Select a goal
   - Rate progress (1-5 stars)
   - Fill in structured reflection fields
   - Select working strategies
   - Save review

2. **Strategies** - Manage custom strategies
   - Add new strategies with category
   - View all strategies organized by category
   - Delete strategies you no longer need
   - Use them in reviews to track effectiveness

3. **Analytics** - Track progress and get recommendations
   - Overall progress summary
   - Per-goal analysis with trend indicators
   - Recommendation engine
   - Top strategies for each goal

### Navigation

Access the Reviews page via the "Reviews" button in the main navigation menu, or use the `#reviews` hash.

## Data Flow

1. **User creates a goal** (via Goals page)
2. **User works toward goal** over time
3. **User creates a review** (via Reviews > Goal Reviews)
   - Rates progress with stars
   - Documents experience
   - Notes working strategies
4. **Analytics engine analyzes** the review
   - Calculates trends
   - Identifies top strategies
   - Generates recommendations
5. **User adjusts strategies** based on recommendations
6. **Cycle repeats** for continuous improvement

## Recommendation Algorithm

Recommendations are generated based on:

- **Rating Level**: What the average star rating indicates
- **Trend**: Whether ratings are improving, stable, or declining
- **Strategy Effectiveness**: Which strategies have been selected most
- **Goal Progress**: Number of reviews and their recency

The system provides contextual encouragement and actionable next steps.

## Example Workflow

**Mentee starts with a goal:** "Exercise 3x per week"

**Week 2 - First Review:**

- Rating: 4/5 stars ✓✓✓✓
- What went well: "Did morning walks, easier than expected"
- What didn't work: "Evening sessions kept getting skipped"
- Next steps: "Stick with mornings, add weekend activity"
- Working strategies: [Morning routine, Accountability partner]

**Week 4 - Second Review:**

- Rating: 5/5 stars ✓✓✓✓✓
- Trend: IMPROVING 📈
- Recommendation: "Excellent progress! You're on a roll—consider increasing to 4x per week."

**Mentor views Analytics:**

- Sees mentee's improving trend
- Notices "Morning routine" is consistently working
- Suggests celebrating this win and building on the momentum
