import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  serverTimestamp,
  query, 
  orderBy, 
  onSnapshot
} from "firebase/firestore";
import { 
  getAuth, 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  User, Phone, Mail, MapPin, Briefcase, 
  Download, Send, LogOut, CheckCircle, 
  AlertCircle, ChevronDown, Lock, Menu, X, Image as ImageIcon,
  Facebook, Building, List, Filter, Search, FileText, ShieldAlert
} from 'lucide-react';

// --- إعدادات النظام ---
// نستخدم import.meta.env لأنك تستخدم Vite (هذا هو الصحيح للنشر على Vercel)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- الثوابت ---
const MOROCCO_REGIONS = [
  "طنجة - تطوان - الحسيمة", "الشرق", "فاس - مكناس", 
  "الرباط - سلا - القنيطرة", "بني ملال - خنيفرة", "الدار البيضاء - سطات",
  "مراكش - آسفي", "درعة - تافيلالت", "سوس - ماسة",
  "كلميم - واد نون", "العيون - الساقية الحمراء", "الداخلة - وادي الذهب"
];

const COLORS = ['#009FE3', '#005EB8', '#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd'];
const MAIN_BLUE = "#009FE3";
const DARK_BLUE = "#1e3a8a";

const GlobalStyles = () => (
  <style>{`
    .gradient-header { background: linear-gradient(135deg, ${MAIN_BLUE} 0%, ${DARK_BLUE} 100%); }
    .card-hover { transition: all 0.3s ease; }
    .card-hover:hover { transform: translateY(-5px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
  `}</style>
);

const Logo = ({ size = "large" }) => (
  <div className={`flex flex-col items-center justify-center ${size === "small" ? "scale-75" : ""}`}>
    <div className="mb-4">
       {/* استبدل src برابط الشعار الخاص بك */}
       <div className="flex flex-col items-center justify-center w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-gray-400">
         <ImageIcon size={32} />
         <span className="text-[10px] mt-2 font-bold text-center">شعار الهيئة</span>
       </div>
    </div>
    <div className="text-center">
      <h1 className={`font-black text-gray-800 leading-none mb-1 ${size === "small" ? "text-lg" : "text-2xl"}`}>
        الهيئة الوطنية لأطر التربية والتكوين
      </h1>
      <h2 className={`font-extrabold text-[#009FE3] leading-none ${size === "small" ? "text-base" : "text-2xl"}`}>
        التجمعيين
      </h2>
    </div>
  </div>
);

// --- 1. واجهة التسجيل ---
const RegistrationView = ({ setView, submitStatus, setSubmitStatus, handleSubmit, loading, formData, handleInputChange }) => (
  <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans" dir="rtl">
    <div className="absolute top-0 left-0 w-full h-80 gradient-header skew-y-3 origin-top-left z-0 transform -translate-y-20 shadow-2xl"></div>
    <header className="relative z-10 container mx-auto px-4 py-6 flex justify-between items-center">
      <div className="w-10"></div> 
      <button onClick={() => setView('login')} className="text-white hover:bg-white/20 transition-all flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 backdrop-blur-md shadow-lg group">
        <Lock size={16} /> <span className="text-sm font-bold">دخول المشرفين</span>
      </button>
    </header>
    <main className="relative z-10 container mx-auto px-4 pb-4 flex flex-col items-center -mt-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 relative">
        <div className="bg-white pt-10 pb-2 px-8 flex flex-col items-center">
          <Logo />
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-700 rounded-full my-6"></div>
          <h1 className="text-3xl font-black text-gray-800 mb-2 text-center tracking-tight">استمارة الانخراط الرقمية</h1>
          <p className="text-gray-500 font-medium">الهيئة الوطنية لأطر التربية والتكوين التجمعيين</p>
        </div>
        {submitStatus === 'success' ? (
          <div className="p-16 text-center animate-fade-in">
            <div className="w-28 h-28 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"><CheckCircle size={56} /></div>
            <h2 className="text-4xl font-black text-gray-800 mb-4">تم التسجيل بنجاح!</h2>
            <button onClick={() => setSubmitStatus('idle')} className="bg-[#009FE3] text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-600 shadow-xl mx-auto flex gap-2">تسجيل عضو جديد <ChevronDown className="rotate-270"/></button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 pb-12 md:px-20 pt-4 space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#1e3a8a] flex items-center gap-3 border-b border-blue-100 pb-3"><User className="text-[#009FE3]"/> المعلومات الشخصية</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white border-gray-100 rounded-2xl focus:border-[#009FE3] outline-none" placeholder="الاسم الكامل" required />
                <input name="cnie" value={formData.cnie} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white border-gray-100 rounded-2xl focus:border-[#009FE3] outline-none uppercase" placeholder="CNIE" required />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#1e3a8a] flex items-center gap-3 border-b border-blue-100 pb-3"><Phone className="text-[#009FE3]"/> التواصل</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white border-gray-100 rounded-2xl focus:border-[#009FE3] outline-none" placeholder="رقم الهاتف (10 أرقام)" dir="ltr" maxLength="10" required />
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white border-gray-100 rounded-2xl focus:border-[#009FE3] outline-none" placeholder="البريد الإلكتروني" dir="ltr" required />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#1e3a8a] flex items-center gap-3 border-b border-blue-100 pb-3"><Briefcase className="text-[#009FE3]"/> المهنة والجهة</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <select name="region" value={formData.region} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white border-gray-100 rounded-2xl focus:border-[#009FE3] outline-none appearance-none cursor-pointer" required>
                    <option value="">اختر الجهة (الأكاديمية)...</option>
                    {MOROCCO_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown className="absolute left-4 top-5 text-gray-400 pointer-events-none" size={20} />
                </div>
                <input name="city" value={formData.city} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white border-gray-100 rounded-2xl focus:border-[#009FE3] outline-none" placeholder="المدينة / المديرية الإقليمية" required />
                <input name="profession" value={formData.profession} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white border-gray-100 rounded-2xl focus:border-[#009FE3] outline-none" placeholder="المهنة (مثال: أستاذ التعليم الابتدائي)" required />
                <input name="province" value={formData.province} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white border-gray-100 rounded-2xl focus:border-[#009FE3] outline-none" placeholder="الإقليم" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#009FE3] to-[#1e3a8a] text-white font-black text-xl py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-4 hover:scale-[1.01]">
              {loading ? 'جاري الاتصال وحفظ البيانات...' : 'تأكيد التسجيل النهائي'} <Send />
            </button>
          </form>
        )}
      </div>
      <footer className="mt-4 pb-8 text-center text-gray-500 text-sm font-medium">
        <div className="flex items-center justify-center gap-2">
          <span>تصميم و إعداد :</span>
          <span className="text-[#009FE3] font-bold flex items-center gap-1">ذ.إقبال أوعيسى <Facebook size={14} /></span>
        </div>
      </footer>
    </main>
  </div>
);

// --- 2. واجهة الدخول ---
const LoginView = ({ handleAdminLogin, adminEmail, setAdminEmail, adminPassword, setAdminPassword, loginError, loading, setView }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 relative font-sans" dir="rtl">
    <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[2.5rem] shadow-2xl w-full max-w-[480px] border border-white/50 z-10">
      <div className="text-center mb-12"><Logo size="small" /><h2 className="text-3xl font-black text-gray-800 mt-8">بوابة المشرفين الآمنة</h2></div>
      <form onSubmit={handleAdminLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
          <input 
            type="email"
            value={adminEmail} 
            onChange={(e)=>setAdminEmail(e.target.value)} 
            className="w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl focus:border-[#009FE3] outline-none" 
            placeholder="admin@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
          <input 
            type="password" 
            value={adminPassword} 
            onChange={(e)=>setAdminPassword(e.target.value)} 
            className="w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl focus:border-[#009FE3] outline-none" 
            placeholder="••••••••" 
            required
          />
        </div>
        
        {loginError && <div className="text-red-500 font-bold flex gap-2"><AlertCircle/>{loginError}</div>}
        
        <button type="submit" disabled={loading} className="w-full bg-[#1e293b] text-white py-5 rounded-2xl font-black hover:bg-black transition-all shadow-xl disabled:opacity-50">
          {loading ? 'جاري التحقق...' : 'دخول آمن'}
        </button>
        <button type="button" onClick={()=>setView('form')} className="w-full text-gray-400 font-bold">عودة</button>
      </form>
    </div>
  </div>
);

// --- 3. لوحة التحكم ---
const DashboardView = ({ sidebarOpen, setSidebarOpen, handleLogout, loginUser, exportToExcel, exportToPDF, registrations, accessDenied }) => {
  // حالات الفرز
  const [filterRegion, setFilterRegion] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // استخراج المدن والجهات المتاحة للفرز
  const availableCities = useMemo(() => [...new Set(registrations.map(r => r.city))], [registrations]);
  const availableRegions = useMemo(() => [...new Set(registrations.map(r => r.region))], [registrations]);

  // تصفية البيانات
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(item => {
      const matchRegion = filterRegion ? item.region === filterRegion : true;
      const matchCity = filterCity ? item.city === filterCity : true;
      const matchSearch = searchTerm 
        ? (item.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || item.phone?.includes(searchTerm))
        : true;
      return matchRegion && matchCity && matchSearch;
    });
  }, [registrations, filterRegion, filterCity, searchTerm]);

  // تحليل البيانات
  const regionData = useMemo(() => {
    const c={}; filteredRegistrations.forEach(r=>c[r.region]=(c[r.region]||0)+1);
    return Object.keys(c).map(k=>({name:k, value:c[k]})).sort((a,b)=>b.value-a.value);
  }, [filteredRegistrations]);
  
  const professionData = useMemo(() => {
    const c={}; filteredRegistrations.forEach(r=>c[r.profession]=(c[r.profession]||0)+1);
    return Object.keys(c).map(k=>({name:k, value:c[k]})).sort((a,b)=>b.value-a.value);
  }, [filteredRegistrations]);

  const cityData = useMemo(() => {
    const c={}; filteredRegistrations.forEach(r=>c[r.city]=(c[r.city]||0)+1);
    return Object.keys(c).map(k=>({name:k, value:c[k]})).sort((a,b)=>b.value-a.value);
  }, [filteredRegistrations]);

  // --- شاشة الخطأ في الصلاحيات (الجديدة) ---
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-2xl text-center border border-red-100">
           <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
             <ShieldAlert size={48}/>
           </div>
           <h2 className="text-3xl font-black text-gray-800 mb-4">تنبيه أمني من المنصة</h2>
           <p className="text-gray-600 mb-8 text-lg leading-relaxed">
             تم تسجيل دخولك بنجاح، ولكن <strong>النظام لا يستطيع التأكد من صلاحياتك كمشرف</strong>.
             <br/><br/>
             <span className="text-red-500 font-bold block mb-2">السبب المحتمل:</span>
             لم يتم إضافة حسابك في قاعدة البيانات ضمن قائمة المشرفين (Users Collection).
           </p>
           
           <div className="bg-blue-50 p-6 rounded-2xl text-right mb-8 border border-blue-100">
             <h4 className="font-bold text-[#009FE3] mb-2">كيفية الحل (للمطور):</h4>
             <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
               <li>اذهب إلى لوحة تحكم قاعدة البيانات.</li>
               <li>أنشئ مجموعة (Collection) باسم <code>users</code>.</li>
               <li>أضف مستنداً (Document) يحمل نفس <strong>معرف المستخدم (UID)</strong> الخاص بك.</li>
               <li>أضف حقلاً بداخله باسم <code>role</code> وقيمة <code>admin</code>.</li>
               <li>معرفك الحالي هو: <code className="bg-white px-2 py-1 rounded border mx-1 select-all">{loginUser?.uid}</code></li>
             </ul>
           </div>

           <button onClick={handleLogout} className="bg-gray-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all">
             تسجيل الخروج والمحاولة لاحقاً
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex text-right" dir="rtl">
      <aside className={`bg-[#1e293b] text-white transition-all duration-500 fixed h-full z-20 shadow-2xl ${sidebarOpen?'w-72':'w-24'} flex flex-col`}>
        <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
          {sidebarOpen && <span className="font-bold text-xl text-blue-400">لوحة التحكم</span>}
          <button onClick={()=>setSidebarOpen(!sidebarOpen)}><Menu/></button>
        </div>
        <div className="p-6 mt-auto"><button onClick={handleLogout} className="text-red-400 flex gap-4"><LogOut/>{sidebarOpen&&"خروج"}</button></div>
      </aside>
      <div className={`flex-1 transition-all duration-500 ${sidebarOpen?'mr-72':'mr-24'}`}>
        <header className="bg-white shadow-sm sticky top-0 z-10 p-5 flex justify-between">
            <h2 className="text-2xl font-black text-gray-800">نظرة عامة</h2>
            <div className="text-[#009FE3] font-bold">المشرف: {loginUser?.email}</div>
        </header>
        <main className="p-10 space-y-8">
          
          {/* أدوات الفرز والتصدير */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-end mb-4">
               <div className="flex gap-4 w-full lg:w-3/4">
                 <div className="flex-1">
                   <label className="text-xs font-bold text-gray-400 mb-1 block">بحث (الاسم/الهاتف)</label>
                   <div className="relative">
                     <input value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-3 pl-10 focus:border-[#009FE3] outline-none" placeholder="بحث..." />
                     <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
                   </div>
                 </div>
                 <div className="flex-1">
                   <label className="text-xs font-bold text-gray-400 mb-1 block">تصفية حسب الجهة</label>
                   <select value={filterRegion} onChange={(e)=>setFilterRegion(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-3 outline-none">
                     <option value="">الكل</option>
                     {availableRegions.map(r => <option key={r} value={r}>{r}</option>)}
                   </select>
                 </div>
                 <div className="flex-1">
                   <label className="text-xs font-bold text-gray-400 mb-1 block">تصفية حسب المدينة</label>
                   <select value={filterCity} onChange={(e)=>setFilterCity(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-3 outline-none">
                     <option value="">الكل</option>
                     {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                 </div>
               </div>
               <div className="flex gap-2 w-full lg:w-auto">
                 <button onClick={()=>exportToExcel(filteredRegistrations)} className="flex-1 bg-green-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2"><Download size={18}/> Excel</button>
                 <button onClick={exportToPDF} className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-red-700 flex items-center justify-center gap-2"><FileText size={18}/> PDF</button>
               </div>
            </div>
            <div className="text-sm text-gray-500 font-bold">عدد النتائج: <span className="text-[#009FE3] text-lg">{filteredRegistrations.length}</span></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm flex justify-between">
                <div><p className="font-bold text-gray-500">مجموع المسجلين</p><h3 className="text-5xl font-black text-[#009FE3]">{registrations.length}</h3></div>
                <User size={40} className="text-[#009FE3]"/>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm flex justify-between">
                <div><p className="font-bold text-gray-500">الجهات المغطاة</p><h3 className="text-5xl font-black text-purple-600">{regionData.length}</h3></div>
                <MapPin size={40} className="text-purple-600"/>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm flex justify-between">
                <div><p className="font-bold text-gray-500">المدن المغطاة</p><h3 className="text-5xl font-black text-indigo-600">{cityData.length}</h3></div>
                <Building size={40} className="text-indigo-600"/>
              </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 h-96">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm lg:col-span-1 flex flex-col">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><MapPin size={18}/> التوزيع حسب الأكاديمية</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer><PieChart><Pie data={regionData} dataKey="value" outerRadius={80} fill="#8884d8" label>{regionData.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm lg:col-span-1 flex flex-col">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Briefcase size={18}/> المهن (النتائج الحالية)</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer><BarChart data={professionData.slice(0,5)} layout="vertical"><XAxis type="number" hide/><YAxis dataKey="name" type="category" width={100} tick={{fontSize:12}}/><Tooltip/><Bar dataKey="value" fill="#009FE3" barSize={20}/></BarChart></ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm lg:col-span-1 flex flex-col">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Building size={18}/> المدن (النتائج الحالية)</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer><BarChart data={cityData.slice(0,5)} layout="vertical"><XAxis type="number" hide/><YAxis dataKey="name" type="category" width={100} tick={{fontSize:12}}/><Tooltip/><Bar dataKey="value" fill="#1e3a8a" barSize={20}/></BarChart></ResponsiveContainer>
                </div>
              </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden p-8" id="printable-table">
              <h3 className="font-black text-xl mb-4 text-[#1e3a8a]">سجل الانخراطات التفصيلي</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="pb-4 pt-4 px-4 text-right text-gray-500">الاسم</th>
                      <th className="pb-4 pt-4 px-4 text-right text-gray-500">CNIE</th>
                      <th className="pb-4 pt-4 px-4 text-right text-gray-500">الهاتف</th>
                      <th className="pb-4 pt-4 px-4 text-right text-gray-500">المدينة/الإقليم</th>
                      <th className="pb-4 pt-4 px-4 text-right text-gray-500">المهنة</th>
                      <th className="pb-4 pt-4 px-4 text-right text-gray-500">الأكاديمية</th>
                    </tr>
                  </thead>
                  <tbody>{filteredRegistrations.map(r=><tr key={r.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="py-4 px-4 font-bold">{r.fullName}</td>
                    <td className="py-4 px-4 font-mono bg-gray-100 rounded text-center text-xs">{r.cnie}</td>
                    <td className="py-4 px-4" dir="ltr">{r.phone}</td>
                    <td className="py-4 px-4">{r.city} / {r.province}</td>
                    <td className="py-4 px-4 text-[#009FE3] font-bold">{r.profession}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{r.region}</td>
                  </tr>)}</tbody>
                </table>
              </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// --- التطبيق الرئيسي ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('form');
  const [loading, setLoading] = useState(false);
  
  // حالات تسجيل الدخول الآمن
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false); // حالة رفض الصلاحية الجديدة

  const [formData, setFormData] = useState({
    fullName: '', cnie: '', phone: '', email: '',
    region: '', province: '', city: '', profession: ''
  });
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [registrations, setRegistrations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // المصادقة الأولية (Check Auth State)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (!currentUser.isAnonymous) {
          setView('dashboard');
        }
      } else {
        signInAnonymously(auth).catch(err => console.error("Anonymous Auth Failed:", err));
      }
    });
    return () => unsubscribe();
  }, []);

  // جلب البيانات فقط عند الدخول للوحة التحكم والمستخدم ليس مجهولاً
  useEffect(() => {
    if (!user || user.isAnonymous || view !== 'dashboard') return;
    setAccessDenied(false); // تصفير حالة الرفض عند المحاولة
    
    const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRegistrations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      if (error.code === 'permission-denied') {
         // بدلاً من إظهار رسالة بالإنجليزية، نقوم بتفعيل شاشة التنبيه العربية
         setAccessDenied(true);
      } else {
         console.error("System Error:", error.message); // رسالة عامة
      }
    });
    return () => unsubscribe();
  }, [user, view]);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- التحقق من البيانات (Validation) ---
    if (!formData.fullName || !formData.phone || !formData.cnie) return alert("المرجو ملء الخانات الضرورية");
    if (!/^[A-Z0-9]+$/i.test(formData.cnie)) return alert("رقم البطاقة الوطنية يجب أن يحتوي على حروف وأرقام فقط");
    
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) return alert("رقم الهاتف يجب أن يتكون من 10 أرقام بالضبط");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return alert("يرجى إدخال بريد إلكتروني صحيح");

    if (!auth.currentUser) await signInAnonymously(auth);

    setLoading(true);
    try {
      await addDoc(collection(db, 'registrations'), {
        ...formData, 
        createdAt: serverTimestamp(), 
        userAgent: navigator.userAgent,
        uid: auth.currentUser?.uid || 'anonymous'
      });
      setSubmitStatus('success');
      setFormData({ fullName: '', cnie: '', phone: '', email: '', region: '', province: '', city: '', profession: '' });
    } catch (err) { 
      console.error("System Error"); 
      alert("حدث خطأ في الاتصال. حاول مرة أخرى.");
      setSubmitStatus('error'); 
    }
    setLoading(false);
  };

  // --- تسجيل دخول المشرف (الآمن) ---
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      setAdminEmail('');
      setAdminPassword('');
    } catch (error) {
      console.error("Auth Error");
      setLoginError("البريد الإلكتروني أو كلمة السر غير صحيحة");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setAccessDenied(false);
    setView('form');
  };

  const exportToPDF = () => {
    const element = document.getElementById('printable-table');
    const opt = {
      margin: 0.5,
      filename: `Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    if (window.html2pdf) {
        window.html2pdf().set(opt).from(element).save();
    } else {
        alert("خاصية PDF جاري تحميلها، يرجى الانتظار قليلاً...");
    }
  };

  const exportToExcel = (dataToExport) => {
    const tableHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <style>
          body { font-family: 'Cairo', 'Arial', sans-serif; direction: rtl; }
          .header { background-color: ${MAIN_BLUE}; color: white; font-weight: bold; text-align: center; border: 1px solid #000; }
          .cell { border: 1px solid #ccc; padding: 5px; text-align: right; }
          .title { font-size: 20px; font-weight: bold; color: ${DARK_BLUE}; text-align: center; margin-bottom: 10px; }
        </style>
      </head>
      <body dir="rtl">
        <div class="title">الهيئة الوطنية لأطر التربية والتكوين التجمعيين</div>
        <div style="text-align:center; margin-bottom:10px;">قاعدة البيانات الرسمية</div>
        <table border="1" cellspacing="0" cellpadding="5">
          <thead>
            <tr style="height: 40px;">
              <th class="header">الاسم الكامل</th>
              <th class="header">CNIE</th>
              <th class="header">الهاتف</th>
              <th class="header">البريد الإلكتروني</th>
              <th class="header">الجهة (الأكاديمية)</th>
              <th class="header">المدينة</th>
              <th class="header">المهنة</th>
              <th class="header">الإقليم</th>
            </tr>
          </thead>
          <tbody>
            ${dataToExport.map(r => `
            <tr>
              <td class="cell">${r.fullName || ''}</td>
              <td class="cell" style="font-family: monospace;">${r.cnie || ''}</td>
              <td class="cell">${r.phone || ''}</td>
              <td class="cell">${r.email || ''}</td>
              <td class="cell">${r.region || ''}</td>
              <td class="cell">${r.city || ''}</td>
              <td class="cell">${r.profession || ''}</td>
              <td class="cell">${r.province || ''}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>`;
      
    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `RNI_Database_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
  };

  return (
    <>
      <GlobalStyles />
      {view === 'form' && <RegistrationView 
          setView={setView} 
          submitStatus={submitStatus} 
          setSubmitStatus={setSubmitStatus}
          handleSubmit={handleSubmit}
          loading={loading}
          formData={formData}
          handleInputChange={handleInputChange}
      />}
      {view === 'login' && <LoginView 
          handleAdminLogin={handleAdminLogin}
          adminEmail={adminEmail}
          setAdminEmail={setAdminEmail}
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
          loginError={loginError}
          loading={loading}
          setView={setView}
      />}
      {view === 'dashboard' && <DashboardView 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          handleLogout={handleLogout}
          loginUser={user}
          setView={setView}
          exportToExcel={exportToExcel}
          exportToPDF={exportToPDF}
          registrations={registrations}
          accessDenied={accessDenied}
      />}
    </>
  );
}
