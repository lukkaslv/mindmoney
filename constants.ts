
import { Scene } from './types';

export const INITIAL_SCENES: Record<string, Scene> = {
  welcome: {
    id: 'welcome',
    title: 'Внезапный доход',
    description: 'Вы просыпаетесь и видите SMS: на ваш счет поступило 500 000 рублей. Неизвестный перевод. Ваша первая реакция?',
    choices: [
      { id: 'c1', text: 'Ой, ошибка! Надо вернуть, а то накажут.', feedback: 'Страх наказания.', beliefKey: 'fear_of_punishment', nextSceneId: 'dinner' },
      { id: 'c2', text: 'Ух ты! Наконец-то я куплю то, что хотел(а)!', feedback: 'Импульсивный слив.', beliefKey: 'impulse_spend', nextSceneId: 'dinner' },
      { id: 'c3', text: 'Тихо, никому не скажу. Деньги любят тишину.', feedback: 'Страх опасности.', beliefKey: 'money_is_danger', nextSceneId: 'dinner' }
    ]
  },
  dinner: {
    id: 'dinner',
    title: 'Ужин с критиком',
    description: 'Близкий человек говорит: "Честным трудом больших денег не заработаешь. Все богачи — воры".',
    choices: [
      { id: 'd1', text: 'Согласиться: "Да, лучше быть бедным, но честным".', feedback: 'Ложная связка порядочности.', beliefKey: 'poverty_is_virtue', nextSceneId: 'debt' },
      { id: 'd2', text: 'Промолчать, чувствуя комок в горле.', feedback: 'Подавление права.', beliefKey: 'fear_of_conflict', nextSceneId: 'debt' },
      { id: 'd3', text: 'Сказать: "Деньги — это просто инструмент".', feedback: 'Взрослая позиция.', beliefKey: 'money_is_tool', nextSceneId: 'debt' }
    ]
  },
  debt: {
    id: 'debt',
    title: 'Старый долг',
    description: 'Друг просит в долг крупную сумму, которую вы копили на обучение. Вы знаете, что он редко возвращает вовремя.',
    choices: [
      { id: 'db1', text: 'Дать деньги, чтобы не портить отношения.', feedback: 'Нарушение границ.', beliefKey: 'fear_of_conflict', nextSceneId: 'promotion' },
      { id: 'db2', text: 'Отказать и чувствовать себя "плохим".', feedback: 'Токсичная вина.', beliefKey: 'guilt_after_pleasure', nextSceneId: 'promotion' },
      { id: 'db3', text: 'Предложить помощь советом или меньшую сумму.', feedback: 'Устойчивые границы.', beliefKey: 'self_permission', nextSceneId: 'promotion' }
    ]
  },
  promotion: {
    id: 'promotion',
    title: 'Шанс на рост',
    description: 'Вам предлагают проект с зарплатой в три раза выше. Ответственности станет в пять раз больше.',
    choices: [
      { id: 'p1', text: 'Отказаться: "Я еще не готов(а)".', feedback: 'Самозванец.', beliefKey: 'imposter_syndrome', nextSceneId: 'error' },
      { id: 'p2', text: 'Согласиться и работать по 18 часов.', feedback: 'Установка на изнурение.', beliefKey: 'hard_work_only', nextSceneId: 'error' },
      { id: 'p3', text: 'Согласиться и нанять помощников.', feedback: 'Навык делегирования.', beliefKey: 'capacity_expansion', nextSceneId: 'error' }
    ]
  },
  error: {
    id: 'error',
    title: 'Ошибка банка',
    description: 'Банк случайно зачислил вам кэшбэк 1 000 000 рублей. Через час они замечают ошибку, но вы уже могли бы их перевести.',
    choices: [
      { id: 'e1', text: 'Сразу позвонить в банк и вернуть.', feedback: 'Сверх-контроль.', beliefKey: 'fear_of_punishment', nextSceneId: 'investment' },
      { id: 'e2', text: 'Подождать: "Может, не заметят?".', feedback: 'Магическое мышление.', beliefKey: 'impulse_spend', nextSceneId: 'investment' },
      { id: 'e3', text: 'Спокойно дождаться списания.', feedback: 'Нейтральное отношение.', beliefKey: 'money_is_tool', nextSceneId: 'investment' }
    ]
  },
  investment: {
    id: 'investment',
    title: 'Риск или стабильность',
    description: 'Знакомый предлагает вложиться в стартап. Шанс 50/50: либо х10 прибыли, либо потеря всего.',
    choices: [
      { id: 'i1', text: 'Ни за что, лучше синица в руках.', feedback: 'Застой в безопасности.', beliefKey: 'family_loyalty', nextSceneId: 'shopping' },
      { id: 'i2', text: 'Вложить всё, "пан или пропал".', feedback: 'Адреналиновая зависимость.', beliefKey: 'impulse_spend', nextSceneId: 'shopping' },
      { id: 'i3', text: 'Вложить ту сумму, которую не жалко потерять.', feedback: 'Риск-менеджмент.', beliefKey: 'capacity_expansion', nextSceneId: 'shopping' }
    ]
  },
  shopping: {
    id: 'shopping',
    title: 'Покупка мечты',
    description: 'Дорогая вещь, на которую родители копили бы годы. Она перед вами.',
    choices: [
      { id: 's1', text: 'Уйти: "Я не имею права так тратить".', feedback: 'Семейный сценарий.', beliefKey: 'family_loyalty', nextSceneId: 'legacy' },
      { id: 's2', text: 'Купить, но потом корить себя.', feedback: 'Вина за радость.', beliefKey: 'guilt_after_pleasure', nextSceneId: 'legacy' },
      { id: 's3', text: 'Купить и поблагодарить себя.', feedback: 'Разрешение себе.', beliefKey: 'self_permission', nextSceneId: 'legacy' }
    ]
  },
  legacy: {
    id: 'legacy',
    title: 'Наследие',
    description: 'Вы узнаете, что ваш успех вызывает зависть у родственников. Они просят "помочь", хотя сами не работают.',
    choices: [
      { id: 'l1', text: 'Раздать всё, чтобы не завидовали.', feedback: 'Сброс ресурса.', beliefKey: 'money_is_danger', nextSceneId: 'end' },
      { id: 'l2', text: 'Скрывать доходы и врать, что всё плохо.', feedback: 'Жизнь во лжи.', beliefKey: 'money_is_danger', nextSceneId: 'end' },
      { id: 'l3', text: 'Помочь только тем, кто реально нуждается.', feedback: 'Взрослая сепарация.', beliefKey: 'self_permission', nextSceneId: 'end' }
    ]
  }
};
