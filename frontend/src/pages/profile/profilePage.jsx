import { useEffect, useState } from "react"
import { getProfile } from "@/services/profileService"
import ProfileForm from "@/components/profile/ProfileForm"
import ProfileCompletionBar from "@/components/profile/ProfileCompletionBar"

export default function ProfilePage() {
    const [profile, setProfile] = useState(null)

    useEffect(() => {
        getProfile().then((data) => setProfile(data))
    }, [])

    if (!profile) return <p className="text-center py-8">Loading...</p>

    return (
        <div className="max-w-lg mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-1">Your profile</h1>
            <p className="text-gray-600 mb-6">
                Complete your profile to get personalized scheme recommendations.
            </p>

            <ProfileCompletionBar profile={profile} />
            <ProfileForm onProfileUpdated={setProfile} />
        </div>
    )
}