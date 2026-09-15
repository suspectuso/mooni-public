'use client'

import { useCallback, useRef } from 'react'

interface ProfileCardPhotoProps {
	photoUrl: string
	name: string
	onLoad?: () => void
}

export default function ProfileCardPhoto({
	photoUrl,
	name,
	onLoad,
}: ProfileCardPhotoProps) {
	const onLoadCalled = useRef(false)

	const imgRef = useCallback(
		(img: HTMLImageElement | null) => {
			if (img && img.complete && !onLoadCalled.current && onLoad) {
				onLoadCalled.current = true
				onLoad()
			}
		},
		[onLoad]
	)

	return (
		<div className='absolute inset-0'>
			{photoUrl && (
				<img
					ref={imgRef}
					src={photoUrl}
					alt={name}
					className='w-full h-full object-cover'
					onLoad={() => {
						if (!onLoadCalled.current && onLoad) {
							onLoadCalled.current = true
							onLoad()
						}
					}}
				/>
			)}
			<div
				className='absolute inset-x-0 bottom-0'
				style={{
					height: '60%',
					background:
						'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
				}}
			/>
		</div>
	)
}
