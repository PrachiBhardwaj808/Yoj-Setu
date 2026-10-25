import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

export default function SchemeCard({ scheme }) {
    const { t } = useLanguage();
    if (!scheme) return null;

    const title = scheme.title || scheme.name || scheme.scheme_name || t('schemes.catalogTitle', "Government Scheme");
    const benefits = scheme.benefitAmount || scheme.benefits || scheme.benefit || t('schemes.directBenefit', "Financial & welfare support");
    const deadline = scheme.deadline || scheme.government_level || t('schemes.active', "Active");
    const schemeId = scheme.id || scheme.scheme_id || scheme.external_scheme_id;

    return (
        <Link
            to={`/schemes/${schemeId}`}
            className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 transition-all shadow-xs hover:shadow-sm group"
        >
            <div className="flex items-center justify-between gap-2">
                <span className="inline-block bg-blue-50 text-blue-800 text-xs font-medium px-3 py-1 rounded-md">
                    {scheme.category || "General"}
                </span>
                {scheme.status && (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {scheme.status}
                    </span>
                )}
            </div>

            <h3 className="font-semibold text-base mt-3 mb-1 text-[#0F1B3D] group-hover:text-blue-600 transition-colors">
                {title}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {scheme.description || "Comprehensive welfare support scheme for eligible beneficiaries."}
            </p>

            <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                <span className="text-blue-600 font-medium text-xs sm:text-sm">{benefits}</span>
                <span className="text-xs text-gray-400">{deadline}</span>
            </div>
        </Link>
    );
}