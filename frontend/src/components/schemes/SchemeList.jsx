
import { useEffect, useState } from "react";
import { getAllSchemes } from "@/services/schemeService";
import { useLanguage } from "@/context/LanguageContext";
import SchemeCard from "./SchemeCard";

export default function SchemeList() {
    const { t } = useLanguage();
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [category, setCategory] = useState("All");

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        getAllSchemes()
            .then((data) => {
                if (isMounted) {
                    setSchemes(Array.isArray(data) ? data : []);
                }
            })
            .catch((err) => {
                console.error("Error fetching schemes in SchemeList:", err);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, []);

    const categories = ["All", ...new Set(schemes.map(s => s.category).filter(Boolean))];

    const filteredSchemes = schemes.filter((scheme) => {
        const title = (scheme.title || scheme.name || scheme.scheme_name || "").toLowerCase();
        const desc = (scheme.description || "").toLowerCase();
        const search = searchText.toLowerCase().trim();

        const matchesSearch = !search || title.includes(search) || desc.includes(search);
        const matchesCategory = category === "All" || (scheme.category || "").toLowerCase() === category.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder={t('schemes.searchPlaceholder', 'Search by scheme name, keywords, or benefits...')}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 shadow-xs"
                    />
                    {searchText && (
                        <button
                            onClick={() => setSearchText("")}
                            className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 shadow-xs text-[#0F1B3D]"
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat === "All" ? t('schemes.allCategories', 'All Categories') : cat}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span>{t('schemes.showing', 'Showing')} {filteredSchemes.length} {t('schemes.schemesCount', 'schemes')}</span>
                {category !== "All" && (
                    <button
                        onClick={() => setCategory("All")}
                        className="text-blue-600 hover:underline"
                    >
                        {t('schemes.resetFilter', 'Reset category filter')}
                    </button>
                )}
            </div>

            {loading ? (
                <div className="py-12 text-center text-sm text-gray-500">
                    <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>{t('schemes.loading', 'Loading government schemes catalog...')}</p>
                </div>
            ) : filteredSchemes.length === 0 ? (
                <div className="p-8 text-center bg-white border border-gray-200 rounded-2xl">
                    <p className="text-gray-600 font-medium text-sm">{t('schemes.noSchemes', 'No schemes match your search criteria.')}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('schemes.noSchemesDesc', 'Try adjusting keywords or selecting "All Categories".')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSchemes.map((scheme) => (
                        <SchemeCard
                            key={scheme.id || scheme.scheme_id || scheme.external_scheme_id}
                            scheme={scheme}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}