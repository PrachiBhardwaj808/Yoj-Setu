import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { getSchemeById } from "@/services/schemeService"
import { Button } from "@/components/ui/button"

export default function SchemeDetailPage() {
    const { id } = useParams()
    const [scheme, setScheme] = useState(null)
    const [status, setStatus] = useState("loading")

    useEffect(() => {
        getSchemeById(id).then((data) => {
            if (data) {
                setScheme(data)
                setStatus("success")
            } else {
                setStatus("notfound")
            }
        })
    }, [id])

    if (status === "loading") return <p className="text-center py-8">Loading...</p>
    if (status === "notfound") {
        return (
            <div className="text-center py-8">
                <p>Scheme not found.</p>
                <Link to="/schemes" className="text-blue-700 underline">
                    Back to schemes
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <span className="inline-block bg-blue-50 text-blue-800 text-xs font-medium px-3 py-1 rounded">
                {scheme.category}
            </span>
            <h1 className="text-2xl font-bold mt-3 mb-2">{scheme.title}</h1>
            <p className="text-gray-600 mb-6">{scheme.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Benefit amount</p>
                    <p className="font-medium">{scheme.benefitAmount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Deadline</p>
                    <p className="font-medium">{scheme.deadline}</p>
                </div>
            </div>

            <div className="border-t pt-4 mb-6">
                <p className="font-medium mb-2">Eligibility</p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    {scheme.eligibility.map((rule, index) => (
                        <li key={index}>{rule}</li>
                    ))}
                </ul>
            </div>

            <Button className="w-full">Apply now</Button>
        </div>
    )
}