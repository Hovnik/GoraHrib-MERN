# Database Models - GoraHrib MERN Application

This document outlines the data models for the GoraHrib mountain tracking application. All models are designed for MongoDB using Mongoose ODM.

---

## 1. User Model

**Purpose**: Store user account and profile information.

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  username: String (unique, required),
  firstName: String,
  lastName: String,
  profileImage: String (URL),
  bio: String,
  location: String,
  totalPeaksClimbed: Number (default: 0),
  points: Number (default: 0),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Key Fields**:

- `email`: User's email for login and contact
- `password`: Encrypted password
- `username`: Unique display name
- `totalPeaksClimbed`: Counter for leaderboard ranking
- `points`: Accumulated score from achievements and activities
- `profileImage`: URL to user's avatar or profile picture

---

## 2. Peak Model

**Purpose**: Store mountain/peak information.

```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  elevation: Number (required, in meters),
  location: String (required),
  description: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  difficulty: String (enum: ['Easy', 'Medium', 'Hard', 'Very Hard']),
  estimatedTime: Number (in hours),
  image: String (URL),
  region: String,
  country: String,
  mountainRange: String (enum of mountain ranges),
  climbCount: Number (default: 0),
  popularity: Number (default: 0),
  reviews: [ObjectId] (references to Review documents),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Key Fields**:

- `name`: Peak name
- `elevation`: Height above sea level
- `coordinates`: GPS location for mapping
- `difficulty`: Climbing difficulty level
- `mountainRange`: Which mountain range the peak belongs to
- `climbCount`: Denormalized counter for quick leaderboard queries
- `popularity`: Track how many users have visited

---

## 3. Achievement Model

**Purpose**: Define achievements users can earn.

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  icon: String (URL),
  badge: String (URL),
  criteria: String (description of how to earn),
  points: Number (awarded upon earning),
  rarity: String (enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']),
  createdAt: Date (default: now)
}
```

**Key Fields**:

- `criteria`: How users earn this achievement
- `points`: Points awarded when earned
- `rarity`: Difficulty/rarity tier

---

## 4. UserAchievement Model

**Purpose**: Track achievements earned by users.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (required, references User),
  achievementId: ObjectId (required, references Achievement),
  unlockedAt: Date (default: now),
  progress: Number (0-100, for multi-step achievements)
}
```

**Key Fields**:

- `userId`: Which user earned this
- `achievementId`: Which achievement was earned
- `unlockedAt`: When the achievement was earned
- `progress`: For incremental achievements (e.g., "climb 10 peaks")

---

## 5. Checklist Model

**Purpose**: Manage user's peak climbing checklist/wishlist.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (required, references User),
  peakId: ObjectId (required, references Peak),
  status: String (enum: ['Wishlist', 'Planned', 'Visited'], default: 'Wishlist'),
  visitedDate: Date,
  notes: String,
  difficulty: String,
  addedAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Key Fields**:

- `status`: Track if peak is planned, wishlist, or visited
- `visitedDate`: When peak was actually climbed
- `notes`: User's personal notes about the peak

---

## 6. Friend Model

**Purpose**: Manage user relationships and friend connections.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (required, references User),
  friendId: ObjectId (required, references User),
  status: String (enum: ['Pending', 'Accepted', 'Blocked'], default: 'Pending'),
  requestedAt: Date (default: now),
  acceptedAt: Date,
  blockedAt: Date
}
```

**Key Fields**:

- `userId`: User who sent the request
- `friendId`: User who received the request
- `status`: Pending, Accepted, or Blocked
- `acceptedAt`: When friendship was confirmed

---

## 7. Forum Post Model

**Purpose**: Store forum discussion posts.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (required, references User),
  title: String (required),
  content: String (required),
  category: String (enum: ['General', 'Tips', 'Trip Reports', 'Gear']),
  tags: [String],
  likes: Number (default: 0),
  likedBy: [ObjectId] (array of user IDs who liked),
  commentCount: Number (default: 0),
  viewCount: Number (default: 0),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Key Fields**:

- `userId`: Author of the post
- `likedBy`: Array of users who liked the post
- `commentCount`: Total number of comments
- `viewCount`: Track post engagement

---

## 8. Comment Model

**Purpose**: Store forum post comments.

```javascript
{
  _id: ObjectId,
  postId: ObjectId (required, references ForumPost),
  userId: ObjectId (required, references User),
  content: String (required),
  likes: Number (default: 0),
  likedBy: [ObjectId] (array of user IDs who liked),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Key Fields**:

- `postId`: Which post this comment belongs to
- `userId`: Comment author
- `likedBy`: Users who liked the comment

---

## 9. Leaderboard Model

**Purpose**: Store calculated leaderboard rankings.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (required, references User),
  rank: Number,
  totalPoints: Number,
  peaksClimbed: Number,
  achievementsUnlocked: Number,
  month: String (format: 'YYYY-MM'),
  leaderboardType: String (enum: ['AllTime', 'Monthly', 'Weekly'], default: 'AllTime'),
  updatedAt: Date (default: now)
}
```

**Key Fields**:

- `rank`: Current leaderboard position
- `leaderboardType`: Different leaderboard views
- `month`: For monthly leaderboards
- `updatedAt`: When stats were last calculated

---

## 10. Peak Climbing Model

**Purpose**: Track which users have climbed which peaks. Used for map visualization showing friend progress.

```javascript
{
  _id: ObjectId,
  peakId: ObjectId (required, references Peak),
  userId: ObjectId (required, references User),
  climbedAt: Date (required),
  userProfileImage: String (denormalized for performance),
  userName: String (denormalized for performance),
  notes: String,
  photos: [String] (array of photo URLs),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Key Fields**:

- `peakId`: Which peak was climbed
- `userId`: Which user climbed it
- `climbedAt`: When the climb happened
- `userProfileImage`: Denormalized profile picture URL (optimizes map queries)
- `userName`: Denormalized username (optimizes map queries)
- `photos`: Photos from the climb

**Use Case**:
When rendering the map, query all PeakClimbing records for friends:

```javascript
const friendIds = getCurrentUserFriends();
const climbData = await PeakClimbing.find({ userId: { $in: friendIds } });
// Returns all peaks climbed by friends with their profile images
// No additional queries needed - everything is denormalized
```

---

## Data Relationships

```
User (1) ──→ (Many) Checklist ←── (Many) Peak
     │                              ↑
     │                              │
     ├─→ (Many) PeakClimbing ───────┘
     │
     ├─→ (Many) ForumPost
     ├─→ (Many) Comment
     ├─→ (Many) UserAchievement ←── (Many) Achievement
     ├─→ (Many) Friend
     └─→ (1) Leaderboard

ForumPost (1) ──→ (Many) Comment
```

**Note on Peak Climbing**:

- PeakClimbing denormalizes user data (profileImage, userName) for efficient map rendering
- Replaces the need to JOIN User data when displaying friend climbs on the map
- Contains climbing metadata (date, photos, notes) separate from the Checklist record

---

## Indexes Recommended

For performance optimization, create these MongoDB indexes:

```javascript
// User indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

// Peak indexes
db.peaks.createIndex({ name: 1 });
db.peaks.createIndex({ region: 1 });
db.peaks.createIndex({ difficulty: 1 });

// Checklist indexes
db.checklists.createIndex({ userId: 1, peakId: 1 }, { unique: true });
db.checklists.createIndex({ userId: 1, status: 1 });

// Friend indexes
db.friends.createIndex({ userId: 1, friendId: 1 }, { unique: true });
db.friends.createIndex({ status: 1 });

// Forum indexes
db.forumposts.createIndex({ userId: 1 });
db.forumposts.createIndex({ createdAt: -1 });
db.comments.createIndex({ postId: 1 });

// Leaderboard indexes
db.leaderboards.createIndex({ leaderboardType: 1, rank: 1 });
db.leaderboards.createIndex({ userId: 1, leaderboardType: 1 });

// Peak Climbing indexes (critical for map performance)
db.peakclimbings.createIndex({ peakId: 1 });
db.peakclimbings.createIndex({ userId: 1 });
db.peakclimbings.createIndex({ peakId: 1, userId: 1 }, { unique: true });
db.peakclimbings.createIndex({ climbedAt: -1 });
```

---

## Validation Rules

### User Model

- Email must be valid format and unique
- Password minimum 8 characters (hash before storage)
- Username unique and 3-20 characters

### Peak Model

- Name must be unique
- Elevation must be positive number
- Coordinates must be valid latitude (-90 to 90) and longitude (-180 to 180)

### Achievement Model

- Title must be unique
- Points must be positive number
- Rarity must be from predefined enum

### Friend Model

- Can't add self as friend
- Only one friend request allowed between two users

---

## Map Implementation Strategy

### For Displaying Peaks on Map:

1. **Get User's Climbed Peaks** (green dots):

```javascript
const userClimbs = await PeakClimbing.find({ userId: currentUserId }).populate(
  "peakId"
);
```

2. **Get Friends' Climbed Peaks** (with profile pictures overlay):

```javascript
const friendIds = await Friend.find({
  userId: currentUserId,
  status: "Accepted",
}).select("friendId");
const friendClimbs = await PeakClimbing.find({ userId: { $in: friendIds } });
// Returns: [{ peakId, userId, climbedAt, userProfileImage, userName }, ...]
```

3. **Frontend Logic**:

- For each peak, check if current user has climbed it → **GREEN** dot
- For each peak, display profile pictures of friends who climbed it → **RED** dots with avatars
- No additional queries needed; all data is denormalized

### Why Denormalization Here:

- Avoids N+1 queries when rendering hundreds of peaks
- Profile images retrieved in a single query
- Username/profile picture updates are infrequent
- Trade-off: ~1KB extra per document is worth avoiding 100s of queries

---

## Notes

- All timestamps use ISO 8601 format
- All passwords are hashed using bcrypt before storage
- User IDs are MongoDB ObjectId format
- Soft deletes can be implemented by adding `isDeleted: Boolean` and `deletedAt: Date` fields
- Consider implementing audit logs for sensitive operations
- Use transactions for operations affecting multiple documents
- **Denormalization**: UserProfileImage and UserName are stored in PeakClimbing for map performance
- **Consistency**: Update denormalized fields in PeakClimbing when user changes profile picture or username
