/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  MapPin, 
  Calendar,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { IT_TEAM } from '../constants';

interface StaffSchedule {
  name: string;
  monthlySchedule: {
    [dateKey: string]: string; // Key format: YYYY-MM-DD
  }
}

const getProxyUrl = (monthName: string) => {
  return `/api/proxy-sheet?month=${encodeURIComponent(monthName)}`;
};

const getDateISO = (year: number, month: number, day: number) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// Initial fallback names mapping
const INITIAL_DATA: StaffSchedule[] = [
  { name: 'Errol', monthlySchedule: {} },
  { name: 'Ron', monthlySchedule: {} },
  { name: 'Paulo', monthlySchedule: {} },
  { name: 'Joyce', monthlySchedule: {} },
  { name: 'Rex', monthlySchedule: {} },
  { name: 'Kristel', monthlySchedule: {} },
  { name: 'Kiel', monthlySchedule: {} },
];


export default function ITSchedule() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [schedules, setSchedules] = useState<StaffSchedule[]>(INITIAL_DATA);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const currentMonthName = currentTime.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getMinutes() !== currentTime.getMinutes()) {
        setCurrentTime(now);
      }
    }, 1000); 
    
    fetchRelevantMonths();
    
    return () => clearInterval(timer);
  }, [currentMonthName]);

  const fetchRelevantMonths = async () => {
    const monthsToFetch = new Set<string>();
    
    // Check 3 days back and 3 days forward to see if we need multiple months
    for (let i = -3; i <= 3; i++) {
        const d = new Date(currentTime);
        d.setDate(currentTime.getDate() + i);
        monthsToFetch.add(d.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const allResults = await Promise.all(
        Array.from(monthsToFetch).map(month => fetchMonthData(month))
      );

      // Merge all months into the schedule state
      setSchedules(prev => {
        const merged = [...prev];
        allResults.forEach(({ monthName, data }) => {
          if (!data || data.length === 0) return;
          
          const monthDate = new Date(monthName);
          const year = monthDate.getFullYear();
          const monthIdx = monthDate.getMonth();

          data.forEach(fetchedStaff => {
            let existing = merged.find(s => s.name.toLowerCase() === fetchedStaff.name.toLowerCase());
            if (!existing) {
              existing = { name: fetchedStaff.name, monthlySchedule: {} };
              merged.push(existing);
            }
            
            // Overwrite/update with new monthly data using YYYY-MM-DD keys
            Object.entries(fetchedStaff.monthlySchedule).forEach(([day, shift]) => {
              const dateKey = getDateISO(year, monthIdx, parseInt(day));
              existing!.monthlySchedule[dateKey] = shift as string;
            });
          });
        });
        return [...merged];
      });

      setLastSync(new Date());
    } catch (error) {
      console.error('Multi-month sync failed:', error);
      setSyncError('Sync failed. Check spreadsheet sharing.');
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchMonthData = async (monthName: string) => {
    try {
      const url = getProxyUrl(monthName);
      const response = await fetch(url);
      if (!response.ok) return { monthName, data: [] };
      
      const csvData = await response.text();
      
      return new Promise<{monthName: string, data: any[]}>((resolve, reject) => {
        Papa.parse(csvData, {
          complete: (results) => {
            const rows = (results.data as string[][]).filter(r => r.length >= 7 && r.some(c => c.trim().length > 0));
            if (rows.length < 2) return resolve({ monthName, data: [] });

            let headerRowIndex = rows.findIndex(r => r[0]?.toLowerCase().includes('date') || r[1]?.toLowerCase().includes('day'));
            if (headerRowIndex === -1) {
              const firstDataIndex = rows.findIndex(r => r[0] === '1');
              headerRowIndex = firstDataIndex > 0 ? firstDataIndex - 1 : 1;
            }

            const headers = rows[headerRowIndex];
            const personnelNames = headers.slice(2, 9);
            const dataStartIndex = headerRowIndex + 1; 

            // Hard keywords to filter out non-names that might appear in title rows
            const BLACKLIST_KEYWORDS = ['SCHEDULE', 'MANILA', 'REGULAR', 'HCIT', 'DATE', 'DAY', 'SUPPORT'];

            const monthData = personnelNames
              .map((name, pIdx) => {
                const cleanedName = (name.trim().split('\n')[0] || '').trim();
                // Skip if name is too short, empty, or contains blacklist words
                const isInvalid = !cleanedName || 
                                cleanedName.length < 2 || 
                                BLACKLIST_KEYWORDS.some(k => cleanedName.toUpperCase().includes(k));
                
                return {
                  name: cleanedName || `Unknown-${pIdx}`,
                  isInvalid,
                  originalIdx: pIdx + 2, // Column C is index 2
                  monthlySchedule: {} as {[day: number]: string}
                };
              })
              .filter(staff => !staff.isInvalid);

            for (let i = dataStartIndex; i < rows.length; i++) {
              const row = rows[i];
              const dateStr = row[0]?.trim();
              if (!dateStr || isNaN(parseInt(dateStr))) continue;
              const dayNum = parseInt(dateStr);
              if (dayNum < 1 || dayNum > 31) continue;

              monthData.forEach((staff) => {
                const shift = row[staff.originalIdx];
                if (shift) {
                  staff.monthlySchedule[dayNum] = shift.trim();
                }
              });
            }
            resolve({ monthName, data: monthData });
          },
          error: (err) => reject(err)
        });
      });
    } catch (e) {
      return { monthName, data: [] };
    }
  };

  const parseShiftTime = (shiftStr: string) => {
    if (!shiftStr || shiftStr === 'OFF' || shiftStr === 'PTO' || shiftStr.includes('OFFSET')) return null;
    
    const timeMatch = shiftStr.match(/(\d+)(AM|PM)-(\d+)(AM|PM)/i);
    if (!timeMatch) return null;

    const convertTo24h = (hours: number, modifier: string) => {
      let h = hours;
      if (h === 12) h = (modifier.toUpperCase() === 'PM' ? 12 : 0);
      else if (modifier.toUpperCase() === 'PM') h += 12;
      return { hours: h, minutes: 0 };
    };

    return {
      start: convertTo24h(parseInt(timeMatch[1]), timeMatch[2]),
      end: convertTo24h(parseInt(timeMatch[3]), timeMatch[4])
    };
  };

  const getStaffStatus = (staff: StaffSchedule) => {
    const now = currentTime;
    const todayKey = getDateISO(now.getFullYear(), now.getMonth(), now.getDate());
    
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayKey = getDateISO(yesterdayDate.getFullYear(), yesterdayDate.getMonth(), yesterdayDate.getDate());
    
    const todayShift = staff.monthlySchedule[todayKey];
    const yesterdayShift = staff.monthlySchedule[yesterdayKey];

    if (todayShift === 'PTO') return 'PTO';
    if (todayShift && (todayShift.includes('OFFSET') || todayShift.includes('OFFSET'))) return 'OFFSET';

    const times = parseShiftTime(todayShift);
    if (times) {
      const start = new Date(now);
      start.setHours(times.start.hours, 0, 0, 0);
      const end = new Date(now);
      end.setHours(times.end.hours, 0, 0, 0);

      if (times.end.hours < times.start.hours) { 
        if (now >= start) return 'Active';
      } else { 
        if (now >= start && now < end) return 'Active';
      }
    }

    const yTimes = parseShiftTime(yesterdayShift);
    if (yTimes && yTimes.end.hours < yTimes.start.hours) {
      const yEnd = new Date(now);
      yEnd.setHours(yTimes.end.hours, 0, 0, 0);
      if (now < yEnd) return 'Active';
    }

    if (todayShift === 'OFF') return 'Restday';

    return 'Offline';
  };

  const filteredStaff = schedules.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    const aStatus = getStaffStatus(a);
    const bStatus = getStaffStatus(b);
    if (aStatus === 'Active' && bStatus !== 'Active') return -1;
    if (aStatus !== 'Active' && bStatus === 'Active') return 1;
    return a.name.localeCompare(b.name);
  });

  const activeCount = schedules.filter(s => getStaffStatus(s) === 'Active').length;

  return (
    <div className="space-y-6 pb-8">
      <div className="hc-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-white shadow-sm border border-gray-100 rounded-3xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#F1F7EB] rounded-2xl flex items-center justify-center text-[#4A773C]">
            <Calendar size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black italic tracking-tight text-gray-900">IT Team Schedule</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#4A773C] bg-[#4A773C]/10 px-3 py-1 rounded-full border border-[#4A773C]/20">
                {currentMonthName} Matrix
              </span>
              <p className="text-xs font-bold text-gray-500">
                {currentTime.toLocaleString([], { weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: true })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#88C13E] outline-none transition-all"
            />
          </div>
          <div className="relative group">
            <button 
              onClick={fetchRelevantMonths}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm disabled:opacity-50 border ${
                syncError 
                  ? 'bg-rose-50 text-rose-500 border-rose-100 animate-pulse' 
                  : lastSync ? 'bg-[#F1F7EB] text-[#4A773C] border-[#4A773C]/10' : 'bg-white text-[#4A773C] border-[#4A773C]/20 hover:bg-gray-50'
              }`}
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : syncError ? 'Auth Error' : lastSync ? 'Live Linked' : 'Matrix Master'}
            </button>
            {(syncError || lastSync) && (
              <div className="absolute right-0 top-full mt-2 w-64 p-4 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 text-[10px] text-gray-500 font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {syncError ? (
                  <>
                    <AlertCircle size={14} className="mb-2 text-rose-500" />
                    <span className="text-rose-600">{syncError}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} className="mb-2 text-[#4A773C]" />
                    <span>Synchronized with Google Sheets</span>
                    <p className="mt-1 text-[9px] opacity-70">Last update: {lastSync?.toLocaleTimeString()}</p>
                  </>
                )}
                <div className="mt-2 pt-2 border-t border-gray-50 text-gray-400 italic">File &gt; Share &gt; Publish to web &gt; CSV</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hc-card overflow-hidden p-0 border-collapse bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Personnel</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Live Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Time Span</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Monthly Matrix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStaff.map((staff) => {
                const status = getStaffStatus(staff);
                const isoToday = getDateISO(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
                const currentShift = staff.monthlySchedule[isoToday];

                return (
                   <motion.tr 
                    key={staff.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`group transition-all hover:bg-[#F1F7EB]/30 ${status === 'Offline' || status === 'Restday' || status === 'PTO' ? 'opacity-40 grayscale-[0.9]' : ''}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all shadow-sm ${
                          status === 'Active' ? 'bg-[#4A773C] text-white shadow-[#4A773C]/20 border-2 border-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 group-hover:text-[#4A773C] transition-colors">{staff.name}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">IT Ops Manila</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`relative flex items-center justify-center w-3 h-3`}>
                          {status === 'Active' && <div className={`absolute inset-0 rounded-full animate-ping bg-[#88C13E]/40`} />}
                          <div className={`w-2 h-2 rounded-full ${
                            status === 'Active' ? 'bg-[#88C13E]' : 
                            status === 'OFFSET' ? 'bg-indigo-400' :
                            'bg-gray-300'
                          }`} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          status === 'Active' ? 'text-[#4A773C]' : 
                          status === 'OFFSET' ? 'text-indigo-600' :
                          'text-gray-400'
                        }`}>
                          {status === 'Active' ? 'Active Now' : status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-black text-gray-600">
                          <Clock size={12} className="text-gray-400" />
                          {currentShift === 'OFF' ? 'RESTDAY' : currentShift === 'PTO' ? 'ON LEAVE' : currentShift?.split(': ')[1] || currentShift || '-'}
                        </div>
                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter italic">PHT (UTC+8)</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6, 7].map(offset => {
                          const targetDate = new Date(currentTime);
                          targetDate.setDate(currentTime.getDate() + (offset - 4));
                          const dateNum = targetDate.getDate();
                          const isoDate = getDateISO(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
                          const shift = staff.monthlySchedule[isoDate] || 'OFF';
                          const isOff = shift === 'OFF';
                          const isPTO = shift === 'PTO';
                          const isToday = isoDate === getDateISO(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());

                          return (
                            <div 
                              key={`${staff.name}-${targetDate.getTime()}`}
                              className={`w-14 h-14 flex flex-col items-center justify-center rounded-2xl transition-all border-2 ${
                                isPTO || isOff ? 'bg-gray-50 text-gray-300 border-gray-100' :
                                'bg-[#4A773C] text-white border-[#3d6331] shadow-xl shadow-[#4A773C]/20'
                              } ${isToday ? 'ring-4 ring-offset-2 ring-[#88C13E] scale-110 z-10' : 'hover:scale-105'}`}
                              title={`${dateNum}: ${shift}`}
                            >
                              <span className="text-[10px] font-black opacity-80 leading-none mb-1.5">{dateNum}</span>
                              <span className="text-sm leading-none font-black tracking-tighter uppercase">
                                {shift === 'OFF' ? '✖' : (shift.includes(':') ? shift.split(':')[0] : shift[0])}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#4A773C]/5 border border-[#4A773C]/10 p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-white rounded-2xl text-[#4A773C] shadow-lg shadow-[#4A773C]/5 border border-[#4A773C]/10">
            <AlertCircle size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4A773C] mb-2">Matrix Synchronization Engine</p>
            <p className="text-sm font-medium text-[#4A773C]/70 italic max-w-md leading-relaxed">
              Monitoring {schedules.length} active personnel. Real-time availability is synchronized with the 
              HC-Local IT Manila spreadsheet master file.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-8 bg-white/50 px-10 py-5 rounded-3xl border border-white">
          <div className="text-center">
            <p className="text-3xl font-black text-[#4A773C] leading-none mb-1">{activeCount}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#4A773C]/40">Active Engineers</p>
          </div>
          <div className="w-px h-10 bg-[#4A773C]/10" />
          <div className="text-center">
            <p className="text-3xl font-black text-gray-300 leading-none mb-1">{schedules.length - activeCount}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400/40">Standby/Off</p>
          </div>
        </div>
      </div>
    </div>
  );
}
