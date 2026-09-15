'use client'

import { useState } from 'react'
import SkillsValuesSection from './SkillsValuesSection'

interface ProfileSkillsValuesProps {
	selectedSkills: string[]
	selectedValues: string[]
	categories: any[]
	values: any[]
	onSaveSkills?: (skills: string[]) => Promise<void>
	onSaveValues?: (values: string[]) => Promise<void>
}

export default function ProfileSkillsValues({
	selectedSkills,
	selectedValues,
	categories,
	values,
	onSaveSkills,
	onSaveValues,
}: ProfileSkillsValuesProps) {
	const [showSkillsDropdown, setShowSkillsDropdown] = useState(false)
	const [showValuesDropdown, setShowValuesDropdown] = useState(false)
	const [localSkills, setLocalSkills] = useState(selectedSkills)
	const [localValues, setLocalValues] = useState(selectedValues)
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
		new Set(),
	)

	const toggleSkill = (skillName: string) => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) tg.HapticFeedback.selectionChanged()

		if (localSkills.includes(skillName)) {
			setLocalSkills(localSkills.filter(s => s !== skillName))
		} else if (localSkills.length < 5) {
			setLocalSkills([...localSkills, skillName])
		}
	}

	const toggleValue = (valueName: string) => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) tg.HapticFeedback.selectionChanged()

		if (localValues.includes(valueName)) {
			setLocalValues(localValues.filter(v => v !== valueName))
		} else if (localValues.length < 5) {
			setLocalValues([...localValues, valueName])
		}
	}

	const toggleCategory = (categoryId: string) => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) tg.HapticFeedback.impactOccurred('light')

		const newExpanded = new Set(expandedCategories)
		if (newExpanded.has(categoryId)) {
			newExpanded.delete(categoryId)
		} else {
			newExpanded.add(categoryId)
		}
		setExpandedCategories(newExpanded)
	}

	const handleSaveSkills = async () => {
		if (onSaveSkills) {
			await onSaveSkills(localSkills)
		}
		setShowSkillsDropdown(false)
	}

	const handleSaveValues = async () => {
		if (onSaveValues) {
			await onSaveValues(localValues)
		}
		setShowValuesDropdown(false)
	}

	const isReadOnly = !onSaveSkills && !onSaveValues

	return (
		<div style={{ marginBottom: '24px' }}>
			<SkillsValuesSection
				type='skills'
				items={localSkills}
				isOpen={showSkillsDropdown}
				hasChanges={
					localSkills.length !== selectedSkills.length ||
					localSkills.some(s => !selectedSkills.includes(s))
				}
				categories={categories}
				expandedCategories={expandedCategories}
				onToggle={
					onSaveSkills
						? () => {
								setShowSkillsDropdown(!showSkillsDropdown)
								setLocalSkills(selectedSkills)
							}
						: () => {}
				}
				onItemToggle={toggleSkill}
				onCategoryToggle={toggleCategory}
				onSave={handleSaveSkills}
			/>

			<SkillsValuesSection
				type='values'
				items={localValues}
				isOpen={showValuesDropdown}
				hasChanges={
					localValues.length !== selectedValues.length ||
					localValues.some(v => !selectedValues.includes(v))
				}
				values={values}
				onToggle={
					onSaveValues
						? () => {
								setShowValuesDropdown(!showValuesDropdown)
								setLocalValues(selectedValues)
							}
						: () => {}
				}
				onItemToggle={toggleValue}
				onSave={handleSaveValues}
			/>
		</div>
	)
}
