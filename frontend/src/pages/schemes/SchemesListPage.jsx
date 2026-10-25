import SchemeList from "@/components/schemes/SchemeList";
import { useLanguage } from "@/context/LanguageContext";

export default function SchemesListPage() {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F1B3D] tracking-tight">
                    {t('schemes.catalogTitle', 'Government Schemes Catalog')}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {t('schemes.catalogSubtitle', 'Explore active Central and State welfare initiatives, verify eligibility criteria, and discover benefits.')}
                </p>
            </div>
            <SchemeList />
        </div>
    );
}