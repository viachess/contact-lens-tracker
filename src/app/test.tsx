import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { App } from './App'

describe('<App />', () => {
  it('should render the App', () => {
    const { container } = render(
      <Provider store={store}>
        <App />
      </Provider>
    )

    // Check for Lens Tracker headings (there should be 2 - nav and main)
    const lensTrackerHeadings = screen.getAllByText(/Lens Tracker/i)
    expect(lensTrackerHeadings).toHaveLength(2)

    expect(
      screen.getByText(
        /Track your contact lens usage and maintain healthy eye care habits/i
      )
    ).toBeInTheDocument()

    // Check for navigation items (multiple instances due to desktop and mobile views)
    const dashboardLinks = screen.getAllByText(/Dashboard/i)
    const historyLinks = screen.getAllByText(/History/i)
    const settingsLinks = screen.getAllByText(/Settings/i)

    expect(dashboardLinks.length).toBeGreaterThan(0)
    expect(historyLinks.length).toBeGreaterThan(0)
    expect(settingsLinks.length).toBeGreaterThan(0)

    expect(container.firstChild).toBeInTheDocument()
  })
})
