marketplace-glass — full project (backend + frontend-glass)

How to run:
1. Backend
   cd backend
   npm install
   node seed-admin.js   # creates admin account voroninzaharfox11@gmail.com / painhub2007
   npm start

2. Frontend
   cd frontend-glass
   npm install
   npm run dev
   open http://localhost:3001

Notes:
- API URL in frontend is controlled by frontend-glass/.env (VITE_API_URL)
- Server enforces that only users with is_seller==1 or is_admin==1 can create listings
- Admin account: voroninzaharfox11@gmail.com / painhub2007
