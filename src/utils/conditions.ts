import type { FieldCondition, ConditionalLogic } from '@/types';

/**
 * Операторы сравнения для условий
 */
const OPERATORS = {
  equals: (fieldValue: any, conditionValue: any): boolean => {
    return fieldValue === conditionValue;
  },
  
  notEquals: (fieldValue: any, conditionValue: any): boolean => {
    return fieldValue !== conditionValue;
  },
  
  contains: (fieldValue: any, conditionValue: any): boolean => {
    if (typeof fieldValue === 'string' && typeof conditionValue === 'string') {
      return fieldValue.includes(conditionValue);
    }
    if (Array.isArray(fieldValue)) {
      return fieldValue.includes(conditionValue);
    }
    return false;
  },
  
  notContains: (fieldValue: any, conditionValue: any): boolean => {
    return !OPERATORS.contains(fieldValue, conditionValue);
  },
  
  gt: (fieldValue: any, conditionValue: any): boolean => {
    const numValue = Number(fieldValue);
    const numCondition = Number(conditionValue);
    return !isNaN(numValue) && !isNaN(numCondition) && numValue > numCondition;
  },
  
  gte: (fieldValue: any, conditionValue: any): boolean => {
    const numValue = Number(fieldValue);
    const numCondition = Number(conditionValue);
    return !isNaN(numValue) && !isNaN(numCondition) && numValue >= numCondition;
  },
  
  lt: (fieldValue: any, conditionValue: any): boolean => {
    const numValue = Number(fieldValue);
    const numCondition = Number(conditionValue);
    return !isNaN(numValue) && !isNaN(numCondition) && numValue < numCondition;
  },
  
  lte: (fieldValue: any, conditionValue: any): boolean => {
    const numValue = Number(fieldValue);
    const numCondition = Number(conditionValue);
    return !isNaN(numValue) && !isNaN(numCondition) && numValue <= numCondition;
  },
  
  empty: (fieldValue: any): boolean => {
    if (fieldValue === null || fieldValue === undefined) return true;
    if (typeof fieldValue === 'string') return fieldValue.trim() === '';
    if (Array.isArray(fieldValue)) return fieldValue.length === 0;
    if (typeof fieldValue === 'object') return Object.keys(fieldValue).length === 0;
    return false;
  },
  
  notEmpty: (fieldValue: any): boolean => {
    return !OPERATORS.empty(fieldValue);
  },
  
  in: (fieldValue: any, conditionValues: any[]): boolean => {
    return Array.isArray(conditionValues) && conditionValues.includes(fieldValue);
  },
  
  notIn: (fieldValue: any, conditionValues: any[]): boolean => {
    return !OPERATORS.in(fieldValue, conditionValues);
  }
} as const;

/**
 * Оценивает одно условие
 */
export function evaluateCondition(
  condition: FieldCondition, 
  formData: Record<string, any>
): boolean {
  const fieldValue = getNestedValue(formData, condition.field);
  const operator = OPERATORS[condition.operator];
  
  if (!operator) {
    console.warn(`Unknown operator: ${condition.operator}`);
    return false;
  }
  
  // Специальная обработка для операторов in/notIn
  if (condition.operator === 'in' || condition.operator === 'notIn') {
    return operator(fieldValue, condition.values || []);
  }
  
  // Специальная обработка для empty/notEmpty
  if (condition.operator === 'empty' || condition.operator === 'notEmpty') {
    return (operator as (value: any) => boolean)(fieldValue);
  }
  
  return operator(fieldValue, condition.value);
}

/**
 * Оценивает массив условий с логикой AND/OR
 */
export function evaluateConditions(
  conditions: FieldCondition[],
  formData: Record<string, any>,
  logic: 'and' | 'or' = 'and'
): boolean {
  if (!conditions || conditions.length === 0) {
    return true;
  }
  
  const results = conditions.map(condition => evaluateCondition(condition, formData));
  
  return logic === 'and' 
    ? results.every(result => result)
    : results.some(result => result);
}

/**
 * Оценивает условную логику поля
 */
export function evaluateFieldLogic(
  conditionalLogic: ConditionalLogic,
  formData: Record<string, any>
): {
  visible: boolean;
  required: boolean;
  disabled: boolean;
} {
  const logic = conditionalLogic.logic || 'and';
  
  let visible = true;
  let required = false;
  let disabled = false;
  
  // Оценка условий показа
  if (conditionalLogic.show) {
    visible = evaluateConditions(conditionalLogic.show, formData, logic);
  }
  
  // Оценка условий скрытия (более приоритетны чем show)
  if (conditionalLogic.hide) {
    const shouldHide = evaluateConditions(conditionalLogic.hide, formData, logic);
    if (shouldHide) {
      visible = false;
    }
  }
  
  // Оценка условий обязательности
  if (conditionalLogic.required) {
    required = evaluateConditions(conditionalLogic.required, formData, logic);
  }
  
  // Оценка условий отключения
  if (conditionalLogic.disabled) {
    disabled = evaluateConditions(conditionalLogic.disabled, formData, logic);
  }
  
  return { visible, required, disabled };
}

/**
 * Получает значение по вложенному пути (например, "user.profile.name")
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined;
  }, obj);
}

/**
 * Класс для управления условиями всей формы
 */
export class ConditionsEngine {
  private formData: Record<string, any> = {};
  private fieldConditions: Map<string, ConditionalLogic> = new Map();
  private cache: Map<string, any> = new Map();
  
  constructor(formData: Record<string, any> = {}) {
    this.formData = { ...formData };
  }
  
  /**
   * Обновляет данные формы
   */
  updateFormData(data: Record<string, any>): void {
    this.formData = { ...data };
    this.cache.clear(); // Очищаем кеш при изменении данных
  }
  
  /**
   * Регистрирует условия для поля
   */
  registerFieldConditions(fieldName: string, conditions: ConditionalLogic): void {
    this.fieldConditions.set(fieldName, conditions);
    this.cache.delete(fieldName); // Удаляем из кеша при изменении условий
  }
  
  /**
   * Получает состояние поля на основе условий
   */
  getFieldState(fieldName: string): {
    visible: boolean;
    required: boolean;
    disabled: boolean;
  } {
    const cacheKey = fieldName;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const conditions = this.fieldConditions.get(fieldName);
    let state = { visible: true, required: false, disabled: false };
    
    if (conditions) {
      state = evaluateFieldLogic(conditions, this.formData);
    }
    
    this.cache.set(cacheKey, state);
    return state;
  }
  
  /**
   * Получает состояния всех зарегистрированных полей
   */
  getAllFieldStates(): Record<string, { visible: boolean; required: boolean; disabled: boolean }> {
    const states: Record<string, any> = {};
    
    for (const fieldName of this.fieldConditions.keys()) {
      states[fieldName] = this.getFieldState(fieldName);
    }
    
    return states;
  }
  
  /**
   * Проверяет, зависит ли поле от других полей
   */
  getFieldDependencies(fieldName: string): string[] {
    const conditions = this.fieldConditions.get(fieldName);
    if (!conditions) return [];
    
    const dependencies = new Set<string>();
    
    const extractDependencies = (conditionArray: FieldCondition[] | undefined) => {
      if (!conditionArray) return;
      conditionArray.forEach(condition => {
        dependencies.add(condition.field);
      });
    };
    
    extractDependencies(conditions.show);
    extractDependencies(conditions.hide);
    extractDependencies(conditions.required);
    extractDependencies(conditions.disabled);
    
    return Array.from(dependencies);
  }
  
  /**
   * Получает все поля, которые зависят от указанного поля
   */
  getDependentFields(fieldName: string): string[] {
    const dependents: string[] = [];
    
    for (const currentFieldName of this.fieldConditions.keys()) {
      const dependencies = this.getFieldDependencies(currentFieldName);
      if (dependencies.includes(fieldName)) {
        dependents.push(currentFieldName);
      }
    }
    
    return dependents;
  }
}
