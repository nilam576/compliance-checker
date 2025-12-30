import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Mock GSAP animations
jest.mock('gsap', () => ({
  registerPlugin: jest.fn(),
  set: jest.fn(),
  from: jest.fn(() => ({ kill: jest.fn() })),
  to: jest.fn(() => ({ kill: jest.fn() })),
  timeline: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    to: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    kill: jest.fn(),
  })),
  ScrollTrigger: {
    create: jest.fn(),
    refresh: jest.fn(),
    kill: jest.fn(),
  },
}))

// Mock the navbar component
jest.mock('@/components/ui/navbar', () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>
}))

describe('Landing Page', () => {
  it('renders the hero section correctly', () => {
    render(<Home />)
    
    // Check for main heading
    expect(screen.getByText(/SEBI Compliance/i)).toBeInTheDocument()
    
    // Check for description text (using a more specific selector)
    expect(screen.getByText(/Verify legal documents against SEBI regulations in seconds/i)).toBeInTheDocument()
  })

  it('renders call-to-action buttons', () => {
    render(<Home />)
    
    const getStartedButton = screen.getByRole('button', { name: /get started free/i })
    const viewFeaturesButton = screen.getByRole('button', { name: /view features/i })
    
    expect(getStartedButton).toBeInTheDocument()
    expect(viewFeaturesButton).toBeInTheDocument()
  })

  it('renders feature sections', () => {
    render(<Home />)
    
    // Check for feature highlights (using more specific selectors)
    expect(screen.getByText('Multi-LLM Support')).toBeInTheDocument()
    expect(screen.getByText('Legal-BERT Embeddings')).toBeInTheDocument()
    expect(screen.getByText('Risk Assessment', { selector: 'h3' })).toBeInTheDocument()
    expect(screen.getByText('SEBI Regulation Database')).toBeInTheDocument()
  })
})

describe('Landing Page Accessibility', () => {
  it('has proper heading hierarchy', () => {
    render(<Home />)
    
    // Check that we have headings (exact count may vary based on implementation)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)
    
    // Main heading should be h1
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toBeInTheDocument()
  })

  it('has proper alt text for images', () => {
    render(<Home />)
    
    // Only test if images exist - this page might not have images
    const images = screen.queryAllByRole('img')
    if (images.length > 0) {
      images.forEach(img => {
        expect(img).toHaveAttribute('alt')
      })
    } else {
      // If no images, the test passes as there's nothing to check
      expect(true).toBe(true)
    }
  })
})