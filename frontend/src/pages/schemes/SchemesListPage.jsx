import SchemeList from "@/components/schemes/SchemeList"

export default function SchemesListPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-1">Government schemes</h1>
            <p className="text-gray-600 mb-6">
                Browse schemes you may be eligible for.
            </p>
            <SchemeList />
        </div>
    )
}