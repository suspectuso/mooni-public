export default function PlusIcon({ size = 32, color = '#121212' }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox='0 0 32 32'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M16 6V26M6 16H26'
				stroke={color}
				strokeWidth='3'
				strokeLinecap='round'
			/>
		</svg>
	)
}
