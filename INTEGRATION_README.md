# RaAI - Frontend-Backend Integration

This project consists of a Next.js frontend and a FastAPI backend for an AI-powered wellness platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.9+ (for backend)
- Git

### Environment Setup

1. **Frontend Environment Variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit .env.local with your settings:
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_API_DEBUG=true
   NEXT_PUBLIC_DEFAULT_LOCALE=en
   ```

2. **Backend Environment Variables**
   ```bash
   # In the backend directory, create a .env file
   cd backend
   cat > .env << EOF
   GEMINI_API_KEY=your_gemini_api_key_here
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   SECRET_KEY=your_secret_key_for_sessions
   FRONTEND_URL=http://localhost:3000
   EOF
   ```

### Running the Application

#### Option 1: Start Both Services Separately

**Terminal 1 - Backend (FastAPI)**
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (if exists)
source bin/activate  # On Linux/Mac
# or
# .\Scripts\activate  # On Windows

# Install dependencies (if not installed)
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend (Next.js)**
```bash
# From project root directory
npm install

# Start the development server
npm run dev
```

#### Option 2: Development Script (if available)
```bash
# Start both frontend and backend
npm run dev:full
```

### Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (FastAPI auto-docs)
- **Health Check**: http://localhost:8000/health

## 🔧 Frontend-Backend Integration Features

### Authentication
- **Google OAuth**: Login with Google account through backend API
- **Session Management**: Automatic token handling and persistence
- **Protected Routes**: Authentication-required pages with fallback

### Core Features Integrated

#### 1. Journal Analysis (`/journal`)
- **Real-time AI Analysis**: Journal entries analyzed by backend LLM
- **Emotion Detection**: Advanced emotion recognition and scoring
- **Safety Checking**: Crisis detection and resource recommendations
- **Exercise Recommendations**: Personalized wellness exercises based on analysis

#### 2. Mood Tracking (`/today`, `/moodindex`)
- **Daily Check-ins**: Structured mood and wellness questionnaires
- **Real-time Analytics**: Mood scores calculated and stored
- **Trend Analysis**: 7-day and 14-day moving averages
- **Interactive Chat**: AI-powered mood conversation interface

#### 3. Dashboard Analytics (`/dashboard`)
- **Mood Visualization**: Interactive charts showing mood trends over time
- **Progress Tracking**: Visual representation of emotional well-being
- **Personalized Insights**: Data-driven wellness recommendations
- **Historical Data**: Access to past mood entries and trends

#### 4. Crisis Support (`/crisis`)
- **Resource Access**: Location-based crisis support resources
- **Safety Classification**: Automatic detection of concerning content
- **Emergency Escalation**: Direct links to crisis hotlines when needed

### API Integration Architecture

#### Frontend API Client (`/lib/api.ts`)
- **Type-safe Requests**: Full TypeScript integration with backend models
- **Error Handling**: Centralized error management with user-friendly messages
- **Authentication Flow**: Automatic token management and refresh
- **Network Resilience**: Retry logic and offline fallbacks

#### Supported Backend Endpoints
```
Authentication:
  GET  /auth/me              - Get current user info
  GET  /auth/login           - OAuth login redirect
  GET  /auth/google/callback - OAuth callback handler

Analytics:
  GET  /analytics/checkin/questions - Get daily checkin questions
  POST /analytics/checkin          - Submit daily mood checkin
  GET  /analytics/series           - Get mood time series data
  GET  /analytics/team             - Get team analytics (coordinators only)

AI Services:
  POST /ai/analyze-entry     - Comprehensive journal analysis
  POST /ai/mood-score        - Quick mood scoring
  POST /ai/safety-check      - Crisis detection
  GET  /ai/get-baseline-questions - EQ assessment questions
  POST /ai/score-baseline    - Score EQ assessment
  POST /ai/get-exercise      - Get personalized exercises

Collaboration:
  POST /collab/rewrite       - AI message rewriting
  POST /collab/debrief       - Meeting notes structuring

Challenges:
  POST /challenges/create    - Create wellness challenges
  POST /challenges/join      - Join existing challenges
  POST /challenges/complete  - Mark challenge day complete
  GET  /challenges/leaderboard - View challenge progress

Crisis Support:
  GET  /crisis/resources     - Get crisis support resources by locale
```

## 🔍 Testing the Integration

### 1. Health Check
```bash
curl http://localhost:8000/health
# Expected: {"status": "ok", "retriever_ready": boolean}
```

### 2. Frontend Connection Test
1. Open http://localhost:3000
2. Navigate to any page
3. Check browser console for API connection messages
4. Watch for toast notifications indicating successful/failed API calls

### 3. Journal Analysis Test
1. Go to `/journal`
2. Enter text like: "I had a challenging day at work. Feeling overwhelmed and stressed."
3. Click "Analyze"
4. Verify you receive:
   - Emotion analysis
   - Mood score
   - Exercise recommendations
   - Safety assessment

### 4. Mood Tracking Test
1. Go to `/today`
2. Complete the daily check-in flow
3. Verify data is submitted to backend
4. Check `/dashboard` for updated mood chart

### 5. Authentication Test
1. Go to `/login`
2. Click "Login with Google"
3. Verify redirect to Google OAuth
4. After authentication, verify user session persistence

## 🛠 Development Notes

### Mock Data Fallbacks
All components include fallback mock data for development when:
- Backend is not running
- API calls fail
- User is not authenticated

### Error Handling
- Network errors display user-friendly messages
- Authentication failures redirect to login
- API timeouts trigger retry mechanisms
- Critical errors show fallback UI states

### Performance Considerations
- API calls are debounced where appropriate
- Large datasets use pagination
- Images and assets are optimized
- Components use React.memo for expensive renders

## 🐛 Troubleshooting

### Common Issues

**Backend Not Starting**
```bash
# Check Python environment
python --version
pip list

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check port availability
lsof -i :8000
```

**Frontend API Connection Issues**
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors
- Ensure backend is running and accessible
- Test API directly with curl/Postman

**Authentication Issues**
- Verify Google OAuth credentials in backend `.env`
- Check that redirect URLs match in Google Console
- Clear browser cookies and localStorage
- Verify session configuration in backend

**Database/AI Issues**
- Check that required AI models are available
- Verify environment variables for external APIs
- Review backend logs for detailed error messages
- Test individual endpoints using FastAPI docs at `/docs`

### Debug Mode
Enable debug mode by setting:
```bash
NEXT_PUBLIC_API_DEBUG=true
```

This will:
- Log all API requests/responses to console
- Show detailed error messages
- Display network timing information
- Enable additional debugging UI elements

## 📊 Monitoring

### Health Endpoints
- `/health` - Overall system health
- `/rag/status` - AI document retrieval status

### Logs
- **Frontend**: Browser console and Next.js terminal
- **Backend**: FastAPI server logs and `logs/` directory

### Performance Metrics
Monitor these key metrics:
- API response times (< 2s for most endpoints)
- Authentication success rate
- Journal analysis completion rate
- User session duration
- Error rates by endpoint

---

## 🚀 Production Deployment

When deploying to production:

1. **Update Environment Variables**
   - Set production API URLs
   - Configure production OAuth credentials
   - Set secure session secrets

2. **Build and Deploy Frontend**
   ```bash
   npm run build
   npm run start
   ```

3. **Deploy Backend**
   ```bash
   # Use production WSGI server
   gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

4. **Configure Reverse Proxy**
   - Set up nginx or similar for SSL termination
   - Configure proper CORS headers
   - Enable gzip compression

5. **Monitor and Scale**
   - Set up application monitoring
   - Configure database persistence
   - Plan for horizontal scaling

The integration is now complete and ready for development and testing!