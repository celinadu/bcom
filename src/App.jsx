import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Hand, 
  FileSpreadsheet,
  RotateCw,
  Calendar
} from 'lucide-react';

// ==========================================
// 1. PASTE YOUR LINKS HERE
// ==========================================
const GOOGLE_SHEET_EMBED_URL = "https://docs.google.com/spreadsheets/d/1HZBaGdF92zYKWPXaHArCvdQb9x9jhDGihP1VMuVEkuM/edit?usp=sharing";
const APPS_SCRIPT_API_URL = "https://script.google.com/macros/s/AKfycbwQ-O4N5hTzjB6Kjd4LM8jR6Kb-hJUoN7keyue0xbvT4WryEiD0xV5P7U_F7SY7qYFB/exec";

const STUDENTS = [
  { id: 's1', name: 'Celina Du', email: 'celinadu@umich.edu' },
  { id: 's2', name: 'Claudia Duimstra', email: 'cduimstr@umich.edu' },
  { id: 's3', name: 'Lauren Azuara', email: 'laurenaz@umich.edu' },
  { id: 's4', name: 'Jackson Clancy', email: 'jfclancy@umich.edu' },
];

const COURSES = {
  'TO 313': {
    name: 'TO 313: Operations Management',
    schedule: 'Mon & Wed',
    allowedAbsences: 3,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  'BCOM 350': {
    name: 'BCOM 350: Business Communication',
    schedule: 'Wednesdays',
    allowedAbsences: 1, // 1 freebie absence limit
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  'BL 300': {
    name: 'BL 300: Legal Environment of Business',
    schedule: 'Tue & Thu',
    allowedAbsences: 3,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  'MO 300': {
    name: 'MO 300: Behavioral Theory in Mgmt',
    schedule: 'Tue & Thu',
    allowedAbsences: 3,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  }
};

const FALLBACK_SEED = {
  'Celina Du': {
    'TO 313': { 'Class 1: 8/31': 'Absent', 'Class 2: 9/2': 'Absent', 'Class 3: 9/9': 'Present' },
    'BCOM 350': { 'Class 1: 9/2': 'Spoke (1)', 'Class 2: 9/9': 'Present' },
    'BL 300': { 'Class 1: 9/1': 'Late <10 min', 'Class 2: 9/3': 'Spoke (2+)' },
    'MO 300': { 'Class 1: 9/1': 'Present', 'Class 2: 9/3': 'Present' },
  }
};

export default function App() {
  const [selectedStudentName, setSelectedStudentName] = useState('Celina Du');
  const [selectedCourseKey, setSelectedCourseKey] = useState('TO 313');
  const [sheetData, setSheetData] = useState(FALLBACK_SEED);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  const fetchLiveData = async () => {
    if (!APPS_SCRIPT_API_URL || APPS_SCRIPT_API_URL.includes("PASTE_YOUR")) {
      return;
    }
    setIsSyncing(true);
    try {
      const response = await fetch(APPS_SCRIPT_API_URL);
      const json = await response.json();
      if (json && Object.keys(json).length > 0) {
        setSheetData(json);
        setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.error("Failed to fetch Google Sheet data:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  const currentStudent = STUDENTS.find((s) => s.name === selectedStudentName) || STUDENTS[0];

  const getCourseStats = (courseCode) => {
    const course = COURSES[courseCode];
    const studentHistory = sheetData[selectedStudentName]?.[courseCode] || {};
    const allowedAbsences = course.allowedAbsences;
    
    let absencesUsed = 0;
    let totalParticipation = 0;

    Object.values(studentHistory).forEach((status) => {
      const trimmed = String(status || '').trim();
      if (trimmed === 'Absent') {
        absencesUsed += 1;
      } else if (trimmed === 'Spoke (1)') {
        totalParticipation += 1;
      } else if (trimmed === 'Spoke (2+)') {
        totalParticipation += 2;
      }
    });

    const absencesLeft = Math.max(0, allowedAbsences - absencesUsed);
    const sessionEntries = Object.entries(studentHistory);

    return {
      allowedAbsences,
      absencesLeft,
      absencesUsed,
      totalParticipation,
      sessionEntries
    };
  };

  const currentCourseStats = getCourseStats(selectedCourseKey);

  const renderStatusBadge = (status) => {
    const trimmed = String(status || '').trim();
    switch (trimmed) {
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-100">
            <XCircle className="h-3.5 w-3.5" /> Absent
          </span>
        );
      case 'Late <10 min':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-100">
            <Clock className="h-3.5 w-3.5" /> Late (&lt;10m)
          </span>
        );
      case 'Spoke (1)':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-100">
            <Hand className="h-3.5 w-3.5" /> Spoke (1 pt)
          </span>
        );
      case 'Spoke (2+)':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-900 border border-emerald-200">
            <Award className="h-3.5 w-3.5" /> Spoke (2+ pts)
          </span>
        );
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Present
          </span>
        );
      default:
        return (
          <span className="rounded bg-slate-50 px-2.5 py-1 text-xs text-slate-400 border border-dashed border-slate-200">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      {/* ================= LEFT HALF: STUDENT DASHBOARD ================= */}
      <section className="flex w-1/2 flex-col border-r border-slate-300 bg-white">
        
        {/* Fixed Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4 bg-white z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Student Course Central</h1>
            <p className="text-xs text-slate-500">Fall Semester • Live Academic Portal</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLiveData}
              disabled={isSyncing}
              title="Sync live changes from Google Sheets"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-100 active:scale-95 transition disabled:opacity-50 cursor-pointer"
            >
              <RotateCw className={`h-3.5 w-3.5 text-indigo-600 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Data'}
            </button>

            <select
              value={selectedStudentName}
              onChange={(e) => setSelectedStudentName(e.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs transition focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              {STUDENTS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="flex flex-1 flex-col overflow-hidden p-6 gap-5">
          
          {/* Top Section (Fixed): Student Banner & 4 Course Cards */}
          <div className="shrink-0 space-y-4">
            
            {/* Student Welcome Banner */}
            <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
              <div>
                <h2 className="text-base font-bold text-indigo-950">{currentStudent.name}</h2>
                <p className="text-xs text-indigo-700">{currentStudent.email}</p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  4 Courses Active
                </span>
                {lastSynced && (
                  <p className="mt-1 text-[10px] text-slate-400">Synced {lastSynced}</p>
                )}
              </div>
            </div>

            {/* BIRD'S EYE VIEW: 4 COURSES GRID */}
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Overview Across Enrolled Classes
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(COURSES).map((code) => {
                  const course = COURSES[code];
                  const stats = getCourseStats(code);
                  const isSelected = selectedCourseKey === code;

                  return (
                    <button
                      key={code}
                      onClick={() => setSelectedCourseKey(code)}
                      className={`flex flex-col text-left rounded-xl border p-3.5 transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-bold text-slate-900">{code}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${course.badgeColor}`}>
                          {course.schedule}
                        </span>
                      </div>
                      
                      <p className="mt-1 text-xs text-slate-500 line-clamp-1">{course.name}</p>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs w-full">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Absences Left</span>
                          <span className={`font-extrabold ${stats.absencesLeft === 0 ? 'text-rose-600' : stats.absencesLeft === 1 ? 'text-amber-600' : 'text-emerald-700'}`}>
                            {stats.absencesLeft} <span className="text-[10px] font-normal text-slate-400">/ {stats.allowedAbsences}</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Participation</span>
                          <span className="font-extrabold text-indigo-700">
                            {stats.totalParticipation} pts
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Section (Dedicated Scroll Area): Detailed Date-by-Date Drilldown */}
          <div className="flex flex-1 flex-col min-h-0 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            
            {/* Sticky Card Header */}
            <div className="shrink-0 flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-white">
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  {COURSES[selectedCourseKey].name}
                </h4>
                <p className="text-xs text-slate-400">
                  Meets {COURSES[selectedCourseKey].schedule} • {COURSES[selectedCourseKey].allowedAbsences} Absence Freebie Policy
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  currentCourseStats.absencesLeft === 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {currentCourseStats.absencesLeft} / {currentCourseStats.allowedAbsences} left
                </span>
                <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  {currentCourseStats.totalParticipation} pts
                </span>
              </div>
            </div>

            {/* Independently Scrollable Session Log */}
            <div className="flex-1 overflow-y-auto px-5 divide-y divide-slate-100">
              {currentCourseStats.sessionEntries.length > 0 ? (
                currentCourseStats.sessionEntries.map(([sessionTitle, status]) => (
                  <div key={sessionTitle} className="flex items-center justify-between py-2.5 hover:bg-slate-50/60 transition-colors">
                    <span className="text-xs font-bold text-slate-700">{sessionTitle}</span>
                    <div>{renderStatusBadge(status)}</div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                  <Calendar className="h-8 w-8 text-slate-300 mb-2" />
                  <span>No date records found for {selectedCourseKey} yet.</span>
                  <span className="text-[11px] text-slate-400 mt-1">Click "Sync Data" above to fetch from your sheet.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ================= RIGHT HALF: SEAMLESS LIVE GOOGLE SHEET ================= */}
      <section className="flex w-1/2 flex-col bg-slate-50">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800">Instructor Roster Sheet</h2>
          </div>
          <span className="rounded bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            Tabs: TO 313 | BL 300 | MO 300 | BCOM 350
          </span>
        </header>

        {/* Full-Height Embedded Sheet */}
        <div className="flex-1 w-full h-full overflow-hidden bg-white">
          <iframe
            src={GOOGLE_SHEET_EMBED_URL}
            title="Google Sheet Master Tracker"
            className="h-full w-full border-0"
          />
        </div>
      </section>
    </div>
  );
}