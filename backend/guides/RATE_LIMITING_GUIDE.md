# Rate Limiting Middleware Implementation Guide

This guide shows how to integrate the rate limiting middleware into your GoraHrib MERN application.

## Installation

The `express-rate-limit` package has been installed. It's now available in your project.

---

## Rate Limiters Available

### 1. **generalLimiter**
- **Limit**: 100 requests per 15 minutes
- **Use Case**: General API endpoints
- **Key Generator**: Uses user ID if authenticated, otherwise IP

### 2. **authLimiter** (Strict)
- **Limit**: 5 requests per 15 minutes per IP
- **Use Case**: Login and registration routes
- **Protection**: Brute force attacks on authentication

### 3. **forumLimiter**
- **Limit**: 30 requests per 15 minutes per user
- **Use Case**: Forum posts and comments
- **Protection**: Spam in community discussions

### 4. **actionLimiter**
- **Limit**: 60 requests per 15 minutes per user
- **Use Case**: Achievements, checklists, leaderboard
- **Protection**: Abuse of user action tracking

### 5. **searchLimiter**
- **Limit**: 30 requests per minute per user
- **Use Case**: Peak search functionality
- **Protection**: Database from expensive queries

### 6. **friendLimiter**
- **Limit**: 10 friend requests per hour per user
- **Use Case**: Friend request endpoints
- **Protection**: Spam friend requests

---

## How to Use

### Step 1: Import in Your Route Files

```javascript
import express from 'express';
import { 
  login,
  register,
  logout
} from '../controllers/auth.controller.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply authLimiter to auth routes
router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.post('/logout', logout);

export default router;
```

### Step 2: Apply to Your Routes

#### Example 1: Auth Routes (`auth.routes.js`)
```javascript
import { authLimiter } from '../middleware/rateLimiter.js';

router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
```

#### Example 2: Forum Routes (`forum.routes.js`)
```javascript
import { forumLimiter } from '../middleware/rateLimiter.js';

router.post('/', forumLimiter, createPost);
router.post('/:postId/comments', forumLimiter, addComment);
router.post('/:postId/like', forumLimiter, likePost);
```

#### Example 3: Peak Routes (`peak.routes.js`)
```javascript
import { searchLimiter, generalLimiter } from '../middleware/rateLimiter.js';

router.get('/', generalLimiter, getPeaks);
router.get('/search', searchLimiter, searchPeaks);
router.get('/:id', generalLimiter, getPeakDetails);
```

#### Example 4: Friend Routes (`friend.routes.js`)
```javascript
import { friendLimiter, generalLimiter } from '../middleware/rateLimiter.js';

router.get('/', generalLimiter, getFriends);
router.post('/:userId', friendLimiter, sendFriendRequest);
router.delete('/:userId', generalLimiter, removeFriend);
```

#### Example 5: Checklist Routes (`checklist.routes.js`)
```javascript
import { actionLimiter } from '../middleware/rateLimiter.js';

router.get('/', actionLimiter, getChecklist);
router.post('/:peakId', actionLimiter, addPeakToChecklist);
router.delete('/:peakId', actionLimiter, removePeakFromChecklist);
router.put('/:peakId/visit', actionLimiter, markPeakAsVisited);
```

#### Example 6: Achievement Routes (`achievement.routes.js`)
```javascript
import { actionLimiter } from '../middleware/rateLimiter.js';

router.get('/', actionLimiter, getAchievements);
router.get('/users/:id', actionLimiter, getAchievementsByUserId);
```

#### Example 7: Leaderboard Routes (`leaderboard.routes.js`)
```javascript
import { generalLimiter } from '../middleware/rateLimiter.js';

router.get('/', generalLimiter, getLeaderboard);
```

---

## Complete Route Example

Here's a complete example for `auth.routes.js`:

```javascript
import express from 'express';
import {
  login,
  register,
  logout
} from '../controllers/auth.controller.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Authentication routes with strict rate limiting
 */
router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.post('/logout', logout); // No rate limit needed for logout

export default router;
```

---

## Response Format on Rate Limit Exceeded

When a user exceeds the rate limit, they receive a response like:

```json
{
  "message": "Too many authentication attempts. Please try again later.",
  "retryAfter": 1671234567890
}
```

Or for other endpoints:

```json
{
  "message": "Too many requests. Please slow down.",
  "retryAfter": 1671234567890
}
```

**Status Code**: `429 Too Many Requests`

---

## Features

✅ **Development Mode**: Automatic bypass in development (set `NODE_ENV=development`)

✅ **User-aware**: Uses user ID if authenticated, falls back to IP address

✅ **Custom Error Messages**: Each limiter has a specific message

✅ **Retry-After Headers**: Returns `RateLimit-*` headers for client-side retry logic

✅ **Configurable**: Easy to adjust limits in `rateLimiter.js`

---

## Customization

To adjust limits, edit `middleware/rateLimiter.js`:

```javascript
// Change general limiter to 200 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,  // ← Change this value
  // ... rest of config
});
```

---

## Advanced Usage

### Skip Rate Limiting for Admin Users

Modify the limiter to skip admin users:

```javascript
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skip: (req) => {
    // Skip if development or if user is admin
    return process.env.NODE_ENV === 'development' || req.user?.isAdmin;
  },
  // ... rest of config
});
```

### Use with Redis for Distributed Systems

For production with multiple servers, use Redis store:

```javascript
import RedisStore from 'rate-limit-redis';
import redis from 'redis';

const redisClient = redis.createClient();

export const generalLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
  // ... rest of config
});
```

---

## Testing

Test rate limiting with curl:

```bash
# First 5 requests will succeed
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test123"}'
  echo "Request $i"
done
```

After 5 requests, you'll get a 429 response.

---

## Best Practices

1. **Apply to sensitive routes**: Always rate limit authentication endpoints
2. **Use appropriate limits**: Adjust based on your expected user behavior
3. **Monitor**: Track 429 errors to detect abuse patterns
4. **User feedback**: Display friendly messages to users about rate limits
5. **Production**: Use Redis store for distributed rate limiting
6. **Gradual rollout**: Start with generous limits, tighten as needed

