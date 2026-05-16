You are a senior full-stack mobile/web app developer and product engineer.

I have a React/Vite prototype for an app called PantryPal. I want you to help me turn it into a fully functional app, not just a design prototype.

PROJECT NAME:
PantryPal

PROJECT SUMMARY:
PantryPal is a mobile-first grocery tracking and simple meal planning app. It helps users track food they already have, reduce food waste, create grocery lists, get expiration and low-stock reminders, and find simple meal ideas based on pantry items.

PRIMARY PLATFORM:
Mobile app for iOS and Android

SECONDARY PLATFORMS:
Web app later
Windows desktop app later using Visual Studio C++ with WebView2 if needed

CURRENT STATUS:
The app prototype is already built in React/Vite. It includes screens and logic for:
- Welcome / Login
- Onboarding
- Home Dashboard
- Pantry
- Add Food
- Item Detail
- Grocery List
- Meal Ideas
- Recipe Detail
- AI Chef mock recommendations
- Meal Planner
- Cookbook
- Insights
- Settings
- Add Recipe
- Success/Error states
- Dark mode
- Large text mode
- Haptics
- LocalStorage persistence
- Import/export
- Photo upload
- Mock barcode scan

CURRENT TECH STACK:
- React
- Vite
- TypeScript
- CSS design tokens
- LocalStorage
- lucide-react icons
- sonner toast notifications
- recharts
- motion/react

GOAL:
Help me create a practical development plan and code strategy to turn this prototype into a working production-style MVP.

MVP REQUIREMENTS:
The first fully functional version should include:

1. User Accounts
- Create account
- Log in
- Log out
- Forgot password
- Guest mode if possible

2. Cloud Database
Replace or extend localStorage with cloud storage for:
- Users
- Pantry items
- Grocery items
- Recipes
- Meal plans
- Cook history
- Household members
- Diet preferences
- Purchase history

3. Pantry Features
- Add pantry item
- Edit pantry item
- Delete pantry item
- Mark item as used
- Track location: pantry, fridge, freezer
- Track quantity and unit
- Track expiration date or days until expiration
- Show expiring soon status
- Show low-stock status
- Search and filter pantry items

4. Grocery List Features
- Add grocery item
- Delete grocery item
- Mark item as bought
- Move bought items into pantry
- Low-stock suggestions
- Missing ingredient suggestions
- Prevent duplicate grocery items if possible

5. Meal Features
- Suggest meals based on pantry items
- Show available ingredients
- Show missing ingredients
- Add missing ingredients to grocery list
- Mark recipe ingredients as used
- Save favorite recipes
- Add custom recipes

6. Meal Planner
- Add meals to breakfast/lunch/dinner slots
- Weekly meal plan
- Add meal plan ingredients to grocery list

7. AI Chef
The current AI Chef is mock logic. I want a real but safe AI system later.
For MVP, create a backend-safe plan where:
- No API keys are stored in frontend code
- AI returns structured JSON
- AI respects pantry items, allergies, diet preferences, servings, and goal
- AI can suggest recipes and substitutions

8. Barcode Scanning
Add a realistic plan for barcode scanning:
- Camera permission
- Scan UPC/barcode
- Look up food item
- Auto-fill name/category if found
- Suggested expiration estimate
Use Open Food Facts or another practical API.

9. Notifications
Add reminders for:
- Expiring soon
- Low stock
- Meal prep reminders
Need a plan for web/mobile notifications.

10. Mobile Packaging
Recommend the best way to package my existing React/Vite app as a real mobile app.
Prefer reusing the current codebase if possible.
Consider Capacitor.

11. Backend Recommendation
Recommend the best backend for this project:
- Supabase
- Firebase
- Custom backend
Explain which is easiest for this app and why.

12. Security / Privacy
Include:
- Database rules
- User data privacy
- Household permissions
- API key safety
- Delete account / export data considerations

13. Development Roadmap
Break the work into phases:
- Phase 1: Make current app run cleanly
- Phase 2: Add backend/database/auth
- Phase 3: Replace localStorage with cloud sync
- Phase 4: Add barcode scanning
- Phase 5: Add notifications
- Phase 6: Add real AI Chef backend
- Phase 7: Package for mobile
- Phase 8: Testing and release

WHAT I NEED FROM YOU:
Please give me:

1. A clear recommended architecture
2. Recommended backend choice and why
3. Database schema/tables
4. Step-by-step MVP roadmap
5. What files/features in my current prototype need to change
6. What new files/folders should be added
7. How to migrate from localStorage to cloud storage
8. How to structure auth and household sharing
9. How to safely add AI without exposing API keys
10. How to package the app for mobile
11. A realistic checklist I can follow in order
12. Any risks or problems I should watch for

IMPORTANT STYLE:
Explain it in a beginner-friendly way. I am building this as a student project but I want it to be realistic enough to become a real app. Keep the plan practical and step-by-step. Do not overcomplicate it. Focus on what I should build first.