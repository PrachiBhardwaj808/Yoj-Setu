import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { Link } from 'react-router-dom';

const DOCUMENT_DEFINITIONS = [
  {
    key: 'has_aadhaar',
    title: 'Aadhaar Card',
    category: 'Identity Proof',
    requiredBy: ['PM Kisan Samman Nidhi', 'Ayushman Bharat PM-JAY', 'PM Awas Yojana', 'PM Surya Ghar'],
    authority: 'Unique Identification Authority of India (UIDAI)',
    helpUrl: 'https://myaadhaar.uidai.gov.in',
    description: '12-digit unique identity number linked with your active mobile number for DBT subsidy transfers.',
  },
  {
    key: 'has_bank_account',
    title: 'Bank Passbook / DBT Account',
    category: 'Financial',
    requiredBy: ['All DBT Schemes', 'PM-KISAN', 'PM Scholarship', 'Atal Pension Yojana'],
    authority: 'Scheduled Commercial Bank / Post Office',
    helpUrl: 'https://pmjdy.gov.in',
    description: 'Active bank account linked with Aadhaar NPCI mapper to receive direct benefit transfers without fail.',
  },
  {
    key: 'has_ration_card',
    title: 'Ration Card (NFSA / State)',
    category: 'Household & Food Security',
    requiredBy: ['Ayushman Bharat PM-JAY', 'PM Ujjwala Yojana', 'PM Awas Yojana'],
    authority: 'Department of Food & Public Distribution',
    helpUrl: 'https://nfsa.gov.in',
    description: 'Proof of family composition and economic tier (Antyodaya, BPL, or Priority Household).',
  },
  {
    key: 'has_income_certificate',
    title: 'Income Certificate',
    category: 'Income Proof',
    requiredBy: ['PM Scholarship for Higher Education', 'PM Awas Yojana (EWS/LIG)', 'State Welfare Schemes'],
    authority: 'Tehsildar / Sub-Divisional Magistrate (SDM)',
    helpUrl: 'https://services.india.gov.in',
    description: 'Official revenue document showing annual household income. Must be valid for current financial year.',
  },
  {
    key: 'has_caste_certificate',
    title: 'Caste / Category Certificate',
    category: 'Social Category',
    requiredBy: ['SC/ST/OBC Post-Matric Scholarships', 'Special Central Assistance Schemes'],
    authority: 'Revenue Officer / District Magistrate',
    helpUrl: 'https://socialjustice.gov.in',
    description: 'Verification of SC, ST, OBC, or EWS community reservation status.',
  },
  {
    key: 'has_land_document',
    title: 'Land Records (RoR / 7/12 Extract)',
    category: 'Agriculture & Property',
    requiredBy: ['PM Kisan Samman Nidhi', 'PM Fasal Bima Yojana', 'Kisan Credit Card'],
    authority: 'State Revenue Department / Bhulekh Portal',
    helpUrl: 'https://dilrmp.gov.in',
    description: 'Record of rights showing land ownership, survey numbers, and cultivable area under applicant name.',
  },
  {
    key: 'has_disability_certificate',
    title: 'Disability / UDID Card',
    category: 'Special Assistance',
    requiredBy: ['Divyangjan Welfare Schemes', 'ADIP Assistive Aids', 'Disability Pension'],
    authority: 'Department of Empowerment of Persons with Disabilities',
    helpUrl: 'https://www.swavlambancard.gov.in',
    description: 'Unique Disability ID certificate specifying 40% or higher benchmark disability.',
  },
];

export default function Documents() {
  const { profile, updateProfile } = useProfile();
  const [filter, setFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  const getStatus = (key) => profile[key] || 'Not sure';

  const handleStatusChange = (key, newStatus) => {
    updateProfile({ [key]: newStatus });
    setToastMessage(`Updated ${key.replace('has_', '').replace('_', ' ')} status to: ${newStatus}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const availableCount = DOCUMENT_DEFINITIONS.filter(d => getStatus(d.key) === 'Yes').length;
  const inProgressCount = DOCUMENT_DEFINITIONS.filter(d => getStatus(d.key) === 'In progress' || getStatus(d.key) === 'Not sure').length;
  const missingCount = DOCUMENT_DEFINITIONS.filter(d => getStatus(d.key) === 'No').length;

  const filteredDocs = DOCUMENT_DEFINITIONS.filter(doc => {
    const status = getStatus(doc.key);
    if (filter === 'ready') return status === 'Yes';
    if (filter === 'pending') return status === 'In progress' || status === 'Not sure';
    if (filter === 'missing') return status === 'No';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Citizen Document Vault</h1>
          <p className="text-sm text-gray-500 mt-1">
            Keep track of verification documents needed for government welfare schemes and DBT transfers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://www.digilocker.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <span>Open DigiLocker</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 font-bold ml-2">×</button>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Documents</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{DOCUMENT_DEFINITIONS.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Ready & Available</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{availableCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">In Progress / Unsure</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Missing / Needed</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">{missingCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {[
          { id: 'all', label: `All (${DOCUMENT_DEFINITIONS.length})` },
          { id: 'ready', label: `Ready (${availableCount})` },
          { id: 'pending', label: `In Progress (${inProgressCount})` },
          { id: 'missing', label: `Missing (${missingCount})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              filter === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => {
          const status = getStatus(doc.key);
          const isReady = status === 'Yes';
          const isPending = status === 'In progress' || status === 'Not sure';
          const isNA = status === 'Not applicable';

          return (
            <div
              key={doc.key}
              className={`bg-white rounded-2xl p-5 border shadow-sm transition-all ${
                isReady
                  ? 'border-emerald-200 ring-1 ring-emerald-100'
                  : isPending
                  ? 'border-amber-200'
                  : isNA
                  ? 'border-gray-200 opacity-75'
                  : 'border-rose-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md mb-1">
                    {doc.category}
                  </span>
                  <h3 className="text-base font-bold text-gray-900">{doc.title}</h3>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                    isReady
                      ? 'bg-emerald-50 text-emerald-700'
                      : isPending
                      ? 'bg-amber-50 text-amber-700'
                      : isNA
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {status}
                </span>
              </div>

              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                {doc.description}
              </p>

              {/* Required By */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Required by schemes:</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {doc.requiredBy.map((s, idx) => (
                    <span key={idx} className="text-xs bg-slate-50 text-slate-700 border border-slate-200/60 px-2 py-0.5 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status Selector & Help */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <label htmlFor={`status-${doc.key}`} className="text-gray-500 font-medium">Status:</label>
                  <select
                    id={`status-${doc.key}`}
                    value={status}
                    onChange={(e) => handleStatusChange(doc.key, e.target.value)}
                    className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Yes">Ready (Available)</option>
                    <option value="In progress">In Progress</option>
                    <option value="Not sure">Not Sure</option>
                    <option value="No">Missing</option>
                    <option value="Not applicable">Not Applicable</option>
                  </select>
                </div>

                <a
                  href={doc.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                >
                  <span>Portal</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Helpful Guidance */}
      <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
          💡
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900">DigiLocker Integration Recommendation</h4>
          <p className="text-xs text-blue-700 mt-1 leading-relaxed">
            Citizens can fetch legally valid electronic copies of Aadhaar, Driving License, Ration Card, and Class X/XII marksheet directly via DigiLocker. Documents stored in DigiLocker are treated at par with physical originals under Rule 9A of the Information Technology (Preservation and Retention of Information by Intermediaries Providing Digital Locker Facilities) Rules, 2016.
          </p>
          <div className="mt-2">
            <Link to="/schemes" className="text-xs font-bold text-blue-800 hover:underline">
              ← Browse eligible schemes requiring these documents
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
