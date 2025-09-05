import { describe, it, expect } from 'vitest';
import { evaluateCondition, evaluateConditions, ConditionsEngine } from '../utils/conditions';
import type { FieldCondition } from '../types';

describe('Conditions Engine', () => {
  describe('evaluateCondition', () => {
    it('should evaluate equals condition correctly', () => {
      const condition: FieldCondition = {
        field: 'status',
        operator: 'equals',
        value: 'active'
      };
      
      const formData = { status: 'active' };
      const result = evaluateCondition(condition, formData);
      
      expect(result).toBe(true);
    });

    it('should evaluate notEquals condition correctly', () => {
      const condition: FieldCondition = {
        field: 'status',
        operator: 'notEquals',
        value: 'inactive'
      };
      
      const formData = { status: 'active' };
      const result = evaluateCondition(condition, formData);
      
      expect(result).toBe(true);
    });

    it('should evaluate empty condition correctly', () => {
      const condition: FieldCondition = {
        field: 'description',
        operator: 'empty'
      };
      
      const formData = { description: '' };
      const result = evaluateCondition(condition, formData);
      
      expect(result).toBe(true);
    });

    it('should evaluate notEmpty condition correctly', () => {
      const condition: FieldCondition = {
        field: 'name',
        operator: 'notEmpty'
      };
      
      const formData = { name: 'John Doe' };
      const result = evaluateCondition(condition, formData);
      
      expect(result).toBe(true);
    });

    it('should evaluate in condition correctly', () => {
      const condition: FieldCondition = {
        field: 'role',
        operator: 'in',
        values: ['admin', 'moderator']
      };
      
      const formData = { role: 'admin' };
      const result = evaluateCondition(condition, formData);
      
      expect(result).toBe(true);
    });
  });

  describe('evaluateConditions', () => {
    it('should evaluate AND logic correctly', () => {
      const conditions: FieldCondition[] = [
        { field: 'age', operator: 'gte', value: 18 },
        { field: 'status', operator: 'equals', value: 'active' }
      ];
      
      const formData = { age: 25, status: 'active' };
      const result = evaluateConditions(conditions, formData, 'and');
      
      expect(result).toBe(true);
    });

    it('should evaluate OR logic correctly', () => {
      const conditions: FieldCondition[] = [
        { field: 'role', operator: 'equals', value: 'admin' },
        { field: 'role', operator: 'equals', value: 'moderator' }
      ];
      
      const formData = { role: 'admin' };
      const result = evaluateConditions(conditions, formData, 'or');
      
      expect(result).toBe(true);
    });
  });

  describe('ConditionsEngine', () => {
    it('should manage field conditions correctly', () => {
      const engine = new ConditionsEngine({ hasJob: true });
      
      engine.registerFieldConditions('salary', {
        show: [{ field: 'hasJob', operator: 'equals', value: true }]
      });
      
      const fieldState = engine.getFieldState('salary');
      
      expect(fieldState.visible).toBe(true);
    });

    it('should update form data and recalculate conditions', () => {
      const engine = new ConditionsEngine({ hasJob: true });
      
      engine.registerFieldConditions('salary', {
        show: [{ field: 'hasJob', operator: 'equals', value: true }]
      });
      
      // Initially visible
      let fieldState = engine.getFieldState('salary');
      expect(fieldState.visible).toBe(true);
      
      // Update form data
      engine.updateFormData({ hasJob: false });
      
      // Should now be hidden
      fieldState = engine.getFieldState('salary');
      expect(fieldState.visible).toBe(false);
    });
  });
});