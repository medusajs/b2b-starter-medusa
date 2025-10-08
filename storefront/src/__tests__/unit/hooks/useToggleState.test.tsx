import { renderHook, act } from '@testing-library/react'
import useToggleState from '../../../lib/hooks/use-toggle-state'

describe('useToggleState', () => {
    it('should initialize with default false state', () => {
        const { result } = renderHook(() => useToggleState())

        expect(result.current.state).toBe(false)
        expect(result.current[0]).toBe(false)
    })

    it('should initialize with provided initial state', () => {
        const { result } = renderHook(() => useToggleState(true))

        expect(result.current.state).toBe(true)
        expect(result.current[0]).toBe(true)
    })

    it('should open state', () => {
        const { result } = renderHook(() => useToggleState(false))

        act(() => {
            result.current.open()
        })

        expect(result.current.state).toBe(true)
        expect(result.current[0]).toBe(true)
    })

    it('should close state', () => {
        const { result } = renderHook(() => useToggleState(true))

        act(() => {
            result.current.close()
        })

        expect(result.current.state).toBe(false)
        expect(result.current[0]).toBe(false)
    })

    it('should toggle state from false to true', () => {
        const { result } = renderHook(() => useToggleState(false))

        act(() => {
            result.current.toggle()
        })

        expect(result.current.state).toBe(true)
        expect(result.current[0]).toBe(true)
    })

    it('should toggle state from true to false', () => {
        const { result } = renderHook(() => useToggleState(true))

        act(() => {
            result.current.toggle()
        })

        expect(result.current.state).toBe(false)
        expect(result.current[0]).toBe(false)
    })

    it('should support array destructuring', () => {
        const { result } = renderHook(() => useToggleState())

        const [state, open, close, toggle] = result.current

        expect(state).toBe(false)

        act(() => {
            open()
        })

        expect(result.current.state).toBe(true)

        act(() => {
            close()
        })

        expect(result.current.state).toBe(false)

        act(() => {
            toggle()
        })

        expect(result.current.state).toBe(true)
    })

    it('should support object destructuring', () => {
        const { result } = renderHook(() => useToggleState())

        const { state, open, close, toggle } = result.current

        expect(state).toBe(false)

        act(() => {
            open()
        })

        expect(result.current.state).toBe(true)

        act(() => {
            close()
        })

        expect(result.current.state).toBe(false)

        act(() => {
            toggle()
        })

        expect(result.current.state).toBe(true)
    })

    it('should maintain state consistency between array and object access', () => {
        const { result } = renderHook(() => useToggleState())

        // Test array access
        expect(result.current[0]).toBe(result.current.state)

        act(() => {
            result.current.open()
        })

        expect(result.current[0]).toBe(result.current.state)
        expect(result.current[0]).toBe(true)

        act(() => {
            result.current.toggle()
        })

        expect(result.current[0]).toBe(result.current.state)
        expect(result.current[0]).toBe(false)
    })
})