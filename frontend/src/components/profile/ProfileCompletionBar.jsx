import { calculateProfileCompletion } from '@/context/ProfileContext';
import { useLanguage } from '@/context/LanguageContext';

export default function ProfileCompletionBar({ profile }) {
    const percentage = calculateProfileCompletion(profile);
    const { t } = useLanguage();

    return (
        <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{t('common.profileCompletion', 'Profile completion')}</span>
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