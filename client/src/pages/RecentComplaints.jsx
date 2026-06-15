import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { ChevronLeft, ChevronRight, Activity, Clock, CheckCircle, Search } from 'lucide-react';

export default function RecentComplaints() {
  const [issues, setIssues] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues(page);
  }, [page]);

  const fetchIssues = async (pageNum) => {
    setLoading(true);
    try {
      const res = await api.get(`/issues/recent?page=${pageNum}&limit=15`);
      if (res.data.success) {
        setIssues(res.data.issues);
        setTotalPages(res.data.totalPages);
        setPage(res.data.currentPage);
      }
    } catch (error) {
      console.error('Error fetching recent complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'In Progress': return <Activity className="w-4 h-4 text-amber-500 animate-pulse" />;
      case 'Assigned': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'In Progress': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Assigned': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1E] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-sm text-sky-600 dark:text-sky-400 hover:underline mb-2 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-7 h-7 text-sky-500" />
            Recent Public Complaints
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Live tracker of institutional complaints. For confidentiality, only token IDs and current statuses are displayed.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Tracking Token
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Date Filed
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                    Current Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Loading complaints...
                    </td>
                  </tr>
                ) : issues.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      No recent complaints found.
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr key={issue._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-200">
                            {issue.token}
                          </span>
                          <Link 
                            to={`/track?token=${issue.token}`}
                            className="opacity-0 group-hover:opacity-100 p-1 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded transition-all"
                            title="Track this token"
                          >
                            <Search className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(issue.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
                          {getStatusIcon(issue.status)}
                          {issue.status}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && totalPages > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/30">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Page <span className="font-medium text-slate-900 dark:text-slate-200">{page}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
