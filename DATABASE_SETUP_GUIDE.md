# Database Setup Guide

## 🚨 **Why You're Seeing Static Data**

Your dashboard shows static data (0 analyses, 95.2% accuracy, etc.) because the database tables don't exist yet. Once you set up the database, you'll see:

- ✅ **Real analysis count** - Actual number of images you've analyzed
- ✅ **Real confidence scores** - Average from your actual predictions  
- ✅ **Real disease count** - Number of different diseases detected
- ✅ **Real processing time** - Actual time taken for analysis

## 🚀 **Quick Setup (5 minutes)**

### **Step 1: Go to Supabase Dashboard**
1. Visit: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New query"

### **Step 2: Run the Database Setup Script**
1. Copy the entire contents of `setup-database.sql` file
2. Paste it into the SQL Editor
3. Click "Run" (or press Ctrl+Enter)

### **Step 3: Verify Setup**
Run this command in your terminal:
```bash
node test-database.js
```

You should see:
```
✅ Database connection successful
✅ Predictions table accessible
✅ Plant diseases table accessible
🎉 Database setup is working correctly!
```

### **Step 4: Test the Application**
1. Go to your dashboard: http://localhost:3002/dashboard
2. Upload an image
3. Select a plant type
4. Click "Analyze Plant"
5. **Watch the statistics update in real-time!**

## 📊 **What You'll See After Setup**

### **Before Setup (Current):**
- Total Analyses: **0** (static)
- Accuracy Rate: **95.2%** (static)
- Diseases Detected: **12+** (static)
- Avg. Processing: **2.3s** (static)

### **After Setup (Real Data):**
- Total Analyses: **1, 2, 3...** (increases with each analysis)
- Accuracy Rate: **87.5%** (calculated from your actual predictions)
- Diseases Detected: **3** (actual diseases found in your analyses)
- Avg. Processing: **2.1s** (real processing time)

## 🔍 **How Real Data Works**

### **Total Analyses:**
```sql
SELECT COUNT(*) FROM predictions WHERE user_id = 'your-user-id'
```

### **Average Confidence:**
```sql
SELECT AVG(confidence_score) * 100 FROM predictions WHERE user_id = 'your-user-id'
```

### **Unique Diseases:**
```sql
SELECT COUNT(DISTINCT predicted_disease) FROM predictions WHERE user_id = 'your-user-id'
```

### **Recent Predictions:**
```sql
SELECT * FROM predictions WHERE user_id = 'your-user-id' ORDER BY created_at DESC LIMIT 5
```

## 🎯 **Expected Results After Setup**

1. **First Analysis:**
   - Total Analyses: **1**
   - Accuracy Rate: **89.2%** (from your first prediction)
   - Diseases Detected: **1** (the disease you detected)
   - Recent Analysis: Shows your first result

2. **After 5 Analyses:**
   - Total Analyses: **5**
   - Accuracy Rate: **87.8%** (average of all 5)
   - Diseases Detected: **3** (if you detected 3 different diseases)
   - Recent Analysis: Shows your last 5 results

## 🚨 **If Setup Fails**

### **Common Issues:**

1. **"Permission denied"**
   - Make sure you're logged into the correct Supabase project
   - Check if you have admin access

2. **"Table already exists"**
   - This is fine! The script uses `CREATE TABLE IF NOT EXISTS`
   - Just continue to the next step

3. **"Syntax error"**
   - Make sure you copied the entire script
   - Check for any missing semicolons

### **Alternative Method:**
If the SQL script doesn't work, you can create tables manually:

1. Go to "Table Editor" in Supabase
2. Create tables one by one:
   - `profiles`
   - `plant_diseases` 
   - `predictions`
3. Set up the relationships and policies

## 🎉 **After Setup**

Once the database is set up:

1. **Every analysis will be saved** to the database
2. **Statistics will update in real-time** based on your actual data
3. **Recent predictions will show** your actual analysis history
4. **Dashboard will display** real metrics instead of static values

## 📝 **Next Steps**

1. **Set up the database** using the SQL script
2. **Test with multiple images** to see statistics change
3. **Integrate your actual model** (optional - works with mock data too)
4. **Deploy to production** when ready

The application will work perfectly with mock data, but setting up the database gives you real analytics and data persistence!

