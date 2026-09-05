import { useEffect, useState } from "react"
import { getProfile, updateProfile } from "@/services/profileService"
import { Button } from "@/components/ui/button"

const STATES = ["Punjab", "Delhi", "Maharashtra", "Uttar Pradesh", "Karnataka", "Other"]
const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"]
const EDUCATION_LEVELS = ["Below 10th", "10th Pass", "12th Pass", "Graduate", "Postgraduate"]

export default function ProfileForm({ onProfileUpdated }) {
    const [formData, setFormData] = useState(null)
    const [saveStatus, setSaveStatus] = useState("idle")

    useEffect(() => {
        getProfile().then((data) => setFormData(data))
    }, [])

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaveStatus("saving")
        const updated = await updateProfile(formData)
        setSaveStatus("saved")
        onProfileUpdated(updated)
        setTimeout(() => setSaveStatus("idle"), 2000)
    }

    if (!formData) return <p>Loading profile...</p>

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Full name</label>
                <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Date of birth</label>
                <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                    value={formData.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <select
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                >
                    <option value="">Select state</option>
                    {STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Annual family income (₹)</label>
                <input
                    type="number"
                    value={formData.annualIncome}
                    onChange={(e) => handleChange("annualIncome", e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Occupation</label>
                <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => handleChange("occupation", e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Education level</label>
                <select
                    value={formData.educationLevel}
                    onChange={(e) => handleChange("educationLevel", e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                >
                    <option value="">Select education level</option>
                    {EDUCATION_LEVELS.map((e) => (
                        <option key={e} value={e}>{e}</option>
                    ))}
                </select>
            </div>

            <Button type="submit" disabled={saveStatus === "saving"}>
                {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : "Save profile"}
            </Button>
        </form>
    )
}