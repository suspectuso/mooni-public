# Рефакторинг page.tsx

Файл `front/app/page.tsx` был разделен на компоненты для улучшения читаемости и поддержки.

## Созданные компоненты:

### 1. HabitCalendar.tsx

Отвечает за отображение календаря с днями и прогрессом привычек.

**Props:**

- `selectedDate: Date` - выбранная дата
- `habitStreak: number` - текущий стрик
- `getStreakText: (days: number) => string` - функция форматирования текста стрика
- `getDayProgress: (date: Date) => number` - функция получения прогресса за день
- `handleDayClick: (date: Date) => void` - обработчик клика по дню

### 2. SprintTasks.tsx

Отображает активные задачи спринтов.

**Props:**

- `userSprints: Sprint[]` - список спринтов пользователя
- `sprintTaskStatuses: Map<string, any>` - статусы выполнения задач
- `selectedDate: Date` - выбранная дата
- `isToday: (date: Date) => boolean` - проверка, является ли дата сегодняшней
- `handleCompleteSprintTask: (sprintId: string) => void` - обработчик выполнения задачи

### 3. HabitsList.tsx

Отображает список привычек (активные и выполненные).

**Props:**

- `selectedActiveHabits: Habit[]` - активные привычки
- `selectedCompletedHabits: Habit[]` - выполненные привычки
- `userId: string` - ID пользователя
- `handleLogHabit: (habitId: string) => void` - обработчик отметки привычки
- `loadHabits: (userId: string) => void` - функция загрузки привычек
- `setShowAddModal: (show: boolean) => void` - функция открытия модалки добавления

## Как использовать:

В `page.tsx` замените соответствующие секции на компоненты:

```tsx
// Вместо большого блока календаря:
<HabitCalendar
  selectedDate={selectedDate}
  habitStreak={habitStreak}
  getStreakText={getStreakText}
  getDayProgress={getDayProgress}
  handleDayClick={handleDayClick}
/>

// Вместо блока спринтов:
<SprintTasks
  userSprints={userSprints}
  sprintTaskStatuses={sprintTaskStatuses}
  selectedDate={selectedDate}
  isToday={isToday}
  handleCompleteSprintTask={handleCompleteSprintTask}
/>

// Вместо блока привычек:
<HabitsList
  selectedActiveHabits={selectedActiveHabits}
  selectedCompletedHabits={selectedCompletedHabits}
  userId={userId}
  handleLogHabit={handleLogHabit}
  loadHabits={loadHabits}
  setShowAddModal={setShowAddModal}
/>
```

## Преимущества:

1. **Читаемость** - каждый компонент отвечает за свою часть UI
2. **Переиспользование** - компоненты можно использовать в других местах
3. **Тестирование** - легче тестировать отдельные компоненты
4. **Поддержка** - проще находить и исправлять баги
