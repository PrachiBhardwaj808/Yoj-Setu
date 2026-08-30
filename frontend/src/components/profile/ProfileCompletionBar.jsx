export default function ProfileCompletionBar({ profile }) {
    const fields = Object.values(profile)
    const filledCount = fields.filter((value) => value !== "").length
    const percentage = Math.round((filledCount / fields.length) * 100)

    return (
        <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
                <span className="font-m cedium">Profile completion</span>
                <span className="text-gray-600">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}