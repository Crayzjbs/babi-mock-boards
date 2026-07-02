# Deploying to Vercel

## Prerequisites
- A Vercel account (sign up at https://vercel.com)
- Git installed on your machine
- Your Supabase credentials

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**
   ```bash
   cd c:\Users\knthj\CascadeProjects\nextjs-shadcn-app
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? (Select your account)
   - Link to existing project? **N**
   - What's your project's name? **babi-mock-boards** (or your preferred name)
   - In which directory is your code located? **./** (press Enter)
   - Want to modify settings? **N**

5. **Add Environment Variables**
   After deployment, add your environment variables:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   
   Or add them via the Vercel Dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://wicouooopcarikfcomvv.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your_anon_key_here`

6. **Redeploy with environment variables**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your repository
   - Configure project:
     - Framework Preset: **Next.js**
     - Root Directory: **./** (leave as default)
     - Build Command: **npm run build** (auto-detected)
     - Output Directory: **.next** (auto-detected)

3. **Add Environment Variables**
   Before deploying, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://wicouooopcarikfcomvv.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your_anon_key_here`

4. **Click "Deploy"**

## Post-Deployment

### Update Supabase Settings
1. Go to your Supabase dashboard
2. Navigate to Settings → API
3. Add your Vercel deployment URL to the allowed URLs

### Custom Domain (Optional)
1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure environment variables are set correctly
- Review build logs in Vercel dashboard

### Environment Variables Not Working
- Make sure variable names start with `NEXT_PUBLIC_`
- Redeploy after adding environment variables
- Check that variables are set for Production environment

### Database Connection Issues
- Verify Supabase URL and key are correct
- Check that Supabase project is active
- Ensure RLS policies allow public access for your tables

## Your Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://wicouooopcarikfcomvv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your key from .env.local]
```

## Useful Commands
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List all deployments
vercel ls

# Remove a deployment
vercel rm [deployment-url]
```
