import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getApplications } from '@/services/applicationService';
import { STATUS_LABELS, STATUS_COLORS } from '@/data/mockApplications';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getApplications()
      .then((data) => {
        if (isMounted) setApplications(data || []);
      })
      .catch((err) => console.error("Error loading applications:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const filteredApps = filter === 'all'
    ? applications
    : applications.filter(a => a.status === filter);

  const totalCount = applications.length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;
  const reviewCount = applications.filter(a => a.status === 'under_review').length;
  const draftCount = applications.filter(a => a.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F1B3D] tracking-tight">Application Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor real-time progress, reference numbers, and disbursement updates for your submitted government applications.
          </p>
        </div>
        <Link
          to="/schemes"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs text-center"
        >
          + Discover Schemes to Apply
        </Link>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">Total Applied</p>
          <p className="text-2xl font-bold text-[#0F1B3D] mt-1">{totalCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-emerald-600 font-medium">Approved / Active</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-amber-600 font-medium">Under Review</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{reviewCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">Draft / Pending</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">{draftCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {['all', 'submitted', 'under_review', 'approved', 'draft', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filter === tab
                ? 'bg-[#0F1B3D] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab === 'all' ? 'All Applications' : STATUS_LABELS[tab] || tab}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p>Loading your applications...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl mb-3">
            📋
          </div>
          <h2 className="text-base font-semibold text-[#0F1B3D] mb-1">No applications found</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
            You don't have any applications under this status filter. Check your scheme recommendations to begin a new application.
          </p>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700"
          >
            Go to Recommendations →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const statusStyle = STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700';
            const statusLabel = STATUS_LABELS[app.status] || app.status;

            return (
              <div
                key={app.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-blue-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
                        {app.category}
                      </span>
                      {app.referenceNo && (
                        <span className="text-xs font-mono text-gray-500">
                          Ref: {app.referenceNo}
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-base text-[#0F1B3D] mt-1">{app.schemeName}</h2>
                  </div>
                  <span className={`self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full ${statusStyle}`}>
                    ● {statusLabel}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block">Applied Date</span>
                    <span className="font-semibold text-gray-700">
                      {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Draft'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Sanctioned Benefit</span>
                    <span className="font-semibold text-blue-600">{app.benefitAmount}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-gray-400 block">Official Verification Notes</span>
                    <span className="font-medium text-gray-600">{app.notes || 'Under standard verification.'}</span>
                  </div>
                </div>

                {/* Progress Pipeline */}
                <div className="pt-2">
                  <div className="grid grid-cols-4 gap-1 text-center">
                    {['Draft', 'Submitted', 'Verification', 'Approved'].map((step, idx) => {
                      const isComplete =
                        app.status === 'approved' ||
                        (app.status === 'under_review' && idx <= 2) ||
                        (app.status === 'submitted' && idx <= 1) ||
                        (app.status === 'draft' && idx === 0);

                      return (
                        <div key={step} className="space-y-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              isComplete ? 'bg-blue-600' : 'bg-gray-100'
                            }`}
                          />
                          <span className={`text-[10px] ${isComplete ? 'font-semibold text-blue-800' : 'text-gray-400'}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
