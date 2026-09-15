'use client'

interface Skill {
	name: string
}

interface Value {
	name: string
}

interface ProfileCardTagsProps {
	hasWorkProfile: boolean
	primarySkill: string | null
	skills: Skill[]
	values: Value[]
	isCurrentCard: boolean
}

export default function ProfileCardTags({
	hasWorkProfile,
	primarySkill,
	skills,
	values,
	isCurrentCard,
}: ProfileCardTagsProps) {
	const allTags: string[] = []

	if (hasWorkProfile && primarySkill) {
		allTags.push(primarySkill)
	}

	if (skills) {
		skills.forEach(skill => {
			allTags.push(skill.name)
		})
	}

	if (values) {
		values.forEach(value => {
			allTags.push(value.name)
		})
	}

	const visibleTags = allTags.slice(0, 8)

	if (visibleTags.length === 0) return null

	const tagStyle: React.CSSProperties = {
		display: 'inline-block',
		lineHeight: '30px',
		height: '30px',
		paddingLeft: '12px',
		paddingRight: '12px',
		borderRadius: '999px',
		background: 'rgba(252, 249, 247, 0.1)',
		backdropFilter: 'blur(2.5px)',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		fontFamily: 'Zen Kaku Gothic New, sans-serif',
		fontSize: '12px',
		fontWeight: 700,
		color: 'rgba(252, 249, 247, 0.65)',
		whiteSpace: 'nowrap',
		flexShrink: 0,
	}

	return (
		<div
			style={{
				marginTop: '8px',
				display: 'flex',
				flexWrap: 'wrap',
				gap: '6px',
				alignItems: 'flex-start',
				opacity: isCurrentCard ? 1 : 0,
				transition: 'opacity 0.3s ease',
			}}
		>
			{visibleTags.map((tag, i) => (
				<span key={`tag-${i}`} style={tagStyle}>
					{tag}
				</span>
			))}
		</div>
	)
}
