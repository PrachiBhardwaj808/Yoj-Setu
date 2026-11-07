import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSchemeById } from "@/services/schemeService";
import { createApplication, getApplications } from "@/services/applicationService";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function SchemeDetailPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { id } = useParams();
    const [scheme, setScheme] = useState(null);
    const [status, setStatus] = useState("loading");
    const [tracking, setTracking] = useState(false);
    const [isTracked, setIsTracked] = useState(false);
    const [trackingError, setTrackingError] = useState("");

    useEffect(() => {
        setTracking(false);
        setIsTracked(false);
        setTrackingError("");
    }, [id, user?.id]);

    useEffect(() => {
        let isMounted = true;
        setScheme(null);
        setStatus("loading");
        getSchemeById(id)
            .then((data) => {
                if (!isMounted) return;
                if (data) {
                    setScheme(data);
                    setStatus("success");
                } else {
                    setStatus("notfound");
                }
            })
            .catch((err) => {
                console.error("Error loading scheme details:", err);
                if (isMounted) setStatus("error");
            });

        return () => { isMounted = false; };
    }, [id]);

    useEffect(() => {
        if (!scheme?.external_scheme_id || !user?.id) return;
        let isMounted = true;
        getApplications(user.id)
            .then((applications) => {
                if (isMounted) {
                    setIsTracked(applications.some(
                        (application) => application.external_scheme_id === scheme.external_scheme_id
                    ));
                }
            })
            .catch((err) => console.error("Error checking local scheme tracking:", err));
        return () => { isMounted = false; };
    }, [scheme?.external_scheme_id, user?.id]);

    const handleTrackScheme = async () => {
        if (!scheme?.external_scheme_id || !user?.id) {
            setTrackingError(t('applications.signInToTrack', 'Sign in to save a scheme to your tracker.'));
            return;
        }

        setTracking(true);
        setTrackingError("");
        try {
            await createApplication(scheme.external_scheme_id, user.id);
            setIsTracked(true);
        } catch (err) {
            console.error("Error adding scheme to local tracker:", err);
            setTrackingError(t('applications.trackError', 'Unable to add this scheme to your tracker. Please try again.'));
        } finally {
            setTracking(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="py-16 text-center text-sm text-gray-500">
                <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                <p>{t('schemes.loadingDetails', 'Loading scheme details...')}</p>
            </div>
        );
    }

    if (status === "notfound" || (!scheme && status !== "error")) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl mb-3">
                    🔍
                </div>
                <h2 className="text-lg font-semibold text-[#0F1B3D] mb-1">{t('schemes.notFound', 'Scheme not found')}</h2>
                <p className="text-sm text-gray-500 mb-6">{t('schemes.notFoundDesc', 'The requested scheme could not be found or may have been updated.')}</p>
                <Link to="/schemes" className="inline-block px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                    ← {t('schemes.backToCatalog', 'Back to Schemes Catalog')}
                </Link>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <h2 className="text-lg font-semibold text-[#0F1B3D] mb-1">
                    {t('schemes.loadErrorTitle', 'Unable to load scheme details')}
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    {t('schemes.loadError', 'Please try again later or return to the schemes catalog.')}
                </p>
                <Link to="/schemes" className="inline-block px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                    ← {t('schemes.backToCatalog', 'Back to Schemes Catalog')}
                </Link>
            </div>
        );
    }

    const title = scheme.title || scheme.name || scheme.scheme_name || "Government Scheme";
    const unavailable = t('common.notAvailable', 'Not provided');
    const benefits = scheme.benefitAmount || scheme.benefits || scheme.benefit || unavailable;
    const deadline = scheme.deadline || scheme.status || scheme.government_level || unavailable;
    const category = scheme.category || "General";
    const description = scheme.description || unavailable;

    const rules = Array.isArray(scheme.eligibility)
        ? scheme.eligibility
        : Array.isArray(scheme.rules) && scheme.rules.length > 0
        ? scheme.rules.map(r => r.raw_condition_text || `${r.field_name} ${r.operator} ${r.field_value}`)
        : [];

    const documents = Array.isArray(scheme.documents) ? scheme.documents : [];
    const applyUrl = scheme.application_url || scheme.source_url;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <Link to="/schemes" className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                ← {t('schemes.backToCatalog', 'Back to Schemes Catalog')}
            </Link>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-block bg-blue-50 text-blue-800 text-xs font-semibold px-3 py-1 rounded-md">
                        {category}
                    </span>
                    {scheme.department && (
                        <span className="text-xs text-gray-500">
                            {scheme.department}
                        </span>
                    )}
                </div>

                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#0F1B3D] tracking-tight">{title}</h1>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">{t('schemes.directBenefit', 'Direct Benefit / Assistance')}</p>
                        <p className="font-semibold text-blue-600 text-base">{benefits}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">{t('schemes.timelineLevel', 'Timeline / Level')}</p>
                        <p className="font-semibold text-[#0F1B3D] text-base">{deadline}</p>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-5 space-y-3">
                    <h2 className="font-semibold text-sm text-[#0F1B3D] uppercase tracking-wider text-xs">
                        {t('schemes.eligibilityCriteria', 'Eligibility Criteria')}
                    </h2>
                    {rules.length > 0 ? (
                        <ul className="space-y-2">
                            {rules.map((rule, index) => (
                                <li key={index} className="flex items-start gap-2.5 text-sm text-gray-700">
                                    <span className="text-emerald-600 font-bold">✓</span>
                                    <span>{rule}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">{unavailable}</p>
                    )}
                </div>

                {documents.length > 0 && (
                    <div className="border-t border-gray-100 pt-5 space-y-3">
                        <h2 className="font-semibold text-sm text-[#0F1B3D] uppercase tracking-wider text-xs">
                            {t('schemes.requiredDocuments', 'Required Verification Documents')}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {documents.map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                                    <span className="font-medium text-gray-800">{doc.document_name || doc.name}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                        doc.is_mandatory ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {doc.is_mandatory ? t('schemes.mandatory', 'Mandatory') : t('schemes.optional', 'Optional')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={handleTrackScheme}
                            disabled={tracking || isTracked}
                            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 text-slate-800 disabled:text-slate-500 font-semibold text-sm rounded-xl transition-all text-center"
                        >
                            {isTracked
                                ? t('applications.tracked', 'Added to your tracker')
                                : tracking
                                ? t('common.saving', 'Saving...')
                                : t('applications.trackScheme', 'Track this scheme')}
                        </button>
                        {trackingError && <p role="alert" className="text-xs text-red-600 mt-2">{trackingError}</p>}
                    </div>
                    {scheme.source_url && (
                        <a
                            href={scheme.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 hover:text-blue-600 underline font-medium"
                        >
                            {t('schemes.viewSourcePortal', 'View Official Government Source Portal ↗')}
                        </a>
                    )}
                    {applyUrl ? (
                        <a
                            href={applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all text-center"
                        >
                            {t('schemes.applyNow', 'Apply on Official Portal')} →
                        </a>
                    ) : (
                        <span className="text-sm text-gray-500">{unavailable}</span>
                    )}
                </div>
            </div>
        </div>
    );
}