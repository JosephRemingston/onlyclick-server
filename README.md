# Contractor Onboarding API Documentation

A Node.js backend API for contractor onboarding in a home services application. This API handles contractor registration, phone verification, and profile management.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   npm run dev    # Development mode
   npm start      # Production mode
   ```

## API Endpoints

### Request OTP

Sends an OTP to the provided phone number and checks if the contractor already exists.

- **URL**: `/api/contractors/request-otp`
- **Method**: `POST`
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "phoneNumber": "+1234567890"
}
```

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "message": "OTP sent successfully",
  "isExisting": true|false
}
```

**Error Response**:

- **Code**: 400
- **Content**:

```json
{
  "errors": [
    {
      "msg": "Invalid phone number",
      "param": "phoneNumber",
      "location": "body"
    }
  ]
}
```

### Verify OTP

Verifies the OTP sent to the contractor's phone number.

- **URL**: `/api/contractors/verify-otp`
- **Method**: `POST`
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "message": "OTP verified successfully",
  "isProfileComplete": true|false
}
```

**Error Response**:

- **Code**: 400
- **Content**:

```json
{
  "error": "Invalid or expired OTP"
}
```

### Complete Profile

Completes or updates the contractor's profile after phone verification.

- **URL**: `/api/contractors/complete-profile`
- **Method**: `POST`
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "phoneNumber": "+1234567890",
  "name": "John Doe",
  "secondaryPhoneNumber": "+1987654321",
  "address": "123 Main St, City, Country",
  "category": "Plumber"
}
```

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "message": "Profile completed successfully",
  "contractor": {
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "secondaryPhoneNumber": "+1987654321",
    "address": "123 Main St, City, Country",
    "category": "Plumber"
  }
}
```

**Error Responses**:

- **Code**: 400
- **Content**:

```json
{
  "error": "Phone number not verified"
}
```

- **Code**: 404
- **Content**:

```json
{
  "error": "Contractor not found"
}
```

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": "Error message"
}
```

Common HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid input)
- `404`: Not Found
- `500`: Server Error

## Data Model

### Contractor Schema

```javascript
{
  name: String,              // Required after verification
  phoneNumber: String,       // Required, unique
  secondaryPhoneNumber: String,  // Optional
  address: String,           // Required after verification
  category: String,          // Required after verification
  isVerified: Boolean,      // Default: false
  otp: {                    // Temporary OTP storage
    code: String,
    expiresAt: Date
  },
  createdAt: Date,          // Auto-generated timestamp
  updatedAt: Date           // Auto-generated timestamp
}
```

## Security Features

1. Input validation using express-validator
2. CORS protection
3. Helmet security headers
4. OTP expiration (10 minutes)
5. Phone number verification
6. MongoDB injection protection

## Development

To run in development mode with hot reloading:

```bash
npm run dev
```

The server will start on `http://localhost:3000` by default.
