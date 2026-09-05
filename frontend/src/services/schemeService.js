import { mockSchemes } from "@/data/mockSchemes"

export const getAllSchemes = async () => {
    return mockSchemes
}
// other files can use this function
export const getSchemeById = async (id) => {
    return mockSchemes.find((scheme) => scheme.id === Number(id))
}