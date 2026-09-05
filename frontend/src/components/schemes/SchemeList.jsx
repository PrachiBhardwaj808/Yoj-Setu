import { useEffect, useState } from "react"
import { getAllSchemes } from "@/services/schemeService"
import SchemeCard from "./SchemeCard"

export default function SchemeList() {
    const [schemes, setSchemes] = useState([])
    const [searchText, setSearchText] = useState("")
    const [category, setCategory] = useState("All")

    useEffect(() => {
        getAllSchemes().then((data) => setSchemes(data))
    }, [])

    const filteredSchemes = schemes.filter((scheme) => {
        const matchesSearch = scheme.title
            .toLowerCase()
            .includes(searchText.toLowerCase())
        const matchesCategory = category === "All" || scheme.category === category
        return matchesSearch && matchesCategory
    })

    return (
        <div>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Search schemes..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="flex-1 border rounded-md px-3 py-2 text-sm"
                />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm"
                >
                    <option value="All">All categories</option>
                    <option value="Education">Education</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Health">Health</option>
                </select>
            </div>

            {filteredSchemes.length === 0 ? (
                <p className="text-gray-500 text-sm">No schemes match your search.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSchemes.map((scheme) => (
                        <SchemeCard key={scheme.id} scheme={scheme} />
                    ))}
                </div>
            )}
        </div>
    )
}