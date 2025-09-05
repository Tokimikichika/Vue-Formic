// Глобальные декларации для Vue типов
declare module '@vue/reactivity' {
  export const ComputedRefSymbol: unique symbol;
  export const RefSymbol: unique symbol;
  export interface ComputedRefSymbol {
    readonly [ComputedRefSymbol]: true;
  }
  export interface RefSymbol {
    readonly [RefSymbol]: true;
  }
}

// Декларации для внутренних Vue типов
declare global {
  namespace Vue {
    const ComputedRefSymbol: unique symbol;
    const RefSymbol: unique symbol;
    interface ComputedRefSymbol {
      readonly [ComputedRefSymbol]: true;
    }
    interface RefSymbol {
      readonly [RefSymbol]: true;
    }
  }
}

// Подавление проблемных Vue типов для TypeScript
declare module '@vue/runtime-core' {
  export interface ComponentInternalInstance {
    [key: string]: any;
  }
}

// Подавление ошибок шаблонов Vue
declare global {
  function __VLS_template(): any;
  function __VLS_styleScopedClasses(): any;
}

export {}