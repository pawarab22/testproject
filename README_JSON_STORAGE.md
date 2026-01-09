# JSON File Storage System

## Important: Browser Limitations

**Browsers CANNOT write directly to files in the `public/data/` folder.** This is a security restriction.

## How It Works

1. **On App Start**: Data loads from `public/data/Enquiry.json`, `Feedback.json`, `Rettings.json`
2. **During Session**: Data is stored in **memory** (not localStorage, not files)
3. **Form Submission**: Data is saved to memory and should appear in Admin Dashboard
4. **Persistence**: Admin must manually export JSON files to save data

## To Persist Data to JSON Files

1. Go to Admin Dashboard
2. Click "Export Enquiries JSON" or "Export All Data"
3. Download the JSON file
4. Replace the file in `public/data/` folder with the downloaded file
5. Restart the app to load the updated data

## Current Status

- ✅ Data is saved to memory when forms are submitted
- ✅ Data should be visible in Admin Dashboard
- ✅ Export functionality available in Admin Dashboard
- ❌ Cannot auto-write to JSON files (browser limitation)

## Testing

1. Submit an enquiry form
2. Check browser console - you should see: "Enquiry saved to memory. Total enquiries: X"
3. Go to Admin Dashboard - the enquiry should appear
4. Click "Export Enquiries JSON" to download the updated file
5. Replace `public/data/Enquiry.json` with the downloaded file
