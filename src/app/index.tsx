import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'tailwindcss/tailwind.css'
import { App } from './App'
import { store } from './store/store'

const container = document.getElementById('root') as HTMLDivElement
const root = createRoot(container)

root.render(
  <Provider store={store}>
    <App />
  </Provider>
)

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/src/sw.ts')
  })
}

// Ask for Notification permission (basic hook; production should gate by user opt-in)
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission()
}
