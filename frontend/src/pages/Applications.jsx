import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApplications, updateApplicationStatus } from '@/services/applicationService';
import { STATUS_LABELS, STATUS_COLORS } from '@/data/mockApplications';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { APPLICATIONS_UPDATED_EVENT } from '@/utils/storage';
import { getSchemeRouteId } from '@/utils/schemeUtils';

const FILTERS = ['all', 'planning', 'applied_by_user'];

export default function Applications() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const userId = user?.id;
  const currentUserIdRef = useRef(userId);
  currentUserIdRef.current = userId;
  const [applications, setApplications] = useState([]);
  const [applicationsOwnerId, setApplicationsOwnerId] = useState(userId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const loadApplications = useCallback(async () => {
    if (!userId) {
      setApplications([]);
      setApplicationsOwnerId(userId);
      setLoading(false);
      setError('');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const loadedApplications = await getApplications(userId);
      if (!Object.is(currentUserIdRef.current, userId)) return;
      setApplications(loadedApplications);
      setApplicationsOwnerId(userId);
    } catch (loadError) {
      if (!Object.is(currentUserIdRef.current, userId)) return;
      console.error('Error loading local application tracking records:', loadError);
      setError(t('applications.loadError', 'Unable to load your locally tracked schemes. Please try again.'));
    } finally {
      if (Object.is(currentUserIdRef.current, userId)) setLoading(false);
    }
  }, [userId, t]);

  useEffect(() => {
    loadApplications();
    const handleUpdate = (event) => {
      if (String(event.detail?.userId) === String(userId)) loadApplications();
    };
    window.addEventListener(APPLICATIONS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(APPLICATIONS_UPDATED_EVENT, handleUpdate);
  }, [loadApplications, userId]);

  const handleStatusChange = async (application, status) => {
    try {
      await updateApplicationStatus(application.id, status, userId);
      await loadApplications();
    } catch (updateError) {
      console.error('Error updating local application tracking status:', updateError);
      setError(t('applications.updateError', 'Unable to update this tracking status. Please try again.'));
    }
  };

  const activeApplications = Object.is(applicationsOwnerId, userId) ? applications : [];
  const filteredApplications = filter === 'all'
    ? activeApplications
    : activeApplications.filter((application) => application.status === filter);
  const planningCount = activeApplications.filter((application) => application.status === 'planning').length;
  const reportedCount = activeApplications.filter((application) => application.status === 'applied_by_user').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F1B3D] tracking-tight">
            {t('applications.title', 'Scheme Tracker')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('applications.subtitle', 'Keep a private list of schemes you are planning to apply for or have applied to. Statuses are self-reported and are not verified by a government service.')}
          </p>
        </div>
        <Link
          to="/schemes"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs text-center"
        >
          {t('applications.discoverSchemes', 'Browse Schemes')}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          [t('applications.trackedCount', 'Tracked schemes'), activeApplications.length, 'text-[#0F1B3D]'],
          [t('applications.planningCount', 'Planning'), planningCount, 'text-blue-700'],
          [t('applications.reportedCount', 'Applied (self-reported)'), reportedCount, 'text-amber-700'],
        ].map(([label, count, color]) => (
          <div key={label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{count}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {FILTERS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filter === tab ? 'bg-[#0F1B3D] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab === 'all'
              ? t('applications.filterAll', 'All')
              : STATUS_LABELS[tab]}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button type="button" onClick={loadApplications} className="mt-2 font-semibold underline">
            {t('common.retry', 'Retry')}
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p>{t('common.loading', 'Loading tracked schemes...')}</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl mb-3">
            📋
          </div>
          <h2 className="text-base font-semibold text-[#0F1B3D] mb-1">
            {t('applications.noApplications', 'No schemes tracked yet')}
          </h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
            {t('applications.noApplicationsDesc', 'Add a scheme to keep a private reminder. Tracking does not submit an application.')}
          </p>
          <Link
            to="/schemes"
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700"
          >
            {t('applications.discoverSchemes', 'Browse Schemes')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <article
              key={application.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[11px] font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
                    {application.category}
                  </span>
                  <Link
                    to={`/schemes/${getSchemeRouteId({ external_scheme_id: application.external_scheme_id })}`}
                    className="block font-bold text-base text-[#0F1B3D] mt-2 hover:text-blue-600"
                  >
                    {application.schemeName}
                  </Link>
                </div>
                <span className={`self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[application.status] || STATUS_COLORS.unverified}`}>
                  {STATUS_LABELS[application.status] || STATUS_LABELS.unverified}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block">{t('applications.trackedOn', 'Added to tracker')}</span>
                  <span className="font-semibold text-gray-700">
                    {new Date(application.trackedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">{t('applications.benefitAmount', 'Catalogue benefit information')}</span>
                  <span className="font-semibold text-blue-600">{application.benefitAmount || t('common.notAvailable', 'Not provided')}</span>
                </div>
                <label className="flex flex-col gap-1">
                  <span className="text-gray-400">{t('applications.updateStatus', 'Your status (not verified)')}</span>
                  <select
                    value={application.status}
                    onChange={(event) => handleStatusChange(application, event.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-gray-700"
                  >
                    {['planning', 'applied_by_user'].map((status) => (
                      <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="text-[11px] text-gray-500">
                {t('applications.localTrackingNotice', 'This record is saved only in your browser for this account. It is not a government submission or official status update.')}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
