# Rating System Integration Guide

## Overview

The Rating System enables businesses to rate their employees and provides comprehensive ranking functionality. This guide covers API endpoints, request/response formats, authentication, and integration examples for frontend applications.

## Table of Contents

1. [Authentication](#authentication)
2. [Base URL Structure](#base-url-structure)
3. [Rating Types](#rating-types)
4. [API Endpoints](#api-endpoints)
5. [Request/Response Examples](#requestresponse-examples)
6. [Error Handling](#error-handling)
7. [Frontend Integration Examples](#frontend-integration-examples)
8. [Best Practices](#best-practices)

---

## Authentication

All rating endpoints require JWT authentication and business-level permissions.

### Required Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Permission Levels
- `VIEW` - Read ratings and statistics
- `EDIT` - Create and update ratings
- `FULL` - Delete ratings

---

## Base URL Structure

All rating endpoints follow this pattern:
```
/businesses/:businessId/ratings
```

The `businessId` is extracted from the JWT token's business context.

---

## Rating Types

### Business Rating User (Employee Performance)
```typescript
enum BusinessToUserRatingType {
  communication    // Communication skills
  professionalism  // Professional behavior
  performance      // Job performance
  reliability      // Dependability
  punctuality      // Timeliness
}
```

### User Rating Business (Workplace Quality)
```typescript
enum UserToBusinessRatingType {
  workEnvironment  // Work environment quality
  payOnTime        // Payment timeliness
  management       // Management quality
  fairness         // Fair treatment
  overall          // Overall experience
}
```

### Rating Scale
All ratings use a 1-5 scale:
- 1 = Poor
- 2 = Below Average
- 3 = Average
- 4 = Good
- 5 = Excellent

---

## API Endpoints

### 1. Create Rating

Rate an employee on a specific criterion.

**Endpoint:** `POST /businesses/:businessId/ratings`

**Permission Required:** `EDIT`

**Request Body:**
```typescript
{
  rateeUserId: string;    // UUID of employee being rated
  rating: number;         // 1-5 scale
  ratingType: RatingType; // e.g., "communication"
  comment?: string;       // Optional feedback
}
```

**Response:** `RatingResponseDto`

**Business Rules:**
- Employee must have current or former employment with the business
- If rating exists for this user/type, it updates the existing rating
- Overall rating is automatically calculated from all rating types

---

### 2. Update Rating

Modify an existing rating.

**Endpoint:** `PUT /businesses/:businessId/ratings/:id`

**Permission Required:** `EDIT`

**Request Body:**
```typescript
{
  rating?: number;   // Updated rating value
  comment?: string;  // Updated comment
}
```

**Response:** `RatingResponseDto`

---

### 3. Get Ratings List

Retrieve paginated ratings with optional filters.

**Endpoint:** `GET /businesses/:businessId/ratings`

**Permission Required:** `VIEW`

**Query Parameters:**
```typescript
{
  rateeUserId?: string;    // Filter by specific employee
  page?: number;           // Default: 1
  limit?: number;          // Default: 10
}
```

**Response:**
```typescript
{
  data: RatingResponseDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

---

### 4. Get Single Rating

Retrieve a specific rating by ID.

**Endpoint:** `GET /businesses/:businessId/ratings/:id`

**Permission Required:** `VIEW`

**Response:** `RatingResponseDto`

---

### 5. Get Employees for Rating

List all employees (current and former) available for rating.

**Endpoint:** `GET /businesses/:businessId/ratings/employees`

**Permission Required:** `VIEW`

**Response:**
```typescript
[
  {
    employmentId: string;
    status: "active" | "resigned" | "terminated" | "archived";
    startDate: Date;
    endDate?: Date;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
  }
]
```

---

### 6. Get User Rating Statistics

Get comprehensive rating statistics for a specific employee.

**Endpoint:** `GET /businesses/:businessId/ratings/stats/:userId`

**Permission Required:** `VIEW`

**Query Parameters:**
```typescript
{
  includeRank?: "true" | "false";  // Include ranking information
}
```

**Response:**
```typescript
{
  averageRating: number;        // Overall average (0-5)
  totalRatings: number;         // Total number of ratings
  rank?: number;                // Rank among all employees (if includeRank=true)
  totalRanked?: number;         // Total employees ranked
  percentile?: number;          // Percentile ranking (0-100)
  ratingBreakdown: {
    communication?: {
      average: number;
      count: number;
    };
    professionalism?: {
      average: number;
      count: number;
    };
    // ... other rating types
  };
}
```

---

### 7. Get Business Rankings

Get paginated rankings of businesses based on user ratings.

**Endpoint:** `GET /businesses/:businessId/ratings/rankings/businesses`

**Permission Required:** `VIEW`

**Query Parameters:**
```typescript
{
  minRatings?: number;  // Minimum ratings required (default: 1)
  page?: number;        // Default: 1
  limit?: number;       // Default: 50
}
```

**Response:**
```typescript
{
  data: [
    {
      businessId: string;
      businessName: string;
      logo?: string;
      averageRating: number;
      totalRatings: number;
      rank: number;
      percentile: number;
    }
  ];
  pagination: PaginationMeta;
}
```

---

### 8. Get User Rankings

Get paginated rankings of users based on business ratings.

**Endpoint:** `GET /businesses/:businessId/ratings/rankings/users`

**Permission Required:** `VIEW`

**Query Parameters:**
```typescript
{
  businessId?: string;  // Filter by specific business
  minRatings?: number;  // Minimum ratings required (default: 1)
  page?: number;        // Default: 1
  limit?: number;       // Default: 50
}
```

**Response:**
```typescript
{
  data: [
    {
      userId: string;
      userName: string;
      avatar?: string;
      averageRating: number;
      totalRatings: number;
      rank: number;
      percentile: number;
      businessId?: string;
    }
  ];
  pagination: PaginationMeta;
}
```

---

### 9. Delete Rating

Remove a rating.

**Endpoint:** `DELETE /businesses/:businessId/ratings/:id`

**Permission Required:** `FULL`

**Response:**
```typescript
{
  message: "Rating deleted successfully"
}
```

---

## Request/Response Examples

### Example 1: Create a Rating

**Request:**
```http
POST /businesses/abc-123/ratings
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "rateeUserId": "user-456",
  "rating": 5,
  "ratingType": "communication",
  "comment": "Excellent communication skills and teamwork"
}
```

**Response (201 Created):**
```json
{
  "id": "rating-789",
  "businessId": "abc-123",
  "raterBusinessId": "abc-123",
  "rateeUserId": "user-456",
  "rating": 5,
  "ratingType": "communication",
  "comment": "Excellent communication skills and teamwork",
  "createdAt": "2026-03-11T10:30:00Z",
  "updatedAt": "2026-03-11T10:30:00Z",
  "rateeUser": {
    "id": "user-456",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg"
  },
  "business": {
    "id": "abc-123",
    "name": "Acme Corp",
    "logo": "https://example.com/logo.png"
  }
}
```

---

### Example 2: Get Employee Statistics with Ranking

**Request:**
```http
GET /businesses/abc-123/ratings/stats/user-456?includeRank=true
Authorization: Bearer eyJhbGc...
```

**Response (200 OK):**
```json
{
  "averageRating": 4.5,
  "totalRatings": 5,
  "rank": 3,
  "totalRanked": 25,
  "percentile": 88,
  "ratingBreakdown": {
    "communication": {
      "average": 4.8,
      "count": 2
    },
    "professionalism": {
      "average": 4.5,
      "count": 2
    },
    "performance": {
      "average": 4.2,
      "count": 1
    }
  }
}
```

---

### Example 3: Get User Rankings

**Request:**
```http
GET /businesses/abc-123/ratings/rankings/users?minRatings=3&page=1&limit=10
Authorization: Bearer eyJhbGc...
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "userId": "user-001",
      "userName": "Alice Johnson",
      "avatar": "https://example.com/alice.jpg",
      "averageRating": 4.9,
      "totalRatings": 12,
      "rank": 1,
      "percentile": 100
    },
    {
      "userId": "user-002",
      "userName": "Bob Smith",
      "avatar": "https://example.com/bob.jpg",
      "averageRating": 4.7,
      "totalRatings": 8,
      "rank": 2,
      "percentile": 95
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "User must be a current or former employee to be rated",
  "error": "Bad Request"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Rating not found",
  "error": "Not Found"
}
```

#### 422 Validation Error
```json
{
  "statusCode": 422,
  "message": [
    "rating must be between 1 and 5",
    "ratingType must be a valid enum value"
  ],
  "error": "Unprocessable Entity"
}
```

---

## Frontend Integration Examples

### React/TypeScript Example

```typescript
// types/rating.ts
export interface CreateRatingRequest {
  rateeUserId: string;
  rating: number;
  ratingType: RatingType;
  comment?: string;
}

export interface RatingResponse {
  id: string;
  businessId: string;
  rateeUserId: string;
  rating: number;
  ratingType: RatingType;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  rateeUser?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  rank?: number;
  totalRanked?: number;
  percentile?: number;
  ratingBreakdown: Record<string, { average: number; count: number }>;
}

// services/ratingService.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export class RatingService {
  private getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async createRating(
    businessId: string,
    data: CreateRatingRequest
  ): Promise<RatingResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/businesses/${businessId}/ratings`,
      data,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getRatings(
    businessId: string,
    params?: { rateeUserId?: string; page?: number; limit?: number }
  ): Promise<{ data: RatingResponse[]; pagination: any }> {
    const response = await axios.get(
      `${API_BASE_URL}/businesses/${businessId}/ratings`,
      { headers: this.getHeaders(), params }
    );
    return response.data;
  }

  async getUserStats(
    businessId: string,
    userId: string,
    includeRank: boolean = false
  ): Promise<RatingStats> {
    const response = await axios.get(
      `${API_BASE_URL}/businesses/${businessId}/ratings/stats/${userId}`,
      { 
        headers: this.getHeaders(),
        params: { includeRank: includeRank ? 'true' : 'false' }
      }
    );
    return response.data;
  }

  async getEmployees(businessId: string): Promise<any[]> {
    const response = await axios.get(
      `${API_BASE_URL}/businesses/${businessId}/ratings/employees`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getUserRankings(
    businessId: string,
    params?: { minRatings?: number; page?: number; limit?: number }
  ): Promise<any> {
    const response = await axios.get(
      `${API_BASE_URL}/businesses/${businessId}/ratings/rankings/users`,
      { headers: this.getHeaders(), params }
    );
    return response.data;
  }

  async updateRating(
    businessId: string,
    ratingId: string,
    data: { rating?: number; comment?: string }
  ): Promise<RatingResponse> {
    const response = await axios.put(
      `${API_BASE_URL}/businesses/${businessId}/ratings/${ratingId}`,
      data,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async deleteRating(
    businessId: string,
    ratingId: string
  ): Promise<void> {
    await axios.delete(
      `${API_BASE_URL}/businesses/${businessId}/ratings/${ratingId}`,
      { headers: this.getHeaders() }
    );
  }
}

export const ratingService = new RatingService();
```

### React Component Example

```typescript
// components/RatingForm.tsx
import React, { useState, useEffect } from 'react';
import { ratingService } from '../services/ratingService';

interface RatingFormProps {
  businessId: string;
  onSuccess?: () => void;
}

export const RatingForm: React.FC<RatingFormProps> = ({ businessId, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [ratingType, setRatingType] = useState('communication');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEmployees();
  }, [businessId]);

  const loadEmployees = async () => {
    try {
      const data = await ratingService.getEmployees(businessId);
      setEmployees(data);
    } catch (err) {
      setError('Failed to load employees');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await ratingService.createRating(businessId, {
        rateeUserId: selectedEmployee,
        rating,
        ratingType,
        comment,
      });
      
      // Reset form
      setSelectedEmployee('');
      setRating(5);
      setComment('');
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rating-form">
      <h2>Rate Employee</h2>
      
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label>Employee</label>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          required
        >
          <option value="">Select an employee</option>
          {employees.map((emp: any) => (
            <option key={emp.user.id} value={emp.user.id}>
              {emp.user.name} ({emp.status})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Rating Type</label>
        <select
          value={ratingType}
          onChange={(e) => setRatingType(e.target.value)}
          required
        >
          <option value="communication">Communication</option>
          <option value="professionalism">Professionalism</option>
          <option value="performance">Performance</option>
          <option value="reliability">Reliability</option>
          <option value="punctuality">Punctuality</option>
        </select>
      </div>

      <div className="form-group">
        <label>Rating: {rating}/5</label>
        <input
          type="range"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label>Comment (Optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Provide feedback..."
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Rating'}
      </button>
    </form>
  );
};
```

### React Native Example

```typescript
// services/ratingService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.example.com';

export class RatingService {
  private async getHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async createRating(businessId: string, data: any) {
    const headers = await this.getHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/businesses/${businessId}/ratings`,
      data,
      { headers }
    );
    return response.data;
  }

  async getUserStats(businessId: string, userId: string, includeRank = false) {
    const headers = await this.getHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/businesses/${businessId}/ratings/stats/${userId}`,
      { 
        headers,
        params: { includeRank: includeRank ? 'true' : 'false' }
      }
    );
    return response.data;
  }
}

export const ratingService = new RatingService();
```

```typescript
// components/EmployeeRatingCard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ratingService } from '../services/ratingService';

interface Props {
  businessId: string;
  userId: string;
}

export const EmployeeRatingCard: React.FC<Props> = ({ businessId, userId }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [businessId, userId]);

  const loadStats = async () => {
    try {
      const data = await ratingService.getUserStats(businessId, userId, true);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!stats) {
    return <Text>No rating data available</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Employee Rating</Text>
      
      <View style={styles.statRow}>
        <Text style={styles.label}>Average Rating:</Text>
        <Text style={styles.value}>{stats.averageRating.toFixed(1)}/5.0</Text>
      </View>

      <View style={styles.statRow}>
        <Text style={styles.label}>Total Ratings:</Text>
        <Text style={styles.value}>{stats.totalRatings}</Text>
      </View>

      {stats.rank && (
        <>
          <View style={styles.statRow}>
            <Text style={styles.label}>Rank:</Text>
            <Text style={styles.value}>
              #{stats.rank} of {stats.totalRanked}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.label}>Percentile:</Text>
            <Text style={styles.value}>{stats.percentile}th</Text>
          </View>
        </>
      )}

      <Text style={styles.subtitle}>Rating Breakdown</Text>
      {Object.entries(stats.ratingBreakdown).map(([type, data]: [string, any]) => (
        <View key={type} style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>{type}:</Text>
          <Text style={styles.breakdownValue}>
            {data.average.toFixed(1)} ({data.count} ratings)
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingLeft: 8,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#888',
    textTransform: 'capitalize',
  },
  breakdownValue: {
    fontSize: 13,
    color: '#555',
  },
});
```

---

## Best Practices

### 1. Rating Creation
- Always validate that the user is an employee before attempting to rate
- Use the `/ratings/employees` endpoint to populate employee selection dropdowns
- Provide clear feedback when ratings are created or updated
- Consider implementing a confirmation dialog before submitting ratings

### 2. Performance Optimization
- Cache employee lists locally to reduce API calls
- Implement pagination for rating lists and rankings
- Use debouncing for search/filter inputs
- Consider implementing infinite scroll for large datasets

### 3. User Experience
- Display rating statistics prominently on employee profiles
- Use visual indicators (stars, progress bars) for ratings
- Show percentile rankings to provide context
- Implement real-time updates when ratings change

### 4. Error Handling
- Always handle network errors gracefully
- Provide user-friendly error messages
- Implement retry logic for failed requests
- Log errors for debugging purposes

### 5. Security
- Never expose JWT tokens in logs or error messages
- Validate permissions on the frontend before showing UI elements
- Always rely on backend permission checks for security
- Implement rate limiting on the frontend to prevent abuse

### 6. Data Freshness
- Refresh rating statistics after creating/updating ratings
- Consider implementing WebSocket connections for real-time updates
- Cache data with appropriate TTL values
- Provide manual refresh options for users

### 7. Accessibility
- Ensure rating inputs are keyboard accessible
- Provide ARIA labels for screen readers
- Use semantic HTML elements
- Ensure sufficient color contrast for rating displays

---

## Integration Checklist

- [ ] Set up authentication headers with JWT token
- [ ] Implement rating creation form with validation
- [ ] Display employee rating statistics
- [ ] Implement rating list with pagination
- [ ] Add ranking/leaderboard views
- [ ] Handle all error cases gracefully
- [ ] Test with different permission levels
- [ ] Implement loading states for async operations
- [ ] Add confirmation dialogs for destructive actions
- [ ] Test on different screen sizes/devices
- [ ] Implement proper error logging
- [ ] Add analytics tracking for rating events

---

## Support

For additional support or questions:
- Review the API documentation at `/api/docs`
- Check the backend README at `src/modules/rating/README.md`
- Contact the development team

---

## Changelog

### Version 1.0.0 (2026-03-11)
- Initial release
- Basic CRUD operations for ratings
- Employee rating statistics
- User and business rankings
- Percentile calculations
- Comprehensive filtering and pagination
