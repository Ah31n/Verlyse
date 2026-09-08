import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

/**
 * IMMERSIVE READING MODE — when a reader opens an article, the interface
 * can quietly step aside. The chrome (header, footer, progress, dock, cursor)
 * fades to near-nothing; the article is all that remains, like sitting in a
 * quiet library with a beautifully printed magazine.
 */

const ReadingModeContext = createContext<{ on: boolean; toggle: () => void; off: () => void }>({
  on: false,
  toggle: () => {},
  off: () => {},
})

export function ReadingModeProvider({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(false)
  const toggle = useCallback(() => setOn((v) => !v), [])
  const off = useCallback(() => setOn(false), [])
  return (
    <ReadingModeContext.Provider value={{ on, toggle, off }}>
      {children}
    </ReadingModeContext.Provider>
  )
}

export function useReadingMode() {
  return useContext(ReadingModeContext)
}
