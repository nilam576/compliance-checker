import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3')
    })

    it('should handle empty values', () => {
      expect(cn('class1', '', null, undefined, 'class2')).toBe('class1 class2')
    })

    it('should handle arrays', () => {
      expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3')
    })

    it('should handle objects', () => {
      expect(cn({
        'class1': true,
        'class2': false,
        'class3': true
      })).toBe('class1 class3')
    })

    it('should handle Tailwind merge conflicts', () => {
      // This tests the tailwind-merge functionality
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    })
  })
})