//Fake backend
let mockProfile = {
    fullName: "",
    dob: "",
    gender: "",
    state: "",
    category: "",
    annualIncome: "",
    occupation: "",
    educationLevel: "",
}

export const getProfile = async () => {
    return mockProfile
}

export const updateProfile = async (updatedData) => {
    mockProfile = { ...mockProfile, ...updatedData }
    return mockProfile
}