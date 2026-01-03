# Review Resume Feature - Setup Instructions

## 🚀 Quick Start

### 1. Database Migration

Run the SQL migration file in your Supabase SQL Editor:

```bash
# File: supabase-review-resume-migration.sql
```

This creates:
- `resume_reviews` table - Stores uploaded PDF resumes
- `resume_review_comments` table - Stores comments on reviews

### 2. Supabase Storage Bucket

Create a new storage bucket in Supabase:

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `resume-reviews`
4. Public: ✅ **Yes** (so PDFs can be accessed via public URLs)
5. File size limit: 10MB (or your preference)
6. Allowed MIME types: `application/pdf`

**Important**: Make sure the bucket is **public** so that PDFs can be viewed without authentication.

### 3. Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Test the Feature

1. **Upload a Resume**:
   - Go to `/review-resume` (or click "Review Resume" in header/dashboard)
   - Click "Upload PDF"
   - Select a PDF file
   - Enter a title
   - Wait for upload to complete

2. **Share the Link**:
   - Copy the shareable link
   - Open in a new tab/incognito window
   - The PDF should display with a comment sidebar

3. **Add Comments**:
   - Use the WYSIWYG editor to add comments
   - Optionally add your name/email
   - Comments appear in real-time (polling every 5 seconds)

## 📁 File Structure

```
app/
  review-resume/
    page.tsx                    # Upload & manage reviews
    [token]/
      page.tsx                  # Public review page
  api/
    review-resume/
      route.ts                  # GET: List, POST: Upload
      [id]/
        route.ts                # GET: Details, DELETE: Delete
      [token]/
        public/
          route.ts              # GET: Public review by token
        comments/
          route.ts              # GET: Comments, POST: Add comment

components/
  review-resume/
    pdf-viewer.tsx              # PDF.js viewer component
    comment-sidebar.tsx         # Comments display & form
```

## 🔧 Features Implemented

✅ PDF upload (max 10MB)
✅ Shareable link generation
✅ PDF viewer with zoom & pagination
✅ WYSIWYG comment editor (TipTap)
✅ Real-time comment updates (polling)
✅ Threaded comments support
✅ Anonymous or named comments
✅ Responsive design

## 🐛 Troubleshooting

### PDF not loading?
- Check Supabase Storage bucket is **public**
- Verify PDF URL is accessible
- Check browser console for CORS errors

### Comments not appearing?
- Check API endpoint is accessible
- Verify database tables exist
- Check browser console for errors

### Upload failing?
- Verify file is PDF format
- Check file size < 10MB
- Ensure storage bucket exists and is public

## 📝 Next Steps (Future Enhancements)

- [ ] Email notifications for new comments
- [ ] Comment editing/deletion
- [ ] Link expiration dates
- [ ] Password protection for reviews
- [ ] WebSocket real-time updates (instead of polling)
- [ ] Export comments as PDF
- [ ] Analytics (views, comment count)


