// Функция для конвертации изображения в WebP с изменением размера
export const convertToWebP = async (
	file: File,
	quality: number,
	maxWidth?: number,
	maxHeight?: number,
): Promise<File> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()

		reader.onload = (e: ProgressEvent<FileReader>) => {
			const img = document.createElement('img') as HTMLImageElement

			img.onload = () => {
				// Вычисляем новые размеры если заданы ограничения
				let width = img.width
				let height = img.height

				if (maxWidth && maxHeight) {
					// Если заданы оба параметра, используем их
					width = maxWidth
					height = maxHeight
				} else if (maxWidth || maxHeight) {
					// Если задан только один параметр, сохраняем пропорции
					const aspectRatio = img.width / img.height

					if (maxWidth) {
						width = maxWidth
						height = Math.round(maxWidth / aspectRatio)
					} else if (maxHeight) {
						height = maxHeight
						width = Math.round(maxHeight * aspectRatio)
					}
				}

				// Создаем canvas
				const canvas = document.createElement('canvas')
				canvas.width = width
				canvas.height = height

				// Рисуем изображение на canvas
				const ctx = canvas.getContext('2d')
				if (!ctx) {
					reject(new Error('Failed to get canvas context'))
					return
				}
				ctx.drawImage(img, 0, 0, width, height)

				// Конвертируем в WebP
				canvas.toBlob(
					blob => {
						if (!blob) {
							reject(new Error('Failed to convert image'))
							return
						}

						// Создаем новый File из Blob
						const webpFile = new File(
							[blob],
							file.name.replace(/\.[^/.]+$/, '.webp'),
							{
								type: 'image/webp',
								lastModified: Date.now(),
							},
						)

						resolve(webpFile)
					},
					'image/webp',
					quality,
				)
			}

			img.onerror = () => {
				reject(new Error('Failed to load image'))
			}

			img.src = e.target?.result as string
		}

		reader.onerror = () => {
			reject(new Error('Failed to read file'))
		}

		reader.readAsDataURL(file)
	})
}

// Функция для загрузки аватара
export const uploadAvatar = async (file: File): Promise<string | null> => {
	try {
		console.log('[Upload] Uploading avatar:', file.name, file.size)
		const formData = new FormData()
		formData.append('file', file)

		const response = await fetch('/api/upload/radar/avatar', {
			method: 'POST',
			body: formData,
		})

		if (response.ok) {
			const data = await response.json()
			console.log('[Upload] Avatar uploaded:', data.avatarPath)
			return data.avatarPath
		} else {
			console.error('[Upload] Avatar upload failed:', await response.text())
			return null
		}
	} catch (error) {
		console.error('[Upload] Error uploading avatar:', error)
		return null
	}
}

// Функция для загрузки фотографий с конвертацией в WebP (без изменения соотношения сторон)
export const uploadPhotos = async (files: File[]): Promise<string[]> => {
	const photoPaths: string[] = []

	for (const file of files) {
		try {
			// Конвертируем в WebP без изменения размера, только оптимизация
			const resizedFile = await convertToWebP(file, 0.85)

			const formData = new FormData()
			formData.append('file', resizedFile)

			const response = await fetch('/api/upload/radar/photo', {
				method: 'POST',
				body: formData,
			})

			if (response.ok) {
				const data = await response.json()
				photoPaths.push(data.photoPath)
			}
		} catch (error) {
			console.error('[Upload] Error uploading photo:', error)
		}
	}

	return photoPaths
}

// Функция для удаления файла из S3
export const deleteFile = async (fileUrl: string): Promise<boolean> => {
	try {
		console.log('[Delete] Deleting file:', fileUrl)

		const response = await fetch('/api/upload/delete', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ fileUrl }),
		})

		if (response.ok) {
			console.log('[Delete] File deleted successfully')
			return true
		} else {
			console.error('[Delete] File deletion failed:', await response.text())
			return false
		}
	} catch (error) {
		console.error('[Delete] Error deleting file:', error)
		return false
	}
}

// Функция для удаления нескольких файлов из S3
export const deleteFiles = async (fileUrls: string[]): Promise<void> => {
	const deletePromises = fileUrls.map(url => deleteFile(url))
	await Promise.all(deletePromises)
}
