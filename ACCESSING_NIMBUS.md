# Accessing Nimbus Cloud UI

## 🌐 Access URL

**Use the backend port which serves both frontend and API:**

```
http://<YOUR-IP>:30400
```

For your instance:
```
http://100.26.58.65:30400
```

## Why Port 30400?

The Nimbus backend (port 30400) serves:
1. **Frontend UI** - Static React files at `/`
2. **API endpoints** - All `/api/*` routes

This eliminates CORS issues and simplifies deployment.

## Port 30401 Issue

Port 30401 serves only the frontend static files without API proxy configuration, which causes 404 errors when trying to make API calls. This is why you should use port 30400 instead.

## ✅ Correct Setup

- **Access Nimbus**: `http://100.26.58.65:30400`
- **API calls work**: Backend serves both UI and API
- **No CORS issues**: Same origin for frontend and backend

## 🔧 Alternative: Fix Frontend to Call Backend

If you want to use port 30401, you need to:

1. Update all axios calls to use absolute URLs pointing to port 30400
2. Configure CORS on the backend to allow requests from port 30401
3. Rebuild and redeploy the frontend Docker image

**Recommendation**: Just use port 30400 for everything!
