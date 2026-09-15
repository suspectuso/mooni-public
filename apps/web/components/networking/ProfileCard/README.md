# ProfileCard Component Structure

Компонент карточки профиля разбит на подкомпоненты для лучшей читаемости и поддержки.

## Структура файлов

```
ProfileCard/
├── index.ts                    # Экспорты всех компонентов
├── ProfileCard.tsx             # Главный компонент карточки
├── ProfileCardContainer.tsx    # Контейнер с анимациями и трансформациями
├── ProfileCardPhoto.tsx        # Фотография профиля с градиентом
├── ProfileCardAura.tsx         # Аура (большая и верхняя)
├── ProfileCardCases.tsx        # Летающие кейсы с голубой аурой
├── ProfileCardButtons.tsx      # Кнопки (skip, ILU, add)
├── ProfileCardInfo.tsx         # Информация (имя, описание)
└── ProfileCardTags.tsx         # Теги (навыки, ценности, work)
```

## Компоненты

### ProfileCard

Главный компонент, который объединяет все подкомпоненты.

**Props:**

- `profile` - данные профиля
- `isCurrentCard` - текущая ли это карточка
- `isSecondCard` - вторая ли это карточка
- `dragOffset` - смещение при свайпе
- `rotation` - угол поворота
- `opacity` - прозрачность
- `isDragging` - идет ли перетаскивание
- `isAnimatingOut` - идет ли анимация улета
- `swipeDirection` - направление свайпа
- `isSwipeDisabled` - заблокирован ли свайп
- `isPlatformDesktop` - десктопная ли платформа
- `myProfile` - мой профиль (для ILU кнопки)
- Обработчики событий (onTouchStart, onTouchMove, etc.)
- Колбэки (onCardClick, onSkip, onLike, onExpressLove)

### ProfileCardContainer

Контейнер с логикой анимаций, трансформаций и позиционирования карточки.

**Особенности:**

- Управляет z-index стека карточек
- Применяет трансформации (translate, rotate, scale)
- Обрабатывает анимации улета и появления
- Управляет курсором и pointer-events

### ProfileCardPhoto

Отображает фотографию профиля с градиентом снизу для читаемости текста.

### ProfileCardAura

Отображает ауру профиля (большую за карточкой или верхнюю).

**Типы аур:**

- TURQUOISE - голубая
- ORANGE - оранжевая
- RED - красная
- NONE - без ауры

### ProfileCardCases

Отображает до 3 кейсов с голубой аурой и анимацией вращения.

**Особенности:**

- Разные позиции для каждого кейса
- Разные размеры (первый меньше, третий больше)
- Кликабельны если есть ссылка
- Анимация вращения ауры

### ProfileCardButtons

Кнопки управления карточкой.

**Логика отображения:**

- На десктопе: skip + ILU (если нужно) + add
- На мобильном: только ILU (если нужно) вместо skip

**Условия показа ILU:**

- Цель ищет relationships
- Разные гендеры (M-F или F-M)

### ProfileCardInfo

Информация о профиле (имя и описание).

**Особенности:**

- Кликабельна (переход на полный профиль)
- Имя обрезается до 2 строк
- Описание обрезается до 3 строк
- Тени для читаемости на фото

### ProfileCardTags

Теги под карточкой (навыки, ценности, work).

**Отображение:**

- Work badge (если есть work профиль)
- До 2 навыков (оранжевые)
- До 1 ценности (прозрачные)
- Обрезка длинных названий

## Использование

```tsx
import ProfileCard from '@/components/networking/ProfileCard'

;<ProfileCard
	profile={profile}
	isCurrentCard={true}
	isSecondCard={false}
	visibleProfilesLength={3}
	index={0}
	dragOffset={dragOffset}
	rotation={rotation}
	opacity={opacity}
	isDragging={isDragging}
	isAnimatingOut={isAnimatingOut}
	swipeDirection={swipeDirection}
	isSwipeDisabled={isSwipeDisabled}
	isPlatformDesktop={isPlatformDesktop}
	myProfile={myProfile}
	onTouchStart={handleTouchStart}
	onTouchMove={handleTouchMove}
	onTouchEnd={handleTouchEnd}
	onMouseDown={handleMouseDown}
	onCardClick={handleCardClick}
	onSkip={handlePass}
	onLike={handleLike}
	onExpressLove={handleExpressLove}
/>
```

## Анимации

### Свайп

- Карточка следует за пальцем/мышью
- Поворот пропорционален смещению
- Прозрачность уменьшается при свайпе влево

### Улет

- Карточка улетает за экран (2000px)
- Поворот 90° (вправо) или -90° (влево)
- Длительность 600ms
- Вторая карточка плавно выходит на передний план

### Стек

- Вторая карточка повернута на 4°
- Масштаб 0.98
- Смещение вниз на 8px
- Прозрачность 0.7

## Стили

Все стили инлайновые для максимальной производительности анимаций.

**Шрифты:**

- Oks - для имени
- Zen Kaku Gothic New - для тегов
- LT Superior - для описания

**Цвета:**

- #FCF9F7 - основной текст
- #F7710B - навыки
- #65FFF7 - work badge
- rgba(252, 249, 247, 0.15) - ценности
