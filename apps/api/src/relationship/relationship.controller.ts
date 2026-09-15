import { Controller, Get, Post } from '@nestjs/common'
import { AiService } from '../ai/ai.service'

// Глубокие вопросы для двоих (à la Between / 36 questions).
const QUESTIONS = [
  'Какое место в Питере ты бы показал(а) мне первым?',
  'О каком спонтанном поступке ты до сих пор вспоминаешь с улыбкой?',
  'Что для тебя идеальный выходной вдвоём?',
  'Какая мелочь делает твой день лучше?',
  'Куда бы ты сбежал(а) на один день, если бы можно было всё?',
  'Что ты ценишь во мне больше всего?',
  'О чём ты мечтал(а) в детстве?',
  'Какая музыка звучит, когда тебе хорошо?',
  'Что тебя вдохновляет в этом городе?',
  'Какое наше совместное воспоминание твоё любимое?',
  'Чему ты хотел(а) бы научиться вместе со мной?',
  'Какой был твой лучший вечер за последний месяц?',
]

/** Помощь в отношениях (à la Between): вопросы для двоих + идея свидания. Публично. */
@Controller('relationship')
export class RelationshipController {
  constructor(private ai: AiService) {}

  @Get('questions')
  questions() {
    return { questions: QUESTIONS }
  }

  @Post('date-idea')
  dateIdea() {
    return this.ai.dateIdea()
  }
}
