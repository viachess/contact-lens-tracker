import '@testing-library/jest-dom/vitest'

// Ensure portal roots exist for tests
const ensureNode = (id: string) => {
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('div')
    el.setAttribute('id', id)
    document.body.appendChild(el)
  }
  return el
}

ensureNode('root')
ensureNode('modal-root')
ensureNode('context-root')
