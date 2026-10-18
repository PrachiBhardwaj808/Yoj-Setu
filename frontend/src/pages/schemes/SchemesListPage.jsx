import SchemeList from "@/components/schemes/SchemeList";

export default function SchemesListPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F1B3D] tracking-tight">
                    Government Schemes Catalog
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Explore active Central and State welfare initiatives, verify eligibility criteria, and discover benefits.
                </p>
            </div>
            <SchemeList />
        </div>
    );
}