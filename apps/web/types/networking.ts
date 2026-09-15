export interface NetworkingProfile {
	id: string
	networkingName: string
	firstName?: string
	username?: string
	networkingPhoto: string
	networkingLocation: string
	networkingAbout: string
	networkingSkills: { name: string }[]
	networkingValues: { name: string }[]
	networkingAura: 'NONE' | 'TURQUOISE' | 'ORANGE' | 'RED' | null
	networkingLookingFor: string[]
	networkingGender?: string
	networkingCases: { id: string; photoPath: string; link: string | null }[]
	hasWorkProfile: boolean
	primarySkill: string | null
	networkingHelpText?: string | null
	networkingSearchText?: string | null
}
