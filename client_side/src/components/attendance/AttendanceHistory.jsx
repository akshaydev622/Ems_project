import React from 'react'
import { getDayTypeDisplay, getWorkingHoursDisplay } from '../../assets/assets'
import { format } from 'date-fns'

const SERVER_BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

/**
 * Resolves an attendance photo path (e.g. /storage/attendancePhotos/photo.jpg)
 * to a full URL served by the Express static middleware.
 */
const getPhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  // Already a full URL (e.g. old base64 or http)
  if (photoPath.startsWith('data:') || photoPath.startsWith('http')) return photoPath;
  return `${SERVER_BASE}${photoPath}`;
};

const PhotoThumb = ({ src, label }) => {
  if (!src) return <span className="text-slate-400">-</span>;
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" title={`View ${label} photo`}>
      <img
        src={src}
        alt={label}
        className="w-9 h-9 rounded-full object-cover border-2 border-indigo-300 shadow-sm hover:scale-110 transition-transform cursor-pointer"
      />
    </a>
  );
};

const AttendanceHistory = ({ history }) => {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">Recent Activity</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="table-modern">
          <thead>
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Punch In</th>
              <th className="px-6 py-4">Punch Out</th>
              <th className="px-6 py-4">Photos</th>
              <th className="px-6 py-4">Working Hours</th>
              <th className="px-6 py-4">Day Type</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  No Records Found
                </td>
              </tr>
            ) : (
              history.map((record) => {
                const dayType = getDayTypeDisplay(record);
                const inPhoto = getPhotoUrl(record.punchInPhoto);
                const outPhoto = getPhotoUrl(record.punchOutPhoto);
                return (
                  <tr key={record._id || record.id}>
                    <td className="px-6 py-4 text-medium text-slate-900">
                      {format(new Date(record.date), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {record.punchIn ? format(new Date(record.punchIn), "hh:mm a") : record.checkIn ? format(new Date(record.checkIn), "hh:mm a") : "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {record.punchOut ? format(new Date(record.punchOut), "hh:mm a") : record.checkOut ? format(new Date(record.checkOut), "hh:mm a") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <PhotoThumb src={inPhoto} label="Punch In" />
                        {outPhoto && <PhotoThumb src={outPhoto} label="Punch Out" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {getWorkingHoursDisplay(record)}
                    </td>
                    <td className="px-6 py-4">
                      {dayType.label !== "-" ? <span className={`badge ${dayType.className}`}>{dayType.label}</span> : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${record.status === "PRESENT" ? "badge-success" : record.status === "LATE" ? "badge-warning" : "badge-danger"}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceHistory