import { Link } from "react-router-dom"

export default function SchemeCard({ scheme }) {
    return (
        <Link
            to={`/schemes/${scheme.id}`}
            className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-400 transition-colors"
        >
            <span className="inline-block bg-blue-50 text-blue-800 text-xs font-medium px-3 py-1 rounded">
                {scheme.category}
            </span>

            <h3 className="font-medium text-base mt-3 mb-1">{scheme.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {scheme.description}
            </p>

            <div className="flex justify-between text-sm">
                <span className="text-blue-700 font-medium">{scheme.benefitAmount}</span>
                <span className="text-gray-400">{scheme.deadline}</span>
            </div>
        </Link>
    )
}